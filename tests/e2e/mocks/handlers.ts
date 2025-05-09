import { http, HttpResponse } from "msw";

// Define user credentials type for typing
interface Credentials {
  email: string;
  password: string;
}

// Mock data for tests
const mockUsers = {
  verified: {
    id: "test-user-id-verified",
    email: "verified-user@example.com",
    password: "Password123!",
    user_metadata: { full_name: "Test Verified User" },
  },
  unverified: {
    id: "test-user-id-unverified",
    email: "unverified-user@example.com",
    password: "Password123!",
    user_metadata: { full_name: "Test Unverified User" },
  },
  lockable: {
    id: "test-user-id-lockable",
    email: "lockable-account@example.com",
    password: "correct-password",
    user_metadata: { full_name: "Test Lockable User" },
  },
};

// Store for tracking failed login attempts
const failedLoginAttempts = new Map<string, { count: number; lockedUntil: number | null }>();

// Helper function to get user by email
const getUserByEmail = (email: string): typeof mockUsers.verified | null => {
  if (email === mockUsers.verified.email) return mockUsers.verified;
  if (email === mockUsers.unverified.email) return mockUsers.unverified;
  if (email === mockUsers.lockable.email) return mockUsers.lockable;
  return null;
};

// Helper function to check if account is locked
const isAccountLocked = (email: string): boolean => {
  const attempts = failedLoginAttempts.get(email);
  if (!attempts) return false;

  // Check if account is locked and lock time hasn't expired
  if (attempts.lockedUntil && attempts.lockedUntil > Date.now()) {
    console.log(`[MSW] Account ${email} is locked until ${new Date(attempts.lockedUntil).toISOString()}`);
    return true;
  }

  // Reset lock if time has expired
  if (attempts.lockedUntil && attempts.lockedUntil <= Date.now()) {
    console.log(`[MSW] Account ${email} lock has expired, resetting counter`);
    failedLoginAttempts.set(email, { count: 0, lockedUntil: null });
    return false;
  }

  return false;
};

// Helper function to record failed login attempt
const recordFailedAttempt = (email: string): void => {
  const attempts = failedLoginAttempts.get(email) || { count: 0, lockedUntil: null };
  attempts.count += 1;

  console.log(`[MSW] Failed login attempt for ${email} - count: ${attempts.count}/5`);

  // Lock account after 5 failed attempts (15 minutes = 15 * 60 * 1000 ms)
  if (attempts.count >= 5) {
    attempts.lockedUntil = Date.now() + 15 * 60 * 1000; // 15 minutes from now
    console.log(`[MSW] Account ${email} LOCKED until ${new Date(attempts.lockedUntil).toISOString()}`);
  }

  failedLoginAttempts.set(email, attempts);
};

// Log all incoming requests for better debugging
const logRequest = async (request: Request, path: string) => {
  try {
    console.log(`[MSW-DEBUG] Intercepted ${request.method} request to ${path}`);
    console.log(`[MSW-DEBUG] Headers:`, Object.fromEntries([...request.headers.entries()]));

    // Try to log the body if present
    if (request.headers.get("content-type")?.includes("application/json")) {
      const clonedRequest = request.clone();
      const body = await clonedRequest.text();
      if (body) {
        try {
          console.log(`[MSW-DEBUG] Body:`, JSON.parse(body));
        } catch {
          console.log(`[MSW-DEBUG] Body (raw):`, body);
        }
      }
    }
  } catch (e) {
    console.error(`[MSW-DEBUG] Error logging request:`, e);
  }
};

/**
 * Handlery MSW dla testów E2E
 *
 * Ten plik zawiera definicje mockowanych endpointów API, które są używane
 * podczas testów E2E z Playwright w trybie mock. Zapewniają one deterministyczne
 * odpowiedzi dla zapytań API, symulując zachowanie rzeczywistego backendu
 * bez konieczności łączenia się z prawdziwą bazą danych.
 */
