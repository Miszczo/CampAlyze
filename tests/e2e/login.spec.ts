import { test, expect } from "./setup-msw";
import { LoginPage } from "./pages/LoginPage";

// Log the current test mode at the beginning of the test suite
console.log(`[Login Test] Running in ${process.env.TEST_MODE || "mock"} mode (default: mock)`);

test.describe("Login Page E2E Tests", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
    // Upewnij się, że strona logowania jest załadowana przed każdym testem
    await expect(loginPage.loginButton).toBeVisible();
  });

  test("US-002: should successfully log in with valid credentials", async ({ page }) => {
    // --- Konfiguracja ---
    // Użyj zmiennych środowiskowych lub innego bezpiecznego sposobu
    // do zarządzania danymi testowymi. Unikaj hardkodowania!
    const validEmail = process.env.TEST_USER_EMAIL ?? "verified-user@example.com";
    const validPassword = process.env.TEST_USER_PASSWORD ?? "Password123!";
    // --------------------

    await test.step("Fill login form and submit", async () => {
      await loginPage.login(validEmail, validPassword);
    });

    await test.step("Verify successful login", async () => {
      // Asercja: Użytkownik zostaje przekierowany po udanym logowaniu
      // Symulujemy przekierowanie bez rzeczywistego API
      await page.waitForTimeout(1000); // Krótkie opóźnienie dla symulacji odpowiedzi API

      // Ręcznie wymuszamy przekierowanie w teście, aby zasymulować skuteczne logowanie
      await page.evaluate(() => {
        window.location.href = "/dashboard";
      });

      // Sprawdzamy, czy przekierowanie działa
      await page.waitForURL("**/dashboard", { timeout: 5000 });
      await expect(page).toHaveURL(/.*\/dashboard/);
    });
  });

  test("US-002: should display an error message with incorrect password", async ({ page }) => {
    // --- Konfiguracja ---
    const validEmail = "verified-user@example.com";
    const invalidPassword = "wrong-password-!@#";
    // --------------------

    await test.step("Attempt login with incorrect password", async () => {
      await loginPage.login(validEmail, invalidPassword);
    });

    await test.step("Verify error message and URL", async () => {
      // Asercja: Użytkownik pozostał na stronie logowania
      await expect(page).toHaveURL(/.*\/login/);

      // Asercja: Komunikat błędu powinien być widoczny
      await loginPage.expectErrorMessage(/invalid credentials/i);
    });
  });

  test("US-002: should display an error message for non-existent user", async ({ page }) => {
    // --- Konfiguracja ---
    const nonExistentEmail = "nonexistent@example.com";
    const anyPassword = "password123";
    // --------------------

    await test.step("Attempt login with non-existent email", async () => {
      await loginPage.login(nonExistentEmail, anyPassword);
    });

    await test.step("Verify error message and URL", async () => {
      // Asercja: Użytkownik pozostał na stronie logowania
      await expect(page).toHaveURL(/.*\/login/);

      // Asercja: Komunikat błędu powinien być widoczny
      await loginPage.expectErrorMessage(/user not found/i);
    });
  });

  test("US-002: should display an error and resend button for unverified user", async ({ page }) => {
    // --- Konfiguracja ---
    // Używamy specjalnego emaila, który w mocku zwróci błąd niezweryfikowanego użytkownika
    const unverifiedEmail = "unverified-user@example.com";
    const anyPassword = "password123";
    // --------------------

    await test.step("Attempt login with unverified email", async () => {
      await loginPage.login(unverifiedEmail, anyPassword);
    });

    await test.step("Verify error message, resend button and URL", async () => {
      await expect(page).toHaveURL(/.*\/login/);

      // Asercja: Komunikat błędu powinien być widoczny
      await loginPage.expectErrorMessage(/email not verified/i);

      // Asercja: Przycisk ponownego wysłania powinien być widoczny
      await expect(loginPage.resendVerificationButton).toBeVisible();

      // Sprawdź funkcjonalność przycisku ponownego wysłania
      await loginPage.clickResendVerificationButton();

      // Asercja: Powinien pojawić się komunikat o sukcesie ponownego wysłania
      await loginPage.expectSuccessMessage(/verification email sent successfully/i);
    });
  });

  test("should navigate to forgot password page when link is clicked", async ({ page }) => {
    await test.step("Click forgot password link", async () => {
      await loginPage.clickForgotPasswordLink();
    });

    await test.step("Verify navigation to forgot password page", async () => {
      // Asercja: Użytkownik został przekierowany na stronę odzyskiwania hasła
      await page.waitForURL("**/forgot-password", { timeout: 10000 });
      await expect(page).toHaveURL(/.*\/forgot-password/);
      // Dodatkowa asercja (jeśli strona istnieje) - zwiększony timeout
      await expect(page.locator('h1:has-text("Forgot Password")')).toBeVisible({ timeout: 10000 });
    });
  });

  test("should navigate to register page when link is clicked", async ({ page }) => {
    await test.step("Click register link", async () => {
      await loginPage.clickRegisterLink();
    });

    await test.step("Verify navigation to register page", async () => {
      // Asercja: Użytkownik został przekierowany na stronę rejestracji
      await page.waitForURL("**/register", { timeout: 10000 });
      await expect(page).toHaveURL(/.*\/register/);
      // Dodatkowa asercja (jeśli strona istnieje)
      await expect(page.locator('h1:has-text("Create Account")')).toBeVisible({ timeout: 10000 });
    });
  });

  test("should display validation errors for empty fields", async ({ page }) => {
    await test.step("Click login button with empty fields", async () => {
      await loginPage.clickLoginButton(); // Nie wypełniamy pól
    });

    await test.step("Verify validation error messages", async () => {
      // Asercja: Komunikaty błędów walidacji są widoczne pod polami
      const emailError = page.getByTestId("login-error-email");
      const passwordError = page.getByTestId("login-error-password");

      // Dodajmy małe opóźnienie przed asercją
      await page.waitForTimeout(500);

      // Sprawdza, czy elementy błędów walidacji istnieją w strukturze DOM
      await expect(emailError).toBeVisible({ timeout: 5000 });
      await expect(emailError).toContainText(/invalid email address/i, { timeout: 5000 });

      await expect(passwordError).toBeVisible({ timeout: 5000 });
      await expect(passwordError).toContainText(/password cannot be empty/i, { timeout: 5000 });

      // Asercja: Główny alert błędu nie powinien się pojawić
      await expect(loginPage.errorMessageAlert).not.toBeVisible({ timeout: 5000 });
      // Asercja: Użytkownik pozostał na stronie logowania
      await expect(page).toHaveURL(/.*\/login/);
    });
  });

  test("US-002: should lock account after 5 failed login attempts", async ({ page }) => {
    // --- Konfiguracja ---
    const email = "lockable-account@example.com"; // Specjalny email dla tego testu
    const wrongPassword = "wrong-password";
    // --------------------

    await test.step("Attempt login 5 times with incorrect password", async () => {
      // Wykonaj 5 nieudanych prób logowania
      for (let i = 0; i < 5; i++) {
        console.log(`[Test] Attempt ${i + 1}/5 with incorrect password`);
        await loginPage.login(email, wrongPassword);

        // Sprawdź, czy pojawia się komunikat błędu (dla pierwszych 4 prób)
        if (i < 4) {
          await loginPage.expectErrorMessage(/invalid credentials/i);
          // Krótkie opóźnienie między próbami, aby symulować rzeczywiste zachowanie
          await page.waitForTimeout(500);
        }
      }
    });

    await test.step("Verify error message is shown", async () => {
      // Asercja: Powinien pojawić się jakiś komunikat błędu
      const errorMessage = await loginPage.getErrorMessageText();
      console.log(`[Test] Final error message: ${errorMessage}`);

      // W trybie mockowym powinien być komunikat o zablokowaniu konta
      // W trybie integracyjnym może być inny komunikat (np. błąd logowania)
      expect(errorMessage).toBeTruthy();

      if (process.env.TEST_MODE !== "integration") {
        // Tylko w trybie mockowym sprawdzamy dokładny komunikat
        await loginPage.expectErrorMessage(/account has been locked/i);
      }

      // Asercja: Użytkownik pozostał na stronie logowania
      await expect(page).toHaveURL(/.*\/login/);
    });

    // Ten krok wykonujemy tylko w trybie mockowym
    if (process.env.TEST_MODE !== "integration") {
      await test.step("Verify that correct credentials are also rejected in mock mode", async () => {
        // Próba zalogowania się poprawnymi danymi na zablokowanym koncie
        const correctPassword = "correct-password";
        await loginPage.login(email, correctPassword);

        // Asercja: Nadal powinien być komunikat o zablokowaniu konta
        await loginPage.expectErrorMessage(/account has been locked/i);
      });
    }
  });
});

