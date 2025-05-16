import { createClient } from "@supabase/supabase-js";
import type { AstroGlobal } from "astro";
import type { Database } from "./database.types";

export function supabaseServerClient(Astro: AstroGlobal) {
  const supabaseUrl = import.meta.env.SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: "pkce",
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
      headers: {
        // Przekazujemy cookie z żądania klienta do Supabase
        Cookie: Astro.request.headers.get("cookie") || "",
      },
    },
  });
}
