import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password cannot be empty" }),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export function useLoginForm(navigate?: (path: string) => void) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [requiresVerification, setRequiresVerification] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  // Clear messages on input change
  useEffect(() => {
    const subscription = form.watch(() => {
      setError(null);
      setSuccessMessage(null);
      setRequiresVerification(false);
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const onSubmit = useCallback(
    async (values: LoginFormValues) => {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      setRequiresVerification(false);

      try {
        console.log("[LoginForm] Submitting login request", { email: values.email });

        const response = await fetch("/api/auth/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        const result = await response.json();
        console.log("[LoginForm] Login response", {
          status: response.status,
          result,
          requiresVerification: result.requiresVerification || false,
        });

        if (!response.ok) {
          if (result.requiresVerification) {
            setRequiresVerification(true);
            setError(result.error || "Please verify your email address first.");
            console.log("[LoginForm] Email verification required", { email: values.email });
          } else if (response.status === 404) {
            setError(result.error || "User not found. Please check your email address.");
            console.log("[LoginForm] User not found", { email: values.email });
          } else if (response.status === 401) {
            setError(result.error || "Invalid credentials. Please check your email and password.");
            console.log("[LoginForm] Invalid credentials", { email: values.email });
          } else {
            setError(result.error || "Login failed. Please check your credentials.");
            console.log("[LoginForm] Login failed", { error: result.error, status: response.status });
          }
        } else {
          // Login successful
          console.log("[LoginForm] Login successful, redirecting to dashboard");
          if (navigate) {
            navigate("/dashboard");
          } else {
            window.location.href = "/dashboard"; // Fallback if navigate is not provided
          }
        }
      } catch (err) {
        console.error("[LoginForm] Login request failed:", err);
        setError("An unexpected error occurred. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  const handleResendVerification = useCallback(async (email: string) => {
    if (!email) {
      setError("Please enter your email address to resend verification.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      console.log("[LoginForm] Resending verification email", { email });

      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      console.log("[LoginForm] Resend verification response", { status: response.status, result });

      if (!response.ok) {
        setError(result.error || "Failed to resend verification email.");
        console.log("[LoginForm] Resend verification failed", { error: result.error });
      } else {
        setSuccessMessage(result.message || "Verification email sent successfully.");
        setRequiresVerification(false); // Hide resend button after successful send
        console.log("[LoginForm] Resend verification successful");
      }
    } catch (err) {
      console.error("[LoginForm] Resend verification failed:", err);
      setError("An unexpected error occurred while sending verification email.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    form,
    formState: form.formState,
    isLoading,
    error,
    successMessage,
    requiresVerification,
    setError,
    setSuccessMessage,
    setRequiresVerification,
    onSubmit,
    handleResendVerification,
  };
}
