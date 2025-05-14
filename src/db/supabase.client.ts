import { createClient } from "@supabase/supabase-js";

import type { Database } from "../db/database.types.ts";

// Określenie, czy jesteśmy w środowisku testowym
const isTestEnvironment =
  import.meta.env.IS_TEST_ENV === "true" ||
  import.meta.env.MODE === "test" ||
  (typeof process !== "undefined" && (process.env.IS_TEST_ENV === "true" || process.env.NODE_ENV === "test"));

// Użyj zmiennych środowiskowych dla rzeczywistej bazy E2E lub normalnej konfiguracji
let supabaseUrl = import.meta.env.SUPABASE_URL;
let supabaseAnonKey = import.meta.env.SUPABASE_KEY; // Używamy SUPABASE_KEY zgodnie z .env.test

// Domyślne wartości dla testów jednostkowych, jeśli zmienne nie są ustawione
if (isTestEnvironment && (!supabaseUrl || !supabaseAnonKey)) {
  // Ostrzeżenie: Unexpected console statement
  // Zamień console.log na komentarz lub logger
  // console.log("[Supabase Client] Using dummy Supabase configuration for unit tests");
  supabaseUrl = "http://localhost:54321";
  supabaseAnonKey = "dummy-key-for-unit-tests";
} else if (isTestEnvironment) {
  // Ostrzeżenie: Unexpected console statement
  // Zamień console.log na komentarz lub logger
  // console.log("[Supabase Client] Using E2E Supabase configuration (from .env.test)");
} else {
  // Ostrzeżenie: Unexpected console statement
  // Zamień console.log na komentarz lub logger
  // console.log("[Supabase Client] Using real Supabase configuration (from .env)");
}

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
