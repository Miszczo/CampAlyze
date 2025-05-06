import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { RegisterForm } from "./RegisterForm";

// --- Mocks ---

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

// Mock Loader icon dla łatwiejszego testowania
vi.mock("lucide-react", async (importOriginal) => {
  const original = (await importOriginal()) as any;
  return {
    ...original,
    Loader2: (props: any) => <div data-testid="loader-icon" {...props}></div>,
  };
});

describe("RegisterForm.tsx", () => {
  const renderComponent = () => render(<RegisterForm />);

  // Helper do wypełniania formularza
  const fillAndSubmitForm = async (
    fullName = "Test User",
    email = "test@example.com",
    password = "Password123",
    confirmPassword = "Password123"
  ) => {
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /register/i });

    // Upewnij się, że inputy istnieją
    expect(nameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(confirmPasswordInput).toBeInTheDocument();

    if (fullName) await userEvent.type(nameInput, fullName);
    if (email) await userEvent.type(emailInput, email);
    if (password) await userEvent.type(passwordInput, password);
    if (confirmPassword) await userEvent.type(confirmPasswordInput, confirmPassword);

    await userEvent.click(submitButton);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  it("powinien renderować wszystkie pola i przycisk rejestracji", () => {
    renderComponent();

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
  });

  it("powinien wyświetlać błędy walidacji dla pustych wymaganych pól", async () => {
    renderComponent();
    const submitButton = screen.getByRole("button", { name: /register/i });

    await userEvent.click(submitButton);

    expect(await screen.findByText(/full name is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/invalid email address/i)).toBeInTheDocument();
    expect(await screen.findByText(/password must be at least 8 characters/i)).toBeInTheDocument();

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("powinien wyświetlać błąd walidacji dla niepoprawnego emaila", async () => {
    renderComponent();

    // Wypełnij tylko email nieprawidłową wartością
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /register/i });

    await userEvent.type(nameInput, "Test User");
    await userEvent.type(emailInput, "invalid-email");
    await userEvent.type(passwordInput, "Password123");
    await userEvent.type(confirmPasswordInput, "Password123");
    await userEvent.click(submitButton);

    expect(await screen.findByText(/invalid email address/i)).toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("powinien wyświetlać błąd walidacji dla zbyt krótkiego hasła", async () => {
    renderComponent();

    // Wypełnij formularz z zbyt krótkim hasłem
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /register/i });

    await userEvent.type(nameInput, "Test User");
    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "short1");
    await userEvent.type(confirmPasswordInput, "short1");
    await userEvent.click(submitButton);

    expect(await screen.findByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("powinien wyświetlać błąd walidacji dla hasła bez cyfry", async () => {
    renderComponent();

    // Wypełnij formularz z hasłem bez cyfry
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /register/i });

    await userEvent.type(nameInput, "Test User");
    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "longpassword");
    await userEvent.type(confirmPasswordInput, "longpassword");
    await userEvent.click(submitButton);

    expect(await screen.findByText(/password must contain at least one letter and one number/i)).toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("powinien wyświetlać błąd walidacji dla hasła bez litery", async () => {
    renderComponent();

    // Wypełnij formularz z hasłem bez litery
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /register/i });

    await userEvent.type(nameInput, "Test User");
    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "123456789");
    await userEvent.type(confirmPasswordInput, "123456789");
    await userEvent.click(submitButton);

    expect(await screen.findByText(/password must contain at least one letter and one number/i)).toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("powinien wyświetlać błąd walidacji, gdy hasła się nie zgadzają", async () => {
    renderComponent();

    // Wypełnij formularz z różnymi hasłami
    await fillAndSubmitForm("Test User", "test@example.com", "Password123", "Password456");

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("powinien wywołać fetch z poprawnymi danymi, pokazać sukces i wyczyścić formularz", async () => {
    const successMessage = "Registration successful! Check email.";
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: successMessage }),
    });

    renderComponent();
    await fillAndSubmitForm();

    // Sprawdź wywołanie fetch
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.com", password: "Password123", full_name: "Test User" }),
      });
    });

    // Sprawdź komunikat sukcesu
    expect(await screen.findByText(successMessage)).toBeInTheDocument();

    // Sprawdź, czy formularz jest ukryty po sukcesie (sprawdzając brak przycisku)
    expect(screen.queryByRole("button", { name: /register/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /login/i })).not.toBeInTheDocument();
  });

  it("powinien wyświetlić błąd API, jeśli rejestracja nie powiodła się", async () => {
    const errorMessage = "Email already exists";
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    });

    renderComponent();
    await fillAndSubmitForm();

    // Sprawdź komunikat błędu
    expect(await screen.findByText(errorMessage)).toBeInTheDocument();

    // Formularz nie powinien być czyszczony ani ukrywany
    expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
  });

  it("powinien wyświetlić domyślny błąd API, jeśli odpowiedź błędu nie zawiera wiadomości", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    renderComponent();
    await fillAndSubmitForm();

    expect(await screen.findByText(/registration failed. please try again./i)).toBeInTheDocument();
  });

  it("powinien wyświetlić generyczny błąd, jeśli fetch rzuci wyjątek", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network Error"));

    renderComponent();
    await fillAndSubmitForm();

    expect(await screen.findByText(/an unexpected error occurred. please try again later./i)).toBeInTheDocument();
  });

  it("powinien pokazywać stan ładowania podczas wysyłania żądania", async () => {
    // Symuluj opóźnienie w odpowiedzi API
    mockFetch.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({ message: "Registration successful!" }),
            });
          }, 100);
        })
    );

    renderComponent();
    const submitButton = screen.getByRole("button", { name: /register/i });

    await fillAndSubmitForm();

    // Sprawdź czy przycisk jest wyłączony i widoczna jest ikona ładowania
    expect(submitButton).toBeDisabled();
    expect(screen.getByTestId("loader-icon")).toBeInTheDocument();

    // Poczekaj na zakończenie ładowania
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
  });
});
