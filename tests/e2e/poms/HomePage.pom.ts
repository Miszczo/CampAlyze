import { type Page, type Locator } from "@playwright/test";

export class HomePage {
  readonly page: Page;

  // Hero Section
  readonly heroHeading: Locator;
  readonly heroDescription: Locator;
  readonly goToDashboardButton: Locator;
  readonly loginButtonHero: Locator;
  readonly registerButtonHero: Locator;

  // Tabs Section
  readonly tabsList: Locator;
  readonly dashboardTabTrigger: Locator;
  readonly importsTabTrigger: Locator;
  readonly aiInsightsTabTrigger: Locator;
  readonly dashboardTabContent: Locator;
  readonly importsTabContent: Locator;
  readonly aiInsightsTabContent: Locator;

  // Value Proposition Cards
  readonly valuePropositionCards: Locator;
  readonly timeSavingCardTitle: Locator;
  readonly betterDecisionsCardTitle: Locator;
  readonly smartRecommendationsCardTitle: Locator;

  // Features List
  readonly featuresListSection: Locator;
  readonly featuresListItems: Locator;

  // CTA Section
  readonly ctaSection: Locator;
  readonly ctaHeading: Locator;
  readonly ctaDescription: Locator;
  readonly registerButtonCTA: Locator;
  readonly loginButtonCTA: Locator;

  constructor(page: Page) {
    this.page = page;

    // Hero Section
    this.heroHeading = page.getByTestId("hero-heading");
    this.heroDescription = page.getByText(
      /Importuj dane z Google Ads i Meta Ads, analizuj kluczowe metryki/i
    );
    this.goToDashboardButton = page.getByTestId("go-to-dashboard-link");
    this.loginButtonHero = page.getByTestId("hero-section").getByRole("link", { name: "Zaloguj się" });
    this.registerButtonHero = page.getByTestId("hero-section").getByRole("link", { name: "Zarejestruj się" });

    // Tabs Section
    this.tabsList = page.getByTestId("tabs-list");
    this.dashboardTabTrigger = this.tabsList.getByRole("tab", { name: "Dashboard" });
    this.importsTabTrigger = this.tabsList.getByRole("tab", { name: "Import danych" });
    this.aiInsightsTabTrigger = this.tabsList.getByRole("tab", { name: "AI Insights" });
    
    this.dashboardTabContent = page.getByTestId("dashboard-tab-content");
    this.importsTabContent = page.getByTestId("imports-tab-content");
    this.aiInsightsTabContent = page.getByTestId("ai-insights-tab-content");

    // Value Proposition Cards
    this.valuePropositionCards = page.getByTestId("value-proposition-section");
    this.timeSavingCardTitle = page.getByTestId("card-title-time-saving");
    this.betterDecisionsCardTitle = page.getByTestId("card-title-better-decisions");
    this.smartRecommendationsCardTitle = page.getByTestId("card-title-smart-recommendations");

    // Features List
    this.featuresListSection = page.getByTestId("features-list-section");
    this.featuresListItems = page.locator('[data-testid^="feature-item-"]');

    // CTA Section
    this.ctaSection = page.getByTestId("cta-section");
    this.ctaHeading = this.ctaSection.getByRole("heading", {
      name: /Gotowy na optymalizację swoich kampanii?/i,
    });
    this.ctaDescription = this.ctaSection.getByText(
      /Dołącz do grona specjalistów korzystających z campAlyze/i
    );
    this.registerButtonCTA = this.ctaSection.getByRole("link", {
      name: "Zarejestruj się za darmo",
    });
    this.loginButtonCTA = this.ctaSection.getByRole("link", { name: "Zaloguj się" });
  }

  async goto() {
    await this.page.goto("/");
  }

  async clickDashboardTab() {
    await this.dashboardTabTrigger.click();
  }

  async clickImportsTab() {
    await this.importsTabTrigger.click();
  }

  async clickAiInsightsTab() {
    await this.aiInsightsTabTrigger.click();
  }

  // Helper to get a specific feature item by its text
  getFeatureListItem(text: string | RegExp): Locator {
    return this.featuresListItems.filter({ hasText: text });
  }
} 