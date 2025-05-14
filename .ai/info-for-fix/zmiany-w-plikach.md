# Zmiany w plikach do naprawy testów E2E w aplikacji campAlyze

Poniżej znajdują się dokładne zmiany, które należy wprowadzić w poszczególnych plikach, aby naprawić błędy w testach E2E.

## 1. src/pages/index.astro

### Zmiana 1: Aktualizacja dyrektywy hydratacji komponentu Tabs

```astro
<!-- Było: -->
<Tabs client:load defaultValue="dashboard" className="w-full">
  <!-- Powinno być: -->
  <Tabs client:only="react" defaultValue="dashboard" className="w-full" /></Tabs
>
```

### Zmiana 2: Dodanie atrybutów data-testid do TabsList i TabsContent

```astro
<!-- Było: -->
<TabsList className="w-full max-w-lg mx-auto mb-8 bg-white/10">
  <!-- Powinno być: -->
  <TabsList data-testid="tabs-list" className="w-full max-w-lg mx-auto mb-8 bg-white/10">
    <!-- Było: -->
    <TabsContent value="dashboard" className="p-2">
      <!-- Powinno być: -->
      <TabsContent data-testid="dashboard-tab-content" value="dashboard" className="p-2">
        <!-- Było: -->
        <TabsContent value="imports" className="p-2">
          <!-- Powinno być: -->
          <TabsContent data-testid="imports-tab-content" value="imports" className="p-2">
            <!-- Było: -->
            <TabsContent value="ai" className="p-2">
              <!-- Powinno być: -->
              <TabsContent data-testid="ai-insights-tab-content" value="ai" className="p-2" /></TabsContent
            ></TabsContent
          ></TabsContent
        ></TabsContent
      ></TabsContent
    ></TabsList
  ></TabsList
>
```

### Zmiana 3: Dodanie atrybutów data-testid do sekcji Hero

```astro
<!-- Było: -->
<div class="text-center mb-16">
  <!-- Powinno być: -->
  <div data-testid="hero-section" class="text-center mb-16">
    <!-- Było: -->
    <h1 class="text-4xl md:text-6xl font-bold mb-6 text-white">
      <!-- Powinno być: -->
      <h1 data-testid="hero-heading" class="text-4xl md:text-6xl font-bold mb-6 text-white"></h1>
    </h1>
  </div>
</div>
```

### Zmiana 4: Dodanie atrybutów data-testid do sekcji Features List

```astro
<!-- Było: -->
<div class="w-full max-w-3xl mb-16">
  <!-- Powinno być: -->
  <div data-testid="features-list-section" class="w-full max-w-3xl mb-16">
    <!-- Było: -->
    <h2 class="text-3xl font-bold mb-8 text-center text-white">
      <!-- Powinno być: -->
      <h2 data-testid="features-list-heading" class="text-3xl font-bold mb-8 text-center text-white">
        <!-- Było: -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Powinno być: -->
          <div data-testid="features-list-grid" class="grid grid-cols-1 sm:grid-cols-2 gap-4"></div>
        </div>
      </h2>
    </h2>
  </div>
</div>
```

### Zmiana 5: Dodanie atrybutów data-testid do poszczególnych elementów listy funkcji

```astro
<!-- Było: -->{
  [
    "Import danych z CSV/XLSX z Google Ads i Meta Ads",
    "Interaktywny dashboard z kluczowymi metrykami",
    // ...pozostałe funkcje
  ].map((feature) => (
    <div class="flex items-start space-x-3 p-3 rounded-lg bg-white/5">
      <div class="mt-0.5">
        <Check client:load className="h-5 w-5 text-green-400" />
      </div>
      <span class="text-white">{feature}</span>
    </div>
  ))
}

<!-- Powinno być: -->
{
  [
    "Import danych z CSV/XLSX z Google Ads i Meta Ads",
    "Interaktywny dashboard z kluczowymi metrykami",
    // ...pozostałe funkcje
  ].map((feature, index) => (
    <div data-testid={`feature-item-${index}`} class="flex items-start space-x-3 p-3 rounded-lg bg-white/5">
      <div class="mt-0.5">
        <Check client:load className="h-5 w-5 text-green-400" />
      </div>
      <span class="text-white">{feature}</span>
    </div>
  ))
}
```

## 2. src/layouts/Layout.astro

### Zmiana: Uzupełnienie brakujących meta tagów SEO

```astro
---
interface Props {
  title?: string;
  description?: string;
  ogImage?: string;
}

const {
  title = "campAlyze - Narzędzie analityczne",
  description = "CampAlyze - Twoje centrum analizy kampanii reklamowych. Importuj, analizuj i optymalizuj wyniki z Google Ads i Meta Ads w jednym miejscu.",
  ogImage = "/images/og-image.jpg",
} = Astro.props;

// Utworzenie pełnego URL dla Open Graph
const canonicalURL = new URL(Astro.url.toString());
const ogImageURL = new URL(ogImage, Astro.url);

const { session } = Astro.locals; // Get session from middleware
---

<!doctype html>
<html lang="pl" class="h-full">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <meta name="generator" content={Astro.generator} />
    <title>{title}</title>

    <!-- Metadane SEO -->
    <meta name="description" content={description} />
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

    <!-- Dodatkowe meta tagi -->
    <meta name="robots" content="index, follow" />

    <!-- CSS -->
    <link rel="stylesheet" href="/src/styles/global.css" />
  </head>

  <!-- Reszta pliku bez zmian -->
</html>
```

