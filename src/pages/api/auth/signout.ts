import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ locals, redirect }) => {
  const supabase = locals.supabase;

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Supabase SignOut Error:", error);
    // Even if signout fails, redirecting is usually the desired behavior.
    // Optionally return an error response:
    // return new Response(JSON.stringify({ error: "Could not sign out." }), { status: 500 });
  }

  // Redirect to login page after sign out
  return redirect("/login?message=Successfully signed out.", 303);
};
