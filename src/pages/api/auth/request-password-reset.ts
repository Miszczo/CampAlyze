import type { APIRoute } from "astro";
import { z, ZodError } from "zod";
import { AuthApiError } from "@supabase/supabase-js";

// Validation schema
const resetRequestSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

export const POST: APIRoute = async ({ request, locals }) => {
  const supabase = locals.supabase;

  try {
    const body = await request.json();
    const { email } = resetRequestSchema.parse(body);

    // Specify the redirect URL for the link in the password reset email
    const redirectUrl = `${request.headers.get("origin")}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      console.error("Supabase Reset Password Error:", error);
      // Avoid revealing if the email exists.
      if (error instanceof AuthApiError && error.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), { status: 429 });
      }
      // Log specific error, return generic success message
      console.error("Failed to send password reset email:", error.message);
      // Return 200 OK to prevent email enumeration
      return new Response(
        JSON.stringify({ message: "If an account with this email exists, a password reset link has been sent." }),
        { status: 200 }
      );
    }

    // Success
    return new Response(
      JSON.stringify({ message: "If an account with this email exists, a password reset link has been sent." }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Request Password Reset Endpoint Error:", error);
    if (error instanceof ZodError) {
      return new Response(JSON.stringify({ error: "Invalid input.", details: error.flatten().fieldErrors }), {
        status: 400,
      });
    }
    if (error instanceof SyntaxError) {
      return new Response(JSON.stringify({ error: "Invalid request body." }), { status: 400 });
    }
    // Generic error, return 200 OK for security
    return new Response(
      JSON.stringify({ message: "An error occurred. If an account exists, a password reset link may have been sent." }),
      { status: 200 }
    );
  }
};
