import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { LoginFormFooter } from "../LoginFormFooter";

describe("LoginFormFooter", () => {
  it("should render the register link", () => {
    render(<LoginFormFooter />);

    const registerLink = screen.getByRole("link", { name: /don't have an account\? register/i });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute("href", "/register");
  });

  it("should render the forgot password link", () => {
    render(<LoginFormFooter />);

    const forgotPasswordLink = screen.getByRole("link", { name: /forgot password\?/i });
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink).toHaveAttribute("href", "/forgot-password");
  });

  it("should render the links with correct classes", () => {
    render(<LoginFormFooter />);

    const registerLink = screen.getByRole("link", { name: /don't have an account\? register/i });
    const forgotPasswordLink = screen.getByRole("link", { name: /forgot password\?/i });

    expect(registerLink).toHaveClass("text-primary");
    expect(forgotPasswordLink).toHaveClass("text-muted-foreground");
  });
});
