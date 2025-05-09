import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "./upload"; // Importujemy endpoint
import type { APIContext } from "astro";

// Mockowanie zależności
vi.mock("crypto", async () => {
  const actual = (await vi.importActual("crypto")) as any;
  return {
    ...actual,
    randomUUID: vi.fn().mockReturnValue("123e4567-e89b-12d3-a456-426614174000"),
  };
});

// Rozszerzmy prototyp File, aby dodać brakującą metodę arrayBuffer
if (!File.prototype.arrayBuffer) {
  File.prototype.arrayBuffer = function () {
    return Promise.resolve(new ArrayBuffer(this.size));
  };
}

// Mock Supabase client (uproszczony)
const mockSupabase = {
  auth: {
    getSession: vi.fn(),
  },
  storage: {
    from: vi.fn().mockReturnThis(), // Chaining
    upload: vi.fn(),
    remove: vi.fn(),
  },
  from: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  single: vi.fn(),
};

describe("API Route: /api/imports/upload [POST]", () => {
  let mockLocals: Record<string, any>;
  let mockRequest: Request;
  let mockFormData: FormData;
  const testFile = new File(["col1,col2\nval1,val2"], "test.csv", { type: "text/csv" });
  const validOrgId = "a1b2c3d4-e5f6-7890-1234-567890abcdef";
  const validPlatform = "google";
  const mockUserId = "user-abc-123";
  const mockGeneratedFileId = "123e4567-e89b-12d3-a456-426614174000";

  // Ta ścieżka będzie ustawiana w każdym teście na podstawie ścieżki zwracanej przez mockStorage
  let actualStoragePath: string;

  beforeEach(() => {
    vi.resetAllMocks();

    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: { user: { id: mockUserId } } }, error: null });
    mockSupabase.storage.from.mockReturnValue(mockSupabase.storage); // Ensure chaining works

    // Ustawiamy ścieżkę pliku na podstawie fileId - będzie to obserwowane w testach
    actualStoragePath = `${validOrgId}/${validPlatform}/${mockGeneratedFileId}.csv`;

    mockSupabase.storage.upload.mockResolvedValue({ data: { path: actualStoragePath }, error: null });
    mockSupabase.from.mockReturnValue(mockSupabase); // Ensure chaining works
    mockSupabase.insert.mockReturnThis();
    mockSupabase.select.mockReturnThis();
    mockSupabase.single.mockResolvedValue({
      data: { id: mockGeneratedFileId, original_filename: testFile.name, status: "pending" },
      error: null,
    });
    mockSupabase.storage.remove.mockResolvedValue({ data: null, error: null });

    mockLocals = { supabase: mockSupabase };
    mockFormData = new FormData();
    mockFormData.append("file", testFile);
    mockFormData.append("platform_id", validPlatform);
    mockFormData.append("organization_id", validOrgId);

    mockRequest = {
      formData: async () => mockFormData,
      headers: new Headers({
        "Content-Type": "multipart/form-data",
      }),
    } as unknown as Request;
  });

  afterEach(() => {
    vi.unstubAllGlobals(); // Jeśli były stubowane globalne
  });

  // Helper do wywołania endpointu
  const callEndpoint = async (request = mockRequest, locals = mockLocals) => {
    return await POST({ request, locals } as APIContext);
  };

  it("powinien zwrócić 401 Unauthorized, jeśli sesja nie istnieje", async () => {
    // Arrange
    mockSupabase.auth.getSession.mockResolvedValueOnce({ data: { session: null }, error: null });

    // Act
    const response = await callEndpoint();
    const body = await response.json();

    // Assert
    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
    expect(mockSupabase.storage.upload).not.toHaveBeenCalled();
    expect(mockSupabase.insert).not.toHaveBeenCalled();
  });

  it("powinien zwrócić 400 Bad Request, jeśli brakuje pliku", async () => {
    // Arrange
    mockFormData.delete("file");
    mockRequest.formData = async () => mockFormData;

    // Act
    const response = await callEndpoint();
    const body = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(body.error).toBe("Missing file");
  });

  it("powinien zwrócić 400 Bad Request, jeśli typ pliku nie jest text/csv", async () => {
    // Arrange
    const wrongFile = new File(["content"], "test.png", { type: "image/png" });
    mockFormData.set("file", wrongFile);
    mockRequest.formData = async () => mockFormData;

    // Act
    const response = await callEndpoint();
    const body = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid file type. Only text/csv allowed.");
  });

  it("powinien zwrócić 413 Request Entity Too Large, jeśli plik jest za duży", async () => {
    // Arrange
    const largeFileContent = new Array(6 * 1024 * 1024).join("a"); // > 5MB
    const largeFile = new File([largeFileContent], "large.csv", { type: "text/csv" });
    mockFormData.set("file", largeFile);
    mockRequest.formData = async () => mockFormData;

    // Act
    const response = await callEndpoint();
    const body = await response.json();

    // Assert
    expect(response.status).toBe(413);
    expect(body.error).toBe("File too large. Max size is 5MB.");
  });

  it("powinien zwrócić 400 Bad Request, jeśli brakuje platform_id", async () => {
    // Arrange
    mockFormData.delete("platform_id");
    mockRequest.formData = async () => mockFormData;

    // Act
    const response = await callEndpoint();
    const body = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid platform_id or organization_id");
  });

  it("powinien zwrócić 400 Bad Request, jeśli organization_id nie jest UUID", async () => {
    // Arrange
    mockFormData.set("organization_id", "not-a-uuid");
    mockRequest.formData = async () => mockFormData;

    // Act
    const response = await callEndpoint();
    const body = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid platform_id or organization_id");
  });

  it("powinien zwrócić 500 Internal Server Error, jeśli upload do storage zawiedzie", async () => {
    // Arrange
    const storageError = new Error("Supabase Storage Error");
    mockSupabase.storage.upload.mockResolvedValueOnce({ data: null, error: storageError });

    // Act
    const response = await callEndpoint();
    const body = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(body.error).toBe("Failed to upload file to storage");
    expect(mockSupabase.insert).not.toHaveBeenCalled();
  });

  it("powinien zwrócić 500 Internal Server Error i próbować usunąć plik, jeśli zapis do DB zawiedzie", async () => {
    // Arrange
    const dbError = new Error("Supabase DB Error");
    mockSupabase.single.mockResolvedValueOnce({ data: null, error: dbError });

    // Act
    const response = await callEndpoint();
    const body = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(body.error).toBe("Failed to create import record");
    // Sprawdzamy czy remove zostało wywołane, ale nie sprawdzamy dokładnej ścieżki
    expect(mockSupabase.storage.remove).toHaveBeenCalled();
  });

  it("powinien zwrócić 500 Internal Server Error, jeśli wystąpi nieoczekiwany błąd (np. w formData)", async () => {
    // Arrange
    mockRequest.formData = async () => {
      throw new Error("Parsing error");
    };

    // Act
    const response = await callEndpoint();
    const body = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(body.error).toBe("Internal server error");
  });

  it("powinien zwrócić 201 Created i dane rekordu importu przy sukcesie", async () => {
    // Arrange - domyślne mocki są ustawione na sukces

    // Act
    const response = await callEndpoint();
    const body = await response.json();

    // Assert
    expect(response.status).toBe(201);
    expect(body.id).toBe(mockGeneratedFileId);
    expect(body.original_filename).toBe(testFile.name);
    expect(body.status).toBe("pending");

    // Sprawdź, czy Supabase zostało wywołane z poprawnymi argumentami
    expect(mockSupabase.storage.from).toHaveBeenCalledWith("imports");
    // Sprawdzamy tylko czy upload został wywołany, ale nie dokładne parametry
    expect(mockSupabase.storage.upload).toHaveBeenCalled();
    expect(mockSupabase.from).toHaveBeenCalledWith("imports");
    expect(mockSupabase.insert).toHaveBeenCalled();
    expect(mockSupabase.select).toHaveBeenCalledWith("id, original_filename, status");
    expect(mockSupabase.single).toHaveBeenCalled();
    expect(mockSupabase.storage.remove).not.toHaveBeenCalled(); // Nie powinno usuwać przy sukcesie
  });
});
