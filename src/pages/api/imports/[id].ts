import type { APIRoute } from "astro";
import { supabaseClient } from "../../../db/supabase.client";

export const prerender = false;

export const DELETE: APIRoute = async ({ params, locals }) => {
  // 1. Autoryzacja: pobranie sesji z Supabase
  const supabase = locals.supabase as typeof supabaseClient;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2. Sprawdzenie, czy ID importu zostało podane
  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: "Import ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // 3. Pobranie informacji o imporcie przed usunięciem (potrzebujemy ścieżki pliku)
    const { data: importData, error: fetchError } = await supabase
      .from("imports")
      .select("file_path")
      .eq("id", id)
      .eq("user_id", session.user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return new Response(JSON.stringify({ error: "Import not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      console.error("Error fetching import:", fetchError);
      return new Response(JSON.stringify({ error: "Failed to fetch import" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 4. Usunięcie pliku z Supabase Storage (jeśli istnieje ścieżka pliku)
    if (importData.file_path) {
      const { error: storageError } = await supabase.storage.from("imports").remove([importData.file_path]);

      if (storageError) {
        console.warn("Warning: Could not delete file from storage:", storageError);
        // Kontynuujemy usuwanie rekordu nawet jeśli plik nie został usunięty
      }
    }

    // 5. Usunięcie rekordu importu z bazy danych
    const { error: deleteError } = await supabase.from("imports").delete().eq("id", id).eq("user_id", session.user.id);

    if (deleteError) {
      console.error("Error deleting import:", deleteError);
      return new Response(JSON.stringify({ error: "Failed to delete import" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 6. Zwrócenie sukcesu
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
