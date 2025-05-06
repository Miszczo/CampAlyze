import type { APIRoute } from "astro";
import { z, ZodError } from "zod";
import { AuthApiError } from "@supabase/supabase-js";

// Validation schema
const resendSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

export const POST: APIRoute = async ({ request, locals }) => {
  const supabase = locals.supabase;

  try {
    const body = await request.json();
    const { email } = resendSchema.parse(body);

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email,
      options: {
        emailRedirectTo: `${request.headers.get("origin")}/login?message=Email verified successfully! Please log in.`,
      },
    });

    if (error) {
      console.error("Supabase Resend Error:", error);
      // Don't reveal if the email exists or not for security reasons
      // Treat most errors generically from the user's perspective
      if (error instanceof AuthApiError && error.status === 429) {
        // Rate limit exceeded
        return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), { status: 429 });
      }
      // Log the specific error but return a generic message
      console.error("Failed to resend verification email:", error.message);
      // Still return 200 OK to prevent email enumeration
      return new Response(
        JSON.stringify({
          message:
            "If an account with this email exists and requires verification, a new verification link has been sent.",
        }),
        { status: 200 }
      );
    }

    // Success
    return new Response(
      JSON.stringify({
        message:
          "If an account with this email exists and requires verification, a new verification link has been sent.",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Resend Verification Endpoint Error:", error);
    if (error instanceof ZodError) {
      return new Response(JSON.stringify({ error: "Invalid input.", details: error.flatten().fieldErrors }), {
        status: 400,
      });
    }
    if (error instanceof SyntaxError) {
      return new Response(JSON.stringify({ error: "Invalid request body." }), { status: 400 });
    }
    // Generic error, but still return 200 for security
    return new Response(
      JSON.stringify({ message: "An error occurred. If an account exists, a verification link may have been sent." }),
      { status: 200 }
    );
  }
};
