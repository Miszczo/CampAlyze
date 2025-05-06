import type { APIRoute } from "astro";
import { z, ZodError } from "zod";
import { AuthApiError } from "@supabase/supabase-js";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

// Validation schema
const signinSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export const POST: APIRoute = async ({ request, locals }) => {
  const supabase = locals.supabase;

  try {
    const body = await request.json();
    const { email, password } = signinSchema.parse(body);

    // --- Account Lockout Check (Conceptual - requires metadata handling) ---
    // TODO: Implement robust lockout check
    // 1. Fetch user metadata using service role client (if needed, or check if possible with anon key)
    // const { data: userMeta, error: metaError } = await supabase.auth.admin.getUserById(userId); // Needs user ID first?
    // This is complex as we don't have the user ID before login attempt.
    // Alternative: Could attempt login first, and if failed due to credentials, *then* fetch user by email and update metadata.

    // Placeholder: Assume user is not locked initially
    // let isLocked = false;
    // let failedAttempts = 0;

    // Check if user is locked (this check needs to happen *before* signInWithPassword)
    // Ideally, fetch user metadata based on email *before* attempting login.
    // This might require a separate admin/service role call if metadata isn't publicly readable.
    // For MVP, we might skip server-side lockout enforcement and rely on client-side feedback + potential future webhook/trigger.
    /*
        if (userMeta?.raw_user_meta_data?.locked_until) {
            const lockedUntil = new Date(userMeta.raw_user_meta_data.locked_until);
            if (lockedUntil > new Date()) {
                isLocked = true;
                return new Response(JSON.stringify({
                    error: `Account locked due to too many failed login attempts. Please try again in ${LOCKOUT_DURATION_MINUTES} minutes.`
                }), { status: 429 }); // Too Many Requests
            }
        }
        failedAttempts = userMeta?.raw_user_meta_data?.failed_login_count ?? 0;
        */

    // --- Attempt Sign In ---
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Supabase SignIn Error:", error);

      // --- Handle Failed Login Attempt (Conceptual - requires metadata update) ---
      // TODO: Implement robust failed login counter update
      // If error indicates invalid credentials:
      // 1. Fetch user by email (admin/service role may be needed)
      // 2. Increment failed_login_count in metadata
      // 3. If count >= MAX_LOGIN_ATTEMPTS, set locked_until = NOW() + LOCKOUT_DURATION
      // 4. Update user metadata (admin/service role)
      /*
            if (error instanceof AuthApiError && error.status === 400) { // Invalid Login Credentials
                failedAttempts++;
                const updateData: any = { failed_login_count: failedAttempts };
                if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
                    const lockedUntil = new Date();
                    lockedUntil.setMinutes(lockedUntil.getMinutes() + LOCKOUT_DURATION_MINUTES);
                    updateData.locked_until = lockedUntil.toISOString();
                }
                // Need service role client to update metadata for a user based on email/id
                // const { error: updateError } = await supabase.auth.admin.updateUserById(userId, { user_metadata: updateData });
                // console.error('Failed to update user metadata:', updateError);
            }
            */

      if (error instanceof AuthApiError) {
        if (error.message.includes("Invalid login credentials")) {
          // Check lockout status *after* failed attempt for immediate feedback if implemented
          /* if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
                       return new Response(JSON.stringify({ error: `Account locked due to too many failed login attempts. Please try again in ${LOCKOUT_DURATION_MINUTES} minutes.` }), { status: 429 });
                    } */
          return new Response(JSON.stringify({ error: "Invalid email or password." }), { status: 401 }); // Unauthorized
        }
        if (error.message.includes("Email not confirmed")) {
          return new Response(
            JSON.stringify({ error: "Please verify your email address first.", requiresVerification: true }),
            { status: 403 }
          ); // Forbidden
        }
      }
      return new Response(JSON.stringify({ error: "Could not sign in." }), { status: 500 });
    }

    // --- Handle Successful Login (Conceptual - requires metadata update) ---
    // TODO: Reset failed login counter on successful login
    // 1. Fetch user metadata (if needed, or if failedAttempts was tracked in this request)
    // 2. If failed_login_count > 0 or locked_until is set, reset them to 0 and null.
    // 3. Update user metadata (admin/service role)
    /*
        if (failedAttempts > 0 || userMeta?.raw_user_meta_data?.locked_until) {
             // Need service role client to update metadata
            // const { error: updateError } = await supabase.auth.admin.updateUserById(data.user.id, { user_metadata: { failed_login_count: 0, locked_until: null } });
            // console.error('Failed to reset user metadata:', updateError);
        }
        */

    // Sign in successful, session is handled by @supabase/ssr and middleware
    return new Response(JSON.stringify({ message: "Sign in successful.", user: data.user }), {
      status: 200,
    });
  } catch (error) {
    console.error("SignIn Endpoint Error:", error);
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
