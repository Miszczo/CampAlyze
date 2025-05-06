import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { AstroCookies } from "astro";
import type { Database } from "../db/database.types"; // Adjust path if needed

export function createSupabaseServerClient(cookies: AstroCookies) {
  return createServerClient<Database>(import.meta.env.SUPABASE_URL!, import.meta.env.SUPABASE_ANON_KEY!, {
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
