import dotenv from "dotenv";
import path from "path";
import { defineConfig, devices } from "@playwright/test";

// Wczytaj zmienne środowiskowe z pliku .env.test
dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

// Sprawdź, czy zmienne środowiskowe zostały poprawnie załadowane
console.log("CONFIG: Loaded Playwright environment variables:");
console.log(`- PLAYWRIGHT_BASE_URL: ${process.env.PLAYWRIGHT_BASE_URL || "not set"}`);
console.log(`- TEST_USER_EMAIL: ${process.env.TEST_USER_EMAIL ? "set (hidden)" : "not set"}`);

export default defineConfig({
  testDir: "./tests/e2e", // Katalog z testami E2E
  /* Uruchamiaj testy w plikach równolegle */
  fullyParallel: false, // Wyłączamy równoległość, aby łatwiej debugować
  /* Niepowodzenie builda w CI, jeśli przypadkowo zostawisz test.only w kodzie */
  forbidOnly: !!process.env.CI,
  /* Ponów próbę tylko w CI */
  retries: process.env.CI ? 2 : 1, // Dodajemy jedną ponowną próbę nawet w trybie dev
  /* Liczba workerów do równoległego uruchamiania testów */
  workers: 1, // Jeden worker dla lepszego debugowania
  /* Reporter do użycia. Zobacz https://playwright.dev/docs/test-reporters */
  reporter: [
    ["html", { open: "never" }],
    ["list"], // Dodajemy reporter list dla większej widoczności w konsoli
  ],
  /* Współdzielona konfiguracja dla wszystkich projektów poniżej. Zobacz https://playwright.dev/docs/api/class-testoptions */
  use: {
    /* Podstawowy URL do użycia podczas akcji takich jak `await page.goto('/')` */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3003", // Port używany przez Astro

    /* Zbieraj ślad (trace) przy nieudanych próbach. Zobacz https://playwright.dev/docs/trace-viewer */
    trace: "retain-on-failure", // Zatrzymaj ślad dla nieudanych testów

    // Ustawienia dla lepszego debugowania
    video: "retain-on-failure", // Nagrywaj wideo tylko dla nieudanych testów
    screenshot: "only-on-failure", // Rób zrzut ekranu tylko dla nieudanych testów

    // Dodatkowe opcje do debugowania
    launchOptions: {
      slowMo: process.env.CI ? 0 : 100, // Zwolnij wykonanie testów w trybie deweloperskim
    },
  },

  /* Konfiguracja dla konkretnych projektów (przeglądarek) */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    // Opcjonalnie: Skonfiguruj inne przeglądarki zgodnie z planem testów
    // {
    //   name: "firefox",
    //   use: { ...devices["Desktop Firefox"] },
    // },

    // {
    //   name: "webkit",
    //   use: { ...devices["Desktop Safari"] },
    // },

    /* Testy na mobilnych viewportach */
    // {
    //   name: "Mobile Chrome",
    //   use: { ...devices["Pixel 5"] },
    // },
    // {
    //   name: "Mobile Safari",
    //   use: { ...devices["iPhone 12"] },
    // },

    /* Testy z konkretnymi ustawieniami regionalnymi lub oznaczonymi kanałami */
    // {
    //   name: "Microsoft Edge",
    //   use: { ...devices["Desktop Edge"], channel: "msedge" },
    // },
    // {
    //   name: "Google Chrome",
    //   use: { ...devices["Desktop Chrome"], channel: "chrome" },
    // },
  ],

  /* Opcjonalnie: Uruchom serwer deweloperski przed rozpoczęciem testów */
  webServer: {
    command: "npm run dev",
    url: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3003",
    reuseExistingServer: true,
    stdout: "pipe",
    stderr: "pipe",
    timeout: 60000, // Dajemy serwerowi minutę na uruchomienie
  },

  // Zwiększ globalny timeout dla testów
  timeout: 60000, // 60 sekund
});
