import { test as base } from "@playwright/test";
import { setupServer } from "msw/node";
import { handlers } from "./mocks/handlers";

// Log the current test mode
const testMode = process.env.TEST_MODE || "integration";
console.log(`Running tests in ${testMode} mode`);

// Only use MSW in mock mode
const useMocks = testMode === "mock";

// Setup MSW server only if we're in mock mode
const server = useMocks ? setupServer(...handlers) : null;

// Override the test object to start/stop MSW for each test if we're in mock mode
export const test = useMocks
  ? base.extend({
      // Start MSW worker before each test
      page: async ({ page }, use) => {
        if (server) {
          // Start MSW server before test
          server.listen({ onUnhandledRequest: "warn" });
          console.log(`MSW server started for test`);
        }

        // Extra logging for debugging
        page.on("request", (request) => {
          console.log(`Request: ${request.method()} ${request.url()}`);
        });

        page.on("response", (response) => {
          console.log(`Response: ${response.status()} ${response.url()}`);
        });

        // Use the page in the test
        await use(page);

        // Clean up after test
        if (server) {
          server.resetHandlers();
          server.close();
          console.log(`MSW server stopped after test`);
        }
      },
    })
  : base; // Use regular base test if not in mock mode

// Export the expect function from Playwright as well
export { expect } from "@playwright/test";
