import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { getPlatformIdByNameCached } from "./platform-utils";

// Utworzenie klienta supabase dla testów E2E
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
  auth: {
    persistSession: false,
  },
});

interface MockImportParams {
  original_filename: string;
  status: "pending" | "processing" | "completed" | "failed";
  platform_id: "google" | "meta" | string; // Teraz akceptuje zarówno nazwy jak i UUID
  error_message?: string | null;
}

export async function createMockImport(params: MockImportParams): Promise<string> {
  try {
    const id = randomUUID();
    const user_id = process.env.TEST_USER_ID;
    const organization_id = process.env.TEST_ORGANIZATION_ID;

    if (!user_id || !organization_id) {
      throw new Error("Brak ID użytkownika lub organizacji w zmiennych środowiskowych");
    }

    // Pobierz UUID platformy, jeśli przekazano nazwę (google/meta)
    let platformId = params.platform_id;

    // Jeśli to nie UUID (36 znaków z myślnikami), traktuj jako nazwę platformy
    if (
      typeof platformId === "string" &&
      !platformId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    ) {
      console.log(`Pobieranie UUID dla platformy: ${platformId}`);
      platformId = await getPlatformIdByNameCached(platformId);
      console.log(`Otrzymano UUID: ${platformId}`);
    }

    const { error } = await supabase.from("imports").insert({
      id,
      original_filename: params.original_filename,
      file_path: `${organization_id}/${params.platform_id}/test/${params.original_filename}`,
      status: params.status,
      user_id,
      organization_id,
      platform_id: platformId, // Używamy UUID platformy, nie nazwy
      error_message: params.error_message || null,
    });

    if (error) {
      console.error("Błąd podczas tworzenia testowego importu:", error);
      throw error;
    }

    return id;
  } catch (error) {
    console.error("Nieoczekiwany błąd podczas tworzenia testowego importu:", error);
    throw error;
  }
}

export async function cleanupMockImport(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("imports").delete().eq("id", id);

    if (error) {
      console.error("Błąd podczas usuwania testowego importu:", error);
    }
  } catch (error) {
    console.error("Nieoczekiwany błąd podczas usuwania testowego importu:", error);
  }
}
