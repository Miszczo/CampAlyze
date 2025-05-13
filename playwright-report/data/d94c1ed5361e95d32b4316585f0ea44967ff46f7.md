# Test info

- Name: Strona główna (index.astro) >> Przyciski CTA (stan zalogowany) >> powinien wyświetlać przycisk 'Przejdź do dashboardu' w Hero dla zalogowanego użytkownika
- Location: D:\www\campAlyze\tests\e2e\home.spec.ts:163:5

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

Locator: getByTestId('go-to-dashboard-link')
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for getByTestId('go-to-dashboard-link')

    at D:\www\campAlyze\tests\e2e\home.spec.ts:169:50
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
   69 |       await expect(homePage.getFeatureListItem(/Import danych z CSV/)).toBeVisible();
   70 |       await expect(homePage.getFeatureListItem(/Interaktywny dashboard/)).toBeVisible();
   71 |     });
   72 |   });
   73 |
   74 |   test.describe("Interaktywność zakładek", () => {
   75 |     test("powinien zmieniać aktywną zakładkę i jej treść po kliknięciu", async ({ page }) => {
   76 |       const homePage = new HomePage(page);
   77 |
   78 |       // Check initial state (Dashboard active)
   79 |       await expect(homePage.dashboardTabContent).toBeVisible();
   80 |       await expect(homePage.importsTabContent).not.toBeVisible();
   81 |       await expect(homePage.aiInsightsTabContent).not.toBeVisible();
   82 |       await expect(homePage.dashboardTabTrigger).toHaveAttribute("data-state", "active");
   83 |
   84 |       // Click Imports Tab
   85 |       await homePage.clickImportsTab();
   86 |       await expect(homePage.importsTabContent).toBeVisible();
   87 |       await expect(homePage.dashboardTabContent).not.toBeVisible();
   88 |       await expect(homePage.aiInsightsTabContent).not.toBeVisible();
   89 |       await expect(homePage.importsTabTrigger).toHaveAttribute("data-state", "active");
   90 |       await expect(homePage.dashboardTabTrigger).toHaveAttribute("data-state", "inactive");
   91 |
   92 |       // Click AI Insights Tab
   93 |       await homePage.clickAiInsightsTab();
   94 |       await expect(homePage.aiInsightsTabContent).toBeVisible();
   95 |       await expect(homePage.dashboardTabContent).not.toBeVisible();
   96 |       await expect(homePage.importsTabContent).not.toBeVisible();
   97 |       await expect(homePage.aiInsightsTabTrigger).toHaveAttribute("data-state", "active");
   98 |       await expect(homePage.importsTabTrigger).toHaveAttribute("data-state", "inactive");
   99 |
  100 |       // Click Dashboard Tab again
  101 |       await homePage.clickDashboardTab();
  102 |       await expect(homePage.dashboardTabContent).toBeVisible();
  103 |       await expect(homePage.importsTabContent).not.toBeVisible();
  104 |       await expect(homePage.aiInsightsTabContent).not.toBeVisible();
  105 |       await expect(homePage.dashboardTabTrigger).toHaveAttribute("data-state", "active");
  106 |       await expect(homePage.aiInsightsTabTrigger).toHaveAttribute("data-state", "inactive");
  107 |     });
  108 |   });
  109 |
  110 |   test.describe("Przyciski CTA (stan niezalogowany)", () => {
  111 |     // These tests run without mocking the session
  112 |     test("powinien wyświetlać przyciski 'Zaloguj się' i 'Zarejestruj się' w Hero dla niezalogowanego użytkownika", async ({
  113 |       page,
  114 |     }) => {
  115 |       const homePage = new HomePage(page);
  116 |       await expect(homePage.loginButtonHero).toBeVisible();
  117 |       await expect(homePage.registerButtonHero).toBeVisible();
  118 |       await expect(homePage.goToDashboardButton).not.toBeVisible();
  119 |     });
  120 |
  121 |     test("powinien wyświetlać przyciski 'Zarejestruj się za darmo' i 'Zaloguj się' w dolnym CTA dla niezalogowanego użytkownika", async ({
  122 |       page,
  123 |     }) => {
  124 |       const homePage = new HomePage(page);
  125 |       await expect(homePage.registerButtonCTA).toBeVisible();
  126 |       await expect(homePage.loginButtonCTA).toBeVisible();
  127 |     });
  128 |
  129 |     test("powinien nawigować do /login po kliknięciu przycisku 'Zaloguj się' w Hero", async ({ page }) => {
  130 |       const homePage = new HomePage(page);
  131 |       await homePage.loginButtonHero.click();
  132 |       await expect(page).toHaveURL(/.*\/login/);
  133 |     });
  134 |
  135 |     test("powinien nawigować do /register po kliknięciu przycisku 'Zarejestruj się' w Hero", async ({ page }) => {
  136 |       const homePage = new HomePage(page);
  137 |       await homePage.registerButtonHero.click();
  138 |       await expect(page).toHaveURL(/.*\/register/);
  139 |     });
  140 |
  141 |     test("powinien nawigować do /register po kliknięciu przycisku 'Zarejestruj się za darmo' w CTA", async ({ page }) => {
  142 |       const homePage = new HomePage(page);
  143 |       await homePage.registerButtonCTA.click();
  144 |       await expect(page).toHaveURL(/.*\/register/);
  145 |     });
  146 |
  147 |     test("powinien nawigować do /login po kliknięciu przycisku 'Zaloguj się' w CTA", async ({ page }) => {
  148 |       const homePage = new HomePage(page);
  149 |       await homePage.loginButtonCTA.click();
  150 |       await expect(page).toHaveURL(/.*\/login/);
  151 |     });
  152 |
  153 |   });
  154 |
  155 |   test.describe("Przyciski CTA (stan zalogowany)", () => {
  156 |     // These tests require mocking the session state
  157 |     test.beforeEach(async ({ context }) => {
  158 |       // Mock the session by adding a cookie before navigating
  159 |       // IMPORTANT: Replace MOCK_SESSION_COOKIE with actual session details
  160 |       await context.addCookies([MOCK_SESSION_COOKIE]);
  161 |     });
  162 |
  163 |     test("powinien wyświetlać przycisk 'Przejdź do dashboardu' w Hero dla zalogowanego użytkownika", async ({
  164 |       page,
  165 |     }) => {
  166 |       const homePage = new HomePage(page); // Re-initialize POM after potential navigation/reload
  167 |       await homePage.goto(); // Need to reload the page after setting the cookie
  168 |
> 169 |       await expect(homePage.goToDashboardButton).toBeVisible();
      |                                                  ^ Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
  170 |       await expect(homePage.loginButtonHero).not.toBeVisible();
  171 |       await expect(homePage.registerButtonHero).not.toBeVisible();
  172 |     });
  173 |
  174 |     // Note: The bottom CTA section doesn't change based on login status in the current index.astro code
  175 |     // If it should, add a test here.
  176 |
  177 |     test("powinien nawigować do /dashboard po kliknięciu przycisku 'Przejdź do dashboardu'", async ({
  178 |       page,
  179 |     }) => {
  180 |         const homePage = new HomePage(page);
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
```