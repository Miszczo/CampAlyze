/**
 * Pomocnik do konfiguracji przechwytywania żądań podczas testów E2E z MSW
 */
import type { Page } from "@playwright/test";

/**
 * Konfiguruje przechwytywanie żądań API dla danej strony.
 * Ta funkcja powinna być wywołana dla każdej strony testowej przed uruchomieniem testów.
 */
export async function setupApiInterception(page: Page) {
  // Śledzenie dodatkowych informacji dla debugowania
  console.log(`[Intercept-Setup] Setting up API interception for page ${page.url()}`);

  // Przechwytujemy wszystkie żądania do API i przekierowujemy je przez localhost
  // gdzie MSW nasłuchuje na żądania
  await page.route("**/(api|auth)/**", async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    console.log(`[Intercept] Caught API request: ${method} ${url}`);

    // Sprawdź czy URL zawiera /api/auth/ - to są endpointy, które nas interesują
    if (url.includes("/api/auth/")) {
      console.log(`[Intercept] Handling auth request: ${method} ${url}`);

      try {
        // Pobierz oryginalne nagłówki i ciało
        const headers = route.request().headers();
        let body = null;
        try {
          body = await route.request().postData();
        } catch (e) {
          // Ignoruj błędy - niektóre żądania mogą nie mieć ciała
        }

        // Dynamiczne pobieranie portu z PLAYWRIGHT_BASE_URL
        const baseUrl = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3003";
        let mockServerPort = "3003";
        try {
          const parsed = new URL(baseUrl);
          mockServerPort = parsed.port || "3003";
        } catch {}
        const mockServerUrl = `http://localhost:${mockServerPort}${new URL(url).pathname}`;

        console.log(`[Intercept] Redirecting to MSW server: ${mockServerUrl}`);

        // Przygotuj nowe żądanie z przekierowanym URL
        const newRequest = {
          url: mockServerUrl,
          method: method,
          headers: {
            ...headers,
            "x-msw-bypass": "false", // Upewnij się, że MSW złapie to żądanie
          },
          body: body,
        };

        // Kontynuuj z nowym żądaniem
        await route.continue(newRequest);
      } catch (error) {
        console.error(`[Intercept] Error during request interception:`, error);
        await route.continue(); // Fallback do oryginalnego żądania
      }
    } else {
      // Inne żądania przepuszczamy bez zmian
      await route.continue();
    }
  });

  // Dodajemy nasłuchiwanie na zdarzenia odpowiedzi dla lepszego debugowania
  page.on("response", async (response) => {
    const url = response.url();
    if (url.includes("/api/auth/")) {
      const status = response.status();
      const statusText = response.statusText();
      console.log(`[Intercept] Response for ${url}: ${status} ${statusText}`);

      // Zapisz nagłówki odpowiedzi
      const headers = response.headers();
      console.log(`[Intercept] Response headers:`, headers);

      // Próba logowania ciała odpowiedzi
      if (headers["content-type"]?.includes("application/json")) {
        try {
          const body = await response.json();
          console.log(`[Intercept] Response body:`, JSON.stringify(body, null, 2));
        } catch (e) {
          console.error(`[Intercept] Error parsing JSON response:`, e);
        }
      }
    }
  });

  // Dodatkowy nasłuch na błędy żądań sieciowych
  page.on("requestfailed", (request) => {
    if (request.url().includes("/api/auth/")) {
      console.error(`[Intercept] Request failed for ${request.url()}:`, request.failure());
    }
  });

  console.log(`[Intercept-Setup] API interception setup completed`);
}
