import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { memo } from "react";
import { UseFormReturn } from "react-hook-form";
import { LoginFormValues } from "../hooks/useLoginForm";

interface LoginFormFieldsProps {
  form: UseFormReturn<LoginFormValues>;
  isLoading: boolean;
}

export const LoginFormFields = memo(function LoginFormFields({ form, isLoading }: LoginFormFieldsProps) {
  return (
    <>
      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...form.register("email")}
          disabled={isLoading}
          data-testid="login-input-email"
        />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive" data-testid="login-error-email">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          {...form.register("password")}
          disabled={isLoading}
          data-testid="login-input-password"
        />
        {form.formState.errors.password && (
          <p className="text-sm text-destructive" data-testid="login-error-password">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      <div className="text-sm">
        <a
          href="/forgot-password"
          className="font-medium text-primary hover:underline"
          data-testid="login-link-forgot-password"
        >
          Forgot your password?
        </a>
      </div>
    </>
  );
});
