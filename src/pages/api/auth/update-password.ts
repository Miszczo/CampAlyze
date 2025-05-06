import type { APIRoute } from "astro";
import { z, ZodError } from "zod";
import { AuthApiError } from "@supabase/supabase-js";

// Validation schema
const updatePasswordSchema = z.object({
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    // Optional: Add regex for complexity (e.g., letters and numbers)
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/, {
      message: "Password must contain at least one letter and one number",
    }),
});

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const supabase = locals.supabase;
  const session = locals.session;

  // This endpoint should only be accessed when the user has a valid session
  // established after clicking the password recovery link.
  // The @supabase/ssr client handles the code exchange implicitly.
  if (!session) {
    // This shouldn't normally happen if the flow is correct, but handle it defensively.
    return new Response(JSON.stringify({ error: "Not authenticated or session expired." }), { status: 401 });
  }

  try {
    const body = await request.json();
    const { password } = updatePasswordSchema.parse(body);

    // Update the user's password
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      console.error("Supabase Update Password Error:", error);
      if (error instanceof AuthApiError) {
        if (error.message.includes("weak password")) {
          return new Response(JSON.stringify({ error: "Password is too weak." }), { status: 400 });
        }
        if (error.message.includes("same password")) {
          return new Response(JSON.stringify({ error: "New password cannot be the same as the old password." }), {
            status: 400,
          });
        }
      }
      // Handle other errors (e.g., token expired if the implicit exchange failed or took too long)
      return new Response(JSON.stringify({ error: "Failed to update password. The reset link may have expired." }), {
        status: 400,
      });
    }

    // Password updated successfully.
    // It's often good practice to sign the user out on other devices after a password change.
    // We can also sign out the current session and redirect to login.
    await supabase.auth.signOut();

    // Redirect to login page with a success message
    return redirect("/login?message=Password successfully updated. Please log in with your new password.", 303);
    // Or return a success JSON response if the client handles the redirect:
    // return new Response(JSON.stringify({ message: 'Password successfully updated.' }), { status: 200 });
  } catch (error) {
    console.error("Update Password Endpoint Error:", error);
    if (error instanceof ZodError) {
      return new Response(JSON.stringify({ error: "Invalid input.", details: error.flatten().fieldErrors }), {
        status: 400,
      });
    }
    if (error instanceof SyntaxError) {
      return new Response(JSON.stringify({ error: "Invalid request body." }), { status: 400 });
    }
    return new Response(JSON.stringify({ error: "An internal server error occurred." }), { status: 500 });
  }
};
