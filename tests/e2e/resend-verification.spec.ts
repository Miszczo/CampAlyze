import { test, expect } from "./setup-msw";
import { LoginPage } from "./poms/LoginPage.pom";

// Log the current test mode at the beginning of the test suite
console.log(`[Resend Verification Test] Running in ${process.env.TEST_MODE || "mock"} mode (default: mock)`);

test.describe("Resend Verification E2E Tests", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
    // Upewnij się, że strona logowania jest załadowana przed każdym testem
    await expect(loginPage.loginButton).toBeVisible();
  });

  test("US-003: should display resend verification button for unverified users", async ({ page }) => {
    // --- Konfiguracja ---
    // Używamy specjalnego emaila, który w mocku zwróci błąd niezweryfikowanego użytkownika
    const unverifiedEmail = "unverified-user@example.com";
    const anyPassword = "password123";
    // --------------------

    await test.step("Attempt login with unverified email", async () => {
      await loginPage.login(unverifiedEmail, anyPassword);
    });

    await test.step("Verify error message and resend button visibility", async () => {
      // Asercja: Użytkownik pozostał na stronie logowania
      await expect(page).toHaveURL(/.*\/login/);

      // Asercja: Komunikat błędu powinien być widoczny
      await loginPage.expectErrorMessage(/email not verified/i);

      // Asercja: Przycisk ponownego wysłania powinien być widoczny
      await expect(loginPage.resendVerificationButton).toBeVisible();
    });
  });

  test("US-003: should handle successful resend verification request", async ({ page }) => {
    // --- Konfiguracja ---
    const unverifiedEmail = "unverified-user@example.com";
    const anyPassword = "password123";
    // --------------------

    await test.step("Login with unverified email to trigger resend option", async () => {
      await loginPage.login(unverifiedEmail, anyPassword);
      await loginPage.expectErrorMessage(/email not verified/i);
      await expect(loginPage.resendVerificationButton).toBeVisible();
    });

    await test.step("Click resend verification button and verify success message", async () => {
      await loginPage.clickResendVerificationButton();

      // Asercja: Powinien pojawić się komunikat o sukcesie
      await loginPage.expectSuccessMessage(/verification email sent successfully/i);

      // Asercja: Przycisk resend powinien zniknąć po sukcesie
      await expect(loginPage.resendVerificationButton).not.toBeVisible();
    });
  });

  test("US-003: should handle error during resend verification", async ({ page }) => {
    // --- Konfiguracja ---
    // Ten email zwróci błąd podczas próby ponownego wysłania
    const problematicEmail = "error-prone@example.com";
    const unverifiedEmail = "unverified-user@example.com";
    const anyPassword = "password123";
    // --------------------

    // Najpierw musimy zalogować się, aby zobaczyć błąd niezweryfikowanego konta
    await test.step("Setup: Modify form with unverified email", async () => {
      // Wypełniamy formularz, ale nie submitujemy jeszcze
      await loginPage.fillEmail(unverifiedEmail);
      await loginPage.fillPassword(anyPassword);

      // Ręcznie zmieniamy wartość emaila na problematyczny
      // (Symulujemy sytuację, gdy użytkownik zmienia email po zobaczeniu błędu weryfikacji)
      await page.evaluate(() => {
        const emailInput = document.querySelector('[data-testid="login-input-email"]') as HTMLInputElement;
        if (emailInput) emailInput.value = "error-prone@example.com";
      });

      // Wysyłamy formularz z problematycznym emailem
      await loginPage.clickLoginButton();

      // Czekamy na wyświetlenie przycisku resend
      await expect(loginPage.resendVerificationButton).toBeVisible();
    });

    await test.step("Click resend verification with problematic email", async () => {
      // W mocku dla tego emaila powinien być zwrócony błąd
      await loginPage.clickResendVerificationButton();

      // Asercja: Powinien pojawić się komunikat o błędzie
      await loginPage.expectErrorMessage(/failed to resend verification email/i);
    });
  });

  test("US-003: should require email to be entered before resend", async ({ page }) => {
    // Test przypadku, gdy użytkownik usunął email przed próbą ponownego wysłania
    await test.step("Setup: First login with unverified email", async () => {
      const unverifiedEmail = "unverified-user@example.com";
      const anyPassword = "password123";

      await loginPage.login(unverifiedEmail, anyPassword);
      await expect(loginPage.resendVerificationButton).toBeVisible();

      // Czyścimy pole email
      await loginPage.emailInput.clear();
    });

    await test.step("Attempt resend with empty email field", async () => {
      await loginPage.clickResendVerificationButton();

      // Asercja: Powinien pojawić się błąd o pustym polu email
      await loginPage.expectErrorMessage(/enter your email address/i);
    });
  });
});
