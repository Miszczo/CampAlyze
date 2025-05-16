import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ResendVerification } from "./ResendVerification";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

// Mock Supabase client
const mockGetSession = vi.fn();
const mockSupabase = {
  auth: {
    getSession: mockGetSession,
  },
};

vi.mock("@/lib/supabase/client", () => ({
  getSupabaseBrowserClient: vi.fn(() => mockSupabase),
}));

// Mock fetch
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

// Mock Loader2 globally for this test file
vi.mock("lucide-react", async (importOriginal) => {
  const original = (await importOriginal()) as any;
  return {
    ...original,
    Loader2: (props: any) => <div data-testid="loader-icon" {...props}></div>,
  };
});

describe("ResendVerification Component", () => {
  const userEmail = "test@example.com";

  beforeEach(() => {
    vi.clearAllMocks();
    // Default successful session fetch
    mockGetSession.mockResolvedValue({
      data: { session: { user: { email: userEmail } } },
      error: null,
    });
    // Default successful API response
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ message: "Verification email sent successfully." }),
    } as Response);
  });

  it("should render the component and fetch user email on mount", async () => {
    render(<ResendVerification />);
    expect(screen.getByText("Verify Your Email")).toBeInTheDocument();
    expect(mockGetSession).toHaveBeenCalledTimes(1);

    // Wait for email to be set and button to appear
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Resend Verification Email/i })).toBeInTheDocument();
    });
    expect(screen.queryByText("Could not determine your email address. Please log in again.")).not.toBeInTheDocument();
  });

  it("should show loader while fetching email", () => {
    // Reset mock to simulate pending state
    mockGetSession.mockReturnValue(new Promise(() => {})); // Never resolves
    render(<ResendVerification />);
    expect(screen.getByTestId("loader-icon")).toBeInTheDocument(); // Assuming Loader2 has data-testid or recognizable role/props
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("should show error if fetching session fails", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: { message: "Session fetch failed" } });
    render(<ResendVerification />);
    await waitFor(() => {
      expect(screen.getByText(/Could not determine your email address/i)).toBeInTheDocument();
    });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("should show error if session has no user email", async () => {
    mockGetSession.mockResolvedValue({ data: { session: { user: { email: null } } }, error: null });
    render(<ResendVerification />);
    await waitFor(() => {
      expect(screen.getByText(/Could not determine your email address/i)).toBeInTheDocument();
    });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("should call the resend API when the button is clicked", async () => {
    render(<ResendVerification />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Resend Verification Email/i })).toBeEnabled();
    });

    fireEvent.click(screen.getByRole("button", { name: /Resend Verification Email/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });
    });
  });

  it("should show loading state and disable button during API call", async () => {
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ message: "Success!" }),
              } as Response),
            100
          )
        )
    ); // Simulate delay

    render(<ResendVerification />);
    await waitFor(() => expect(screen.getByRole("button")).toBeEnabled());

    fireEvent.click(screen.getByRole("button", { name: /Resend Verification Email/i }));

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeDisabled();
      expect(screen.getByTestId("loader-icon")).toBeInTheDocument(); // Loader inside button
    });

    // Wait for fetch to complete
    await waitFor(() => expect(mockFetch).toHaveBeenCalled());
    // Wait for success message
    await waitFor(() => expect(screen.getByText("Success!")).toBeInTheDocument());
    // Button should hide after success
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("should display success message on successful API response", async () => {
    render(<ResendVerification />);
    await waitFor(() => expect(screen.getByRole("button")).toBeEnabled());

    fireEvent.click(screen.getByRole("button", { name: /Resend Verification Email/i }));

    await waitFor(() => {
      expect(screen.getByText("Verification email sent successfully.")).toBeInTheDocument();
    });
    // Button should disappear after successful resend
    expect(screen.queryByRole("button", { name: /Resend Verification Email/i })).not.toBeInTheDocument();
  });

  it("should display error message on failed API response", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: "API Error: Failed to send." }),
    } as Response);

    render(<ResendVerification />);
    await waitFor(() => expect(screen.getByRole("button")).toBeEnabled());

    fireEvent.click(screen.getByRole("button", { name: /Resend Verification Email/i }));

    await waitFor(() => {
      expect(screen.getByText("API Error: Failed to send.")).toBeInTheDocument();
    });
    // Button should still be visible after error
    expect(screen.getByRole("button", { name: /Resend Verification Email/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Resend Verification Email/i })).toBeEnabled(); // Re-enabled
  });

  it("should display generic error message on network error", async () => {
    mockFetch.mockRejectedValue(new Error("Network failed"));
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {}); // Mock console.error

    render(<ResendVerification />);
    await waitFor(() => expect(screen.getByRole("button")).toBeEnabled());

    fireEvent.click(screen.getByRole("button", { name: /Resend Verification Email/i }));

    await waitFor(() => {
      expect(
        screen.getByText("An unexpected error occurred while resending the verification email.")
      ).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /Resend Verification Email/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Resend Verification Email/i })).toBeEnabled();

    consoleErrorSpy.mockRestore(); // Przywróć oryginalną implementację console.error
  });

  // Helper to ensure Loader2 has a data-testid or recognizable attribute
  it("renders loader icon correctly", async () => {
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ message: "Success!" }),
              } as Response),
            50
          )
        )
    );

    render(<ResendVerification />);
    await waitFor(() => expect(screen.getByRole("button")).toBeEnabled());
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(screen.getByTestId("loader-icon")).toBeInTheDocument());
    await waitFor(() => expect(screen.queryByTestId("loader-icon")).not.toBeInTheDocument()); // Should disappear after loading
  });
});
