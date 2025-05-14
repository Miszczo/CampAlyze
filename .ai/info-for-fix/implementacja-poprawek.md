# Implementacja poprawek dla testów E2E w aplikacji campAlyze

Poniżej znajdują się konkretne implementacje poprawek dla naprawy błędów zidentyfikowanych w testach E2E. Błędy te dotyczą hydratacji komponentów Radix UI, brakujących selektorów testowych oraz metadanych SEO.

## 1. Poprawka problemu hydratacji komponentów Radix UI

### Zmiana w `src/pages/index.astro`

```astro
<!-- Zmiana dyrektywy hydratacji z client:load na client:only="react" -->
<Tabs client:only="react" defaultValue="dashboard" className="w-full">
  <TabsList data-testid="tabs-list" className="w-full max-w-lg mx-auto mb-8 bg-white/10">
    <TabsTrigger
      value="dashboard"
      className="text-white data-[state=active]:bg-white data-[state=active]:text-purple-900">Dashboard</TabsTrigger
    >
    <TabsTrigger value="imports" className="text-white data-[state=active]:bg-white data-[state=active]:text-purple-900"
      >Import danych</TabsTrigger
    >
    <TabsTrigger value="ai" className="text-white data-[state=active]:bg-white data-[state=active]:text-purple-900"
      >AI Insights</TabsTrigger
    >
  </TabsList>
  <TabsContent data-testid="dashboard-tab-content" value="dashboard" className="p-2">
    <!-- Zawartość zakładki Dashboard bez zmian -->
  </TabsContent>
  <TabsContent data-testid="imports-tab-content" value="imports" className="p-2">
    <!-- Zawartość zakładki Import danych bez zmian -->
  </TabsContent>
  <TabsContent data-testid="ai-insights-tab-content" value="ai" className="p-2">
    <!-- Zawartość zakładki AI Insights bez zmian -->
  </TabsContent>
</Tabs>
```

Alternatywnie, możemy utworzyć dedykowany komponent React:

### Nowy plik `src/components/FeatureTabs.jsx`

```jsx
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function FeatureTabs() {
  return (
    <Tabs defaultValue="dashboard" className="w-full">
      <TabsList data-testid="tabs-list" className="w-full max-w-lg mx-auto mb-8 bg-white/10">
        <TabsTrigger
          value="dashboard"
          className="text-white data-[state=active]:bg-white data-[state=active]:text-purple-900"
        >
          Dashboard
        </TabsTrigger>
        <TabsTrigger
          value="imports"
          className="text-white data-[state=active]:bg-white data-[state=active]:text-purple-900"
        >
          Import danych
        </TabsTrigger>
        <TabsTrigger value="ai" className="text-white data-[state=active]:bg-white data-[state=active]:text-purple-900">
          AI Insights
        </TabsTrigger>
      </TabsList>
      <TabsContent data-testid="dashboard-tab-content" value="dashboard" className="p-2">
        <div className="w-full h-[400px] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 relative overflow-hidden flex items-center justify-center">
          <div className="text-center text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-4 opacity-75"
            >
              <rect width="20" height="14" x="2" y="3" rx="2"></rect>
              <line x1="8" x2="16" y1="21" y2="21"></line>
              <line x1="12" x2="12" y1="17" y2="21"></line>
              <path d="M2 10h20"></path>
            </svg>
            <p className="text-2xl font-medium">Interaktywny dashboard z kluczowymi metrykami</p>
            <p className="mt-2 text-blue-200/70">Monitoruj CPC, CTR, konwersje, koszt/konwersję i ROAS</p>
          </div>
        </div>
      </TabsContent>
      {/* Pozostałe TabsContent (imports i ai) - podobnie jak powyżej */}
    </Tabs>
  );
}
```

### Użycie w `src/pages/index.astro`

