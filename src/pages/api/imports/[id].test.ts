import { expect, vi, describe, it, beforeEach } from "vitest";
import { DELETE } from "./[id]";

// Mock dla modułu Supabase
vi.mock("../../../db/supabase.client", () => ({
  supabaseClient: {
    auth: {
      getSession: vi.fn(),
    },
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
  },
}));

describe("DELETE /api/imports/:id endpoint", () => {
  const mockParams = { id: "123e4567-e89b-12d3-a456-426614174000" };
  let mockSupabase; // Zadeklaruj mockSupabase tutaj, aby był dostępny w każdym teście
  let mockSession;

  // Reset mocków przed każdym testem
  beforeEach(() => {
    vi.resetAllMocks();
    mockSession = { user: { id: "user-123" } };

    // Definicja mocków dla poszczególnych operacji Supabase
    const mockAuthGetSession = vi.fn().mockResolvedValue({ data: { session: mockSession } });

    const mockStorageRemove = vi.fn().mockResolvedValue({ error: null });
    const mockStorageFrom = vi.fn().mockReturnValue({ remove: mockStorageRemove });

    const mockImportSingle = vi.fn().mockResolvedValue({
      data: { file_path: "user-123/platform-uuid/123e4567-e89b-12d3-a456-426614174000.csv" },
      error: null,
    });

    // Mockowanie dla delete().eq("id", id).eq("user_id", userId)
    const mockImportDeleteEqUserId = vi.fn().mockResolvedValue({ error: null });
    const mockImportDeleteEqId = vi.fn().mockReturnValue({ eq: mockImportDeleteEqUserId });
    const mockImportDelete = vi.fn().mockReturnValue({ eq: mockImportDeleteEqId });

    const mockImportSelectEqUserId = vi.fn().mockReturnValue({ single: mockImportSingle });
    const mockImportSelectEqId = vi.fn().mockReturnValue({ eq: mockImportSelectEqUserId });
    const mockImportSelect = vi.fn().mockReturnValue({ eq: mockImportSelectEqId });

    const mockFrom = vi.fn((tableName) => {
      if (tableName === "imports") {
        return {
          select: mockImportSelect,
          delete: mockImportDelete,
        };
      }
      return {}; // Domyślne zachowanie dla innych tabel
    });

    mockSupabase = {
      auth: { getSession: mockAuthGetSession },
      storage: { from: mockStorageFrom },
      from: mockFrom,
      // Dodajemy referencje do mocków, aby można było je modyfikować/sprawdzać w testach
      _mocks: {
        authGetSession: mockAuthGetSession,
        storageRemove: mockStorageRemove,
        storageFrom: mockStorageFrom,
        importSingle: mockImportSingle,
        importDelete: mockImportDelete, // Główny mock dla .delete()
        importDeleteEqId: mockImportDeleteEqId, // Mock dla .delete().eq(id)
        importDeleteEqUserId: mockImportDeleteEqUserId, // Mock dla .delete().eq(id).eq(userId)
        importSelectEqUserId: mockImportSelectEqUserId,
        importSelectEqId: mockImportSelectEqId,
        importSelect: mockImportSelect,
        from: mockFrom,
      },
    };
  });

  it("should return 401 if user is not authenticated", async () => {
    mockSupabase._mocks.authGetSession.mockResolvedValueOnce({ data: { session: null } });
    const mockLocals = { supabase: mockSupabase };
    const response = await DELETE({ params: mockParams, locals: mockLocals } as any);

    expect(response.status).toBe(401);
    const responseBody = await response.json();
    expect(responseBody.error).toBe("Unauthorized");
  });

  it("should return 400 if import ID is missing", async () => {
    const mockLocals = { supabase: mockSupabase };
    const response = await DELETE({ params: {}, locals: mockLocals } as any); // Brak ID w params

    expect(response.status).toBe(400);
    const responseBody = await response.json();
    expect(responseBody.error).toBe("Import ID is required");
  });

  it("should return 404 if import is not found", async () => {
    mockSupabase._mocks.importSingle.mockResolvedValueOnce({
      data: null,
      error: { code: "PGRST116", message: "Not found" }, // Symulacja błędu 'Not found' z Supabase
    });

    const mockLocals = { supabase: mockSupabase };
    const response = await DELETE({ params: mockParams, locals: mockLocals } as any);

    expect(response.status).toBe(404);
    const responseBody = await response.json();
    expect(responseBody.error).toBe("Import not found");
    expect(mockSupabase._mocks.importSelect).toHaveBeenCalledWith("file_path");
    expect(mockSupabase._mocks.importSelectEqId).toHaveBeenCalledWith("id", mockParams.id);
    expect(mockSupabase._mocks.importSelectEqUserId).toHaveBeenCalledWith("user_id", mockSession.user.id);
  });

  it("should successfully delete an import with its file", async () => {
    const mockLocals = { supabase: mockSupabase };
    const response = await DELETE({ params: mockParams, locals: mockLocals } as any);

    // Sprawdź status odpowiedzi
    expect(response.status).toBe(200);

    // Sprawdź, czy pobieranie importu zostało wywołane poprawnie
    expect(mockSupabase._mocks.from).toHaveBeenCalledWith("imports");
    expect(mockSupabase._mocks.importSelect).toHaveBeenCalledWith("file_path");
    expect(mockSupabase._mocks.importSelectEqId).toHaveBeenCalledWith("id", mockParams.id);
    expect(mockSupabase._mocks.importSelectEqUserId).toHaveBeenCalledWith("user_id", mockSession.user.id);
    expect(mockSupabase._mocks.importSingle).toHaveBeenCalled();

    // Sprawdź, czy usuwanie pliku zostało wywołane
    expect(mockSupabase._mocks.storageFrom).toHaveBeenCalledWith("imports");
    expect(mockSupabase._mocks.storageRemove).toHaveBeenCalledWith([
      "user-123/platform-uuid/123e4567-e89b-12d3-a456-426614174000.csv",
    ]);

    // Sprawdź, czy usuwanie rekordu zostało wywołane poprawnie
    expect(mockSupabase._mocks.importDelete).toHaveBeenCalled();
    expect(mockSupabase._mocks.importDeleteEqId).toHaveBeenCalledWith("id", mockParams.id);
    expect(mockSupabase._mocks.importDeleteEqUserId).toHaveBeenCalledWith("user_id", mockSession.user.id);

    // Sprawdź odpowiedź
    const responseBody = await response.json();
    expect(responseBody.success).toBe(true);
  });

  it("should handle errors when deleting file from storage and still delete record", async () => {
    // Mock dla błędu podczas usuwania pliku ze storage
    mockSupabase._mocks.storageRemove.mockResolvedValueOnce({
      error: { message: "Storage error" },
    });

    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const mockLocals = { supabase: mockSupabase };
    const response = await DELETE({ params: mockParams, locals: mockLocals } as any);

    // Sprawdź, czy ostrzeżenie zostało zalogowane
    expect(consoleWarnSpy).toHaveBeenCalledWith("Warning: Could not delete file from storage:", {
      message: "Storage error",
    });

    // Sprawdź status odpowiedzi - nadal powinno być 200, ponieważ rekord został usunięty
    expect(response.status).toBe(200);
    const responseBody = await response.json();
    expect(responseBody.success).toBe(true);

    // Sprawdź, czy usuwanie rekordu zostało wywołane poprawnie
    expect(mockSupabase._mocks.importDelete).toHaveBeenCalled();
    expect(mockSupabase._mocks.importDeleteEqId).toHaveBeenCalledWith("id", mockParams.id);
    expect(mockSupabase._mocks.importDeleteEqUserId).toHaveBeenCalledWith("user_id", mockSession.user.id);

    consoleWarnSpy.mockRestore();
  });

  it("should return 500 if deleting record from db fails", async () => {
    // Mock dla błędu podczas usuwania rekordu z bazy
    // Ten mock powinien być na ostatnim kroku łańcucha: delete().eq().eq()
    mockSupabase._mocks.importDeleteEqUserId.mockResolvedValueOnce({
      error: { message: "DB delete error" },
    });

    const mockLocals = { supabase: mockSupabase };
    const response = await DELETE({ params: mockParams, locals: mockLocals } as any);

    expect(response.status).toBe(500);
    const responseBody = await response.json();
    expect(responseBody.error).toBe("Failed to delete import");
  });

  it("should return 500 if fetching import details fails (non-PGRST116 error)", async () => {
    mockSupabase._mocks.importSingle.mockResolvedValueOnce({
      data: null,
      error: { message: "Some other DB error" }, // Inny błąd niż 'Not found'
    });

    const mockLocals = { supabase: mockSupabase };
    const response = await DELETE({ params: mockParams, locals: mockLocals } as any);

    expect(response.status).toBe(500);
    const responseBody = await response.json();
    expect(responseBody.error).toBe("Failed to fetch import");
  });
});
