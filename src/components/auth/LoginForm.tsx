import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useLoginForm } from "../hooks/useLoginForm";
import { LoginFormAlerts } from "./LoginFormAlerts";
import { LoginFormFields } from "./LoginFormFields";
import { LoginFormActions } from "./LoginFormActions";
import { LoginFormFooter } from "./LoginFormFooter";

interface LoginFormProps {
  initialMessage?: string | null;
  messageType?: "success" | "error" | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({ initialMessage = null, messageType = null }) => {
  const { form, isLoading, error, successMessage, requiresVerification, onSubmit, handleResendVerification } =
    useLoginForm({ initialMessage, messageType });

  return (
    <Card className="w-full max-w-md" data-testid="login-card">
      <CardHeader>
        <CardTitle>
          <h1>Login</h1>
        </CardTitle>
        <CardDescription>Enter your credentials to access your account.</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <LoginFormAlerts error={error} successMessage={successMessage} />
          <LoginFormFields form={form} isLoading={isLoading} />
          <LoginFormActions
            isLoading={isLoading}
            requiresVerification={requiresVerification}
            onResendVerification={handleResendVerification}
          />
        </form>
      </CardContent>

      <CardFooter className="flex justify-center">
        <LoginFormFooter />
      </CardFooter>
    </Card>
  );
};
