import { test, expect } from '@playwright/test';
import path from 'path';

// Page Objects
class LoginPage {
  constructor(private page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);
    await this.page.click('[data-testid="login-button"]');
  }
}

class ImportsPage {
  constructor(private page) {}

  async goto() {
    await this.page.goto('/imports');
  }

  async navigateToImportUpload() {
    await this.page.click('text=Nowy import');
  }

  async deleteImport(importName: string) {
    const row = this.page.locator(`tr:has-text("${importName}")`);
    await row.locator('text=Usuń').click();
    await this.page.click('button:has-text("OK")');
  }

  async goToImportDetails(importName: string) {
    const row = this.page.locator(`tr:has-text("${importName}")`);
    await row.locator('text=Szczegóły').click();
  }
}

class ImportUploadPage {
  constructor(private page) {}
  
  async uploadFile(filePath: string) {
    // Konwertuj ścieżkę względną na bezwzględną
    const absolutePath = path.resolve(__dirname, filePath);
    
    await this.page.setInputFiles('#file-input', absolutePath);
    await this.page.click('button:has-text("Importuj")');
  }
}

class ImportDetailsPage {
  constructor(private page) {}

  async runAIAnalysis() {
    await this.page.click('button:has-text("Analyze Campaign Performance")');
    // Czekaj na wynik analizy
    await this.page.waitForSelector('text=AI Analysis');
  }

  async getMetricsTable() {
    return this.page.locator('h3:has-text("Przykładowe metryki")').locator('xpath=following-sibling::div//table');
  }
}

// Test całego przepływu importu
test.describe('Import Flow', () => {
  let loginPage: LoginPage;
  let importsPage: ImportsPage;
  let importUploadPage: ImportUploadPage;
  let importDetailsPage: ImportDetailsPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    importsPage = new ImportsPage(page);
    importUploadPage = new ImportUploadPage(page);
    importDetailsPage = new ImportDetailsPage(page);
  });

  test('Complete import flow: login → upload → list → details → AI analysis', async ({ page }) => {
    // 1. Logowanie
    await loginPage.goto();
    await loginPage.login('test@example.com', 'password123');
    
    // Upewnij się, że jesteśmy zalogowani
    await expect(page).toHaveURL(/dashboard/);
    
    // 2. Przejście do strony importów
    await importsPage.goto();
    
    // 3. Przejście do strony upload
    await importsPage.navigateToImportUpload();
    await expect(page).toHaveURL(/imports-upload/);
    
    // 4. Import pliku
    await importUploadPage.uploadFile('./fixtures/test-campaign-data.csv');
    
    // 5. Przekierowanie do szczegółów importu
    await expect(page).toHaveURL(/imports\/[a-zA-Z0-9-]+/);
    
    // 6. Sprawdzenie czy szczegóły są wyświetlane
    await expect(page.locator('h1')).toContainText('Szczegóły importu');
    
    // 7. Uruchomienie analizy AI (jeśli dostępna)
    const analyzeButton = page.locator('button:has-text("Analyze Campaign Performance")');
    if (await analyzeButton.count() > 0) {
      await importDetailsPage.runAIAnalysis();
      await expect(page.locator('text=AI Analysis')).toBeVisible();
    }
    
    // 8. Powrót do listy importów
    await page.click('a:has-text("Powrót do listy")');
    await expect(page).toHaveURL('/imports');
  });
}); 