import { createClient } from "@supabase/supabase-js";

import type { Database } from "../db/database.types.ts";

// Określenie, czy jesteśmy w środowisku testowym
const isTestEnvironment =
  import.meta.env.IS_TEST_ENV === "true" ||
  import.meta.env.MODE === "test" ||
  (typeof process !== "undefined" && (process.env.IS_TEST_ENV === "true" || process.env.NODE_ENV === "test"));

// Użyj zmiennych środowiskowych lub wartości mockowanych dla testów
const supabaseUrl = isTestEnvironment
  ? import.meta.env.MOCK_SUPABASE_URL || "https://mock.supabase.co"
  : import.meta.env.SUPABASE_URL;

const supabaseAnonKey = isTestEnvironment
  ? import.meta.env.MOCK_SUPABASE_KEY || "mock-key"
  : import.meta.env.SUPABASE_KEY;

// Log informacyjny pokazujący użycie rzeczywistego lub mockowanego klienta
if (isTestEnvironment) {
  console.log("[Supabase Client] Using mock Supabase configuration for tests");
} else {
  console.log("[Supabase Client] Using real Supabase configuration");
}

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
