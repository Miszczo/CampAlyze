import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import AIAnalysisButton from "./AIAnalysisButton";
import { toast } from "sonner"; // Import toast to be used with vi.mocked

// Mock fetch API
global.fetch = vi.fn();

// Mock sonner toast functions at the module level
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("AIAnalysisButton component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // No need to mock toast here as it's done at module level
  });

  it("renders analyze button initially", () => {
    render(<AIAnalysisButton importId="test-import-id" onAnalysisComplete={vi.fn()} />);

    expect(screen.getByRole("button", { name: /Generate AI Insights/i })).toBeInTheDocument();
  });

  it("shows loading state when analyzing", async () => {
    (global.fetch as any).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({ insights: "Analysis content" }),
            });
          }, 100)
        )
    );

    const handleAnalysisComplete = vi.fn();
    render(<AIAnalysisButton importId="test-import-id" onAnalysisComplete={handleAnalysisComplete} />);

    fireEvent.click(screen.getByRole("button", { name: /Generate AI Insights/i }));

    // Check for loading state
    expect(screen.getByText(/Generating Insights.../i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Generating Insights.../i })).toBeDisabled();

    // Wait for the mock fetch to resolve and loading to finish
    await waitFor(() => {
      expect(handleAnalysisComplete).toHaveBeenCalledWith("Analysis content");
    });
  });

  it("calls onAnalysisComplete after successful API call", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        insights: "This is the AI analysis of the import.",
      }),
    });

    const handleAnalysisComplete = vi.fn();
    render(<AIAnalysisButton importId="test-import-id" onAnalysisComplete={handleAnalysisComplete} />);

    fireEvent.click(screen.getByRole("button", { name: /Generate AI Insights/i }));

    await waitFor(() => {
      expect(handleAnalysisComplete).toHaveBeenCalledWith("This is the AI analysis of the import.");
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/imports/test-import-id/analyze", {
      method: "POST",
    });
  });

  it("calls onAnalysisError and shows toast when API call fails", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      json: async () => ({
        error: "API Error",
      }),
    });

    const handleAnalysisError = vi.fn();
    render(
      <AIAnalysisButton importId="test-import-id" onAnalysisComplete={vi.fn()} onAnalysisError={handleAnalysisError} />
    );

    fireEvent.click(screen.getByRole("button", { name: /Generate AI Insights/i }));

    await waitFor(() => {
      expect(handleAnalysisError).toHaveBeenCalledWith("API Error");
      expect(vi.mocked(toast.error)).toHaveBeenCalledWith("API Error");
    });
  });

  // Test 'passes date range parameters to API call' is removed as this component
  // AIAnalysisButton now takes importId and calls /api/imports/${importId}/analyze
  // It does not take campaignId or date ranges directly anymore.
  // If campaign-specific analysis with date ranges is needed,
  // a different component or an updated API endpoint would be required.
  // For now, this specific test case is no longer applicable to AIAnalysisButton.

  // The old test was:
  // it('passes date range parameters to API call', async () => { ... })
  // This is removed because the component's props and API endpoint have changed.
  // The current AIAnalysisButton is for `importId`, not generic `campaignId` with date ranges.
});
