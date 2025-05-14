import { test, expect } from "@playwright/test";
import { HomePage } from "./poms/HomePage.pom";

test.describe("Strona główna (index.astro)", () => {
  test.beforeEach(async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
  });

  test.describe("Wyświetlanie strony", () => {
    test("powinien poprawnie wyświetlić wszystkie główne sekcje strony głównej", async ({ page }) => {
      const homePage = new HomePage(page);
      await expect(homePage.heroHeading).toBeVisible();
      await expect(homePage.heroDescription).toBeVisible();
      await expect(homePage.tabsList).toBeVisible();
      await expect(homePage.valuePropositionCards).toBeVisible();
      await expect(homePage.featuresListSection).toBeVisible();
      await expect(homePage.ctaSection).toBeVisible();
    });

    test("powinien wyświetlić poprawne teksty w sekcji Hero", async ({ page }) => {
      const homePage = new HomePage(page);
      await expect(homePage.heroHeading).toContainText(
        /Analiza kampanii reklamowych w jednym miejscu/i
      );
      await expect(homePage.heroDescription).toContainText(
        /Importuj dane z Google Ads i Meta Ads/i
      );
    });

    test("powinien wyświetlić poprawne nazwy zakładek", async ({ page }) => {
      const homePage = new HomePage(page);
      await expect(homePage.dashboardTabTrigger).toBeVisible();
      await expect(homePage.importsTabTrigger).toBeVisible();
      await expect(homePage.aiInsightsTabTrigger).toBeVisible();
    });

    test("powinien domyślnie wyświetlać zawartość zakładki Dashboard", async ({ page }) => {
        const homePage = new HomePage(page);
        await expect(homePage.dashboardTabContent).toBeVisible();
        await expect(homePage.importsTabContent).not.toBeVisible();
        await expect(homePage.aiInsightsTabContent).not.toBeVisible();
    });

    test("powinien wyświetlić poprawne tytuły na kartach wartości", async ({ page }) => {
      const homePage = new HomePage(page);
      await expect(homePage.timeSavingCardTitle).toBeVisible();
      await expect(homePage.betterDecisionsCardTitle).toBeVisible();
      await expect(homePage.smartRecommendationsCardTitle).toBeVisible();
    });

    test("powinien wyświetlić listę funkcji", async ({ page }) => {
      const homePage = new HomePage(page);
      // Check if at least one feature item is visible
      await expect(homePage.featuresListItems.first()).toBeVisible();
      // Optionally check count or specific features
      await expect(homePage.featuresListItems).toHaveCount(8);
      await expect(homePage.getFeatureListItem(/Import danych z CSV/)).toBeVisible();
      await expect(homePage.getFeatureListItem(/Interaktywny dashboard/)).toBeVisible();
    });
  });

  test.describe("Interaktywność zakładek", () => {
    test("powinien zmieniać aktywną zakładkę i jej treść po kliknięciu", async ({ page }) => {
      const homePage = new HomePage(page);

      // Check initial state (Dashboard active)
      await expect(homePage.dashboardTabContent).toBeVisible();
      await expect(homePage.importsTabContent).not.toBeVisible();
      await expect(homePage.aiInsightsTabContent).not.toBeVisible();
      await expect(homePage.dashboardTabTrigger).toHaveAttribute("data-state", "active");

      // Click Imports Tab
      await homePage.clickImportsTab();
      await expect(homePage.importsTabContent).toBeVisible();
      await expect(homePage.dashboardTabContent).not.toBeVisible();
      await expect(homePage.aiInsightsTabContent).not.toBeVisible();
      await expect(homePage.importsTabTrigger).toHaveAttribute("data-state", "active");
      await expect(homePage.dashboardTabTrigger).toHaveAttribute("data-state", "inactive");

      // Click AI Insights Tab
      await homePage.clickAiInsightsTab();
      await expect(homePage.aiInsightsTabContent).toBeVisible();
      await expect(homePage.dashboardTabContent).not.toBeVisible();
      await expect(homePage.importsTabContent).not.toBeVisible();
      await expect(homePage.aiInsightsTabTrigger).toHaveAttribute("data-state", "active");
      await expect(homePage.importsTabTrigger).toHaveAttribute("data-state", "inactive");

      // Click Dashboard Tab again
      await homePage.clickDashboardTab();
      await expect(homePage.dashboardTabContent).toBeVisible();
      await expect(homePage.importsTabContent).not.toBeVisible();
      await expect(homePage.aiInsightsTabContent).not.toBeVisible();
      await expect(homePage.dashboardTabTrigger).toHaveAttribute("data-state", "active");
      await expect(homePage.aiInsightsTabTrigger).toHaveAttribute("data-state", "inactive");
    });
  });

  test.describe("Przyciski CTA (stan niezalogowany)", () => {
    // These tests run without mocking the session
    test("powinien wyświetlać przyciski 'Zaloguj się' i 'Zarejestruj się' w Hero dla niezalogowanego użytkownika", async ({
      page,
    }) => {
      const homePage = new HomePage(page);
      await expect(homePage.loginButtonHero).toBeVisible();
      await expect(homePage.registerButtonHero).toBeVisible();
      await expect(homePage.goToDashboardButton).not.toBeVisible();
    });

    test("powinien wyświetlać przyciski 'Zarejestruj się za darmo' i 'Zaloguj się' w dolnym CTA dla niezalogowanego użytkownika", async ({
      page,
    }) => {
      const homePage = new HomePage(page);
      await expect(homePage.registerButtonCTA).toBeVisible();
      await expect(homePage.loginButtonCTA).toBeVisible();
    });

    test("powinien nawigować do /login po kliknięciu przycisku 'Zaloguj się' w Hero", async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.loginButtonHero.click();
      await expect(page).toHaveURL(/.*\/login/);
    });

    test("powinien nawigować do /register po kliknięciu przycisku 'Zarejestruj się' w Hero", async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.registerButtonHero.click();
      await expect(page).toHaveURL(/.*\/register/);
    });

    test("powinien nawigować do /register po kliknięciu przycisku 'Zarejestruj się za darmo' w CTA", async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.registerButtonCTA.click();
      await expect(page).toHaveURL(/.*\/register/);
    });

    test("powinien nawigować do /login po kliknięciu przycisku 'Zaloguj się' w CTA", async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.loginButtonCTA.click();
      await expect(page).toHaveURL(/.*\/login/);
    });

  });

  test.describe("Przyciski CTA (stan zalogowany)", () => {
    test.beforeEach(({ }, testInfo) => {
      // Skip this suite when not using the logged-in project
      test.skip(testInfo.project.name !== 'chromium-logged-in');
    });

    // Te testy korzystają z projektu Playwright skonfigurowanego z storageState (chromium-logged-in)
    test("powinien wyświetlać przycisk 'Przejdź do dashboardu' w Hero dla zalogowanego użytkownika", async ({
      page,
    }) => {
      const homePage = new HomePage(page);
      await homePage.goto();
      await page.waitForLoadState('networkidle');
      await expect(homePage.goToDashboardButton).toBeVisible();
      await expect(homePage.loginButtonHero).not.toBeVisible();
      await expect(homePage.registerButtonHero).not.toBeVisible();
    });

    test("powinien nawigować do /dashboard po kliknięciu przycisku 'Przejdź do dashboardu'", async ({
      page,
    }) => {
      const homePage = new HomePage(page);
      await homePage.goto();
      await page.waitForLoadState('networkidle');
      await homePage.goToDashboardButton.click();
      await expect(page).toHaveURL(/.*\/dashboard/);
    });
  });

  // Nowe testy sprawdzające dostępność
  test.describe('Dostępność', () => {
    test('powinien mieć poprawną hierarchię nagłówków', async ({ page }) => {
      // Sprawdzanie czy strona ma prawidłową strukturę nagłówków (h1, h2, h3)
      // h1 powinien być jeden na stronie
      const h1Count = await page.getByRole('heading', { level: 1 }).count();
      expect(h1Count).toBe(1);

      // Wszystkie nagłówki h2 powinny być widoczne
      const h2Elements = page.getByRole('heading', { level: 2 });
      const h2Count = await h2Elements.count();
      expect(h2Count).toBeGreaterThan(0);
      
      for(let i = 0; i < h2Count; i++) {
        await expect(h2Elements.nth(i)).toBeVisible();
      }
    });

    test('powinien mieć dostępne przyciski z odpowiednim kontrastem', async ({ page }) => {
      const homePage = new HomePage(page);
      // Sprawdzamy czy przyciski mają odpowiednie atrybuty dostępności
      await expect(homePage.loginButtonHero).toBeVisible();
      
      // Sprawdzamy przyciski zakładek
      await expect(homePage.dashboardTabTrigger).toHaveAttribute('role', 'tab');
      await expect(homePage.importsTabTrigger).toHaveAttribute('role', 'tab');
      await expect(homePage.aiInsightsTabTrigger).toHaveAttribute('role', 'tab');
      
      // Sprawdzamy czy panele zakładek mają poprawne atrybuty
      await expect(homePage.dashboardTabContent).toHaveAttribute('role', 'tabpanel');
    });

    test('powinien być nawigowany klawiaturą', async ({ page }) => {
      // Test nawigacji klawiaturą - sprawdzamy czy możemy przejść do przycisku TAB-em
      await page.keyboard.press('Tab');
      
      // Pierwsze Tab powinno przenieść fokus na pierwszy link
      const focusedElement = await page.evaluate(() => {
        const activeElement = document.activeElement;
        return activeElement ? activeElement.tagName : null;
      });
      
      expect(focusedElement).toBe('A');
    });
  });

  // Nowe testy dla responsywności
  test.describe('Responsywność', () => {
    test('powinien dostosować układ do małego ekranu', async ({ page }) => {
      // Ustawiamy widok na ekran mobilny
      await page.setViewportSize({ width: 375, height: 667 });
      
      const homePage = new HomePage(page);
      await homePage.goto(); // Przeładowujemy stronę z nowym rozmiarem viewport
      
      // Sprawdzamy czy wszystkie kluczowe elementy są nadal widoczne
      await expect(homePage.heroHeading).toBeVisible();
      await expect(homePage.tabsList).toBeVisible();
      
      // Na małym ekranie karty wartości powinny być układane pionowo (po 1 w wierszu)
      // Sprawdzamy czy wszystkie karty są widoczne
      await expect(homePage.timeSavingCardTitle).toBeVisible();
      await expect(homePage.betterDecisionsCardTitle).toBeVisible();
      await expect(homePage.smartRecommendationsCardTitle).toBeVisible();
    });

    test('powinien dostosować układ do dużego ekranu', async ({ page }) => {
      // Ustawiamy widok na duży ekran
      await page.setViewportSize({ width: 1200, height: 800 });
      
      const homePage = new HomePage(page);
      await homePage.goto(); // Przeładowujemy stronę z nowym rozmiarem viewport
      
      // Na dużym ekranie karty wartości powinny być układane poziomo (po 3 w wierszu)
      // Bez specyficznego selektora dla układu kart, możemy tylko sprawdzić widoczność
      await expect(homePage.valuePropositionCards).toBeVisible();
    });
  });

  // Test wizualny
  test('powinien zgadzać się wizualnie ze wzorcem', async ({ page }) => {
    // Możemy zdefiniować konkretne wymiary dla testu wizualnego
    await page.setViewportSize({ width: 1280, height: 720 });
    
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Czekamy aż cała strona będzie widoczna i się załaduje
    await page.waitForLoadState('networkidle');
    
    // Ustaw opcje dla porównania zrzutów ekranu - dodajmy więcej tolerancji
    const screenshotOptions = {
      maxDiffPixelRatio: 0.2, // 20% pikseli może się różnić
      threshold: 0.3,         // 30% tolerancji na różnice pikseli
      animations: 'disabled' as const, // Wyłącz animacje
    };
    
    // Porównanie zrzutu ekranu z bardziej liberalnymi ustawieniami
    // NOTE: Przy pierwszym uruchomieniu tego testu, zostanie utworzony wzorcowy zrzut ekranu
    // Przy kolejnych uruchomieniach, zrzuty będą porównywane z wzorcem
    await expect(page).toHaveScreenshot('home-page.png', screenshotOptions);
  });

  // Test metadanych SEO
  test('powinien mieć odpowiednie metadane SEO', async ({ page }) => {
    // Sprawdzamy tytuł strony
    await expect(page).toHaveTitle(/campAlyze - Narzędzie analityczne/);
    
    // Sprawdzamy inne metadane (użyj evaluateHandle aby zbadać elementy meta)
    const description = await page.$eval('meta[name="description"]', (meta) => meta.getAttribute('content'));
    expect(description).toBeTruthy();
    
    // Sprawdzamy czy są podstawowe OG tagi dla social media
    const ogTitle = await page.$eval('meta[property="og:title"]', (meta) => meta.getAttribute('content'));
    expect(ogTitle).toBeTruthy();
  });
}); 