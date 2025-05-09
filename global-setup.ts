import { chromium } from "@playwright/test";
import { setupServer } from "msw/node";
import { handlers } from "./tests/e2e/mocks/handlers";

// Create MSW server and expose it for reuse
export const server = setupServer(...handlers);

async function globalSetup() {
  console.log("[Global Setup] Starting Mock Service Worker server");

  // Start the server with better handling of unhandled requests
  server.listen({
    onUnhandledRequest: "bypass",
  });

  // Log unhandled requests for debugging purposes
  server.events.on("request:unhandled", ({ request }) => {
    console.warn(`[MSW] Unhandled ${request.method} request to ${request.url}`);
  });

  // Optional: Set up browser for testing
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Visit the site to make sure it's ready - dynamic port detection
  let baseUrl = "http://localhost:3003/";

  try {
    console.log("[Global Setup] Testing connection to app at:", baseUrl);
    await page.goto(baseUrl);
    console.log("[Global Setup] Successfully connected to app");
  } catch (error) {
    // Try alternative port
    console.log("[Global Setup] Failed to connect on port 3003, trying 3002...");
    baseUrl = "http://localhost:3002/";
    try {
      await page.goto(baseUrl);
      console.log("[Global Setup] Successfully connected to app on port 3002");
      // Update environment variable if available
      if (process.env.PLAYWRIGHT_BASE_URL) {
        process.env.PLAYWRIGHT_BASE_URL = baseUrl;
        console.log("[Global Setup] Updated PLAYWRIGHT_BASE_URL to:", baseUrl);
      }
    } catch (secondError) {
      console.error("[Global Setup] Failed to connect to app on both ports:");
      console.error(secondError);
    }
  }

  // Close browser
  await browser.close();

  console.log("[Global Setup] MSW server started and app connection tested");
}

export default globalSetup;
