import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { LoginFormAlerts } from "../LoginFormAlerts";

describe("LoginFormAlerts", () => {
  it("should render error message when provided", () => {
    const errorMessage = "Invalid credentials";
    render(<LoginFormAlerts error={errorMessage} successMessage={null} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.queryByTestId("success-message")).not.toBeInTheDocument();
  });

  it("should render success message when provided", () => {
    const successMessage = "Verification email sent";
    render(<LoginFormAlerts error={null} successMessage={successMessage} />);

    expect(screen.getByText(successMessage)).toBeInTheDocument();
    expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();
  });

  it("should render both error and success messages when both provided", () => {
    const errorMessage = "Email not verified";
    const successMessage = "Verification email sent";
    render(<LoginFormAlerts error={errorMessage} successMessage={successMessage} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText(successMessage)).toBeInTheDocument();
  });

  it("should not render any alerts when no messages provided", () => {
    render(<LoginFormAlerts error={null} successMessage={null} />);

    expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();
    expect(screen.queryByTestId("success-message")).not.toBeInTheDocument();
  });
});
