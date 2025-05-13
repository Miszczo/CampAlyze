# Test info

- Name: Strona główna (index.astro) >> powinien zgadzać się wizualnie ze wzorcem
- Location: D:\www\campAlyze\tests\e2e\home.spec.ts:268:3

# Error details

```
Error: expect(page).toHaveScreenshot(expected)

  722722 pixels (ratio 0.79 of all image pixels) are different.

Expected: D:\www\campAlyze\tests\e2e\home.spec.ts-snapshots\home-page-chromium-win32.png
Received: D:\www\campAlyze\test-results\home-Strona-główna-index-a-1a59c-ać-się-wizualnie-ze-wzorcem-chromium\home-page-actual.png
    Diff: D:\www\campAlyze\test-results\home-Strona-główna-index-a-1a59c-ać-się-wizualnie-ze-wzorcem-chromium\home-page-diff.png

Call log:
  - expect.toHaveScreenshot(home-page.png) with timeout 5000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 722722 pixels (ratio 0.79 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 722722 pixels (ratio 0.79 of all image pixels) are different.

    at D:\www\campAlyze\tests\e2e\home.spec.ts:281:24
```

# Page snapshot

```yaml
- banner: CampAlyze
- main:
  - heading "Analiza kampanii reklamowych w jednym miejscu" [level=1]
  - paragraph: Importuj dane z Google Ads i Meta Ads, analizuj kluczowe metryki i otrzymuj inteligentne rekomendacje AI dla optymalizacji Twoich kampanii reklamowych.
  - link "Zaloguj się":
    - /url: /login
    - button "Zaloguj się"
  - link "Zarejestruj się":
    - /url: /register
    - button "Zarejestruj się"
  - tablist:
    - tab "Dashboard" [selected]
    - tab "Import danych"
    - tab "AI Insights"
  - tabpanel "Dashboard":
    - img
    - paragraph: Interaktywny dashboard z kluczowymi metrykami
    - paragraph: Monitoruj CPC, CTR, konwersje, koszt/konwersję i ROAS
  - text: Oszczędność czasu Krótszy czas analizy kampanii
  - paragraph: Zredukuj czas poświęcany na analizę danych i raportowanie o minimum 40% dzięki zautomatyzowanym narzędziom.
  - text: Lepsze decyzje Oparte na danych ze wszystkich platform
  - paragraph: Podejmuj lepsze decyzje dzięki kompleksowemu widokowi wszystkich kampanii w jednym miejscu i automatycznym alertom.
  - text: Inteligentne rekomendacje Sugestie optymalizacji od AI
  - paragraph: Wykorzystuj moc sztucznej inteligencji do automatycznego wykrywania trendów i otrzymywania rekomendacji optymalizacyjnych.
  - heading "Główne funkcje campAlyze" [level=2]
  - text: Import danych z CSV/XLSX z Google Ads i Meta Ads Interaktywny dashboard z kluczowymi metrykami Porównanie platform reklamowych System alertów dla problematycznych kampanii Dziennik zmian wprowadzonych w kampaniach Automatyczne podsumowania i rekomendacje AI Eksport raportów do CSV/PDF/XLSX Bezpieczne zarządzanie kontami użytkowników
  - heading "Gotowy na optymalizację swoich kampanii?" [level=2]
  - paragraph: Dołącz do grona specjalistów korzystających z campAlyze i zacznij podejmować lepsze decyzje oparte na danych.
  - link "Zarejestruj się za darmo":
    - /url: /register
    - button "Zarejestruj się za darmo"
  - link "Zaloguj się":
    - /url: /login
    - button "Zaloguj się"
```

# Test source