```astro
---
import Layout from "../layouts/Layout.astro";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { FeatureTabs } from "@/components/FeatureTabs";

// Wykorzystanie sesji użytkownika z middleware
const { session } = Astro.locals;
const isLoggedIn = !!session;
---

<Layout title="campAlyze - Narzędzie analityczne do kampanii reklamowych">
  <!-- Treść strony -->
  <div class="w-full bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900">
    <div class="container mx-auto px-4 py-12 md:py-24 flex flex-col items-center">
      <!-- Hero Section - bez zmian -->

      <!-- Feature Highlights - zamienione na komponent React -->
      <div class="w-full max-w-5xl mb-16">
        <FeatureTabs client:only="react" />
      </div>

      <!-- Pozostałe sekcje bez zmian -->
    </div>
  </div>
</Layout>
```

## 2. Dodanie brakujących atrybutów data-testid

### Zmiany w `src/pages/index.astro`

Dodanie atrybutów `data-testid` do wszystkich kluczowych elementów testowanych w E2E:

```astro
<!-- Hero Section -->
<div class="text-center mb-16" data-testid="hero-section">
  <h1 class="text-4xl md:text-6xl font-bold mb-6 text-white" data-testid="hero-heading">
    Analiza kampanii reklamowych
    <span class="bg-gradient-to-r from-blue-200 to-purple-200 text-transparent bg-clip-text"> w jednym miejscu </span>
  </h1>
  <!-- Reszta sekcji hero bez zmian -->
</div>

<!-- Features List -->
<div class="w-full max-w-3xl mb-16" data-testid="features-list-section">
  <h2 class="text-3xl font-bold mb-8 text-center text-white" data-testid="features-list-heading">
    Główne funkcje <span class="bg-gradient-to-r from-blue-200 to-purple-200 text-transparent bg-clip-text">
      campAlyze
    </span>
  </h2>

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4" data-testid="features-list-grid">
    {
      [
        "Import danych z CSV/XLSX z Google Ads i Meta Ads",
        "Interaktywny dashboard z kluczowymi metrykami",
        "Porównanie platform reklamowych",
        "System alertów dla problematycznych kampanii",
        "Dziennik zmian wprowadzonych w kampaniach",
        "Automatyczne podsumowania i rekomendacje AI",
        "Eksport raportów do CSV/PDF/XLSX",
        "Bezpieczne zarządzanie kontami użytkowników",
      ].map((feature, index) => (
        <div class="flex items-start space-x-3 p-3 rounded-lg bg-white/5" data-testid={`feature-item-${index}`}>
          <div class="mt-0.5">
            <Check client:load className="h-5 w-5 text-green-400" />
          </div>
          <span class="text-white">{feature}</span>
        </div>
      ))
    }
  </div>
</div>
```

## 3. Aktualizacja selektorów w Page Object Model

### Zmiany w `tests/e2e/poms/HomePage.pom.ts`

