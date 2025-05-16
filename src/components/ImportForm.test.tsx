import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ImportForm from "./ImportForm";
import { ToastProvider } from "./hooks/useToast";

// Mock fetch API
global.fetch = vi.fn();

// Helper function to render component with ToastProvider
const renderWithToast = (ui) => {
  return render(<ToastProvider>{ui}</ToastProvider>);
};

describe("ImportForm component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders the form correctly", () => {
    renderWithToast(<ImportForm />);

    expect(screen.getByLabelText(/wybierz plik/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /importuj/i })).toBeInTheDocument();
  });

  it.todo("shows error when no file is selected");

  it.todo("handles file upload success");

  it.todo("handles file upload error");

  it.todo("disables the submit button during upload");
});
