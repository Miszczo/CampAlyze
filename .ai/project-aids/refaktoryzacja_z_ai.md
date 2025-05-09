---

### `lekcja_13_refaktoryzacja_ai.md`

```markdown
# Lekcja 13: Refaktoryzacja Projektu z AI

**Cel:** Wykorzystanie modeli AI do identyfikacji obszarów wymagających refaktoryzacji, generowania sugestii zmian oraz wsparcia w implementacji ulepszeń w kodzie.

**Kluczowe Koncepcje i Techniki:**

- **"AI Detektyw":** Użycie AI (np. w trybie agenta w Cursorze, Copilot w VS Code Insiders) do analizy kodu w określonym folderze/module.
  - Prompt: "Zapoznaj się z plikami w @components. Zidentyfikuj TOP 5 plików z największą liczbą linii kodu. Dla każdego zasugeruj kierunki refaktoryzacji (wzorce, techniki) bazując na @tech-stack.md."
- **Single Responsibility Principle (SRP):** Zasada mówiąca, że klasa/komponent powinien mieć tylko jeden powód do zmiany. Częsty cel refaktoryzacji.
- **Refaktoryzacja Formularzy:**
  - Problem: Komponenty formularzy robią zbyt wiele (stan, walidacja, komunikacja z API, UI).
  - Rozwiązanie: Wyniesienie logiki (walidacja, obsługa błędów, zapytania API) do osobnych hooków, serwisów. Użycie bibliotek jak **Zod** (walidacja schematów) i **React Hook Form** (zarządzanie stanem formularza, walidacja).
- **Responsywny Interfejs Użytkownika (RUI):**
  - Problem: UI nie dostosowuje się do różnych rozmiarów ekranu. Ogólnikowe polecenia dla AI ("zrób responsywny interfejs") są nieskuteczne.
  - Podejście:
    1.  Analiza z AI: Dostarcz screenshot/opis problemu, kontekst technologiczny. Poproś AI o sugestie rozwiązań (np. Claude 3.5 Sonnet).
    2.  Ocena Propozycji: Poproś AI o ocenę rozwiązań pod kątem UX/dostępności.
    3.  Specyfikacja Biznesowa: Utwórz specyfikację zmian (bez implementacji, z referencjami do komponentów), np. `.ai/ui/mobile-navigation.md`.
    4.  Implementacja z AI: Poproś AI o implementację na podstawie specyfikacji i kontekstu (`@tech-stack.md`, `@react-development.mdc`).
- **Instrukcje Migracji:** Wykorzystanie oficjalnych przewodników migracji bibliotek/frameworków (np. React 19 Upgrade Guide, Svelte 5 Migration Guide) jako precyzyjnego kontekstu dla AI.
  - Dodaj dokument migracji do projektu lub użyj funkcji "Custom Docs" w edytorze.
  - Prompt: "Zapoznaj się z @R19Migration. Oceń, które komponenty w @rule-builder będą wymagać korekty przy migracji do Reacta 19."
- **Row-Level Security (RLS) w Supabase:** Mechanizm bezpieczeństwa PostgreSQL kontrolujący dostęp do danych na poziomie wierszy.
  - Problem: Bez RLS, przy bezpośrednim dostępie do bazy z frontendu (jak w Supabase SDK), użytkownicy mogą mieć dostęp do wszystkich danych.
  - Rozwiązanie: Włącz RLS dla tabel w Supabase. Zdefiniuj polityki (np. użytkownik może widzieć/edytować tylko swoje dane `auth.uid()`).
  - Implementacja: Użyj AI z promptem i regułami (np. `@supabase-migrations.mdc`, `@database.types.ts`) do wygenerowania migracji SQL. Zaaplikuj migrację: `supabase db push`.

**Implementacja (Przykładowy Prompt Refaktoryzacji Formularza):**
"You are an experienced React developer. Refactor {{COMPONENTS}} using React Hook Form and Zod. Tech Stack: {{TECH_STACK}}.

1. Analyze current components: identify form logic, complexity, API calls.
2. Implement React Hook Form & Zod: explain integration, structure changes.
3. Optimize logic: simplify, improve readability.
4. Manage API calls: suggest moving to service/hook.
5. Outline testing strategy.
   Provide a detailed refactoring plan."

**Rozwiązywanie Problemów / Sugestie:**

- **Jakość Zależy od Doświadczenia:** Im więcej wiesz o projekcie i technologiach, tym lepsze wyniki uzyskasz z AI. AI to partner, nie magiczna różdżka.
- **Iteracja i Korekta:** AI może generować kod wymagający poprawek. Bądź gotów na debugowanie i dostosowywanie.
- **Kontekst dla AI:** Zawsze dostarczaj `tech-stack.md`, relevantne pliki `.mdc` (reguły), fragmenty kodu, których dotyczy refaktoryzacja.
- **Podział Zadań:** Rozdzielaj analizę od implementacji. Najpierw poproś o plan/sugestie, potem o kod.
- **Walidacja Logowania vs Rejestracji:** Upewnij się, że reguły walidacji (np. Zod) dla logowania i rejestracji są spójne i nie blokują użytkowników po założeniu konta.
- **RLS:** Po włączeniu RLS, upewnij się, że wszystkie operacje CRUD mają zdefiniowane odpowiednie polityki. Testuj dostęp do danych jako różni użytkownicy. Zmiany wprowadzaj na wszystkich bazach (lokalna, E2E).
- **Ciągły Proces:** Refaktoryzacja to proces ciągły. Regularnie oceniaj stan projektu.
- **Bezpieczeństwo Zmian:**
  - Commituj często działające zmiany.
  - Rozszerzaj testy automatyczne.
  - Dokumentuj wprowadzone zmiany.
  - Twórz cząstkowe specyfikacje zmian z AI.
```
