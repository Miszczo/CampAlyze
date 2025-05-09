# Lekcja 11: Test Plan i Testy Jednostkowe z Vitest

**Cel:** Stworzenie Test Planu i implementacja testów jednostkowych przy użyciu Vitest, aby zabezpieczyć działające funkcjonalności przed regresją.

**Kluczowe Koncepcje i Narzędzia:**

- **Test Plan:** Dokument definiujący zakres, strategię i metodologię testów. Może być generowany przy pomocy AI (np. Claude 3.5 Sonnet, Gemini 1.5 Pro) z wykorzystaniem narzędzi jak GitIngest lub Google AI Studio (uwaga na politykę prywatności darmowych wersji).
  - Kontekst dla AI: `@Codebase`, `project-prd.md`, `tech-stack.md`.
  - Przykładowy plik z promptem: `test-plan.mdc`.
- **Vitest:** Framework do testów jednostkowych dla projektów opartych o Vite (np. Astro).
- **Mockowanie Zależności:** Izolowanie testowanej jednostki poprzez zastępowanie jej zależności atrapami (mocks).
- **Reguły dla AI (np. `vitest-unit-testing.mdc`):** Instrukcje dla modelu AI dotyczące pisania testów Vitest.

**Implementacja (Główne Kroki):**

1.  **Stworzenie Test Planu:**
    - Użyj AI (np. Claude w konsoli Anthropic, Gemini w Google AI Studio) z dostępem do kodu (np. przez GitIngest lub @Codebase).
    - Zdefiniuj typy testów (jednostkowe, E2E), narzędzia, kluczowe scenariusze.
2.  **Konfiguracja Środowiska Vitest:**
    - Zainstaluj Vitest i potrzebne zależności (`npm install -D vitest @testing-library/react` itp.).
    - Skonfiguruj Vitest (np. w `vite.config.ts` lub dedykowanym pliku).
3.  **Pisanie Testów Jednostkowych z AI:**
    - **Identyfikacja Kandydatów:** Poproś AI o analizę komponentu/modułu i wskazanie funkcji/logiki do przetestowania jednostkowo. Np. "W formacie ASCII przedstaw strukturę komponentów i zależności rozpoczynając od @RulePreview.tsx. Które elementy warto przetestować unitami i dlaczego?"
    - **Generowanie Testów:** Użyj AI z regułami (np. `vitest-unit-testing.mdc`) do napisania testów dla wybranej logiki (np. `RulesBuilderService.generateRulesContent()`).
    - **Kontekst dla AI:** Kod testowanego komponentu/funkcji, jego zależności, oczekiwane zachowanie, warunki brzegowe.
    - **Korekta:** Zweryfikuj i popraw wygenerowane testy (np. usuń zbędne, popraw typy).

**Rozwiązywanie Problemów / Sugestie:**

- **Tryb "Watch" w Testach:** Domyślnie Vitest może uruchamiać się w trybie "watch". Dla pracy z AI, gdzie agent uruchamia testy, lepszy jest tryb jednorazowego uruchomienia.
  - W `package.json` zmień skrypt testowy: `"test": "vitest run"`.
- **Dokładność AI:** Modele nie "czytają w myślach". Dostarczaj jasny kontekst, specyfikę kodu, co mockować.
- **Zależności:** Jasno komunikuj AI, które zależności mają być mockowane, a które nie.
- **Google AI Studio (Prywatność):** Darmowe użycie modeli wiąże się z udostępnianiem konwersacji. Dla projektów komercyjnych używaj płatnych integracji lub edytorów z "Privacy Mode".
- **Wybór Elementów do Testowania:** Nie wszystko nadaje się do testów jednostkowych. Skupiaj się na logice biznesowej, funkcjach przetwarzających dane, warunkach brzegowych. UI lepiej testować komponentowo lub E2E.
