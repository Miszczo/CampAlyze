import { defineMiddleware } from "astro:middleware";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/db/database.types";
import { type SupabaseClient, type Session } from "@supabase/supabase-js";

// Extend Astro locals type
declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database> | null;
      session: Session | null;
      isTestEnvironment: boolean;
      testMode: "mock" | "integration" | null;
    }
  }
}

export const onRequest = defineMiddleware(async (context, next) => {
  const supabaseUrl = import.meta.env.SUPABASE_URL;
  const supabaseKey = import.meta.env.SUPABASE_KEY;

  // Sprawdź, czy jesteśmy w środowisku testowym
  const isTestEnvironment =
    import.meta.env.IS_TEST_ENV === "true" ||
    import.meta.env.MODE === "test" ||
    process.env.IS_TEST_ENV === "true" ||
    process.env.NODE_ENV === "test";

  // Określ tryb testowy
  const testMode = isTestEnvironment
    ? import.meta.env.TEST_MODE === "mock" || process.env.TEST_MODE === "mock"
      ? "mock"
      : "integration"
    : null;

  // Ustaw flagi środowiska testowego w kontekście
  context.locals.isTestEnvironment = isTestEnvironment;
  context.locals.testMode = testMode;

  // Logger middleware
  console.log(`[Middleware] ${context.request.method} ${new URL(context.request.url).pathname}`);

  if (isTestEnvironment) {
    console.log(`[Middleware] Running in test environment, mode: ${testMode}`);
  }

  // Jeśli zmienne środowiskowe Supabase nie są dostępne lub jesteśmy w trybie testowym mock
  if (!supabaseUrl || !supabaseKey || (isTestEnvironment && testMode === "mock")) {
    if (!supabaseUrl || !supabaseKey) {
      console.warn(`[Middleware] Supabase URL or Key missing, skipping Supabase initialization`);
    } else if (isTestEnvironment && testMode === "mock") {
      console.log(`[Middleware] Using mock mode, skipping real Supabase initialization`);
    }

    // Inicjalizuj puste wartości dla kontekstu
    context.locals.supabase = null;
    context.locals.session = null;

    // W środowisku testowym możemy użyć mocków lub ustawić domyślną sesję dla testów
    if (isTestEnvironment) {
      const url = new URL(context.request.url);

      // Opcjonalnie automatycznie ustaw mockowaną sesję dla określonych ścieżek w testach
      if (
        (url.pathname.startsWith("/dashboard") && url.searchParams.get("mockSession") === "true") ||
        (testMode === "mock" && url.pathname.startsWith("/dashboard"))
      ) {
        console.log("[Middleware] Using mock session for test environment");
        context.locals.session = {
          access_token: "mock-token",
          refresh_token: "mock-refresh",
          expires_at: Date.now() + 3600,
          expires_in: 3600,
          user: {
            id: "mock-user-id",
            email: "test@example.com",
            user_metadata: { full_name: "Test User" },
          },
        } as Session;
      }
    }

    return next();
  }

  try {
    const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
      cookies: {
        get: (key) => context.cookies.get(key)?.value,
        set: (key, value, options) => {
          context.cookies.set(key, value, options);
        },
        remove: (key, options) => {
          context.cookies.delete(key, options);
        },
      },
    });

    // Dodaj klienta supabase do lokalnego kontekstu
    context.locals.supabase = supabase;

    // Sprawdź sesję użytkownika
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Dodaj informacje o sesji do lokalnego kontekstu
    context.locals.session = session;

    // Obsługa ścieżek chronionych
    const url = new URL(context.request.url);
    const isProtectedRoute = url.pathname.startsWith("/dashboard");
    const isAuthRoute =
      url.pathname.startsWith("/login") ||
      url.pathname.startsWith("/register") ||
      url.pathname.startsWith("/forgot-password") ||
      url.pathname.startsWith("/reset-password");

    // Przekierowanie dla chronionych ścieżek, gdy użytkownik nie jest zalogowany
    if (isProtectedRoute && !session) {
      return context.redirect("/login");
    }

    // Przekierowanie dla ścieżek logowania, gdy użytkownik jest już zalogowany
    if (isAuthRoute && session) {
      return context.redirect("/dashboard");
    }
  } catch (error) {
    console.error("[Middleware] Error:", error);
    // Ustaw puste wartości w przypadku błędu
    context.locals.supabase = null;
    context.locals.session = null;
  }

  return next();
});
