import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

// Wczytaj zmienne środowiskowe z pliku .env.test
dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

// Sprawdź, czy zmienne środowiskowe zostały poprawnie załadowane
// console.log("CONFIG: Loaded Playwright environment variables:");
// console.log(`- PLAYWRIGHT_BASE_URL: ${process.env.PLAYWRIGHT_BASE_URL || "not set"}`);
// console.log(`- TEST_USER_EMAIL: ${process.env.TEST_USER_EMAIL ? "set (hidden)" : "not set"}`);
// console.log(`- TEST_MODE: ${process.env.TEST_MODE || "mock (default)"}`);

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  globalSetup: "./tests/e2e/utils/supabaseAuth.ts",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    trace: "retain-on-failure",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium-logged-out",
      use: {
        browserName: "chromium",
      },
    },
    {
      name: "chromium-logged-in",
      use: {
        browserName: "chromium",
        storageState: "playwright/.auth/state.json",
      },
    },
  ],
  webServer: {
    command: "npm run dev:e2e",
    url: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      NODE_ENV: "test",
    },
  },
});
