import type { APIRoute } from "astro";
import { z } from "zod";
import { supabaseClient } from "../../../db/supabase.client";
import type { ImportFileResponseDTO } from "../../../types";
import { randomUUID } from "crypto";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
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
    // 2. Parsowanie multipart/form-data
    const form = await request.formData();

    // 3. Weryfikacja obecności pliku
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ error: "Missing file" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 4. Walidacja MIME (tylko text/csv)
    if (file.type !== "text/csv") {
      return new Response(JSON.stringify({ error: "Invalid file type. Only text/csv allowed." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 5. Walidacja rozmiaru (<= 5 MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      return new Response(JSON.stringify({ error: "File too large. Max size is 5MB." }), {
        status: 413,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 6. Walidacja pozostałych pól: platform_id i organization_id
    const rawPlatform = form.get("platform_id");
    const rawOrg = form.get("organization_id");
    const schema = z.object({
      platform_id: z.enum(["meta", "google"]),
      organization_id: z.string().uuid(),
    });
    const parseResult = schema.safeParse({
      platform_id: rawPlatform,
      organization_id: rawOrg,
    });
    if (!parseResult.success) {
      return new Response(JSON.stringify({ error: "Invalid platform_id or organization_id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const { platform_id, organization_id } = parseResult.data;

    // 7. Generowanie unikalnego ID dla pliku
    const fileId = randomUUID();
    const fileExtension = file.name.split(".").pop();
    const storagePath = `${organization_id}/${platform_id}/${fileId}.${fileExtension}`;

    // 8. Konwersja pliku do ArrayBuffer
    const fileBuffer = await file.arrayBuffer();

    // 9. Upload pliku do Supabase Storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from("imports")
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (storageError) {
      console.error("Storage upload error:", storageError);
      return new Response(JSON.stringify({ error: "Failed to upload file to storage" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const filePath = storageData.path;

    // 10. Utworzenie rekordu w tabeli imports
    const { data: importRecord, error: dbError } = await supabase
      .from("imports")
      .insert({
        id: fileId,
        original_filename: file.name,
        file_path: filePath,
        status: "pending",
        organization_id,
        platform_id,
        user_id: session.user.id,
      })
      .select("id, original_filename, status")
      .single();

    if (dbError) {
      console.error("Database insert error:", dbError);
      // Próba usunięcia pliku, jeśli zapis do DB się nie powiódł
      await supabase.storage.from("imports").remove([storagePath]);
      return new Response(JSON.stringify({ error: "Failed to create import record" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 11. Zwrócenie odpowiedzi zgodnej z ImportFileResponseDTO
    const response: ImportFileResponseDTO = {
      id: importRecord.id,
      original_filename: importRecord.original_filename,
      status: importRecord.status,
    };

    return new Response(JSON.stringify(response), {
      status: 201,
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
