import { expect, vi, describe, it, beforeEach } from "vitest";
import { GET } from "./index";

// Mock dla modułu Supabase
vi.mock("../../../db/supabase.client", () => ({
  supabaseClient: {
    auth: {
      getSession: vi.fn(),
    },
    from: vi.fn(),
  },
}));

describe("GET /api/imports endpoint", () => {
  // Przygotowanie zmiennych
  const mockRequest = new Request("http://localhost:3000/api/imports");
  const mockImports = [
    {
      id: "123e4567-e89b-12d3-a456-426614174000",
      organization_id: "123e4567-e89b-12d3-a456-426614174001",
      platform_id: "google",
      platforms: { name: "Google Ads" },
      original_filename: "google_ads_data.csv",
      status: "completed",
      created_at: "2024-05-19T10:00:00.000Z",
      error_message: null,
    },
    {
      id: "223e4567-e89b-12d3-a456-426614174002",
      organization_id: "123e4567-e89b-12d3-a456-426614174001",
      platform_id: "meta",
      platforms: { name: "Meta Ads" },
      original_filename: "meta_ads_data.csv",
      status: "failed",
      created_at: "2024-05-18T10:00:00.000Z",
      error_message: "Invalid file format",
    },
  ];

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
    const response = await GET({ request: mockRequest, locals: mockLocals } as any);

    expect(response.status).toBe(401);
    const responseBody = await response.json();
    expect(responseBody.error).toBe("Unauthorized");
  });

  it("should return a list of imports for authenticated user", async () => {
    // Mockowanie sesji użytkownika
    const mockSession = {
      user: {
        id: "user-123",
      },
    };

    const mockEq = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockResolvedValue({
      data: mockImports,
      error: null,
    });
    const mockSelect = vi.fn().mockReturnValue({
      eq: mockEq,
      order: mockOrder,
    });

    const mockSupabase = {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: mockSession } }),
      },
      from: vi.fn().mockReturnValue({
        select: mockSelect,
      }),
    };

    const mockLocals = { supabase: mockSupabase };
    const response = await GET({ request: mockRequest, locals: mockLocals } as any);

    // Sprawdź status odpowiedzi
    expect(response.status).toBe(200);

    // Sprawdź, czy metoda from została wywołana
    expect(mockSupabase.from).toHaveBeenCalledWith("imports");
    
    // Sprawdź, czy metoda select została wywołana
    expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining("id,\n        platform_id,\n        platforms (name)"));
    
    // Sprawdź, czy metoda eq została wywołana z odpowiednimi parametrami
    expect(mockEq).toHaveBeenCalledWith("user_id", "user-123");

    // Sprawdź, czy metoda order została wywołana z odpowiednimi parametrami
    expect(mockOrder).toHaveBeenCalledWith("created_at", { ascending: false });

    // Sprawdź strukturę odpowiedzi
    const responseBody = await response.json();
    expect(Array.isArray(responseBody.data)).toBe(true);
    expect(responseBody.data).toHaveLength(2);
    
    // Sprawdź czy dane są poprawnie zmapowane do ImportListItemDTO
    expect(responseBody.data[0]).toEqual({
      id: mockImports[0].id,
      platform_id: mockImports[0].platform_id,
      platform_name: mockImports[0].platforms.name,
      original_filename: mockImports[0].original_filename,
      status: mockImports[0].status,
      created_at: mockImports[0].created_at,
      error_message: mockImports[0].error_message,
    });
    // Sprawdź, czy user_id jest obecny, jeśli jest zwracany przez API (opcjonalne, w zależności od definicji DTO)
    if (responseBody.data[0].user_id) {
      expect(responseBody.data[0].user_id).toBeDefined();
    }
  });

  it("should handle database error gracefully", async () => {
    // Mockowanie sesji użytkownika
    const mockSession = {
      user: {
        id: "user-123",
      },
    };

    // Mockowanie błędu bazy danych
    const mockEqError = vi.fn().mockReturnThis();
    const mockOrderError = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "Database error" },
    });
    const mockSelectError = vi.fn().mockReturnValue({
      eq: mockEqError,
      order: mockOrderError,
    });

    const mockSupabase = {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: mockSession } }),
      },
      from: vi.fn().mockReturnValue({
        select: mockSelectError,
      }),
    };

    const mockLocals = { supabase: mockSupabase };
    const response = await GET({ request: mockRequest, locals: mockLocals } as any);

    // Sprawdź status odpowiedzi
    expect(response.status).toBe(500);
    
    // Sprawdź treść błędu
    const responseBody = await response.json();
    expect(responseBody.error).toBe("Failed to fetch imports");
  });
}); 