import { GET } from "./status"; // Endpoint do testowania
import { supabaseClient } from "../../../../db/supabase.client"; // Do mockowania
import { vi, describe, it, expect, beforeEach } from "vitest";
import type { APIContext } from "astro";

// Mock Supabase client
vi.mock("../../../../db/supabase.client", () => ({
  supabaseClient: {
    auth: {
      getSession: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            // Drugie eq dla user_id
            single: vi.fn(),
          })),
          single: vi.fn(), // Na wypadek gdyby user_id nie był używany w jakimś mocku
        })),
      })),
    })),
  },
}));

// Definicja uproszczonego typu Locals dla celów testowych
interface MockLocals {
  supabase: typeof supabaseClient | null; // Zgodnie z Astro może być null
  session: Record<string, any> | null; // Uproszczony session mock
  isTestEnvironment?: boolean;
  testMode?: string;
  // Można dodać inne właściwości z globalnego typu Locals, jeśli są potrzebne
}

// Helper do tworzenia mock APIContext
const createMockApiContext = (params: Record<string, any>, localsInput?: Partial<MockLocals>): APIContext => {
  const mockLocals = {
    supabase: supabaseClient,
    session: null,
    ...localsInput,
  } as unknown as APIContext["locals"];

  // Uproszczony mock, dostarczamy tylko to, co jest używane przez endpoint
  return {
    params,
    locals: mockLocals,
    request: new Request("http://localhost") as APIContext["request"],
    url: new URL("http://localhost") as APIContext["url"],
    // Poniższe pola są dodane, aby zaspokoić typ APIContext, ale nie są używane przez ten endpoint
    // @ts-ignore
    cookies: { get: vi.fn(), set: vi.fn(), delete: vi.fn(), has: vi.fn() } as APIContext["cookies"],
    redirect: vi.fn() as APIContext["redirect"],
    props: {} as APIContext["props"],
    site: undefined as APIContext["site"], // Może być undefined
    generator: "" as APIContext["generator"],
    clientAddress: "127.0.0.1" as APIContext["clientAddress"],
    // slots nie jest częścią APIContext dla endpointów
  } as APIContext;
};

describe("API Route - /api/imports/[id]/status", () => {
  const mockSession = {
    data: { session: { user: { id: "test-user-id" } } },
    error: null,
  };
  const noMockSession = { data: { session: null }, error: null };

  beforeEach(() => {
    vi.resetAllMocks();
    // Domyślne mockowanie sesji jako zalogowany użytkownik
    (supabaseClient.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue(mockSession);
  });

  it("should return 400 if importId is missing", async () => {
    const context = createMockApiContext({});
    const response = await GET(context as APIContext);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Import ID is required");
  });

  it("should return 401 if user is not authenticated", async () => {
    (supabaseClient.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValueOnce(noMockSession);
    const context = createMockApiContext({ id: "test-import-id" });
    const response = await GET(context);
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe("Unauthorized");
  });

  const statusesToTest: Array<"pending" | "processing" | "completed" | "failed"> = [
    "pending",
    "processing",
    "completed",
    "failed",
  ];
  statusesToTest.forEach((status) => {
    it(`should return 200 with status "${status}" if import found`, async () => {
      const mockImportData = { status, error_message: status === "failed" ? "Test error" : null };

      // Uproszczone mockowanie Supabase query chain
      const mockSingle = vi.fn().mockResolvedValue({ data: mockImportData, error: null });
      const mockEqUserId = vi.fn(() => ({ single: mockSingle }));
      const mockEqImportId = vi.fn(() => ({ eq: mockEqUserId, single: mockSingle })); // single jako fallback gdyby nie było drugiego eq
      const mockSelect = vi.fn(() => ({ eq: mockEqImportId }));
      (supabaseClient.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: mockSelect,
      });

      const context = createMockApiContext({ id: "test-import-id" });
      const response = await GET(context);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.status).toBe(status);
      if (status === "failed") {
        expect(body.message).toBe("Test error");
      } else {
        expect(body.message).toBeUndefined();
      }
      expect(supabaseClient.from).toHaveBeenCalledWith("imports");
      expect(mockSelect).toHaveBeenCalledWith("status, error_message");
      expect(mockEqImportId).toHaveBeenCalledWith("id", "test-import-id");
      expect(mockEqUserId).toHaveBeenCalledWith("user_id", "test-user-id");
      expect(mockSingle).toHaveBeenCalled();
    });
  });

  it("should return 404 if import not found (DB returns no data)", async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockEqUserId = vi.fn(() => ({ single: mockSingle }));
    const mockEqImportId = vi.fn(() => ({ eq: mockEqUserId, single: mockSingle }));
    const mockSelect = vi.fn(() => ({ eq: mockEqImportId }));
    (supabaseClient.from as ReturnType<typeof vi.fn>).mockReturnValue({ select: mockSelect });

    const context = createMockApiContext({ id: "non-existent-id" });
    const response = await GET(context);
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toBe("Import not found or access denied");
  });

  it("should return 404 if import not found (DB error PGRST116)", async () => {
    const dbError = { code: "PGRST116", message: "Row not found" };
    const mockSingle = vi.fn().mockResolvedValue({ data: null, error: dbError });
    const mockEqUserId = vi.fn(() => ({ single: mockSingle }));
    const mockEqImportId = vi.fn(() => ({ eq: mockEqUserId, single: mockSingle }));
    const mockSelect = vi.fn(() => ({ eq: mockEqImportId }));
    (supabaseClient.from as ReturnType<typeof vi.fn>).mockReturnValue({ select: mockSelect });

    const context = createMockApiContext({ id: "non-existent-id" });
    const response = await GET(context);
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toBe("Import not found or access denied");
  });

  it("should return 500 on other database error", async () => {
    const dbError = { code: "SOME_OTHER_CODE", message: "Generic DB error" };
    const mockSingle = vi.fn().mockResolvedValue({ data: null, error: dbError });
    const mockEqUserId = vi.fn(() => ({ single: mockSingle }));
    const mockEqImportId = vi.fn(() => ({ eq: mockEqUserId, single: mockSingle }));
    const mockSelect = vi.fn(() => ({ eq: mockEqImportId }));
    (supabaseClient.from as ReturnType<typeof vi.fn>).mockReturnValue({ select: mockSelect });

    const context = createMockApiContext({ id: "test-import-id" });
    const response = await GET(context);
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe("Failed to fetch import status");
  });
});
