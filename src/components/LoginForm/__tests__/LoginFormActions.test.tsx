import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { LoginFormActions } from "../LoginFormActions";

describe("LoginFormActions", () => {
  const mockHandleResendVerification = vi.fn();
  const mockEmail = "test@example.com";

  it("should render login button", () => {
    render(
      <LoginFormActions
        isLoading={false}
        requiresVerification={false}
        handleResendVerification={mockHandleResendVerification}
        email={mockEmail}
      />
    );

    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /resend verification/i })).not.toBeInTheDocument();
  });

  it("should render login button as disabled when isLoading is true", () => {
    render(
      <LoginFormActions
        isLoading={true}
        requiresVerification={false}
        handleResendVerification={mockHandleResendVerification}
        email={mockEmail}
      />
    );

    const loginButton = screen.getByRole("button", { name: /log in/i });
    expect(loginButton).toBeInTheDocument();
    expect(loginButton).toBeDisabled();
  });

  it("should render resend verification button when requiresVerification is true", () => {
    render(
      <LoginFormActions
        isLoading={false}
        requiresVerification={true}
        handleResendVerification={mockHandleResendVerification}
        email={mockEmail}
      />
    );

    expect(screen.getByRole("button", { name: /resend verification/i })).toBeInTheDocument();
  });

  it("should call handleResendVerification when resend button is clicked", () => {
    render(
      <LoginFormActions
        isLoading={false}
        requiresVerification={true}
        handleResendVerification={mockHandleResendVerification}
        email={mockEmail}
      />
    );

    const resendButton = screen.getByRole("button", { name: /resend verification/i });
    fireEvent.click(resendButton);

    expect(mockHandleResendVerification).toHaveBeenCalledWith(mockEmail);
  });

  it("should disable resend verification button when isLoading is true", () => {
    render(
      <LoginFormActions
        isLoading={true}
        requiresVerification={true}
        handleResendVerification={mockHandleResendVerification}
        email={mockEmail}
      />
    );

    const resendButton = screen.getByRole("button", { name: /resend verification/i });
    expect(resendButton).toBeDisabled();
  });
});