## 3. tests/e2e/poms/HomePage.pom.ts

### Zmiana: Aktualizacja selektorów

```typescript
constructor(page: Page) {
  this.page = page;

  // Hero Section - zaktualizowane selektory
  this.heroHeading = page.getByTestId("hero-heading");
  this.heroDescription = page.getByText(
    /Importuj dane z Google Ads i Meta Ads, analizuj kluczowe metryki/i
  );

  // Przyciski w Hero - bez zmian
  this.goToDashboardButton = page.getByRole("link", { name: "Przejdź do dashboardu" });
  this.loginButtonHero = page.getByRole("link", { name: "Zaloguj się" }).first();
  this.registerButtonHero = page.getByRole("link", { name: "Zarejestruj się" }).first();

  // Tabs Section - zaktualizowane selektory
  this.tabsList = page.getByTestId("tabs-list");

  // Triggery zakładek - bez zmian
  this.dashboardTabTrigger = page.getByRole("tab", { name: "Dashboard" });
  this.importsTabTrigger = page.getByRole("tab", { name: "Import danych" });
  this.aiInsightsTabTrigger = page.getByRole("tab", { name: "AI Insights" });

  // Zawartość zakładek - zaktualizowane selektory
  this.dashboardTabContent = page.getByTestId("dashboard-tab-content");
  this.importsTabContent = page.getByTestId("imports-tab-content");
  this.aiInsightsTabContent = page.getByTestId("ai-insights-tab-content");

  // Value Proposition Cards - bez zmian
  this.valuePropositionCards = page.getByTestId("value-proposition-section");
  this.timeSavingCardTitle = page.getByRole("heading", { name: "Oszczędność czasu" });
  this.betterDecisionsCardTitle = page.getByRole("heading", { name: "Lepsze decyzje" });
  this.smartRecommendationsCardTitle = page.getByRole("heading", { name: "Inteligentne rekomendacje" });

  // Features List - zaktualizowane selektory
  this.featuresListSection = page.getByTestId("features-list-section");
  this.featuresListItems = page.locator('[data-testid^="feature-item-"]');

  // CTA Section - bez zmian
  this.ctaSection = page.getByTestId("cta-section");
  this.ctaHeading = this.ctaSection.getByRole("heading", {
    name: /Gotowy na optymalizację swoich kampanii?/i,
  });
  this.ctaDescription = this.ctaSection.getByText(
    /Dołącz do grona specjalistów korzystających z campAlyze/i
  );
  this.registerButtonCTA = this.ctaSection.getByRole("link", { name: "Zarejestruj się za darmo" });
  this.loginButtonCTA = this.ctaSection.getByRole("link", { name: "Zaloguj się" });
}
```

## Alternatywne podejście: Stworzenie osobnego komponentu React

Jeśli podejście z `client:only="react"` nie rozwiąże problemu hydratacji, można zastosować alternatywne rozwiązanie przez stworzenie dedykowanego komponentu React.

### Nowy plik: src/components/FeatureTabs.tsx

```tsx
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

      <TabsContent data-testid="imports-tab-content" value="imports" className="p-2">
        {/* Zawartość zakładki Import danych */}
      </TabsContent>

      <TabsContent data-testid="ai-insights-tab-content" value="ai" className="p-2">
        {/* Zawartość zakładki AI Insights */}
      </TabsContent>
    </Tabs>
  );
}
```

### Zmiana w src/pages/index.astro przy użyciu komponentu FeatureTabs

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
  <!-- Zawartość strony -->
  <div class="w-full bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900">
    <div class="container mx-auto px-4 py-12 md:py-24 flex flex-col items-center">
      <!-- Hero Section - z dodanym data-testid -->
      <div data-testid="hero-section" class="text-center mb-16">
        <!-- Zawartość Hero bez zmian -->
      </div>

      <!-- Feature Highlights - zamienione na komponent React -->
      <div class="w-full max-w-5xl mb-16">
        <FeatureTabs client:only="react" />
      </div>

      <!-- Pozostałe sekcje - z dodanym data-testid -->
    </div>
  </div>
</Layout>
```

## 4. Podsumowanie zmian

Główne zmiany do wprowadzenia:

1. **Zmiana w hydratacji komponentów Radix UI**

   - Użyj `client:only="react"` zamiast `client:load` dla komponentu Tabs
   - Alternatywnie, utwórz dedykowany komponent React i użyj go w pliku .astro

2. **Dodanie atrybutów data-testid**

   - Dodaj atrybuty data-testid do wszystkich kluczowych elementów UI
   - Szczególnie dla sekcji testowanych w testach E2E

3. **Aktualizacja selektorów w Page Object Models**

   - Zaktualizuj selektory w HomePage.pom.ts, aby używały atrybutów data-testid
   - Unikaj polegania wyłącznie na rolach ARIA

4. **Uzupełnienie metadanych SEO**
   - Dodaj kompletny zestaw meta tagów w Layout.astro
   - Zapewnij, że każda strona ma unikalne i odpowiednie metadane

Po wprowadzeniu tych zmian, testy E2E powinny przechodzić pomyślnie, ponieważ:

- Komponenty Radix UI będą poprawnie hydratowane
- Selektory testów będą wskazywać na odpowiednie elementy
- Wszystkie wymagane metadane SEO będą obecne