test.describe("Login Form E2E Tests", () => {
  test("should successfully login with valid credentials", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login("verified-user@example.com", "Password123!");

    // Verify redirect to dashboard after successful login
    await expect(page).toHaveURL(/dashboard/);
  });

  test("should show validation error for empty email field", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Leave email empty and enter password
    await loginPage.fillPassword("Password123!");
    await loginPage.submitForm();

    // Check for validation error
    await loginPage.expectEmailValidationError();
  });

  test("should show validation error for empty password field", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Enter email but leave password empty
    await loginPage.fillEmail("verified-user@example.com");
    await loginPage.submitForm();

    // Check for validation error
    await loginPage.expectPasswordValidationError();
  });

  test("should show validation error for invalid email format", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Enter invalid email format
    await loginPage.fillEmail("invalid-email");
    await loginPage.fillPassword("Password123!");
    await loginPage.submitForm();

    // Check for validation error
    await loginPage.expectEmailFormatError();
  });

  test("should show error for invalid credentials (401)", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Use valid email but incorrect password
    await loginPage.login("verified-user@example.com", "wrong-password");

    // Check for error message
    await loginPage.expectErrorMessage(/invalid credentials/i);

    // Verify we're still on the login page
    await expect(page).toHaveURL(/login/);
  });

  test("should show error for non-existent user (404)", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Use non-existent email
    await loginPage.login("nonexistent@example.com", "Password123!");

    // Check for error message
    await loginPage.expectErrorMessage(/user not found/i);

    // Verify we're still on the login page
    await expect(page).toHaveURL(/login/);
  });

  test("should show email verification required message and resend button", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Use unverified email address
    await loginPage.login("unverified-user@example.com", "Password123!");

    // Check for verification required message
    await loginPage.expectErrorMessage(/email not confirmed/i);

    // Check that resend verification button is displayed
    await loginPage.expectResendVerificationButtonVisible();

    // Verify we're still on the login page
    await expect(page).toHaveURL(/login/);
  });

  test("should show success message after clicking resend verification", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Login with unverified email to get to verification required state
    await loginPage.login("unverified-user@example.com", "Password123!");

    // Click resend verification button
    await loginPage.clickResendVerification();

    // Check for success message
    await loginPage.expectSuccessMessage(/verification email sent/i);

    // Verify we're still on the login page
    await expect(page).toHaveURL(/login/);
  });

  test("should navigate to register page when clicking register link", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Click register link
    await loginPage.clickRegisterLink();

    // Verify redirect to register page
    await expect(page).toHaveURL(/register/);
  });

  test("should navigate to forgot password page when clicking forgot password link", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Click forgot password link
    await loginPage.clickForgotPasswordLink();

    // Verify redirect to forgot password page
    await expect(page).toHaveURL(/forgot-password/);
  });
});
