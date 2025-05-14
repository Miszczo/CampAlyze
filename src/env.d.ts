/// <reference types="astro/client" />

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./db/database.types";

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database> | null;
      session: import("@supabase/supabase-js").Session | null;
      isTestEnvironment: boolean;
      testMode: "mock" | "integration" | null;
      supabaseInitializationError?: Error;
    }
  }
}

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly OPENROUTER_API_KEY: string;
  readonly SUPABASE_TEST_USER_EMAIL?: string;
  readonly SUPABASE_TEST_USER_PASSWORD?: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
