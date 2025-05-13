# Plan naprawy błędów testów E2E w aplikacji campAlyze

## 1. Zidentyfikowane problemy

### 1.1. Błędy hydratacji komponentów Radix UI w Astro
Konsola pokazuje powtarzające się błędy:
```
[ERROR] `TabsContent` must be used within `Tabs`
  at useContext2 (file:///D:/www/campAlyze/node_modules/@radix-ui/react-context/dist/index.mjs:38:13)
```

Ten błąd wskazuje na problem z hydratacją komponentów Radix UI (które są używane przez shadcn/ui) w środowisku Astro.

### 1.2. Problemy z selektorami w testach E2E
Testy E2E nie znajdują elementów, które powinny być obecne na stronie:
- Nie można znaleźć elementu `tabsList` z role="tablist"
- Nie można znaleźć elementu `valuePropositionCards` z data-testid="value-proposition-section"

### 1.3. Problemy z metadanymi SEO
Test sprawdzający metadane SEO nie przechodzi, prawdopodobnie z powodu braku niektórych meta tagów.

## 2. Szczegółowa analiza przyczyn

### 2.1. Problem hydratacji komponentów Radix UI
Komponent `Tabs` z shadcn/ui używa wewnętrznie kontekstu React z biblioteki Radix UI. W środowisku Astro, które używa częściowej hydratacji, może dochodzić do problemów z synchronizacją:

1. Astro renderuje komponenty na serwerze
2. W trakcie hydratacji na kliencie, komponenty Radix UI wymagają pewnej hierarchii (np. `TabsContent` musi być wewnątrz kontekstu `Tabs`)
3. Częściowa hydratacja poprzez dyrektywę `client:load` może powodować, że komponenty są hydratowane w innej kolejności niż oczekiwane

### 2.2. Problem z selektorami testów
W plikach testów używane są selektory oparte na rolach ARIA lub atrybutach data-testid:
- `homePage.tabsList = page.getByRole("tablist");`
- `homePage.valuePropositionCards = page.getByTestId("value-proposition-section");`

Jednak albo:
1. Te atrybuty nie są poprawnie generowane podczas renderowania komponentów
2. Atrybuty nie są generowane w czasie, gdy test próbuje je znaleźć (problemy z timing)
3. Selektory są niepoprawne (np. z powodu zmiany w klasach CSS)

### 2.3. Problem metadanych SEO
Brakuje niektórych meta tagów wymaganych w testach, np. `og:title` lub innych meta tagów Open Graph.

## 3. Propozycje rozwiązania

### 3.1. Rozwiązanie problemu hydratacji Radix UI

#### Opcja 1: Zmiana dyrektywy hydratacji
Zmienić dyrektywę hydratacji `client:load` na bardziej odpowiednią:
```astro
<Tabs client:visible defaultValue="dashboard" className="w-full">
  <!-- zamiast -->
  <!-- <Tabs client:load defaultValue="dashboard" className="w-full"> -->
```

Dyrektywa `client:visible` spowoduje, że komponent będzie hydratowany dopiero gdy będzie widoczny na ekranie, co może zapobiec problemom z hydratacją w niewłaściwej kolejności.

#### Opcja 2: Opakowanie całego komponentu Tabs w jeden kontener hydratacji
```astro
<div client:load>
  <Tabs defaultValue="dashboard" className="w-full">
    <!-- Zawartość komponentu Tabs -->
  </Tabs>
</div>
```

#### Opcja 3: Stworzenie dedykowanego komponentu React
Przenieść całą logikę zakładek do oddzielnego komponentu React i użyć go w pliku .astro:
```jsx
// src/components/FeatureTabs.jsx
export function FeatureTabs() {
  return (
    <Tabs defaultValue="dashboard" className="w-full">
      {/* Cała zawartość komponentu */}
    </Tabs>
  );
}
```

```astro
<!-- W index.astro -->
<FeatureTabs client:load />
```

### 3.2. Rozwiązanie problemów z selektorami

#### Dodanie jednoznacznych atrybutów data-testid
Dodać więcej atrybutów `data-testid` dla wszystkich kluczowych elementów na stronie:

```astro
<TabsList className="w-full max-w-lg mx-auto mb-8 bg-white/10" data-testid="tabs-list">
```

```astro
<TabsContent value="dashboard" className="p-2" data-testid="dashboard-tab-content">
```

#### Aktualizacja selektorów w Page Object Models

Zaktualizować selektory w pliku `HomePage.pom.ts`:

```typescript
// Stary selektor
this.tabsList = page.getByRole("tablist");

// Nowy selektor
this.tabsList = page.getByTestId("tabs-list");

// Alternatywnie, używając bardziej elastycznych selektorów
this.tabsList = page.locator('[data-testid="tabs-list"], [role="tablist"]');
```

### 3.3. Rozwiązanie problemu metadanych SEO

Dodać brakujące meta tagi do layoutu lub bezpośrednio na stronie:

```astro
---
// W Layout.astro
const { title, description = "Narzędzie analityczne do kampanii reklamowych" } = Astro.props;
---

<html lang="pl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <meta name="description" content={description} />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content={Astro.url} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content={Astro.url} />
    <meta property="twitter:title" content={title} />
    <meta property="twitter:description" content={description} />
  </head>
  <body>
    <slot />
  </body>
</html>
```

## 4. Plan wdrożenia zmian

### 4.1. Kolejność wdrażania poprawek

1. **Dodanie atrybutów data-testid**
   - Dodać atrybuty data-testid do wszystkich kluczowych elementów w index.astro
   - Zaktualizować selektory w HomePage.pom.ts

2. **Poprawienie meta tagów SEO**
   - Dodać brakujące meta tagi w Layout.astro

3. **Rozwiązanie problemu hydratacji Radix UI**
   - Przetestować opcję z `client:visible` zamiast `client:load`
   - Jeśli to nie zadziała, wypróbować opcję z dedykowanym komponentem React

4. **Weryfikacja naprawionych testów**
   - Uruchomić testy aby sprawdzić czy zmiany rozwiązały problemy
   - W razie potrzeby zastosować kolejne poprawki

### 4.2. Wnioski i zalecenia na przyszłość

1. **Hydratacja komponentów UI**
   - Biblioteki UI oparte na kontekście React (jak Radix UI) mogą mieć problemy z częściową hydratacją w Astro
   - Zawsze używać jednolitej strategii hydratacji dla powiązanych komponentów
   - Rozważyć używanie bardziej natywnych komponentów Astro dla elementów statycznych

2. **Testowanie**
   - Używać jednoznacznych atrybutów data-testid zamiast polegać na rolach ARIA lub selektorach CSS
   - Pamiętać o różnicy między renderowaniem serwerowym a hydratacją na kliencie podczas pisania testów

3. **SEO**
   - Utrzymywać kompletny zestaw meta tagów w szablonie layoutu, aby zapewnić spójność między stronami
   - Używać dynamicznych wartości dla meta tagów opierających się na treści strony

## 5. Alternatywy do rozważenia

Jeśli problemy z hydratacją komponentów Radix UI będą trudne do rozwiązania, można rozważyć:

1. **Użycie alternatywnej biblioteki UI**
   - Biblioteki z mniejszą zależnością od kontekstu React mogą być bardziej kompatybilne z częściową hydratacją

2. **Przepisanie komponentów na natywne komponenty Astro+React**
   - Stworzenie własnych komponentów zakładek specyficznie dla potrzeb projektu

3. **Zastosowanie pełnej hydratacji**
   - W niektórych przypadkach może być prostsze używanie pełnej hydratacji (`client:only`) dla bardziej złożonych komponentów UI 