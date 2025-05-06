import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { memo } from "react";

interface LoginFormAlertsProps {
  error: string | null;
  successMessage: string | null;
}

export const LoginFormAlerts = memo(function LoginFormAlerts({ error, successMessage }: LoginFormAlertsProps) {
  if (!error && !successMessage) return null;

  return (
    <>
      {error && (
        <Alert variant="destructive" data-testid="login-alert-error">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert variant="default" data-testid="login-alert-success">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
    </>
  );
});
