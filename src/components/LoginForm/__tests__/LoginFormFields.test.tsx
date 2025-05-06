import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { LoginFormFields } from "../LoginFormFields";

describe("LoginFormFields", () => {
  const mockRegister = vi.fn();
  const mockErrors = {};

  it("should render email and password fields", () => {
    render(<LoginFormFields register={mockRegister} errors={mockErrors} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("should call register function for both fields", () => {
    mockRegister.mockReturnValue({ name: "test" });
    render(<LoginFormFields register={mockRegister} errors={mockErrors} />);

    expect(mockRegister).toHaveBeenCalledWith("email", expect.any(Object));
    expect(mockRegister).toHaveBeenCalledWith("password", expect.any(Object));
  });

  it("should show validation requirements for email field", () => {
    mockRegister.mockReturnValue({ name: "test" });
    render(<LoginFormFields register={mockRegister} errors={mockErrors} />);

    const emailField = screen.getByLabelText(/email/i);
    expect(emailField).toHaveAttribute("required");
    expect(emailField).toHaveAttribute("type", "email");
  });

  it("should show validation requirements for password field", () => {
    mockRegister.mockReturnValue({ name: "test" });
    render(<LoginFormFields register={mockRegister} errors={mockErrors} />);

    const passwordField = screen.getByLabelText(/password/i);
    expect(passwordField).toHaveAttribute("required");
    expect(passwordField).toHaveAttribute("type", "password");
    expect(passwordField).toHaveAttribute("minLength", "8");
  });

  it("should display error message when email error exists", () => {
    const errorsWithEmail = {
      email: { message: "Email is required" },
    };

    render(<LoginFormFields register={mockRegister} errors={errorsWithEmail} />);

    expect(screen.getByText("Email is required")).toBeInTheDocument();
  });

  it("should display error message when password error exists", () => {
    const errorsWithPassword = {
      password: { message: "Password is required" },
    };

    render(<LoginFormFields register={mockRegister} errors={errorsWithPassword} />);

    expect(screen.getByText("Password is required")).toBeInTheDocument();
  });

  it("should allow user input in the fields", () => {
    mockRegister.mockReturnValue({ name: "test" });
    render(<LoginFormFields register={mockRegister} errors={mockErrors} />);

    const emailField = screen.getByLabelText(/email/i);
    const passwordField = screen.getByLabelText(/password/i);

    fireEvent.change(emailField, { target: { value: "test@example.com" } });
    fireEvent.change(passwordField, { target: { value: "Password123!" } });

    expect(emailField).toHaveValue("test@example.com");
    expect(passwordField).toHaveValue("Password123!");
  });
});
