import { createServerClient } from "@supabase/ssr";
import type { AstroCookies, CookieOptions } from "astro";
import type { Database } from "../db/database.types"; // Adjust path if needed

export function createSupabaseServerClient(cookies: AstroCookies) {
  // Używamy bezpiecznych wartości domyślnych zamiast non-null assertion
  const supabaseUrl = import.meta.env.SUPABASE_URL || "";
  const supabaseKey = import.meta.env.SUPABASE_ANON_KEY || "";

  return createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      get(key: string) {
        return cookies.get(key)?.value;
      },
      set(key: string, value: string, options: CookieOptions) {
        cookies.set(key, value, options);
      },
      remove(key: string, options: CookieOptions) {
        cookies.delete(key, options);
      },
    },
  });
}
