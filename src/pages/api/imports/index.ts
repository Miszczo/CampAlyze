import type { APIRoute } from "astro";
import { supabaseClient } from "../../../db/supabase.client";
import type { ImportListItemDTO } from "../../../types";

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
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

  try {
    // 2. Pobranie listy importów z bazy danych (bez paginacji)
    const { data: imports, error } = await supabase
      .from("imports")
      .select(`
        id, 
        organization_id,
        platform_id,
        platforms (name),
        original_filename,
        status,
        created_at,
        error_message
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database query error:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch imports" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Mapowanie danych do formatu ImportListItemDTO
    const importsList: ImportListItemDTO[] = imports.map((importItem) => ({
      id: importItem.id,
      organization_id: importItem.organization_id,
      platform_id: importItem.platform_id,
      platform_name: importItem.platforms?.name || importItem.platform_id, // Fallback jeśli join się nie powiedzie
      original_filename: importItem.original_filename,
      status: importItem.status,
      created_at: importItem.created_at,
      error_message: importItem.error_message,
    }));

    // 4. Zwrócenie odpowiedzi zgodnej z oczekiwaniami
    return new Response(JSON.stringify({ data: importsList }), {
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