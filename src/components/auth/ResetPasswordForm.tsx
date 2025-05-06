import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client"; // Import browser client helper

const resetPasswordFormSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/, {
        message: "Password must contain at least one letter and one number",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;

interface ResetPasswordFormProps {
  accessToken?: string | null; // Pass access token if available (though ssr client handles it)
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ accessToken }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isTokenValid, setIsTokenValid] = useState(true); // Assume valid initially
  const supabase = getSupabaseBrowserClient(); // Use browser client

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  // Effect to handle the PASSWORD_RECOVERY event and potential errors
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        // Session should now be available if the token was valid
        // We don't strictly *need* the session here, as the API call
        // relies on the cookie set by the ssr client, but this confirms the event.
        console.log("Password recovery event received, session:", session);
        setIsTokenValid(true); // Confirm token validity
      }
      // Handle cases where the implicit exchange might fail, though the API call is the main check
      if (event === "SIGNED_IN" && !session) {
        // This might indicate an issue with the token after initial page load
        // setError('Invalid or expired password reset link.');
        // setIsTokenValid(false);
      }
    });

    // Check initial session in case the event fired before listener attached
    // Although the middleware should handle the initial session setup
    supabase.auth.getSession().then(({ data }) => {
      // console.log('Initial session on reset page:', data.session);
      // If no session exists here *and* no PASSWORD_RECOVERY event fires,
      // the token might be invalid/expired.
      // The API call will ultimately determine this.
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Double-check token validity based on state (optional defensive check)
    if (!isTokenValid) {
      setError("Invalid or expired password reset link.");
      setIsLoading(false);
      return;
    }

    try {
      // The API endpoint relies on the session cookie managed by @supabase/ssr
      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: values.password }),
      });

      if (!response.ok) {
        // If response indicates redirection (3xx), let the browser handle it
        if (response.redirected && response.status >= 300 && response.status < 400) {
          // The endpoint redirects to /login on success
          // No need to do anything here, browser follows redirect
          console.log("Redirecting after password update...");
          // Set loading indefinitely as page navigates away
          setIsLoading(true);
          return;
        } else {
          // Handle JSON error responses (4xx, 5xx)
          const result = await response.json();
          setError(result.error || "Failed to update password. The link may be invalid or expired.");
          setIsTokenValid(false); // Assume token is now invalid
        }
      } else {
        // Should not happen if API redirects on success, but handle just in case
        const result = await response.json();
        setSuccessMessage(result.message || "Password updated successfully! You can now log in.");
        // Redirect manually if API didn't
        window.location.href = "/login?message=Password successfully updated. Please log in.";
      }
    } catch (err) {
      console.error("Update password request failed:", err);
      setError("An unexpected error occurred. Please try again later.");
    }
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>Enter your new password below.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {successMessage && (
            <Alert variant="default">
              {" "}
              {/* Success style */}
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}
          {!successMessage && isTokenValid && (
            <>
              <div className="space-y-1">
                <Label htmlFor="password">New Password</Label>
                <Input id="password" type="password" {...form.register("password")} disabled={isLoading} />
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...form.register("confirmPassword")}
                  disabled={isLoading}
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Set New Password"}
              </Button>
            </>
          )}
          {!isTokenValid && !error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Invalid or expired password reset link.</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Return to{" "}
          <a href="/login" className="text-primary hover:underline">
            Login
          </a>
        </p>
      </CardFooter>
    </Card>
  );
};
