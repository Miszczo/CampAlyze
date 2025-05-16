import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

// Mockowanie globalnego fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("ForgotPasswordForm.tsx", () => {
  const renderComponent = () => render(<ForgotPasswordForm />);
  const user = userEvent.setup();

  beforeEach(() => {
    mockFetch.mockReset();
    // Domyślna, pomyślna odpowiedź, aby uniknąć nieoczekiwanego successMessage w innych testach
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ message: "Default success" }),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("powinien renderować pole email i przycisk wysyłania", () => {
    renderComponent();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send reset link/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
  });

  it("powinien wyświetlać błąd walidacji dla pustego emaila po próbie wysłania", async () => {
    // Celowo nie mockujemy fetch tutaj, aby sprawdzić walidację front-endową
    // Jeśli walidacja zadziała, onSubmit nie powinno być wywołane
    mockFetch.mockImplementationOnce(() => {
      throw new Error("onSubmit was called unexpectedly during validation test for empty email");
    });

    renderComponent();
    const submitButton = screen.getByRole("button", { name: /send reset link/i });
    await user.click(submitButton); // Próba wysłania pustego formularza

    await waitFor(() => {
      expect(screen.getByText("Invalid email address")).toBeInTheDocument();
    });
    // Upewnij się, że fetch nie został wywołany, bo walidacja powinna zatrzymać submit
    expect(mockFetch).not.toHaveBeenCalled();
    // Upewnij się, że żaden alert (sukcesu/błędu API) nie jest wyświetlany
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("powinien wyświetlać błąd walidacji dla niepoprawnego formatu emaila po próbie wysłania", async () => {
    mockFetch.mockImplementationOnce(() => {
      throw new Error("onSubmit was called unexpectedly during validation test for invalid email format");
    });

    renderComponent();
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole("button", { name: /send reset link/i });

    await user.type(emailInput, "invalid-email");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid email address")).toBeInTheDocument();
    });
    expect(mockFetch).not.toHaveBeenCalled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("powinien wywołać fetch, pokazać sukces i wyczyścić formularz przy udanej odpowiedzi API (2xx)", async () => {
    const successMessageFromApi = "Request successful! Check email.";
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ message: successMessageFromApi }),
    });
    renderComponent();
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole("button", { name: /send reset link/i });
    const testEmail = "test@example.com";

    await user.type(emailInput, testEmail);
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail }),
      });
    });

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent("Check Your Email"); // Sprawdzenie AlertTitle
      expect(alert).toHaveTextContent(successMessageFromApi); // Sprawdzenie AlertDescription
    });

    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /send reset link/i })).not.toBeInTheDocument();
  });

  it("powinien pokazać generyczny komunikat sukcesu przy błędzie API (np. 404), aby nie ujawniać istnienia emaila", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: "User not found (internal)" }),
    });
    renderComponent();
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole("button", { name: /send reset link/i });
    const testEmail = "nonexistent@example.com";

    await user.type(emailInput, testEmail);
    await user.click(submitButton);

    const expectedSuccessMessage =
      "Request submitted. If an account with this email exists, a password reset link has been sent.";
    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent("Check Your Email");
      expect(alert).toHaveTextContent(expectedSuccessMessage);
    });

    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
  });

  it("powinien pokazać komunikat sukcesu z informacją o rate limit przy błędzie 429", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({ error: "Too many requests" }),
    });
    renderComponent();
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole("button", { name: /send reset link/i });

    await user.type(emailInput, "test@example.com");
    await user.click(submitButton);

    const expectedMessage =
      "Request submitted. If an account exists, a link will be sent. Please check rate limits if issues persist.";
    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent("Check Your Email");
      expect(alert).toHaveTextContent(expectedMessage);
    });
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
  });

  it("powinien pokazać generyczny komunikat sukcesu, jeśli fetch rzuci wyjątek", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network Error"));
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {}); // Mock console.error

    renderComponent();
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole("button", { name: /send reset link/i });

    await user.type(emailInput, "test@example.com");
    await user.click(submitButton);

    const expectedMessage =
      "Request submitted. If an account with this email exists, a password reset link has been sent.";
    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent("Check Your Email");
      expect(alert).toHaveTextContent(expectedMessage);
    });
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();

    consoleErrorSpy.mockRestore(); // Przywróć oryginalną implementację console.error
  });

  it("powinien czyścić błąd walidacji po wpisaniu poprawnego emaila", async () => {
    renderComponent();
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole("button", { name: /send reset link/i });

    // Krok 1: Wywołaj błąd walidacji
    // Ustawiamy mockFetch tak, aby rzucił błąd, jeśli zostanie wywołany,
    // co pomoże zdiagnozować, czy onSubmit jest wywoływane mimo błędu walidacji.
    mockFetch.mockImplementationOnce(() => {
      throw new Error("onSubmit was called unexpectedly during initial validation for clearing test");
    });
    await user.type(emailInput, "invalid");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid email address")).toBeInTheDocument();
    });
    // Ważne: Resetujemy mockFetch DO DOMYŚLNEGO zachowania z beforeEach (resolved value),
    // aby nie wpływać na inne asercje lub testy.
    // Alternatywnie, jeśli chcemy być pewni, że fetch nie jest wywoływany po wpisaniu poprawnego emaila
    // (bez klikania submit), to nie musimy go tu zmieniać.
    // Na razie zostawiam, aby upewnić się, że poprzednie kliknięcie nie zostawiło "złego" mocka.
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({
      // Przywracamy domyślny mock z beforeEach
      ok: true,
      status: 200,
      json: async () => ({ message: "Default success" }),
    });

    // Krok 2: Wpisz poprawny email
    await user.clear(emailInput);
    await user.type(emailInput, "correct@example.com");

    // Krok 3: Sprawdź, czy błąd walidacji zniknął (react-hook-form powinien go usunąć)
    await waitFor(() => {
      expect(screen.queryByText("Invalid email address")).not.toBeInTheDocument();
    });
    // Upewnij się, że successMessage nie zostało przypadkowo ustawione (nie było submita)
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled(); // Fetch nie powinien być wywołany tylko przez wpisanie poprawnego emaila
  });
});
