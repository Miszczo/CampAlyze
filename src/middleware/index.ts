import { defineMiddleware } from "astro:middleware";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Database } from "@/db/database.types";
import { type SupabaseClient, type Session } from "@supabase/supabase-js";

export const onRequest = defineMiddleware(async (context, next) => {
  const supabaseUrl = import.meta.env.SUPABASE_URL;
  const supabaseKey = import.meta.env.SUPABASE_KEY;

  const isTestEnvironment =
    import.meta.env.IS_TEST_ENV === "true" ||
    import.meta.env.MODE === "test" ||
    process.env.IS_TEST_ENV === "true" ||
    process.env.NODE_ENV === "test";

  const testMode = isTestEnvironment
    ? import.meta.env.TEST_MODE === "mock" || process.env.TEST_MODE === "mock"
      ? "mock"
      : "integration"
    : null;

  context.locals.isTestEnvironment = isTestEnvironment;
  context.locals.testMode = testMode;

  console.log(`[Middleware] ${context.request.method} ${new URL(context.request.url).pathname}`);
  if (isTestEnvironment) {
    console.log(`[Middleware] Running in test environment, mode: ${testMode}`);

    // DEBUG: Log incoming cookie keys to help diagnose auth cookie issues during tests.
    const rawCookieHeader = context.request.headers.get("cookie") || "";
    console.log(`[Middleware][DEBUG] Cookie header: ${rawCookieHeader}`);
  }

  if (isTestEnvironment && testMode === "mock") {
    console.log(`[Middleware] Mock mode active. Checking for playwright_mock_session cookie.`);
    context.locals.supabase = null;
    context.locals.session = null;

    const cookies = context.cookies;
    const mockCookie = cookies.get("playwright_mock_session");
    const hasPlaywrightMockSessionCookie = mockCookie !== undefined;

    console.log(
      `[Middleware] Mock Mode: Has playwright_mock_session cookie: ${hasPlaywrightMockSessionCookie}`,
      mockCookie ? `Value: ${mockCookie.value}` : ""
    );

    if (hasPlaywrightMockSessionCookie) {
      console.log("[Middleware] Mock Mode: playwright_mock_session cookie FOUND. Setting mock session.");
      context.locals.session = {
        access_token: "mock-token",
        refresh_token: "mock-refresh",
        token_type: "bearer",
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        expires_in: 3600,
        user: {
          id: "mock-user-id",
          email: "test@example.com",
          user_metadata: { full_name: "Test User Mock From Cookie" },
          app_metadata: {},
          aud: "authenticated",
          created_at: new Date().toISOString(),
        },
      } as unknown as Session;
    } else {
      console.log("[Middleware] Mock Mode: playwright_mock_session cookie NOT FOUND. Session remains null.");
    }
    return next();
  }

  if (!supabaseUrl || !supabaseKey) {
    console.warn(`[Middleware] Supabase URL or Key missing. Supabase client not initialized. Session will be null.`);
    context.locals.supabase = null;
    context.locals.session = null;
    context.locals.supabaseInitializationError = new Error("Supabase URL or Key missing.");
    return next();
  }

  try {
    const projectRef = (() => {
      try {
        const hostname = new URL(supabaseUrl).hostname;
        if (hostname === "localhost" || hostname === "127.0.0.1") return "127";
        return hostname.split(".")[0];
      } catch {
        return "unknown";
      }
    })();

    const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
      cookieOptions: { name: `sb-${projectRef}-auth-token` },
      cookies: {
        get: (key) => context.cookies.get(key)?.value,
        set: (key, value, options: CookieOptions) => {
          context.cookies.set(key, value, options);
        },
        remove: (key, options: CookieOptions) => {
          context.cookies.delete(key, options);
        },
      },
    });
    context.locals.supabase = supabase;

    const {
      data: { session },
    } = await supabase.auth.getSession();
    context.locals.session = session;
    if (session) {
      console.log("[Middleware] Real session found for:", session.user.email);
    } else {
      console.log("[Middleware] No real session found.");
    }

    const url = new URL(context.request.url);
    const isProtectedRoute = protectedPaths.some((path) => url.pathname.startsWith(path));
    const isAuthRoute = authRoutes.some((path) => url.pathname.startsWith(path));
    const isPublicApiRoute = publicApiRoutes.some((path) => url.pathname.startsWith(path));

    if (isPublicApiRoute) {
      console.log(`[Middleware] Public API route, allowing access: ${url.pathname}`);
      return next();
    }

    if (isProtectedRoute && !session) {
      console.log(`[Middleware] Redirecting to /login from protected route: ${url.pathname}`);
      return context.redirect("/login");
    }

    if (isAuthRoute && session) {
      console.log(`[Middleware] Redirecting to /dashboard from auth route: ${url.pathname} (user already logged in)`);
      return context.redirect("/dashboard");
    }
  } catch (error) {
    console.error("[Middleware] Error during Supabase client initialization or session handling:", error);
    context.locals.supabase = null;
    context.locals.session = null;
    if (error instanceof Error) {
      context.locals.supabaseInitializationError = error;
    } else {
      context.locals.supabaseInitializationError = new Error(String(error));
    }
  }

  return next();
});

const protectedPaths = [
  "/dashboard",
  "/import",
  "/kampanie",
  "/dziennik-zmian",
  "/alerty",
  "/eksport",
  "/ai-insights",
  "/api/data",
];
const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password", "/auth/callback"];
const publicApiRoutes = ["/api/auth"];

export function getSupabase(locals: App.Locals): SupabaseClient<Database> {
  if (locals.supabaseInitializationError) {
    console.error("Supabase client initialization previously failed.", locals.supabaseInitializationError);
    throw new Error("Supabase client is not available due to an initialization error. Check middleware logs.");
  }
  if (!locals.supabase && !(locals.isTestEnvironment && locals.testMode === "mock")) {
    console.error("Supabase client is null and not in a mock test environment.");
    throw new Error("Supabase client is not available and not in mock mode. Check middleware logs.");
  }
  return locals.supabase as SupabaseClient<Database>;
}
