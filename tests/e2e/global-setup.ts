/**
 * Globalny setup dla testów E2E Playwright
 *
 * Ten plik wykonuje się przed uruchomieniem wszystkich testów.
 * Używany jest do konfiguracji środowiska testowego.
 */

// Określamy tryb testów (mock lub integration)
const testMode = process.env.TEST_MODE || "mock";
console.log(`[Global Setup] Running tests in ${testMode} mode`);

/**
 * Funkcja global setup wykonująca się przed wszystkimi testami
 */
async function globalSetup() {
  console.log("[Global Setup] Starting setup process...");

  // Wyświetl informacje diagnostyczne o środowisku
  console.log(`[Global Setup] Test mode: ${testMode}`);
  console.log(`[Global Setup] BASE_URL: ${process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3001"}`);

  // Sprawdź, czy zmienne środowiskowe dla Supabase są dostępne
  if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
    console.log("[Global Setup] Supabase environment variables are available");
  } else {
    console.warn("[Global Setup] Warning: Supabase environment variables not found!");
  }

  // Sprawdź, czy mamy dane testowe
  if (process.env.TEST_USER_EMAIL && process.env.TEST_USER_PASSWORD) {
    console.log("[Global Setup] Test user credentials are available");
  } else {
    console.warn("[Global Setup] Warning: Test user credentials not found in environment variables!");
  }

  console.log("[Global Setup] Setup complete");
}

/**
 * Funkcja global teardown wykonująca się po wszystkich testach
 */
async function globalTeardown() {
  console.log("[Global Setup] Starting teardown process...");
  // Tutaj można dodać operacje czyszczenia po testach
  console.log("[Global Setup] Teardown complete");
}

// Eksportujemy obie funkcje do użycia przez Playwright
export default globalSetup;
export { globalTeardown };
