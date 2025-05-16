import { test, expect } from "@playwright/test";
import { LoginPage } from "./poms/LoginPage.pom";
import { setupApiInterception } from "./intercept-setup";

// Log the current test mode at the beginning of the test suite
console.log(`[Resend Verification Test] Running in ${process.env.TEST_MODE || "mock"} mode (default: mock)`);

test.describe("Resend Verification E2E Tests", () => {
  let loginPage: LoginPage;

  test.beforeAll(({}, testInfo) => {
    // Skip resend verification tests in logged-in project (redirects from /login)
    test.skip(testInfo.project.name === "chromium-logged-in");
  });

  test.beforeEach(async ({ page }) => {
    // Najpierw ustawiamy interceptor API
    await setupApiInterception(page);

    loginPage = new LoginPage(page);
    await loginPage.goto();
    // Upewnij się, że strona logowania jest załadowana przed każdym testem
    await expect(loginPage.loginButton).toBeVisible();
  });

  test.skip("US-003: should display resend verification button for unverified users", async ({ page }) => {
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

  test.skip("US-003: should handle successful resend verification request", async ({ page }) => {
    // --- Konfiguracja ---
    const unverifiedEmail = "unverified-user@example.com";
    const anyPassword = "password123";
    console.log(`[Test US-003 Success] Starting test with email: ${unverifiedEmail}`);
    // --------------------

    await test.step("Login with unverified email to trigger resend option", async () => {
      console.log("[Test US-003 Success] Step: Attempting login...");
      try {
        await loginPage.login(unverifiedEmail, anyPassword);
        console.log("[Test US-003 Success] Step: Login call completed.");

        console.log("[Test US-003 Success] Step: Expecting 'email not verified' error message...");
        await loginPage.expectErrorMessage(/email not verified/i);
        console.log("[Test US-003 Success] Step: 'email not verified' error message found.");

        console.log("[Test US-003 Success] Step: Expecting resend button to be visible...");
        await expect(loginPage.resendVerificationButton).toBeVisible();
        console.log("[Test US-003 Success] Step: Resend button is visible.");
      } catch (error) {
        console.error("[Test US-003 Success] ERROR during login/setup phase:", error);
        throw error; // Re-throw to fail the test if setup fails
      }
    });

    await test.step("Click resend verification button and verify success message", async () => {
      console.log("[Test US-003 Success] Step: Clicking resend verification button...");
      try {
        await loginPage.clickResendVerificationButton();
        console.log("[Test US-003 Success] Step: clickResendVerificationButton call completed.");

        console.log("[Test US-003 Success] Step: Expecting generic success message...");
        await loginPage.expectSuccessMessage(
          /If an account with this email exists and requires verification, a new verification link has been sent./i
        );
        console.log("[Test US-003 Success] Step: Generic success message found.");

        console.log("[Test US-003 Success] Step: Expecting resend button NOT to be visible...");
        await expect(loginPage.resendVerificationButton).not.toBeVisible({ timeout: 5000 });
        console.log("[Test US-003 Success] Step: Resend button is NOT visible as expected.");
      } catch (error) {
        console.error("[Test US-003 Success] ERROR during resend/verification phase:", error);
        throw error; // Re-throw to fail the test
      }
    });
    console.log("[Test US-003 Success] Test completed successfully.");
  });

  test.skip("US-003: should handle error during resend verification", async ({ page }) => {
    // --- Konfiguracja ---
    const problematicEmail = "error-prone@example.com";
    const unverifiedEmail = "unverified-user@example.com";
    const anyPassword = "password123";
    // --------------------

    await test.step("Setup: Login with unverified, then change to problematic email", async () => {
      await loginPage.login(unverifiedEmail, anyPassword);
      await loginPage.expectErrorMessage(/email not verified/i);
      await expect(loginPage.resendVerificationButton).toBeVisible();
      // Zmieniamy wartość emaila na problematyczny tuż przed kliknięciem resend
      await loginPage.fillEmail(problematicEmail);
    });

    await test.step("Click resend verification with problematic email and verify outcome", async () => {
      await loginPage.clickResendVerificationButton();

      // Asercja: API (i mock) zwraca status 200 z generycznym komunikatem, nawet jeśli wewnętrznie wystąpił błąd.
      // Użytkownik zobaczy ten sam komunikat co przy sukcesie.
      await loginPage.expectSuccessMessage(
        /If an account with this email exists and requires verification, a new verification link has been sent./i
      );
      // Przycisk resend może nadal być widoczny lub nie, w zależności od logiki UI
      // Jeśli błąd był po stronie serwera, UI może nie wiedzieć, by go ukryć.
      // Dla spójności z poprzednim testem, załóżmy, że powinien zniknąć, jeśli API zwróciło 200.
      // Jednak to może być punkt do dyskusji - czy UI powinno ukrywać przycisk tylko przy "prawdziwym" sukcesie?
      // Na razie zostawiam asercję zgodną z poprzednim testem.
      await expect(loginPage.resendVerificationButton).not.toBeVisible({ timeout: 5000 });
    });
  });

  test.skip("US-003: should require email to be entered before resend", async ({ page }) => {
    // Test przypadku, gdy użytkownik usunął email przed próbą ponownego wysłania
    await test.step("Setup: First login with unverified email, then clear email field", async () => {
      const unverifiedEmail = "unverified-user@example.com";
      const anyPassword = "password123";

      await loginPage.login(unverifiedEmail, anyPassword);
      await loginPage.expectErrorMessage(/email not verified/i);
      await expect(loginPage.resendVerificationButton).toBeVisible();

      // Czyścimy pole email
      await loginPage.emailInput.clear();
      await loginPage.emailInput.press("Tab"); // Wywołaj zdarzenie blur, aby potencjalnie wywołać walidację frontendu
    });

    await test.step("Attempt resend with empty email field and verify error message", async () => {
      // Mock dla tego przypadku jest już w intercept-setup.ts i zwraca 400
      // await page.route("**/api/auth/resend-verification", ...); // Nie jest już potrzebny tutaj

      await loginPage.clickResendVerificationButton();

      // Asercja: Powinien pojawić się błąd o pustym/niepoprawnym polu email (zgodnie z mockiem 400)
      // Oczekiwany tekst błędu powinien pasować do tego, co mock zwraca dla statusu 400
      // np. "Invalid input." lub komunikat z `details`
      await loginPage.expectErrorMessage(/Invalid input.|Invalid email address/i);
    });
  });
});
