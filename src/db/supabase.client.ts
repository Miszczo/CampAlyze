import { createClient } from "@supabase/supabase-js";

import type { Database } from "../db/database.types.ts";

// Określenie, czy jesteśmy w środowisku testowym
const isTestEnvironment =
  import.meta.env.IS_TEST_ENV === "true" ||
  import.meta.env.MODE === "test" ||
  (typeof process !== "undefined" && (process.env.IS_TEST_ENV === "true" || process.env.NODE_ENV === "test"));

// Użyj zmiennych środowiskowych dla rzeczywistej bazy E2E lub normalnej konfiguracji
const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY; // Używamy SUPABASE_KEY zgodnie z .env.test

// Log informacyjny pokazujący użycie konfiguracji
if (isTestEnvironment) {
  console.log("[Supabase Client] Using E2E Supabase configuration (from .env.test)");
} else {
  console.log("[Supabase Client] Using real Supabase configuration (from .env)");
}

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
