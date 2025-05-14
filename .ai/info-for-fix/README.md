# Naprawa testów E2E w aplikacji campAlyze

Ten folder zawiera dokumentację dotyczącą naprawy błędów w testach end-to-end (E2E) aplikacji campAlyze. Poniżej znajduje się krótki opis zawartości poszczególnych plików.

## 1. Analiza błędów

Pliki w tym folderze dokumentują różne aspekty procesu naprawy testów E2E:

### [e2e-tests-fix-plan.md](./e2e-tests-fix-plan.md)

Ten dokument zawiera kompleksowy plan naprawy błędów w testach E2E, w tym:

- Identyfikację problemów
- Analizę przyczyn
- Proponowane rozwiązania
- Plan wdrożenia zmian
- Wnioski i zalecenia na przyszłość

### [implementacja-poprawek.md](./implementacja-poprawek.md)

Szczegółowy opis konkretnych implementacji poprawek, które należy wprowadzić, w tym:

- Kod do naprawy problemu hydratacji komponentów Radix UI
- Kod do dodania atrybutów data-testid do kluczowych elementów
- Kod do aktualizacji selektorów w Page Object Models
- Kod do dodania metadanych SEO do layoutu

### [przebieg-naprawy-testow.md](./przebieg-naprawy-testow.md)

Dokument szczegółowo opisujący przebieg naprawy:

- Wykryte problemy
- Etapy analizy przyczyn
- Proces implementacji poprawek
- Weryfikację poprawek
- Wnioski i rekomendacje na przyszłość

### [zmiany-w-plikach.md](./zmiany-w-plikach.md)

Dokładne zmiany, które należy wprowadzić w poszczególnych plikach:

- src/pages/index.astro
- src/layouts/Layout.astro
- tests/e2e/poms/HomePage.pom.ts
- oraz opcjonalny nowy plik src/components/FeatureTabs.tsx

## 2. Główne problemy i rozwiązania

### Problem 1: Hydratacja komponentów Radix UI w Astro

**Objawy:**

- Błędy w konsoli: `TabsContent must be used within Tabs`

**Rozwiązanie:**

- Zmiana dyrektywy hydratacji z `client:load` na `client:only="react"`
- Alternatywnie: utworzenie dedykowanego komponentu React

### Problem 2: Selektory w testach E2E

**Objawy:**

- Nieznalezione elementy w testach: `Locator: getByRole('tablist')`
- Timeout podczas oczekiwania na elementy

**Rozwiązanie:**

- Dodanie atrybutów `data-testid` do kluczowych elementów
- Aktualizacja selektorów w Page Object Models

### Problem 3: Brakujące metadane SEO

**Objawy:**

- Niepowodzenie testów sprawdzających metadane SEO

**Rozwiązanie:**

- Uzupełnienie meta tagów w Layout.astro
- Dodanie Open Graph i Twitter Card meta tagów

## 3. Podsumowanie

Przeprowadzone zmiany mają na celu rozwiązanie wszystkich napotkanych problemów z testami E2E w aplikacji campAlyze. Po wdrożeniu tych zmian, testy powinny przechodzić pomyślnie, ponieważ:

1. Problem hydratacji Radix UI zostanie rozwiązany przez pełną hydratację komponentów React
2. Selektory będą trafiać w odpowiednie elementy dzięki atrybutom data-testid
3. Testy metadanych SEO będą przechodziły dzięki kompletnym meta tagom

## 4. Wnioski i rekomendacje

Dla przyszłego rozwoju aplikacji campAlyze zalecamy:

1. Używanie dyrektywy `client:only="react"` dla komponentów Radix UI / shadcn-ui
2. Konsekwentne dodawanie atrybutów `data-testid` do wszystkich kluczowych elementów UI
3. Preferowanie selektorów opartych na data-testid nad selektorami opartymi na rolach ARIA
4. Utrzymywanie kompletnych metadanych SEO w szablonie layoutu
5. Dokumentowanie napotkanych problemów i rozwiązań

## 5. Dodatkowe kroki diagnostyczne

- W przypadku niepowodzenia testów E2E, sprawdź zawartość folderu `playwright-report` w katalogu głównym projektu:
  - Otwórz plik `playwright-report/index.html` w przeglądarce, aby zobaczyć podsumowanie i szczegóły przebiegu testów.
  - Przejrzyj folder `playwright-report/trace`, aby analizować zapisane ścieżki wykonania (trace) w celu dokładnego zbadania punktów awarii.
  - Przejdź do folderu `playwright-report/data`, aby zapoznać się z dodatkowymi logami, zrzutami ekranów i innymi artefaktami generowanymi przez Playwright.
  - Zalecenie dla modelu LLM: uwzględnij analizę zawartości folderu `playwright-report` przy diagnozie problemów z testami E2E.

## 6. Uruchamianie tylko zmienionych testów

Po wprowadzeniu zmian w następujących plikach aplikacji i POM:

- `src/pages/index.astro`
- `src/pages/login.astro`
- `src/pages/register.astro`
- `tests/e2e/poms/HomePage.pom.ts`

możesz uruchomić tylko odpowiadające im specyfikacje E2E, aby przyspieszyć weryfikację:

```bash
npx playwright test tests/e2e/home.spec.ts tests/e2e/login.spec.ts tests/e2e/resend-verification.spec.ts
```

Alternatywnie, możesz dodać skrypt do `package.json`:

```json
"scripts": {
  // ... istniejące skrypty ...
  "test:e2e:changed": "playwright test tests/e2e/home.spec.ts tests/e2e/login.spec.ts tests/e2e/resend-verification.spec.ts"
}
```

Wtedy uruchomienie będzie wyglądać tak:

```bash
npm run test:e2e:changed
```
