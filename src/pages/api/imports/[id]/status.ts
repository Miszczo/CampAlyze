import type { APIRoute } from "astro";
import { supabaseClient } from "../../../../db/supabase.client"; // Poprawiona ścieżka
import type { ImportStatusResponseDTO } from "../../../../types"; // Poprawiona ścieżka

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  // 1. Pobranie ID importu z parametrów ścieżki
  const importId = params.id;

  if (!importId) {
    return new Response(JSON.stringify({ error: "Import ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2. Autoryzacja: pobranie sesji z Supabase
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

  try {
    // 3. Pobranie statusu importu z bazy danych
    // Upewnij się, że import należy do użytkownika lub jego organizacji
    // Na razie zakładamy prostsze sprawdzenie - tylko po user_id
    const { data: importData, error: dbError } = await supabase
      .from("imports")
      .select("status, error_message") // Dodajemy error_message
      .eq("id", importId)
      .eq("user_id", session.user.id) // Klauzula bezpieczeństwa
      .single();

    if (dbError) {
      console.error("Database error fetching import status:", dbError);
      if (dbError.code === 'PGRST116') { // Not a single row
        return new Response(JSON.stringify({ error: "Import not found or access denied" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
      }
      return new Response(JSON.stringify({ error: "Failed to fetch import status" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!importData) {
      return new Response(JSON.stringify({ error: "Import not found or access denied" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 4. Zwrócenie odpowiedzi
    const response: ImportStatusResponseDTO = {
      status: importData.status as "pending" | "completed" | "failed" | "processing", // Dodajemy 'processing'
      message: importData.error_message || undefined,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Unexpected error fetching import status:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}; 