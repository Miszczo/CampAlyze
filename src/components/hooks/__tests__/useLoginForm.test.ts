import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useLoginForm } from "../useLoginForm";

// Mock fetch API
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("useLoginForm", () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    mockFetch.mockClear();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useLoginForm({ navigate: mockNavigate }));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.successMessage).toBeNull();
    expect(result.current.requiresVerification).toBe(false);
    expect(result.current.formState.errors).toEqual({});
  });

  it("should handle successful login", async () => {
    // Mock successful login response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    const { result } = renderHook(() => useLoginForm({ navigate: mockNavigate }));

    await act(async () => {
      await result.current.onSubmit({ email: "test@example.com", password: "Password123!" });
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com", password: "Password123!" }),
    });
    
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should handle email not verified error", async () => {
    // Mock error response for unverified email
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({
        error: "Email not confirmed",
        requiresVerification: true,
      }),
    } as Response);

    const { result } = renderHook(() => useLoginForm({ navigate: mockNavigate }));

    await act(async () => {
      await result.current.onSubmit({ email: "unverified@example.com", password: "Password123!" });
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "unverified@example.com", password: "Password123!" }),
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.requiresVerification).toBe(true);
    expect(result.current.error).toContain("Email not confirmed");
  });

  it("should handle invalid credentials error", async () => {
    // Mock error response for invalid credentials
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({
        error: "Invalid login credentials",
      }),
    } as Response);

    const { result } = renderHook(() => useLoginForm({ navigate: mockNavigate }));

    await act(async () => {
      await result.current.onSubmit({ email: "test@example.com", password: "WrongPassword" });
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com", password: "WrongPassword" }),
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toContain("Invalid login credentials");
  });

  it("should handle user not found error", async () => {
    // Mock error response for user not found
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({
        error: "User not found",
      }),
    } as Response);

    const { result } = renderHook(() => useLoginForm({ navigate: mockNavigate }));

    await act(async () => {
      await result.current.onSubmit({ email: "nonexistent@example.com", password: "Password123!" });
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "nonexistent@example.com", password: "Password123!" }),
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toContain("User not found");
  });

  it("should handle resend email verification", async () => {
    // Mock successful resend verification
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Verification email sent successfully." }),
    } as Response);

    const { result } = renderHook(() => useLoginForm({ navigate: mockNavigate }));

    // Set requiresVerification to true to test resend
    act(() => {
      result.current.setRequiresVerification(true);
      result.current.setError("Email not confirmed");
    });

    await act(async () => {
      await result.current.handleResendVerification("unverified@example.com");
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "unverified@example.com" }),
    });
    expect(result.current.successMessage).toContain("Verification email sent successfully");
    expect(result.current.error).toBeNull();
  });

  it("should handle error during resend verification", async () => {
    // Mock error during resend verification
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({
        error: "Too many requests",
      }),
    } as Response);

    const { result } = renderHook(() => useLoginForm({ navigate: mockNavigate }));

    // Set requiresVerification to true to test resend
    act(() => {
      result.current.setRequiresVerification(true);
    });

    await act(async () => {
      await result.current.handleResendVerification("unverified@example.com");
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "unverified@example.com" }),
    });
    expect(result.current.successMessage).toBeNull();
    expect(result.current.error).toContain("Too many requests");
  });
});
