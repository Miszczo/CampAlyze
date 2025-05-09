# Lekcja 12: Testy E2E z Playwright

**Cel:** Implementacja testów End-to-End (E2E) za pomocą Playwright, weryfikujących całościowe ścieżki użytkownika i funkcjonalności biznesowe, na dedykowanej bazie danych.

**Kluczowe Koncepcje i Narzędzia:**

- **Playwright:** Framework do testów E2E, umożliwiający automatyzację interakcji z przeglądarką.
- **Dedykowana Baza E2E (Supabase):** Oddzielna instancja bazy danych dla testów E2E, aby zapewnić izolację i odtwarzalność.
  - Konfiguracja: Utwórz nowy projekt w Supabase, zapisz URL i klucz publiczny.
  - Zmienne Środowiskowe: Przechowuj w `.env.test` (np. `SUPABASE_URL_E2E`, `SUPABASE_PUBLIC_KEY_E2E`, `E2E_USERNAME`, `E2E_PASSWORD`). Dodaj do `.gitignore`.
- **Migracja Schematu:** Użyj Supabase CLI (`supabase link --project-ref <ID_PROJEKTU_E2E>`, `supabase db push`) do zsynchronizowania schematu bazy E2E z bazą deweloperską.
- **Selektory Testowe (`data-testid`):** Dodawaj atrybuty `data-testid` do elementów UI, aby testy były bardziej stabilne i mniej zależne od struktury DOM czy stylów. Dodawaj je _wewnątrz_ komponentów.
- **Page Object Model (POM):** Wzorzec projektowy, gdzie tworzy się obiekty reprezentujące strony (lub większe komponenty) aplikacji, hermetyzujące logikę interakcji z UI.
- **Reguły dla AI (np. `playwright-e2e-testing.mdc`):** Instrukcje dla modelu AI dotyczące pisania testów Playwright.
- **Teardown:** Mechanizm czyszczenia danych/stanu po zakończeniu testów (np. usuwanie rekordów z bazy).

**Implementacja (Główne Kroki):**

1.  **Konfiguracja Bazy E2E:**
    - Stwórz projekt Supabase dla E2E.
    - Zapisz dane dostępowe w `.env.test`.
    - Utwórz testowego użytkownika w Supabase Auth dla E2E.
    - Zsynchronizuj schemat bazy (`supabase db push`).
2.  **Konfiguracja Playwright:**
    - Zainstaluj Playwright (`npm init playwright@latest`).
    - Skonfiguruj `playwright.config.ts` do wczytywania zmiennych z `.env.test` (użyj `dotenv`).
    - Dodaj skrypt w `package.json` do uruchamiania aplikacji w trybie testowym: `"dev:e2e": "astro dev --mode test"`.
3.  **Dodanie Selektorów `data-testid`:** Oznacz kluczowe elementy UI.
4.  **Tworzenie Page Object Modeli (POM):** Zdefiniuj klasy/obiekty dla stron/komponentów biorących udział w testach.
5.  **Pisanie Testów E2E z AI:**
    - Zidentyfikuj scenariusze testowe (na podstawie PRD).
    - Poproś AI o wygenerowanie testów z użyciem POM i reguł `playwright-e2e-testing.mdc`.
6.  **Implementacja Teardown (Czyszczenie Danych):**
    - W `playwright.config.ts` (lub pliku global setup/teardown) dodaj logikę usuwania danych stworzonych podczas testów.
    - Klient Supabase używany do czyszczenia powinien być zalogowany jako ten sam użytkownik E2E, który tworzył dane (aby ominąć problemy z RLS).
    ```typescript
    // Przykład logowania klienta Supabase w teardown
    // const { error: signInError } = await supabase.auth.signInWithPassword({
    //   email: process.env.E2E_USERNAME!,
    //   password: process.env.E2E_PASSWORD!,
    // });
    ```

**Rozwiązywanie Problemów / Sugestie:**

- **Stabilność Selektorów:** Używaj `data-testid` zamiast polegać na klasach CSS czy strukturze DOM.
- **Logowanie w Testach E2E:**
  - Początkowo: Logowanie przez UI w każdym teście.
  - Optymalizacja (dla większej liczby testów):
    - Logowanie programatyczne (przez API) na początku zestawu testów.
    - Zapisywanie i reużywanie stanu sesji (zobacz dokumentację Playwright `auth`).
- **Czyszczenie Danych (Teardown):**
  - **RLS:** Upewnij się, że klient Supabase w skrypcie teardown ma uprawnienia do usuwania danych (np. logując się jako ten sam użytkownik E2E). Nie używaj `SERVICE_ROLE_KEY` na frontendzie lub w testach, jeśli to możliwe.
  - **Praca Zespołowa:** Proste czyszczenie całej tabeli może powodować problemy, gdy wielu deweloperów uruchamia testy równolegle. Rozważ:
    - Niezależni użytkownicy E2E dla każdego dewelopera/brancha.
    - Supabase Branching.
    - Czyszczenie tylko danych stworzonych przez konkretny przebieg testów (np. przez tagowanie danych).
    - Cykliczne, zautomatyzowane czyszczenie (np. o północy).
- **AI i POM:** Naucz AI korzystania z utworzonych POMów, aby generowało bardziej modularne i łatwiejsze w utrzymaniu testy.
