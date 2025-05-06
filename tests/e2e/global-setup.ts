import { chromium } from "@playwright/test";
import { setupServer } from "msw/node";
import { handlers } from "./mocks/handlers";

// Create MSW server and expose it for reuse
export const server = setupServer(...handlers);

async function globalSetup() {
  console.log("[Global Setup] Starting Mock Service Worker server");

  // Start the server with better visibility of unhandled requests
  server.listen({
    onUnhandledRequest: (req) => {
      console.warn(`[MSW] Unhandled ${req.method} request to ${req.url.href}`);
    },
  });

  // Optional: Set up browser for testing
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Visit the site to make sure it's ready - dynamic port detection
  let baseUrl = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3003/";

  try {
    console.log("[Global Setup] Testing connection to app at:", baseUrl);
    await page.goto(baseUrl);
    console.log("[Global Setup] Successfully connected to app");
  } catch (error) {
    // Try alternative port if using default port
    if (baseUrl.includes("3003")) {
      console.log("[Global Setup] Failed to connect on port 3003, trying 3002...");
      baseUrl = baseUrl.replace("3003", "3002");
      try {
        await page.goto(baseUrl);
        console.log("[Global Setup] Successfully connected to app on port 3002");
        // Update environment variable
        process.env.PLAYWRIGHT_BASE_URL = baseUrl;
        console.log("[Global Setup] Updated PLAYWRIGHT_BASE_URL to:", baseUrl);
      } catch (secondError) {
        console.error("[Global Setup] Failed to connect to app on both ports:");
        console.error(secondError);
      }
    } else {
      console.error("[Global Setup] Failed to connect to app:");
      console.error(error);
    }
  }

  // Close browser
  await browser.close();

  console.log("[Global Setup] MSW server started and app connection tested");
}

export default globalSetup;
