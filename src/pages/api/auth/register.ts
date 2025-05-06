import type { APIRoute } from "astro";
import { z } from "zod";
import { ZodError } from "zod";
import { AuthApiError } from "@supabase/supabase-js";

// Validation schema
const registerSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    // Optional: Add regex for complexity (e.g., letters and numbers)
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/, {
      message: "Password must contain at least one letter and one number",
    }),
  full_name: z.string().min(1, { message: "Full name is required" }),
});

export const POST: APIRoute = async ({ request, locals }) => {
  const supabase = locals.supabase; // Get Supabase client from middleware

  try {
    const body = await request.json();
    const { email, password, full_name } = registerSchema.parse(body);

    // Attempt to sign up the user with email confirmation required
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${request.headers.get("origin")}/login?message=Email verified successfully! Please log in.`, // Redirect after email confirmation
        data: {
          full_name: full_name, // Store full name in metadata
          // Initialize lockout fields
          failed_login_count: 0,
          locked_until: null,
        },
      },
    });

    if (error) {
      console.error("Supabase SignUp Error:", error);
      // Handle specific Supabase errors
      if (error instanceof AuthApiError) {
        if (error.message.includes("User already registered")) {
          return new Response(JSON.stringify({ error: "Email already exists." }), { status: 409 }); // Conflict
        }
        if (error.message.includes("Password should be at least 6 characters")) {
          // We validate for 8 chars, but Supabase might have its own minimum
          return new Response(JSON.stringify({ error: "Password is too weak." }), { status: 400 });
        }
      }
      // Generic server error for other Supabase issues
      return new Response(JSON.stringify({ error: "Could not register user." }), { status: 500 });
    }

    // Check if user object exists and email confirmation is needed
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      // This can happen in Supabase if auto-confirmation is off but an error prevented the user row from being created properly.
      console.error("Supabase SignUp anomaly: User object created but no identity.");
      return new Response(JSON.stringify({ error: "An issue occurred during registration. Please try again." }), {
        status: 500,
      });
    }

    // Successfully initiated sign up - email confirmation pending
    // Supabase sends the confirmation email automatically if enabled
    return new Response(
      JSON.stringify({ message: "Registration successful. Please check your email to verify your account." }),
      {
        status: 201, // Created
      }
    );
  } catch (error) {
    console.error("Register Endpoint Error:", error);
    if (error instanceof ZodError) {
      // Validation error
      return new Response(JSON.stringify({ error: "Invalid input.", details: error.flatten().fieldErrors }), {
        status: 400,
      });
    }
    if (error instanceof SyntaxError) {
      // JSON parsing error
      return new Response(JSON.stringify({ error: "Invalid request body." }), { status: 400 });
    }
    // Generic server error
    return new Response(JSON.stringify({ error: "An internal server error occurred." }), { status: 500 });
  }
};
