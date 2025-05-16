import { test, expect } from "@playwright/test";
import { LoginPage } from "./poms/LoginPage.pom";
import { setupMockAuth, setupMockImports, setupMockCampaigns, setupMockAIAnalysis } from "./utils/mock-handlers";

test.describe.skip("AI Analysis E2E Test", () => {
  test.beforeEach(async ({ page }) => {
    // Przechwytywanie logów z konsoli przeglądarki
    page.on("console", (msg) => console.log(`BROWSER LOG: ${msg.text()}`));

    // Setup mocks for login, imports list, and AI analysis
    await setupMockAuth(page);
    await setupMockImports(page);
    await setupMockCampaigns(page);
    await setupMockAIAnalysis(page);
  });

  test("should go through full import details and analysis flow", async ({ page }) => {
    // 1. Przejdź od razu na dashboard (sesja jest już mockowana)
    console.log("[ai-analysis.spec.ts] Navigating to /dashboard...");
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/.*dashboard/);
    console.log("[ai-analysis.spec.ts] Current URL after dashboard navigation:", page.url());

    // PAUZA PRZED KLIKNIĘCIEM LINKU DO IMPORTÓW
    console.log("[ai-analysis.spec.ts] Pausing before clicking imports link...");
    await page.pause();

    // 2. Navigate to imports page
    console.log("[ai-analysis.spec.ts] Navigating to imports page...");
    await page.getByRole("link", { name: /imports/i }).click();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/.*imports/);
    console.log("[ai-analysis.spec.ts] Current URL after imports navigation:", page.url());

    // 3. Verify imports list is displayed
    console.log("[ai-analysis.spec.ts] Verifying imports list...");
    await expect(page.getByText("Historia importów")).toBeVisible();

    // 4. Click on details for first import
    console.log("[ai-analysis.spec.ts] Clicking import details...");
    await page
      .getByRole("link", { name: /szczegóły/i })
      .first()
      .click();
    await page.waitForLoadState("networkidle");

    // 5. Verify we're on the import details page
    console.log("[ai-analysis.spec.ts] Verifying import details page...");
    await expect(page).toHaveURL(/.*imports\/[a-zA-Z0-9-]+/);
    await expect(page.getByTestId("import-details-heading")).toBeVisible();

    // 6. Verify campaign section is displayed
    console.log("[ai-analysis.spec.ts] Verifying campaign section...");
    await expect(page.getByText("Kampanie")).toBeVisible();

    // 7. Click on Analyze button for a campaign
    console.log("[ai-analysis.spec.ts] Clicking analyze button...");
    const analyzeButton = page.getByRole("button", { name: /analyze campaign performance/i });
    await expect(analyzeButton).toBeVisible();
    await analyzeButton.click();
    await page.waitForLoadState("networkidle");

    // 8. Verify loading state appears
    console.log("[ai-analysis.spec.ts] Verifying loading state...");
    await expect(page.getByText(/analyzing campaign data/i)).toBeVisible();

    // 9. Wait for analysis results
    console.log("[ai-analysis.spec.ts] Waiting for analysis results...");
    await expect(page.getByText(/ai analysis for/i)).toBeVisible({ timeout: 10000 });

    // 10. Verify analysis content is displayed
    console.log("[ai-analysis.spec.ts] Verifying analysis content...");
    await expect(page.locator(".whitespace-pre-line")).toContainText(/performance|campaign|metrics|recommendations/i);
  });
});
