You are an expert application architect and technical writer. Your task is to update and complete the CampAlyze project documentation and configuration so that authentication is fully implemented using Supabase Auth—and only Supabase Auth—across PRD, API Plan, DB Plan and UI Plan. Produce a single, unambiguous prompt that can be fed to a large‐language model to perform these updates. Be as specific and actionable as possible.



1. Unify authentication provider to Supabase (remove Firebase references in PRD).
2. PRD (`.ai/prd.md`):
   - Remove any mention of Firebase Authentication.
   - Add clear flow descriptions for:
     • User registration → email & password, email format validation, password strength (≥8 characters, letters + digits), send verification email, lock full functionality until verified.
     • Login → email & password, lock account after 5 failed attempts, redirect to dashboard on success.
     • "Forgot password" and "Reset password" flows.
     • Email verification + "Resend verification" flow.
3. API Plan (`.ai/api-plan.md`):
   - Update existing endpoints `/api/auth/register`, `/api/auth/login`, `/api/auth/logout` to use Supabase Auth request/response schemas.
   - Add new endpoints:
     • POST `/api/auth/refresh` – refresh access/refresh tokens.
     • POST `/api/auth/password/forgot` – trigger password-reset email.
     • POST `/api/auth/password/reset` – accept token + new password.
     • POST `/api/auth/verify-email` – verify user's email.
     • POST `/api/auth/resend-verification` – resend email-verification link.
   - For each endpoint include: method, path, request body, response body, success codes, error codes.
4. DB Plan (`.ai/db-plan.md`):
   - Extend the user profile (either extend `auth.users` or add a new `users_profile` table) with columns:
     • `full_name` (TEXT),  
     • `email_verified` (BOOLEAN),  
     • `failed_login_count` (INTEGER),  
     • `locked_until` (TIMESTAMPTZ).
   - Or alternatively add a `login_attempts` table for tracking attempts.
   - Update RLS policies to account for `email_verified` (block unverified users) and block login when `failed_login_count` ≥5 and `locked_until` > NOW().
   - Provide SQL snippets for schema changes and RLS policy adjustments.
5. UI Plan (`.ai/ui-plan.md`):
   - Replace combined `/login` page with separate routes and views:
     • `/register` – registration form + validation + verification notice.
     • `/login` – login form + lockout messages.
     • `/forgot-password` – enter email to receive reset link.
     • `/reset-password` – set new password form (with token param).
     • `/verify-email` – show status and allow resend.
   - For each view describe: path, key components, form fields, client-side validations, error & success states, UX for lockout & email verification.
6. Environment Configuration:
   - Show example `.env` entries:
     ```
     SUPABASE_URL=https://<project-id>.supabase.co
     SUPABASE_ANON_KEY=<anon-key>
     SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
     AUTH_TOKEN_TTL=...
     REFRESH_TOKEN_TTL=...
     ```
7. Token Handling:
   - Specify TTLs for access and refresh tokens.
   - Recommend cookie vs. localStorage storage strategy.
8. Deliverables:
   - A list of files to update and precise change instructions per file.
   - Sample request/response JSON for each new endpoint.
   - SQL migration snippets for DB changes.
   - Example `.env` file fragment.