```typescript
// Aktualizacja selektorów, aby używały atrybutów data-testid
export class HomePage {
  // Pozostałe deklaracje bez zmian

  constructor(page: Page) {
    this.page = page;

    // Hero Section - zaktualizowane selektory
    this.heroHeading = page.getByTestId("hero-heading");
    // Alternatywny selektor z fallbackiem
    // this.heroHeading = page.locator('[data-testid="hero-heading"], h1:has-text("Analiza kampanii reklamowych")');

    this.heroDescription = page.getByText(/Importuj dane z Google Ads i Meta Ads, analizuj kluczowe metryki/i);

    // Przyciski w hero - bez zmian
    this.goToDashboardButton = page.getByRole("link", { name: "Przejdź do dashboardu" });
    this.loginButtonHero = page.getByRole("link", { name: "Zaloguj się" }).first();
    this.registerButtonHero = page.getByRole("link", { name: "Zarejestruj się" }).first();

    // Tabs Section - zaktualizowane selektory z użyciem data-testid
    this.tabsList = page.getByTestId("tabs-list");
    // Fallback z użyciem alternatywnych selektorów
    // this.tabsList = page.locator('[data-testid="tabs-list"], [role="tablist"]');

    // Selektory zakładek pozostają bez zmian dla zachowania kompatybilności
    this.dashboardTabTrigger = page.getByRole("tab", { name: "Dashboard" });
    this.importsTabTrigger = page.getByRole("tab", { name: "Import danych" });
    this.aiInsightsTabTrigger = page.getByRole("tab", { name: "AI Insights" });

    // Zawartość zakładek - zaktualizowane selektory
    this.dashboardTabContent = page.getByTestId("dashboard-tab-content");
    this.importsTabContent = page.getByTestId("imports-tab-content");
    this.aiInsightsTabContent = page.getByTestId("ai-insights-tab-content");

    // Value Proposition Cards
    this.valuePropositionCards = page.getByTestId("value-proposition-section");
    // Tytuły kart - bez zmian
    this.timeSavingCardTitle = page.getByRole("heading", { name: "Oszczędność czasu" });
    this.betterDecisionsCardTitle = page.getByRole("heading", { name: "Lepsze decyzje" });
    this.smartRecommendationsCardTitle = page.getByRole("heading", { name: "Inteligentne rekomendacje" });

    // Features List - zaktualizowane selektory
    this.featuresListSection = page.getByTestId("features-list-section");
    this.featuresListItems = page.locator('[data-testid^="feature-item-"]');

    // CTA Section
    this.ctaSection = page.getByTestId("cta-section");
    this.ctaHeading = this.ctaSection.getByRole("heading", {
      name: /Gotowy na optymalizację swoich kampanii?/i,
    });
    // Pozostałe selektory CTA bez zmian
  }

  // Pozostałe metody bez zmian
}
```

## 4. Dodanie metadanych SEO do layoutu

### Zmiany w `src/layouts/Layout.astro`

```astro
---
interface Props {
  title: string;
  description?: string;
  ogImage?: string;
}

const {
  title,
  description = "Narzędzie analityczne do kampanii reklamowych dla specjalistów marketingu i reklamy.",
  ogImage = "/images/og-image.jpg", // Zakładając, że istnieje taki obrazek
} = Astro.props;

// Utworzenie pełnego URL dla Open Graph
const canonicalURL = new URL(Astro.request.url, Astro.site);
const ogImageURL = new URL(ogImage, Astro.site);
---

<!doctype html>
<html lang="pl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>{title}</title>
    <meta name="description" content={description} />

    <!-- Kanoniczny URL -->
    <link rel="canonical" href={canonicalURL} />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content={canonicalURL} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={ogImageURL} />

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content={canonicalURL} />
    <meta property="twitter:title" content={title} />
    <meta property="twitter:description" content={description} />
    <meta property="twitter:image" content={ogImageURL} />

    <!-- Dodatkowe meta tagi dla SEO -->
    <meta name="generator" content={Astro.generator} />
    <meta name="robots" content="index, follow" />

    <!-- Slot dla dodatkowych meta tagów specyficznych dla strony -->
    <slot name="head" />
  </head>
  <body>
    <slot />
  </body>
</html>
```

## 5. Zestawienie zmian do wykonania

### 1. Rozwiązanie problemu hydratacji:

- Zamiana `client:load` na `client:only="react"` dla komponentu Tabs lub
- Utworzenie dedykowanego komponentu React `FeatureTabs.jsx` i użycie go w index.astro

### 2. Dodanie atrybutów data-testid:

- Do sekcji hero, zakładek, listy funkcji i CTA w index.astro

### 3. Aktualizacja selektorów w HomePage.pom.ts:

- Użycie selektorów opartych na data-testid
- Dodanie alternatywnych selektorów jako fallback

### 4. Dodanie metadanych SEO:

- Uzupełnienie meta tagów w Layout.astro
- Dodanie Open Graph i Twitter Card meta tagów

Po wprowadzeniu tych zmian, testy E2E powinny przechodzić poprawnie, ponieważ:

1. Problem hydratacji Radix UI zostanie rozwiązany przez pełną hydratację komponentów React
2. Selektory będą trafiać w odpowiednie elementy dzięki atrybutom data-testid
3. Testy metadanych SEO będą przechodziły dzięki kompletnym meta tagom
