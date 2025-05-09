import { useState, /* useEffect, */ useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password cannot be empty" }),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

interface LoginFormProps {
  initialMessage?: string | null;
  messageType?: "success" | "error" | null;
}

export function useLoginForm(props?: LoginFormProps) {
  const { initialMessage = null, messageType = null } = props || {};
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialMessage && messageType === "error" ? initialMessage : null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    initialMessage && messageType === "success" ? initialMessage : null
  );
  const [requiresVerification, setRequiresVerification] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  // Clear only error and success messages on input change, but preserve requiresVerification
  /*
  useEffect(() => {
    const subscription = form.watch(() => {
      // Resetujemy tylko komunikaty błędów i sukcesu, zachowując flagę requiresVerification
      setError(null);
      setSuccessMessage(null);
      // NIE resetujemy flagi requiresVerification przy zmianach w formularzu
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);
  */

  const onSubmit = useCallback(async (values: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    // Nie resetujemy requiresVerification tutaj, zostanie ustawione na podstawie odpowiedzi API

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
          const errorMsg = result.error || "Please verify your email address first.";
          console.log("[LoginForm-Debug] Setting error state for verification:", errorMsg);
          setError(errorMsg);
          console.log("[LoginForm] Email verification required", { email: values.email });
        } else {
          // Tylko resetujemy flagę requiresVerification przy INNYCH błędach niż weryfikacja
          setRequiresVerification(false);

          if (response.status === 404) {
            const errorMsg = result.error || "User not found. Please check your email address.";
            console.log("[LoginForm-Debug] Setting error state for 404:", errorMsg);
            setError(errorMsg);
            console.log("[LoginForm] User not found", { email: values.email });
          } else if (response.status === 401) {
            const errorMsg = result.error || "Invalid credentials. Please check your email and password.";
            console.log("[LoginForm-Debug] Setting error state for 401:", errorMsg);
            setError(errorMsg);
            console.log("[LoginForm] Invalid credentials", { email: values.email });
          } else {
            const errorMsg = result.error || "Login failed. Please check your credentials.";
            console.log("[LoginForm-Debug] Setting error state for other error:", errorMsg);
            setError(errorMsg);
            console.log("[LoginForm] Login failed", { error: result.error, status: response.status });
          }
        }
      } else {
        // Login successful
        setRequiresVerification(false); // Reset tylko przy sukcesie
        console.log("[LoginForm] Login successful, redirecting to dashboard");
        window.location.href = "/dashboard"; // Przekierowanie po udanym logowaniu
      }
    } catch (err) {
      console.error("[LoginForm] Login request failed:", err);
      setRequiresVerification(false); // Reset przy wyjątkach
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleResendVerification = useCallback(
    async (providedEmail?: string) => {
      // Pobierz bieżącą wartość email z formularza lub użyj podanego emaila
      const email = providedEmail || form.getValues().email;

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
    },
    [form]
  );

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
