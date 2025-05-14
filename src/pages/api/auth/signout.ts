import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ locals, redirect, cookies, request }) => {
  const supabase = locals.supabase;
  
  if (!supabase) {
    console.error("Supabase client not available in locals");
    return new Response(JSON.stringify({ error: "Authentication service unavailable" }), { status: 500 });
  }

  // Wykryj prefix ciasteczek Supabase z URL-a
  let prefix = "sb";
  try {
    const supabaseUrl = import.meta.env.SUPABASE_URL;
    if (supabaseUrl) {
      const hostname = new URL(supabaseUrl).hostname;
      const hostnameSegments = hostname.split('.');
      if (hostnameSegments.length > 0 && hostnameSegments[0].startsWith('sb-')) {
        prefix = hostnameSegments[0]; // np. 'sb-127'
        console.log(`[Auth] Detected Supabase prefix: ${prefix}`);
      }
    }
  } catch (error) {
    console.warn("[Auth] Error detecting Supabase prefix:", error);
    // Fallback do domyślnego prefixu jeśli nie można wykryć
  }

  // Zapisz nazwy ciasteczek do usunięcia
  const authTokenCookie = `${prefix}-auth-token`;
  const authTokenVerifierCookie = `${prefix}-auth-token-code-verifier`;

  // 1. Wyloguj przez API Supabase
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("[Auth] Supabase SignOut Error:", error);
    // Nawet jeśli API zwróci błąd, kontynuujemy z czyszczeniem ciasteczek
  }

  // 2. Ręcznie usuń ciasteczka (dla pewności)
  try {
    // Usuń ciasteczka auth tokenu
    cookies.delete(authTokenCookie);
    cookies.delete(authTokenVerifierCookie);
    
    // Dla zgodności wstecz, usuń również wersje bez prefixu (jeśli istnieją)
    cookies.delete('sb-auth-token');
    cookies.delete('sb-auth-token-code-verifier');
    
    console.log(`[Auth] Cookies cleared: ${authTokenCookie}, ${authTokenVerifierCookie}`);
  } catch (cookieError) {
    console.error("[Auth] Error clearing cookies:", cookieError);
  }

  // 3. Przekieruj użytkownika na stronę logowania
  return redirect("/login?message=Successfully signed out.", 303);
};
