// Plik: src/pages/api/imports/upload.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { randomUUID } from "crypto";
import type * as Crypto from 'crypto'; // Importujemy typ, aby TypeScript był szczęśliwy
import { POST } from "./upload";
import type { APIContext } from "astro";

// Używamy dokładnie sugerowanego podejścia z komunikatu błędu
vi.mock("crypto", async (importOriginal) => {
  const actual = await importOriginal<typeof Crypto>();
  return {
    ...actual,
    randomUUID: vi.fn().mockReturnValue("123e4567-e89b-12d3-a456-426614174000")
  };
});

// Test sprawdzający mockowanie randomUUID
describe("Mockowanie crypto.randomUUID", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("powinno zwrócić zamockowaną wartość UUID", () => {
    // Wywołanie testowanej funkcji
    const result = randomUUID();
    
    // Sprawdzenie rezultatów
    expect(result).toBe("123e4567-e89b-12d3-a456-426614174000");
    expect(vi.mocked(randomUUID)).toHaveBeenCalledTimes(1);
  });
});

// Następnie testujemy sam endpoint
describe("POST /api/imports/upload - scenariusz podstawowy", () => {
  // Tworzymy minimalny mock Supabase
  const mockSupabase = {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: null },
        error: null
      })
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Proste sprawdzenie dla scenariusza 401 - użytkownik nieautoryzowany
  it("powinno zwrócić 401 dla nieautoryzowanego użytkownika", async () => {
    // Symulujemy brak sesji użytkownika
    mockSupabase.auth.getSession.mockResolvedValueOnce({
      data: { session: null },
      error: null
    });

    const mockContext = {
      locals: { supabase: mockSupabase },
      request: new Request("http://localhost/api/imports/upload", { method: "POST" })
    } as unknown as APIContext;

    const response = await POST(mockContext);
    const responseBody = await response.json();

    expect(response.status).toBe(401);
    expect(responseBody.error).toBe("Unauthorized");
    expect(mockSupabase.auth.getSession).toHaveBeenCalled();
  });
});
