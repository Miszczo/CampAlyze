/**
 * Pomocnik do konfiguracji przechwytywania żądań podczas testów E2E
 */
import type { Page } from "@playwright/test";

/**
 * Konfiguruje przechwytywanie żądań API dla danej strony.
 * Ta funkcja powinna być wywołana dla każdej strony testowej przed uruchomieniem testów.
 */
export async function setupApiInterception(page: Page) {
  console.log(`[Intercept-Setup] Setting up API interception`);

  // 1. Dodajemy interceptor dla żądań API - musi być najpierw
  // Uwaga: w url trzeba użyć ** zamiast * aby złapać wszystkie ścieżki
  await page.route("**/api/auth/signin", async (route) => {
    const url = route.request().url();
    console.log(`[Intercept] Intercepted signin request: ${url}`);

    try {
      const postData = route.request().postDataJSON() as { email: string; password: string };
      const { email, password } = postData;
      console.log(`[Intercept] Login request with email: ${email}`);

      // Pomyślne logowanie
      if (
        email === (process.env.TEST_USER_EMAIL || "verified-user@example.com") &&
        password === (process.env.TEST_USER_PASSWORD || "Password123!")
      ) {
        console.log(`[Intercept] Mocking successful login for ${email}`);
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
        return;
      }

      // Niezweryfikowany użytkownik
      if (email === "unverified-user@example.com") {
        console.log(`[Intercept] Mocking unverified user for ${email}`);
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({
            success: false,
            requiresVerification: true,
            error: "Email not verified",
          }),
        });
        return;
      }

      // Domyślna odpowiedź - błędne dane logowania
      console.log(`[Intercept] Mocking invalid credentials for ${email}`);
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: "Invalid login credentials",
        }),
      });
    } catch (error) {
      console.error(`[Intercept] Error handling signin:`, error);
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: "An unexpected error occurred during authentication",
        }),
      });
    }
  });

  // Interceptor dla żądań resend-verification
  await page.route("**/api/auth/resend-verification", async (route) => {
    const url = route.request().url();
    console.log(`[Intercept] Intercepted resend-verification request: ${url}`);

    try {
      const postData = route.request().postDataJSON() as { email: string };
      const { email } = postData;

      if (!email) {
        // Ten przypadek jest zgodny z walidacją Zod w API (błąd 400)
        console.log(`[Intercept] Mocking missing email for resend verification: ${email}`);
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({
            success: false, // Zgodnie z tym co API może zwrócić przy błędzie walidacji
            error: "Invalid input.", // Lub bardziej szczegółowe z ZodError
            details: { email: ["Invalid email address"] } // Przykładowy detal
          }),
        });
        return;
      }

      // Symulacja błędu dla konkretnego adresu email (np. wewnętrzny błąd serwera)
      // API odpowie statusem 200 i generycznym komunikatem, aby nie ujawniać informacji.
      if (email === "error-prone@example.com") {
        console.log(`[Intercept] Mocking server-side issue for resend verification (but returning 200): ${email}`);
        await route.fulfill({
          status: 200, // Zgodnie z API, które maskuje błędy
          contentType: "application/json",
          body: JSON.stringify({
            // success: false, // API niekoniecznie musi zwracać 'success: false' w tym przypadku
            message: "If an account with this email exists and requires verification, a new verification link has been sent.",
          }),
        });
        return;
      }

      // Pomyślne ponowne wysłanie (standardowy przypadek)
      // API również odpowie statusem 200 i generycznym komunikatem.
      console.log(`[Intercept] Mocking successful resend verification (returning 200): ${email}`);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          // success: true, // API niekoniecznie musi zwracać 'success: true'
          message: "If an account with this email exists and requires verification, a new verification link has been sent.",
        }),
      });
    } catch (error) {
      console.error(`[Intercept] Error handling resend-verification:`, error);
      // W przypadku nieoczekiwanego błędu w mocku, zwróć 500
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: "An unexpected error occurred while intercepting resend verification",
        }),
      });
    }
  });

  // 2. Debug listener dla wszystkich odpowiedzi
  page.on("response", async (response) => {
    const url = response.url();
    if (url.includes("/api/auth/")) {
      const status = response.status();
      const statusText = response.statusText();
      console.log(`[Intercept] Response for ${url}: ${status} ${statusText}`);

      try {
        if (response.headers()["content-type"]?.includes("application/json")) {
          // Response w Playwright nie ma metody clone, więc bezpośrednio parsujemy JSON
          const jsonBody = await response.json();
          console.log(`[Intercept] Response body: ${JSON.stringify(jsonBody)}`);
        }
      } catch (error) {
        console.log(`[Intercept] Could not parse response JSON:`, error);
      }
    }
  });

  console.log(`[Intercept-Setup] API interception setup completed`);
}