```ts
  181 |         await homePage.goto(); // Ensure page is loaded with mocked session
  182 |
  183 |         await homePage.goToDashboardButton.click();
  184 |         await expect(page).toHaveURL(/.*\/dashboard/);
  185 |     });
  186 |   });
  187 |
  188 |   // Nowe testy sprawdzające dostępność
  189 |   test.describe('Dostępność', () => {
  190 |     test('powinien mieć poprawną hierarchię nagłówków', async ({ page }) => {
  191 |       // Sprawdzanie czy strona ma prawidłową strukturę nagłówków (h1, h2, h3)
  192 |       // h1 powinien być jeden na stronie
  193 |       const h1Count = await page.getByRole('heading', { level: 1 }).count();
  194 |       expect(h1Count).toBe(1);
  195 |
  196 |       // Wszystkie nagłówki h2 powinny być widoczne
  197 |       const h2Elements = page.getByRole('heading', { level: 2 });
  198 |       const h2Count = await h2Elements.count();
  199 |       expect(h2Count).toBeGreaterThan(0);
  200 |       
  201 |       for(let i = 0; i < h2Count; i++) {
  202 |         await expect(h2Elements.nth(i)).toBeVisible();
  203 |       }
  204 |     });
  205 |
  206 |     test('powinien mieć dostępne przyciski z odpowiednim kontrastem', async ({ page }) => {
  207 |       const homePage = new HomePage(page);
  208 |       // Sprawdzamy czy przyciski mają odpowiednie atrybuty dostępności
  209 |       await expect(homePage.loginButtonHero).toBeVisible();
  210 |       
  211 |       // Sprawdzamy przyciski zakładek
  212 |       await expect(homePage.dashboardTabTrigger).toHaveAttribute('role', 'tab');
  213 |       await expect(homePage.importsTabTrigger).toHaveAttribute('role', 'tab');
  214 |       await expect(homePage.aiInsightsTabTrigger).toHaveAttribute('role', 'tab');
  215 |       
  216 |       // Sprawdzamy czy panele zakładek mają poprawne atrybuty
  217 |       await expect(homePage.dashboardTabContent).toHaveAttribute('role', 'tabpanel');
  218 |     });
  219 |
  220 |     test('powinien być nawigowany klawiaturą', async ({ page }) => {
  221 |       // Test nawigacji klawiaturą - sprawdzamy czy możemy przejść do przycisku TAB-em
  222 |       await page.keyboard.press('Tab');
  223 |       
  224 |       // Pierwsze Tab powinno przenieść fokus na pierwszy link
  225 |       const focusedElement = await page.evaluate(() => {
  226 |         const activeElement = document.activeElement;
  227 |         return activeElement ? activeElement.tagName : null;
  228 |       });
  229 |       
  230 |       expect(focusedElement).toBe('A');
  231 |     });
  232 |   });
  233 |
  234 |   // Nowe testy dla responsywności
  235 |   test.describe('Responsywność', () => {
  236 |     test('powinien dostosować układ do małego ekranu', async ({ page }) => {
  237 |       // Ustawiamy widok na ekran mobilny
  238 |       await page.setViewportSize({ width: 375, height: 667 });
  239 |       
  240 |       const homePage = new HomePage(page);
  241 |       await homePage.goto(); // Przeładowujemy stronę z nowym rozmiarem viewport
  242 |       
  243 |       // Sprawdzamy czy wszystkie kluczowe elementy są nadal widoczne
  244 |       await expect(homePage.heroHeading).toBeVisible();
  245 |       await expect(homePage.tabsList).toBeVisible();
  246 |       
  247 |       // Na małym ekranie karty wartości powinny być układane pionowo (po 1 w wierszu)
  248 |       // Sprawdzamy czy wszystkie karty są widoczne
  249 |       await expect(homePage.timeSavingCardTitle).toBeVisible();
  250 |       await expect(homePage.betterDecisionsCardTitle).toBeVisible();
  251 |       await expect(homePage.smartRecommendationsCardTitle).toBeVisible();
  252 |     });
  253 |
  254 |     test('powinien dostosować układ do dużego ekranu', async ({ page }) => {
  255 |       // Ustawiamy widok na duży ekran
  256 |       await page.setViewportSize({ width: 1200, height: 800 });
  257 |       
  258 |       const homePage = new HomePage(page);
  259 |       await homePage.goto(); // Przeładowujemy stronę z nowym rozmiarem viewport
  260 |       
  261 |       // Na dużym ekranie karty wartości powinny być układane poziomo (po 3 w wierszu)
  262 |       // Bez specyficznego selektora dla układu kart, możemy tylko sprawdzić widoczność
  263 |       await expect(homePage.valuePropositionCards).toBeVisible();
  264 |     });
  265 |   });
  266 |
  267 |   // Test wizualny
  268 |   test('powinien zgadzać się wizualnie ze wzorcem', async ({ page }) => {
  269 |     // Możemy zdefiniować konkretne wymiary dla testu wizualnego
  270 |     await page.setViewportSize({ width: 1280, height: 720 });
  271 |     
  272 |     const homePage = new HomePage(page);
  273 |     await homePage.goto();
  274 |     
  275 |     // Czekamy aż cała strona będzie widoczna i się załaduje
  276 |     await page.waitForLoadState('networkidle');
  277 |     
  278 |     // Porównanie zrzutu ekranu
  279 |     // NOTE: Przy pierwszym uruchomieniu tego testu, zostanie utworzony wzorcowy zrzut ekranu
  280 |     // Przy kolejnych uruchomieniach, zrzuty będą porównywane z wzorcem
> 281 |     await expect(page).toHaveScreenshot('home-page.png');
      |                        ^ Error: expect(page).toHaveScreenshot(expected)
  282 |   });
  283 |
  284 |   // Test metadanych SEO
  285 |   test('powinien mieć odpowiednie metadane SEO', async ({ page }) => {
  286 |     // Sprawdzamy tytuł strony
  287 |     await expect(page).toHaveTitle(/campAlyze - Narzędzie analityczne/);
  288 |     
  289 |     // Sprawdzamy inne metadane (użyj evaluateHandle aby zbadać elementy meta)
  290 |     const description = await page.$eval('meta[name="description"]', (meta) => meta.getAttribute('content'));
  291 |     expect(description).toBeTruthy();
  292 |     
  293 |     // Sprawdzamy czy są podstawowe OG tagi dla social media
  294 |     const ogTitle = await page.$eval('meta[property="og:title"]', (meta) => meta.getAttribute('content'));
  295 |     expect(ogTitle).toBeTruthy();
  296 |   });
  297 | }); 
```