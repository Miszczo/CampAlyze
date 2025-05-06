import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { memo } from "react";

interface LoginFormActionsProps {
  isLoading: boolean;
  requiresVerification: boolean;
  onResendVerification: () => void;
}

export const LoginFormActions = memo(function LoginFormActions({
  isLoading,
  requiresVerification,
  onResendVerification,
}: LoginFormActionsProps) {
  return (
    <>
      {requiresVerification && (
        <Button
          variant="secondary"
          className="w-full"
          onClick={onResendVerification}
          disabled={isLoading}
          data-testid="login-button-resend-verification"
          type="button"
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Resend Verification Email"}
        </Button>
      )}

      <Button type="submit" className="w-full" disabled={isLoading} data-testid="login-button-submit">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" data-testid="login-loader" /> : "Login"}
      </Button>
    </>
  );
});
