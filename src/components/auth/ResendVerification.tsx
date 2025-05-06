import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const ResendVerification: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    // Attempt to get the current user's email
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      } else {
        // If no session or email, redirect to login? Or show generic message?
        // For now, show an error if email cannot be determined.
        setError("Could not determine your email address. Please log in again.");
      }
    });
  }, [supabase]);

  const handleResend = async () => {
    if (!userEmail) {
      setError("Cannot resend verification without an email address.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Failed to resend verification email.");
      } else {
        setSuccessMessage(result.message || "Verification email sent successfully.");
      }
    } catch (err) {
      console.error("Resend verification failed:", err);
      setError("An unexpected error occurred while resending the verification email.");
    }
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Verify Your Email</CardTitle>
        <CardDescription>
          Please check your inbox for a verification link. If you haven't received it, you can request a new one.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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

        {userEmail && !successMessage && (
          <Button className="w-full" onClick={handleResend} disabled={isLoading || !userEmail}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Resend Verification Email"}
          </Button>
        )}
        {!userEmail && !error && <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />}
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
