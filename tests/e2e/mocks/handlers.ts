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

// Define mocked API handlers for auth endpoints
export const handlers = [
  // Handle login endpoint with better wildcards and more flexible URL matching
  http.post("*/api/auth/signin", async ({ request }) => {
    await logRequest(request, "signin");

    try {
      const body = (await request.json()) as Credentials;
      console.log("[MSW] Handling login request for:", body.email);

      const user = getUserByEmail(body.email);

      // Check if account is locked
      if (user && isAccountLocked(user.email)) {
        console.log("[MSW] Account is locked:", user.email);
        return HttpResponse.json(
          {
            error:
              "Your account has been locked due to too many failed login attempts. Please try again in 15 minutes.",
          },
          { status: 403 }
        );
      }

      // Handle different test scenarios based on email/password
      if (user?.email === mockUsers.verified.email && body.password === mockUsers.verified.password) {
        console.log("[MSW] Successful login for verified user");
        return HttpResponse.json(
          {
            success: true,
            user: {
              id: user.id,
              email: user.email,
              user_metadata: user.user_metadata,
            },
          },
          { status: 200 }
        );
      }

      if (user?.email === mockUsers.lockable.email && body.password === mockUsers.lockable.password) {
        console.log("[MSW] Successful login for lockable user");
        return HttpResponse.json(
          {
            success: true,
            user: {
              id: user.id,
              email: user.email,
              user_metadata: user.user_metadata,
            },
          },
          { status: 200 }
        );
      }

      if (body.email === "nonexistent@example.com") {
        console.log("[MSW] Login attempt with non-existent user");
        return HttpResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (
        (user?.email === mockUsers.verified.email || user?.email === mockUsers.lockable.email) &&
        body.password !== user.password
      ) {
        console.log("[MSW] Login attempt with invalid credentials");

        // Record failed attempt for lockable account
        if (user?.email === mockUsers.lockable.email) {
          recordFailedAttempt(user.email);
        }

        return HttpResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      if (user?.email === mockUsers.unverified.email) {
        console.log("[MSW] Login attempt with unverified email");
        return HttpResponse.json(
          {
            error: "Email not verified",
            requiresVerification: true,
          },
          { status: 403 }
        );
      }

      // Default fallback for unhandled cases
      console.log("[MSW] Unhandled login scenario, returning generic error");
      return HttpResponse.json({ error: "Authentication failed" }, { status: 400 });
    } catch (error) {
      console.error("[MSW] Error parsing request body:", error);
      return HttpResponse.json({ error: "Invalid request format" }, { status: 400 });
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

  // Logout endpoint
  http.post("/api/auth/signout", () => {
    console.log("[MSW] Logout request");

    return HttpResponse.json(
      {
        success: true,
        message: "Logged out successfully",
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

  // Auth handlers
  http.post("/api/auth/login", async ({ request }) => {
    try {
      const body = (await request.json()) as { email: string; password: string };
      console.log("[MSW] Login request:", body);

      const { email, password } = body;

      // Case: Verified user with correct password
      if (email === "verified-user@example.com" && password === "Password123!") {
        return HttpResponse.json(
          {
            user: {
              id: "123e4567-e89b-12d3-a456-426614174000",
              email: "verified-user@example.com",
              emailVerified: true,
            },
            session: {
              accessToken: "mock-access-token",
              refreshToken: "mock-refresh-token",
            },
          },
          { status: 200 }
        );
      }

      // Case: Unverified user
      if (email === "unverified-user@example.com") {
        return HttpResponse.json(
          {
            error: "Email not confirmed",
            status: 400,
          },
          { status: 400 }
        );
      }

      // Case: Wrong password
      if (email === "verified-user@example.com") {
        return HttpResponse.json(
          {
            error: "Invalid login credentials",
            status: 401,
          },
          { status: 401 }
        );
      }

      // Case: User not found
      return HttpResponse.json(
        {
          error: "User not found",
          status: 404,
        },
        { status: 404 }
      );
    } catch (error) {
      console.error("[MSW] Error handling login request:", error);
      return HttpResponse.json(
        {
          error: "Internal server error",
          status: 500,
        },
        { status: 500 }
      );
    }
  }),

  // Resend verification email handler
  http.post("/api/auth/resend-verification", async ({ request }) => {
    try {
      const body = (await request.json()) as { email: string };
      console.log("[MSW] Resend verification request:", body);

      const { email } = body;

      // Always succeed for test emails
      if (email === "unverified-user@example.com") {
        return HttpResponse.json(
          {
            success: true,
            message: "Verification email sent",
          },
          { status: 200 }
        );
      }

      // Rate limiting error for all other emails
      return HttpResponse.json(
        {
          error: "Too many requests",
          status: 429,
        },
        { status: 429 }
      );
    } catch (error) {
      console.error("[MSW] Error handling resend verification request:", error);
      return HttpResponse.json(
        {
          error: "Internal server error",
          status: 500,
        },
        { status: 500 }
      );
    }
  }),
];
