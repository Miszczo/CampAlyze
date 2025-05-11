import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "../db/database.types"; // Adjust path if needed

let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Gets a Supabase client for use in browser environments (client-side components).
 * Uses a singleton pattern to avoid creating multiple instances.
 */
export function getSupabaseBrowserClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  if (!supabaseClient) {
    // Zamiast używać non-null assertion, użyjmy bezpiecznych wartości domyślnych
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || "";
    const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || "";

    supabaseClient = createBrowserClient<Database>(supabaseUrl, supabaseKey);
  }

  return supabaseClient;
}
