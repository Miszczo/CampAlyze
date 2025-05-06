import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LoginForm } from "../LoginForm";
import * as useLoginFormHook from "../../hooks/useLoginForm";

// Mock useLoginForm hook
vi.mock("../../hooks/useLoginForm", () => ({
  useLoginForm: vi.fn(),
}));

describe("LoginForm", () => {
  const mockNavigate = vi.fn();
  const mockOnSubmit = vi.fn();
  const mockHandleResendVerification = vi.fn();
  const mockRegister = vi.fn().mockImplementation((name) => ({ name }));

  beforeEach(() => {
    vi.resetAllMocks();

    // Default mock implementation
    vi.mocked(useLoginFormHook.useLoginForm).mockReturnValue({
      isLoading: false,
      error: null,
      successMessage: null,
      requiresVerification: false,
      handleResendVerification: mockHandleResendVerification,
      onSubmit: mockOnSubmit,
      register: mockRegister,
      formState: { errors: {} },
      getValues: vi.fn().mockReturnValue({ email: "test@example.com" }),
      setError: vi.fn(),
      setRequiresVerification: vi.fn(),
      setSuccessMessage: vi.fn(),
    });
  });

  it("should render all subcomponents correctly", () => {
    render(<LoginForm />);

    // Check if form fields are rendered
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    // Check if login button is rendered
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();

    // Check if footer with links is rendered
    expect(screen.getByRole("link", { name: /don't have an account\? register/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /forgot password\?/i })).toBeInTheDocument();
  });

  it("should call onSubmit when form is submitted", async () => {
    render(<LoginForm />);

    const emailField = screen.getByLabelText(/email/i);
    const passwordField = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /log in/i });

    fireEvent.change(emailField, { target: { value: "test@example.com" } });
    fireEvent.change(passwordField, { target: { value: "Password123!" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it("should show error message when there is an error", () => {
    vi.mocked(useLoginFormHook.useLoginForm).mockReturnValue({
      isLoading: false,
      error: "Invalid credentials",
      successMessage: null,
      requiresVerification: false,
      handleResendVerification: mockHandleResendVerification,
      onSubmit: mockOnSubmit,
      register: mockRegister,
      formState: { errors: {} },
      getValues: vi.fn().mockReturnValue({ email: "test@example.com" }),
      setError: vi.fn(),
      setRequiresVerification: vi.fn(),
      setSuccessMessage: vi.fn(),
    });

    render(<LoginForm />);

    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });

  it("should show success message when there is a success message", () => {
    vi.mocked(useLoginFormHook.useLoginForm).mockReturnValue({
      isLoading: false,
      error: null,
      successMessage: "Verification email sent",
      requiresVerification: true,
      handleResendVerification: mockHandleResendVerification,
      onSubmit: mockOnSubmit,
      register: mockRegister,
      formState: { errors: {} },
      getValues: vi.fn().mockReturnValue({ email: "test@example.com" }),
      setError: vi.fn(),
      setRequiresVerification: vi.fn(),
      setSuccessMessage: vi.fn(),
    });

    render(<LoginForm />);

    expect(screen.getByText("Verification email sent")).toBeInTheDocument();
  });

  it("should render resend verification button when verification is required", () => {
    vi.mocked(useLoginFormHook.useLoginForm).mockReturnValue({
      isLoading: false,
      error: "Email not verified",
      successMessage: null,
      requiresVerification: true,
      handleResendVerification: mockHandleResendVerification,
      onSubmit: mockOnSubmit,
      register: mockRegister,
      formState: { errors: {} },
      getValues: vi.fn().mockReturnValue({ email: "test@example.com" }),
      setError: vi.fn(),
      setRequiresVerification: vi.fn(),
      setSuccessMessage: vi.fn(),
    });

    render(<LoginForm />);

    expect(screen.getByRole("button", { name: /resend verification/i })).toBeInTheDocument();
  });

  it("should disable submit button when form is loading", () => {
    vi.mocked(useLoginFormHook.useLoginForm).mockReturnValue({
      isLoading: true,
      error: null,
      successMessage: null,
      requiresVerification: false,
      handleResendVerification: mockHandleResendVerification,
      onSubmit: mockOnSubmit,
      register: mockRegister,
      formState: { errors: {} },
      getValues: vi.fn().mockReturnValue({ email: "test@example.com" }),
      setError: vi.fn(),
      setRequiresVerification: vi.fn(),
      setSuccessMessage: vi.fn(),
    });

    render(<LoginForm />);

    const submitButton = screen.getByRole("button", { name: /log in/i });
    expect(submitButton).toBeDisabled();
  });

  it("should call handleResendVerification when resend button is clicked", async () => {
    vi.mocked(useLoginFormHook.useLoginForm).mockReturnValue({
      isLoading: false,
      error: "Email not verified",
      successMessage: null,
      requiresVerification: true,
      handleResendVerification: mockHandleResendVerification,
      onSubmit: mockOnSubmit,
      register: mockRegister,
      formState: { errors: {} },
      getValues: vi.fn().mockReturnValue({ email: "test@example.com" }),
      setError: vi.fn(),
      setRequiresVerification: vi.fn(),
      setSuccessMessage: vi.fn(),
    });

    render(<LoginForm />);

    const resendButton = screen.getByRole("button", { name: /resend verification/i });
    fireEvent.click(resendButton);

    await waitFor(() => {
      expect(mockHandleResendVerification).toHaveBeenCalledWith("test@example.com");
    });
  });
});