export const handlers = [
  /**
   * Endpoint logowania
   * Obsługuje różne scenariusze testowe dla procesu logowania:
   * - Prawidłowe dane uwierzytelniające
   * - Nieprawidłowe hasło
   * - Nieistniejący użytkownik
   * - Niezweryfikowany email
   * - Zablokowane konto
   */
  http.post("/api/auth/signin", async ({ request }) => {
    // Logowanie żądania dla celów debugowania
    await logRequest(request, "/api/auth/signin");

    try {
      const body = await request.json();
      const { email, password } = body;
      console.log("[MSW] Login request:", { email, password: "HIDDEN" });

      // Sprawdź, czy konto jest zablokowane
      if (isAccountLocked(email)) {
        console.log(`[MSW] Login failed: Account ${email} is locked`);
        return HttpResponse.json(
          {
            success: false,
            error: "Your account has been locked due to too many failed login attempts",
          },
          { status: 403 }
        );
      }

      // Pobierz użytkownika na podstawie emaila
      const user = getUserByEmail(email);

      // Symulacja różnych scenariuszy testowych na podstawie adresu email
      if (user && user.email === mockUsers.verified.email && password === mockUsers.verified.password) {
        // Prawidłowe dane uwierzytelniające
        console.log("[MSW] Login successful");
        return HttpResponse.json(
          {
            success: true,
            data: {
              user: {
                id: user.id,
                email: user.email,
                name: user.user_metadata.full_name,
                created_at: new Date().toISOString(),
              },
              session: {
                access_token: "mock-access-token",
                refresh_token: "mock-refresh-token",
                expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
              },
            },
          },
          { status: 200 }
        );
      } else if (user && user.email === mockUsers.unverified.email) {
        // Niezweryfikowany email
        console.log("[MSW] Login failed: Email not verified");
        return HttpResponse.json(
          {
            success: false,
            error: "Email not verified",
            requiresVerification: true,
          },
          { status: 400 }
        );
      } else if (user && user.email === mockUsers.lockable.email && password !== user.password) {
        // Nieprawidłowe hasło dla konta, które można zablokować
        recordFailedAttempt(email);
        console.log("[MSW] Login failed: Invalid credentials for lockable account");

        // Sprawdź, czy konto zostało właśnie zablokowane
        if (isAccountLocked(email)) {
          return HttpResponse.json(
            {
              success: false,
              error: "Your account has been locked due to too many failed login attempts",
            },
            { status: 403 }
          );
        }

        return HttpResponse.json(
          {
            success: false,
            error: "Invalid login credentials",
          },
          { status: 401 }
        );
      } else if (user) {
        // Nieprawidłowe hasło
        console.log("[MSW] Login failed: Invalid credentials");
        return HttpResponse.json(
          {
            success: false,
            error: "Invalid login credentials",
          },
          { status: 401 }
        );
      } else {
        // Nieistniejący użytkownik
        console.log("[MSW] Login failed: User not found");
        return HttpResponse.json(
          {
            success: false,
            error: "User not found",
          },
          { status: 404 }
        );
      }
    } catch (error) {
      console.error("[MSW] Error handling login request:", error);
      return HttpResponse.json(
        {
          success: false,
          error: "Internal server error",
        },
        { status: 500 }
      );
    }
  }),

  // Zachowujemy również oryginalny handler dla /api/auth/login, na wypadek gdyby gdzieś był używany
  http.post("/api/auth/login", async ({ request }) => {
    try {
      const body = await request.json();
      const { email, password } = body;
      console.log("[MSW] Login request:", { email, password: "HIDDEN" });

      // Symulacja różnych scenariuszy testowych na podstawie adresu email
      if (email === "verified-user@example.com" && password === "Password123!") {
        // Prawidłowe dane uwierzytelniające
        console.log("[MSW] Login successful");
        return HttpResponse.json(
          {
            success: true,
            data: {
              user: {
                id: "mock-user-id-123",
                email,
                name: "Test User",
                created_at: new Date().toISOString(),
              },
              session: {
                access_token: "mock-access-token",
                refresh_token: "mock-refresh-token",
                expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
              },
            },
          },
          { status: 200 }
        );
      } else if (email === "verified-user@example.com") {
        // Nieprawidłowe hasło
        console.log("[MSW] Login failed: Invalid credentials");
        return HttpResponse.json(
          {
            success: false,
            error: "Invalid login credentials",
          },
          { status: 401 }
        );
      } else if (email === "unverified-user@example.com") {
        // Niezweryfikowany email
        console.log("[MSW] Login failed: Email not verified");
        return HttpResponse.json(
          {
            success: false,
            error: "Email not verified",
            needsVerification: true,
          },
          { status: 400 }
        );
      } else if (email === "lockable-account@example.com") {
        // Zablokowane konto (po 5 próbach)
        console.log("[MSW] Login failed: Account locked");
        return HttpResponse.json(
          {
            success: false,
            error: "Your account has been locked due to too many failed login attempts",
          },
          { status: 403 }
        );
      } else {
        // Nieistniejący użytkownik
        console.log("[MSW] Login failed: User not found");
        return HttpResponse.json(
          {
            success: false,
            error: "User not found",
          },
          { status: 404 }
        );
      }
    } catch (error) {
      console.error("[MSW] Error handling login request:", error);
      return HttpResponse.json(
        {
          success: false,
          error: "Internal server error",
        },
        { status: 500 }
      );
    }
  }),

  /**
   * Endpoint ponownego wysłania weryfikacji email
   */
  http.post("/api/auth/resend-verification", async ({ request }) => {
    try {
      const body = await request.json();
      const { email } = body;
      console.log("[MSW] Resend verification request:", { email });

      if (email === "unverified-user@example.com") {
        console.log("[MSW] Verification email sent successfully");
        return HttpResponse.json(
          {
            success: true,
            message: "Verification email sent successfully",
          },
          { status: 200 }
        );
      } else {
        console.log("[MSW] Resend verification failed: User not found");
        return HttpResponse.json(
          {
            success: false,
            error: "User not found",
          },
          { status: 404 }
        );
      }
    } catch (error) {
      console.error("[MSW] Error handling resend verification request:", error);
      return HttpResponse.json(
        {
          success: false,
          error: "Internal server error",
        },
        { status: 500 }
      );
    }
  }),

  /**
   * Endpoint wylogowania
   */
  http.post("/api/auth/logout", async () => {
    console.log("[MSW] Logout request");
    return HttpResponse.json(
      {
        success: true,
      },
      { status: 200 }
    );
  }),

  /**
   * Endpoint rejestracji
   */
  http.post("/api/auth/register", async ({ request }) => {
    try {
      const body = await request.json();
      const { email } = body;
      console.log("[MSW] Register request:", { email, password: "HIDDEN" });

      if (email === "existing-user@example.com") {
        console.log("[MSW] Registration failed: User already exists");
        return HttpResponse.json(
          {
            success: false,
            error: "User already exists",
          },
          { status: 409 }
        );
      } else {
        console.log("[MSW] Registration successful");
        return HttpResponse.json(
          {
            success: true,
            message: "User registered successfully. Please check your email for verification.",
          },
          { status: 201 }
        );
      }
    } catch (error) {
      console.error("[MSW] Error handling register request:", error);
      return HttpResponse.json(
        {
          success: false,
          error: "Internal server error",
        },
        { status: 500 }
      );
    }
  }),

  /**
   * Endpoint importu danych
   */
  http.post("/api/imports/upload", async ({ request }) => {
    try {
      const formData = await request.formData();
      const file = formData.get("file") as File;
      const platform = formData.get("platform") as string;

      console.log("[MSW] Import request:", {
        fileName: file?.name,
        fileSize: file?.size,
        platform,
      });

      return HttpResponse.json(
        {
          success: true,
          data: {
            importId: "mock-import-id-123",
            fileName: file?.name,
            platform,
            status: "processing",
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("[MSW] Error handling import request:", error);
      return HttpResponse.json(
        {
          success: false,
          error: "Internal server error",
        },
        { status: 500 }
      );
    }
  }),

  // Email verification resend endpoint - more flexible URL matching
  http.post("*/api/auth/resend-verification", async ({ request }) => {
    await logRequest(request, "resend-verification");

    try {
      const body = await request.json();
      console.log("[MSW] Resend verification email request for:", body.email);

      const user = getUserByEmail(body.email);

      // Obsługa błędu dla problematycznego emaila
      if (body.email === "error-prone@example.com") {
        console.log("[MSW] Simulating error for problematic email:", body.email);
        return HttpResponse.json(
          { error: "Failed to resend verification email. Please try again later." },
          { status: 500 }
        );
      }

      if (!user) {
        return HttpResponse.json({ error: "User not found" }, { status: 404 });
      }

      return HttpResponse.json(
        {
          message: "Verification email sent successfully",
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("[MSW] Error in resend verification:", error);
      return HttpResponse.json({ error: "Invalid request format" }, { status: 400 });
    }
  }),

  // Registration endpoint - better url matching
  http.post("*/api/auth/signup", async ({ request }) => {
    await logRequest(request, "signup");

    try {
      const body = await request.json();
      console.log("[MSW] Registration request for:", body.email);

      // Mock email already in use scenario
      if (body.email === mockUsers.verified.email || body.email === mockUsers.unverified.email) {
        return HttpResponse.json({ error: "Email already in use" }, { status: 409 });
      }

      // Successful registration
      return HttpResponse.json(
        {
          success: true,
          message: "Registration successful. Please check your email to verify your account.",
        },
        { status: 201 }
      );
    } catch (error) {
      console.error("[MSW] Error in registration:", error);
      return HttpResponse.json({ error: "Invalid request format" }, { status: 400 });
    }
  }),

  // Password reset request endpoint
  http.post("*/api/auth/forgot-password", async ({ request }) => {
    console.log("[MSW-DEBUG] Intercepted forgot-password request to:", request.url);
    try {
      const body = await request.json();
      console.log("[MSW] Password reset request for:", body.email);

      const user = getUserByEmail(body.email);

      if (!user) {
        // We still return success for security reasons, even if the user doesn't exist
        return HttpResponse.json(
          {
            success: true,
            message: "If an account with that email exists, a password reset link has been sent.",
          },
          { status: 200 }
        );
      }

      return HttpResponse.json(
        {
          success: true,
          message: "If an account with that email exists, a password reset link has been sent.",
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("[MSW] Error in password reset:", error);
      return HttpResponse.json({ error: "Invalid request format" }, { status: 400 });
    }
  }),

  // User profile endpoint
  http.get("/api/auth/user", () => {
    // This would normally verify an auth token
    console.log("[MSW] User profile request");

    return HttpResponse.json(
      {
        success: true,
        user: {
          id: mockUsers.verified.id,
          email: mockUsers.verified.email,
          user_metadata: mockUsers.verified.user_metadata,
        },
      },
      { status: 200 }
    );
  }),

  // Endpoint do resetowania stanu mocków (np. licznik prób logowania)
  http.post("/mock/reset", () => {
    failedLoginAttempts.clear();
    console.log("[MSW] Mock state reset (failedLoginAttempts cleared)");
    return HttpResponse.json({ success: true });
  }),

  // Catch-all handler for any other auth requests
  http.all("*/api/auth/*", async ({ request }) => {
    const url = new URL(request.url);
    const headers = Object.fromEntries([...request.headers.entries()]);
    let body = null;
    try {
      const cloned = request.clone();
      body = await cloned.text();
    } catch {}
    console.log(`[MSW] Unhandled auth endpoint: ${request.method} ${url.pathname}`);
    console.log(`[MSW] Headers:`, headers);
    if (body) console.log(`[MSW] Body:`, body);
    return HttpResponse.json({ error: "Endpoint not implemented in mock server" }, { status: 501 });
  }),
];
