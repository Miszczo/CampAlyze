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

const forgotPasswordFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;

export const ForgotPasswordForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: { email: "" },
  });

  // Clear only error on input change, keep successMessage until next submission
  useEffect(() => {
    const subscription = form.watch(() => {
      // Clear server error on field change
      if (error) {
        setError(null);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, error]);

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (!response.ok) {
        // Even if API returns non-200 (e.g., rate limit), show generic message for security
        if (response.status === 429) {
          setSuccessMessage(
            "Request submitted. If an account exists, a link will be sent. Please check rate limits if issues persist."
          );
        } else {
          setError(result.error || "Failed to submit request. Please try again.");
          // Fallback to generic success message to avoid revealing info
          setSuccessMessage(
            "Request submitted. If an account with this email exists, a password reset link has been sent."
          );
        }
      } else {
        setSuccessMessage(result.message || "Request submitted. Check your email for the reset link.");
        form.reset(); // Clear form on success
      }
    } catch (err) {
      console.error("Password reset request failed:", err);
      // Show generic success message on unexpected client-side errors too
      setSuccessMessage(
        "Request submitted. If an account with this email exists, a password reset link has been sent."
      );
    }
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          <h1>Forgot Password</h1>
        </CardTitle>
        <CardDescription>
          Enter your email address and we&apos;ll send you a link to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Always show success message if set, even if there was a hidden error, for security */}
          {successMessage ? (
            <Alert variant="default">
              <AlertTitle>Check Your Email</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          ) : error ? (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {!successMessage && (
            <>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...form.register("email")} disabled={isLoading} />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Reset Link"}
              </Button>
            </>
          )}
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Remembered your password?{" "}
          <a href="/login" className="text-primary hover:underline">
            Login
          </a>
        </p>
      </CardFooter>
    </Card>
  );
};
