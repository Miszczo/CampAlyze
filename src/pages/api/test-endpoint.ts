import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ success: true, message: "Test endpoint works!" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
