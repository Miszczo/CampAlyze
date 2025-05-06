import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLoginForm } from "./useLoginForm";

// Mock fetch API
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock window.location
const originalLocation = window.location;
beforeAll(() => {
  delete (window as any).location;
  window.location = { ...originalLocation, assign: vi.fn(), href: "" };
});

afterAll(() => {
  window.location = originalLocation;
});

describe("useLoginForm hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
    window.location.href = "/login";
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useLoginForm());

    expect(result.current.error).toBeNull();
    expect(result.current.successMessage).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.requiresVerification).toBe(false);
    expect(result.current.form).toBeDefined();
    expect(typeof result.current.onSubmit).toBe("function");
    expect(typeof result.current.handleResendVerification).toBe("function");
  });

  it("should initialize with provided initialMessage (error type)", () => {
    const errorMessage = "Test error message";
    const { result } = renderHook(() =>
      useLoginForm({
        initialMessage: errorMessage,
        messageType: "error",
      })
    );

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.successMessage).toBeNull();
  });

  it("should initialize with provided initialMessage (success type)", () => {
    const successMessage = "Test success message";
    const { result } = renderHook(() =>
      useLoginForm({
        initialMessage: successMessage,
        messageType: "success",
      })
    );

    expect(result.current.error).toBeNull();
    expect(result.current.successMessage).toBe(successMessage);
  });

  it("should handle form submission for successful login", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    const { result } = renderHook(() => useLoginForm());

    // Set form values
    result.current.form.setValue("email", "test@example.com");
    result.current.form.setValue("password", "password123");

    // Submit form
    await act(async () => {
      await result.current.onSubmit({ email: "test@example.com", password: "password123" });
    });

    // Assertions
    expect(mockFetch).toHaveBeenCalledWith("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com", password: "password123" }),
    });

    expect(window.location.href).toBe("/dashboard");
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle form submission with verification required", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({
        error: "Email not verified",
        requiresVerification: true,
      }),
    } as Response);

    const { result } = renderHook(() => useLoginForm());

    // Set form values
    result.current.form.setValue("email", "test@example.com");
    result.current.form.setValue("password", "password123");

    // Submit form
    await act(async () => {
      await result.current.onSubmit({ email: "test@example.com", password: "password123" });
    });

    // Assertions
    expect(result.current.requiresVerification).toBe(true);
    expect(result.current.error).toContain("verify your email address");
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle resend verification success", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Verification email sent successfully." }),
    } as Response);

    const { result } = renderHook(() => useLoginForm());

    // Set form values
    result.current.form.setValue("email", "test@example.com");

    // Set verification required
    act(() => {
      result.current.form.setValue("email", "test@example.com");
    });

    // Call resend verification
    await act(async () => {
      await result.current.handleResendVerification();
    });

    // Assertions
    expect(mockFetch).toHaveBeenCalledWith("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com" }),
    });

    expect(result.current.successMessage).toContain("Verification email sent successfully");
    expect(result.current.requiresVerification).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });
});
