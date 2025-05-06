import { memo } from "react";

export const LoginFormFooter = memo(function LoginFormFooter() {
  return (
    <p className="text-sm text-muted-foreground">
      Don&apos;t have an account?{" "}
      <a href="/register" className="text-primary hover:underline" data-testid="login-link-register">
        Register
      </a>
    </p>
  );
});
