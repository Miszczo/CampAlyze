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
  navigate?: (path: string) => void;
}

export function useLoginForm(props?: LoginFormProps) {
  const { initialMessage = null, messageType = null, navigate = (path) => (window.location.href = path) } = props || {};
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

  const onSubmit = useCallback(
    async (values: LoginFormValues) => {
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
          navigate("/dashboard");
        }
      } catch (err) {
        console.error("[LoginForm] Login request failed:", err);
        setRequiresVerification(false); // Reset przy wyjątkach
        setError("An unexpected error occurred. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  const handleResendVerification = useCallback(
    async (providedEmail?: string) => {
      // Pobierz bieżącą wartość email z formularza lub użyj podanego emaila
      const email = providedEmail || form.getValues().email;

      if (!email) {
        console.log("[useLoginForm] Resend verification: Email is empty, setting error.");
        setError("Please enter your email address to resend verification.");
        return;
      }

      setIsLoading(true);
      setError(null);
      setSuccessMessage(null); // Wyczyszczenie poprzedniego komunikatu sukcesu
      console.log("[useLoginForm] Resend verification: States cleared, starting request for email:", email);

      try {
        console.log("[useLoginForm] Resending verification email API call", { email });

        const response = await fetch("/api/auth/resend-verification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const result = await response.json();
        console.log("[useLoginForm] Resend verification API response", { status: response.status, result });

        if (!response.ok) {
          const errorMsg = result.error || "Failed to resend verification email.";
          console.log(
            "[useLoginForm] Resend verification API call !response.ok. Setting error:",
            errorMsg,
            "Result:",
            result
          );
          setError(errorMsg);
          console.log("[useLoginForm] Resend verification failed (network/server error)", { error: result.error });
        } else {
          const successMsg = result.message || "Verification email sent successfully.";
          console.log(
            "[useLoginForm] Resend verification API call response.ok. Preparing to set success message:",
            successMsg,
            "Result:",
            result
          );
          setSuccessMessage(successMsg);
          // Sprawdzenie stanu zaraz po ustawieniu
          // Uwaga: console.log bezpośrednio po setState może nie pokazać zaktualizowanej wartości z powodu asynchroniczności setState
          // Lepiej obserwować w useEffect lub w logach renderowania komponentu LoginForm.tsx
          console.log("[useLoginForm] Called setSuccessMessage with:", successMsg);
          setRequiresVerification(false); // Hide resend button after successful send
          console.log("[useLoginForm] Resend verification successful (logic complete)");
        }
      } catch (err) {
        console.error("[useLoginForm] Resend verification request failed (catch block):", err);
        setError("An unexpected error occurred while sending verification email.");
      } finally {
        setIsLoading(false);
        console.log("[useLoginForm] Resend verification finally block. isLoading set to false.");
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
