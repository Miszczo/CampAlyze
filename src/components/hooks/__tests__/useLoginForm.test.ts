import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useLoginForm } from "../useLoginForm";
import * as supabaseClient from "../../../lib/supabase/client";

// Mock supabaseClient
vi.mock("../../../lib/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      resendEmailVerification: vi.fn(),
    },
  },
}));

describe("useLoginForm", () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useLoginForm(mockNavigate));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.successMessage).toBeNull();
    expect(result.current.requiresVerification).toBe(false);
    expect(result.current.formState.errors).toEqual({});
  });

  it("should handle successful login", async () => {
    // Mock successful login response
    const mockSignIn = vi.mocked(supabaseClient.supabase.auth.signInWithPassword);
    mockSignIn.mockResolvedValueOnce({
      data: { user: { id: "123", email: "test@example.com" }, session: { access_token: "token" } },
      error: null,
    });

    const { result } = renderHook(() => useLoginForm(mockNavigate));

    await act(async () => {
      await result.current.onSubmit({ email: "test@example.com", password: "Password123!" });
    });

    expect(mockSignIn).toHaveBeenCalledWith({ email: "test@example.com", password: "Password123!" });
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should handle email not verified error", async () => {
    // Mock error response for unverified email
    const mockSignIn = vi.mocked(supabaseClient.supabase.auth.signInWithPassword);
    mockSignIn.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: "Email not confirmed", status: 400 },
    });

    const { result } = renderHook(() => useLoginForm(mockNavigate));

    await act(async () => {
      await result.current.onSubmit({ email: "unverified@example.com", password: "Password123!" });
    });

    expect(mockSignIn).toHaveBeenCalledWith({ email: "unverified@example.com", password: "Password123!" });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.requiresVerification).toBe(true);
    expect(result.current.error).toContain("Email not confirmed");
  });

  it("should handle invalid credentials error", async () => {
    // Mock error response for invalid credentials
    const mockSignIn = vi.mocked(supabaseClient.supabase.auth.signInWithPassword);
    mockSignIn.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: "Invalid login credentials", status: 401 },
    });

    const { result } = renderHook(() => useLoginForm(mockNavigate));

    await act(async () => {
      await result.current.onSubmit({ email: "test@example.com", password: "WrongPassword" });
    });

    expect(mockSignIn).toHaveBeenCalledWith({ email: "test@example.com", password: "WrongPassword" });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toContain("Invalid login credentials");
  });

  it("should handle user not found error", async () => {
    // Mock error response for user not found
    const mockSignIn = vi.mocked(supabaseClient.supabase.auth.signInWithPassword);
    mockSignIn.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: "User not found", status: 404 },
    });

    const { result } = renderHook(() => useLoginForm(mockNavigate));

    await act(async () => {
      await result.current.onSubmit({ email: "nonexistent@example.com", password: "Password123!" });
    });

    expect(mockSignIn).toHaveBeenCalledWith({ email: "nonexistent@example.com", password: "Password123!" });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toContain("User not found");
  });

  it("should handle resend email verification", async () => {
    // Mock successful resend verification
    const mockResend = vi.mocked(supabaseClient.supabase.auth.resendEmailVerification);
    mockResend.mockResolvedValueOnce({
      data: {},
      error: null,
    });

    const { result } = renderHook(() => useLoginForm(mockNavigate));

    // Set requiresVerification to true to test resend
    act(() => {
      result.current.setRequiresVerification(true);
      result.current.setError("Email not confirmed");
    });

    await act(async () => {
      await result.current.handleResendVerification("unverified@example.com");
    });

    expect(mockResend).toHaveBeenCalledWith({ email: "unverified@example.com" });
    expect(result.current.successMessage).toContain("Verification email sent");
    expect(result.current.error).toBeNull();
  });

  it("should handle error during resend verification", async () => {
    // Mock error during resend verification
    const mockResend = vi.mocked(supabaseClient.supabase.auth.resendEmailVerification);
    mockResend.mockResolvedValueOnce({
      data: {},
      error: { message: "Too many requests", status: 429 },
    });

    const { result } = renderHook(() => useLoginForm(mockNavigate));

    // Set requiresVerification to true to test resend
    act(() => {
      result.current.setRequiresVerification(true);
    });

    await act(async () => {
      await result.current.handleResendVerification("unverified@example.com");
    });

    expect(mockResend).toHaveBeenCalledWith({ email: "unverified@example.com" });
    expect(result.current.successMessage).toBeNull();
    expect(result.current.error).toContain("Too many requests");
  });
});
