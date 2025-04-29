import type { APIRoute } from "astro";
import { z } from "zod";
import { randomUUID } from "crypto";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parsowanie multipart/form-data
    const form = await request.formData();

    // Weryfikacja obecności pliku
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ error: "Missing file" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Walidacja MIME (tylko text/csv)
    if (file.type !== "text/csv") {
      return new Response(JSON.stringify({ error: "Invalid file type. Only text/csv allowed." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Walidacja rozmiaru (<= 5 MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      return new Response(JSON.stringify({ error: "File too large. Max size is 5MB." }), {
        status: 413,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Walidacja pozostałych pól: platform_id i organization_id
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

    // Symulacja zapisu do bazy bez faktycznego użycia Supabase
    const fileId = randomUUID();
    const fileExtension = file.name.split(".").pop();

    // Zwracamy informację o sukcesie
    const response = {
      id: fileId,
      original_filename: file.name,
      status: "pending",
      test_mode: true,
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
