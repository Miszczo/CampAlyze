import { test, expect } from "@playwright/test";
import path from "path";
import { LoginPage } from "./poms/LoginPage.pom";
import { setupMockAuth, setupMockImports, setupMockCampaigns, setupMockAIAnalysis } from "./utils/mock-handlers";

// Page Objects
class ImportsPage {
  constructor(private page) {}

  async goto() {
    await this.page.goto("/imports");
  }

  async navigateToImportUpload() {
    await this.page.click("text=Nowy import");
  }

  async deleteImport(importName: string) {
    const row = this.page.locator(`tr:has-text("${importName}")`);
    await row.locator("text=Usuń").click();
    await this.page.click('button:has-text("OK")');
  }

  async goToImportDetails(importName: string) {
    const row = this.page.locator(`tr:has-text("${importName}")`);
    await row.locator("text=Szczegóły").click();
  }
}

class ImportUploadPage {
  constructor(private page) {}

  async uploadFile(filePath: string) {
    // Konwertuj ścieżkę względną na bezwzględną
    const absolutePath = path.resolve(__dirname, filePath);

    await this.page.setInputFiles("#file-input", absolutePath);
    await this.page.click('button:has-text("Importuj")');
  }
}

class ImportDetailsPage {
  constructor(private page) {}

  async runAIAnalysis() {
    await this.page.click('button:has-text("Analyze Campaign Performance")');
    // Czekaj na wynik analizy
    await this.page.waitForSelector("text=AI Analysis");
  }

  async getMetricsTable() {
    return this.page.locator('h3:has-text("Przykładowe metryki")').locator("xpath=following-sibling::div//table");
  }
}

// test.describe.configure({ mode: 'serial' }); // Keep serial mode if tests depend on each other

test.describe.skip("Complete import flow", () => {
  let newPage; // Define newPage

  test.beforeEach(async ({ page }) => {
    // Setup mocks for login, imports list, and AI analysis
    await setupMockAuth(page);
    await setupMockImports(page);
    await setupMockCampaigns(page);
    await setupMockAIAnalysis(page);
  });

  test("login → upload → list → details → AI analysis", async ({ page }) => {
    // Inicjalizacja page objects
    const importsPage = new ImportsPage(page);
    const importUploadPage = new ImportUploadPage(page);
    const importDetailsPage = new ImportDetailsPage(page);

    // 1. Przejdź od razu na dashboard (sesja jest już mockowana)
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle"); // Czekaj na załadowanie strony
    await expect(page).toHaveURL(/dashboard/);

    // 2. Przejście do strony importów
    console.log("[imports-flow.spec.ts] Navigating to imports page...");
    await importsPage.goto();
    await page.waitForLoadState("networkidle"); // Czekaj na załadowanie strony

    // 3. Przejście do strony upload
    console.log("[imports-flow.spec.ts] Navigating to import upload page...");
    await importsPage.navigateToImportUpload();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/imports-upload/);

    // 4. Import pliku
    console.log("[imports-flow.spec.ts] Uploading file...");
    await importUploadPage.uploadFile("../fixtures/test-campaign-data.csv");
    await page.waitForLoadState("networkidle");

    // 5. Przekierowanie do szczegółów importu
    console.log("[imports-flow.spec.ts] Verifying redirection to import details...");
    await expect(page).toHaveURL(/imports\/[a-zA-Z0-9-]+/);

    // 6. Sprawdzenie czy szczegóły są wyświetlane
    console.log("[imports-flow.spec.ts] Verifying import details heading...");
    await expect(page.getByTestId("import-details-heading")).toBeVisible();

    // 7. Uruchomienie analizy AI (jeśli dostępna)
    console.log("[imports-flow.spec.ts] Running AI analysis...");
    const analyzeButton = page.locator('button:has-text("Analyze Campaign Performance")');
    if ((await analyzeButton.count()) > 0) {
      await importDetailsPage.runAIAnalysis();
      await page.waitForLoadState("networkidle");
      await expect(page.locator("text=AI Analysis")).toBeVisible();
    }

    // 8. Powrót do listy importów
    console.log("[imports-flow.spec.ts] Navigating back to imports list...");
    await page.click('a:has-text("Powrót do listy")');
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL("/imports");
  });
});
