import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { LoginForm } from "./LoginForm";
import "@testing-library/jest-dom";
import * as useLoginFormModule from "../hooks/useLoginForm";

// Mock useLoginForm hook
vi.mock("../hooks/useLoginForm", async () => {
  const actual = await vi.importActual("../hooks/useLoginForm");
  return {
    ...actual,
    useLoginForm: vi.fn(),
  };
});

// Mock fetch API
vi.stubGlobal("fetch", vi.fn());

// Mock the window.location for redirect testing
Object.defineProperty(window, "location", {
  value: { href: "/login" },
  writable: true,
});

describe("LoginForm Component Tests", () => {
  // Default mock implementation for useLoginForm
  const mockForm = {
    register: vi.fn().mockReturnValue({}),
    handleSubmit: vi.fn((callback) => (e) => {
      e?.preventDefault?.();
      return callback({ email: "test@example.com", password: "password123" });
    }),
    formState: {
      errors: {},
    },
    getValues: vi.fn().mockReturnValue("test@example.com"),
  };

  const mockOnSubmit = vi.fn();
  const mockHandleResendVerification = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetch).mockClear();

    // Default mock implementation
    vi.mocked(useLoginFormModule.useLoginForm).mockReturnValue({
      form: mockForm,
      isLoading: false,
      error: null,
      successMessage: null,
      requiresVerification: false,
      onSubmit: mockOnSubmit,
      handleResendVerification: mockHandleResendVerification,
    });
  });

  // Basic rendering tests
  test("renders LoginForm with all fields and buttons", () => {
    render(<LoginForm />);
    expect(screen.getByTestId("login-input-email")).toBeInTheDocument();
    expect(screen.getByTestId("login-input-password")).toBeInTheDocument();
    expect(screen.getByTestId("login-button-submit")).toBeInTheDocument();
    expect(screen.getByTestId("login-link-forgot-password")).toBeInTheDocument();
    expect(screen.getByTestId("login-link-register")).toBeInTheDocument();
  });

  test("passes initialMessage to useLoginForm hook", () => {
    const errorMessage = "Test error message";
    render(<LoginForm initialMessage={errorMessage} messageType="error" />);

    expect(useLoginFormModule.useLoginForm).toHaveBeenCalledWith({
      initialMessage: errorMessage,
      messageType: "error",
    });
  });

  test("shows error message when provided by hook", () => {
    vi.mocked(useLoginFormModule.useLoginForm).mockReturnValue({
      form: mockForm,
      isLoading: false,
      error: "Login error message",
      successMessage: null,
      requiresVerification: false,
      onSubmit: mockOnSubmit,
      handleResendVerification: mockHandleResendVerification,
    });

    render(<LoginForm />);
    expect(screen.getByTestId("login-alert-error")).toHaveTextContent("Login error message");
  });

  test("shows success message when provided by hook", () => {
    vi.mocked(useLoginFormModule.useLoginForm).mockReturnValue({
      form: mockForm,
      isLoading: false,
      error: null,
      successMessage: "Login success message",
      requiresVerification: false,
      onSubmit: mockOnSubmit,
      handleResendVerification: mockHandleResendVerification,
    });

    render(<LoginForm />);
    expect(screen.getByTestId("login-alert-success")).toHaveTextContent("Login success message");
  });

  test("submits form and calls onSubmit from hook", async () => {
    render(<LoginForm />);

    const submitButton = screen.getByTestId("login-button-submit");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  test("shows verification button when requiresVerification is true", () => {
    vi.mocked(useLoginFormModule.useLoginForm).mockReturnValue({
      form: mockForm,
      isLoading: false,
      error: "Please verify your email",
      successMessage: null,
      requiresVerification: true,
      onSubmit: mockOnSubmit,
      handleResendVerification: mockHandleResendVerification,
    });

    render(<LoginForm />);

    const resendButton = screen.getByTestId("login-button-resend-verification");
    expect(resendButton).toBeInTheDocument();

    fireEvent.click(resendButton);
    expect(mockHandleResendVerification).toHaveBeenCalled();
  });

  test("shows loading state when isLoading is true", () => {
    vi.mocked(useLoginFormModule.useLoginForm).mockReturnValue({
      form: mockForm,
      isLoading: true,
      error: null,
      successMessage: null,
      requiresVerification: false,
      onSubmit: mockOnSubmit,
      handleResendVerification: mockHandleResendVerification,
    });

    render(<LoginForm />);

    // Check for spinner in submit button
    const loader = screen.getByTestId("login-loader");
    expect(loader).toBeInTheDocument();

    // Check if form fields are disabled
    const emailInput = screen.getByTestId("login-input-email");
    const passwordInput = screen.getByTestId("login-input-password");

    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
  });
});
