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
  
  // Reset mocków przed każdym testem
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should return 401 if user is not authenticated", async () => {
    // Mockowanie braku sesji użytkownika
    const mockSupabase = {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      },
    };

    const mockLocals = { supabase: mockSupabase };
    const response = await DELETE({ params: mockParams, locals: mockLocals } as any);

    expect(response.status).toBe(401);
    const responseBody = await response.json();
    expect(responseBody.error).toBe("Unauthorized");
  });

  it("should return 400 if import ID is missing", async () => {
    // Mockowanie sesji użytkownika
    const mockSession = {
      user: {
        id: "user-123",
      },
    };

    const mockSupabase = {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: mockSession } }),
      },
    };

    const mockLocals = { supabase: mockSupabase };
    const response = await DELETE({ params: {}, locals: mockLocals } as any);

    expect(response.status).toBe(400);
    const responseBody = await response.json();
    expect(responseBody.error).toBe("Import ID is required");
  });

  it("should return 404 if import is not found", async () => {
    // Mockowanie sesji użytkownika
    const mockSession = {
      user: {
        id: "user-123",
      },
    };

    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { code: "PGRST116", message: "Not found" },
    });

    const mockSupabase = {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: mockSession } }),
      },
      from: vi.fn().mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      }),
    };

    const mockLocals = { supabase: mockSupabase };
    const response = await DELETE({ params: mockParams, locals: mockLocals } as any);

    expect(response.status).toBe(404);
    const responseBody = await response.json();
    expect(responseBody.error).toBe("Import not found");
  });

  it("should successfully delete an import with its file", async () => {
    // Mockowanie sesji użytkownika
    const mockSession = {
      user: {
        id: "user-123",
      },
    };

    // Mock dla pobrania danych importu
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq1 = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
      data: {
        file_path: "org-123/google/file.csv",
        organization_id: "org-123",
      },
      error: null,
    });

    // Mock dla usunięcia pliku ze storage
    const mockRemove = vi.fn().mockResolvedValue({ error: null });
    const mockStorageFrom = vi.fn().mockReturnValue({
      remove: mockRemove,
    });

    // Mock dla usunięcia rekordu z bazy danych
    const mockDelete = vi.fn().mockReturnThis();
    const mockEq2 = vi.fn().mockResolvedValue({
      error: null,
    });

    const mockSupabase = {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: mockSession } }),
      },
      from: vi.fn((table) => {
        if (table === "imports") {
          return {
            select: mockSelect,
            delete: mockDelete,
            eq: mockEq1,
          };
        }
      }),
      storage: {
        from: mockStorageFrom,
      },
    };

    // Przypisanie drugiego mocka dla eq (dla delete)
    mockEq1.mockImplementation((field, value) => {
      if (field === "id" && value === mockParams.id) {
        return {
          single: mockSingle,
          delete: mockDelete,
        };
      }
      return { single: mockSingle };
    });

    mockDelete.mockReturnValue({
      eq: mockEq2,
    });

    const mockLocals = { supabase: mockSupabase };
    const response = await DELETE({ params: mockParams, locals: mockLocals } as any);

    // Sprawdź status odpowiedzi
    expect(response.status).toBe(200);
    
    // Sprawdź, czy metody zostały wywołane
    expect(mockSupabase.from).toHaveBeenCalledWith("imports");
    expect(mockSelect).toHaveBeenCalledWith("file_path, organization_id");
    expect(mockEq1).toHaveBeenCalledWith("id", mockParams.id);
    expect(mockSingle).toHaveBeenCalled();
    
    // Sprawdź, czy usuwanie pliku zostało wywołane
    expect(mockStorageFrom).toHaveBeenCalledWith("imports");
    expect(mockRemove).toHaveBeenCalledWith(["org-123/google/file.csv"]);
    
    // Sprawdź, czy usuwanie rekordu zostało wywołane
    expect(mockDelete).toHaveBeenCalled();
    
    // Sprawdź odpowiedź
    const responseBody = await response.json();
    expect(responseBody.success).toBe(true);
  });

  it("should handle errors when deleting file from storage", async () => {
    // Mockowanie sesji użytkownika
    const mockSession = {
      user: {
        id: "user-123",
      },
    };

    // Mock dla pobrania danych importu
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq1 = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
      data: {
        file_path: "org-123/google/file.csv",
        organization_id: "org-123",
      },
      error: null,
    });

    // Mock dla błędu podczas usuwania pliku ze storage
    const mockRemove = vi.fn().mockResolvedValue({ 
      error: { message: "Storage error" } 
    });
    const mockStorageFrom = vi.fn().mockReturnValue({
      remove: mockRemove,
    });

    // Mock dla usunięcia rekordu z bazy danych
    const mockDelete = vi.fn().mockReturnThis();
    const mockEq2 = vi.fn().mockResolvedValue({
      error: null,
    });

    const mockSupabase = {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: mockSession } }),
      },
      from: vi.fn((table) => {
        if (table === "imports") {
          return {
            select: mockSelect,
            delete: mockDelete,
            eq: mockEq1,
          };
        }
      }),
      storage: {
        from: mockStorageFrom,
      },
    };

    // Przypisanie drugiego mocka dla eq (dla delete)
    mockEq1.mockImplementation((field, value) => {
      if (field === "id" && value === mockParams.id) {
        return {
          single: mockSingle,
          delete: mockDelete,
        };
      }
      return { single: mockSingle };
    });

    mockDelete.mockReturnValue({
      eq: mockEq2,
    });

    const mockLocals = { supabase: mockSupabase };

    // Mock dla console.warn aby uniknąć zanieczyszczania wyjścia testów
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    const response = await DELETE({ params: mockParams, locals: mockLocals } as any);

    // Sprawdź, czy ostrzeżenie zostało zalogowane
    expect(consoleWarnSpy).toHaveBeenCalled();
    
    // Sprawdź status odpowiedzi - nadal powinno być 200, ponieważ rekord został usunięty
    expect(response.status).toBe(200);
    
    // Sprawdź odpowiedź
    const responseBody = await response.json();
    expect(responseBody.success).toBe(true);
    
    // Przywróć oryginalną funkcję console.warn
    consoleWarnSpy.mockRestore();
  });
}); 