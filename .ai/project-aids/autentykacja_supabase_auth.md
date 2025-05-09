# Lekcja 10: Autentykacja z Supabase Auth

**Cel:** Implementacja systemu logowania i rejestracji użytkowników za pomocą Supabase Auth w aplikacji webowej (Astro/React).

**Kluczowe Koncepcje i Narzędzia:**

- **Supabase Auth:** Gotowe rozwiązanie do autentykacji (email/hasło, OAuth, magic link), zarządzanie użytkownikami, integracja z PostgreSQL, Row Level Security (RLS).
- **User Stories (np. `project-prd.md`):** Definiowanie wymagań funkcjonalnych (kto, co, dlaczego) np. dostęp do kolekcji reguł tylko dla zalogowanych.
- **Specyfikacja Architektury (np. `.ai/auth-spec.md`):** Plan implementacji generowany z AI, opisujący zmiany w UI, logikę backendu, integrację z Supabase.
- **Diagramy Mermaid:** Tekstowa reprezentacja architektury, przepływów, np. generowana przez AI na podstawie `project-prd.md` i `auth-spec.md`. (np. `mermaid-diagram-auth.mdc`).
- **Reguły dla AI (np. `supabase-auth.mdc`):** Plik z instrukcjami dla modelu AI, jak przeprowadzić integrację.
- **Podejście Krokowe:** Analiza -> Planowanie -> UI -> Endpointy API -> Integracja Supabase -> Testy.

**Implementacja (Główne Kroki):**

1.  **Aktualizacja User Stories:** Doprecyzuj, które funkcje wymagają logowania.
2.  **Planowanie Architektury:** Wykorzystaj AI do stworzenia `auth-spec.md` i diagramów Mermaid.
3.  **Frontend (UI):**
    - Stwórz strony/komponenty React dla logowania (`LoginForm.tsx`, `login.astro`), rejestracji (`SignupForm.tsx`, `signup.astro`), odzyskiwania hasła.
    - Wykorzystaj AI z regułami (np. `@astro.mdc`, `@react.mdc`).
4.  **Backend (API Endpoints w Astro):**
    - Zintegruj formularze z endpointami Astro.
    - Wykorzystaj `supabase.client.ts` i reguły `supabase-auth.mdc` do interakcji z Supabase Auth (logowanie, rejestracja).
    - Obsłuż błędy i feedback dla użytkownika.
5.  **Layout:** Zaktualizuj główny layout (`Layout.astro`) o wyświetlanie statusu użytkownika i przycisk wylogowania.
6.  **Zabezpieczenie Stron:** Chroń strony/komponenty wymagające autentykacji (np. przekierowanie niezalogowanych).

**Rozwiązywanie Problemów / Sugestie:**

- **Zmienne Środowiskowe:** Przechowuj klucze Supabase (`SUPABASE_URL`, `SUPABASE_PUBLIC_KEY`) w plikach `.env` i dodaj je do `.gitignore` oraz `.cursorignore` (lub odpowiednika). Przekazuj je bezpiecznie (np. sekrety w CI/CD).
- **Renderowanie Stron w Astro:** Jeśli używasz `Astro.request.headers` (np. w middleware do sprawdzania sesji), strona musi być renderowana serwerowo.
  - Opcja 1: `output: "server"` w `astro.config.mjs` (dla całej aplikacji).
  - Opcja 2: `export const prerender = false;` na konkretnych stronach Astro.
- **Błędy AI:** Dziel zadania na mniejsze. Dostarczaj precyzyjny kontekst (wymagania, stack, istniejący kod, logi błędów). Iteruj, koryguj.
- **Rejestracja (Supabase):** Domyślnie Supabase wysyła email potwierdzający. Poinformuj o tym użytkownika. Dla baz lokalnych, ten krok może być pominięty/inny.
- **Logowanie na Stronie Głównej:** Upewnij się, że PRD jasno określa, czy strona główna wymaga logowania. Jeśli tak, zaimplementuj to.
- **"Vertical Slicing":** Po zaimplementowaniu jednej pełnej funkcji (UI, API, Auth dla np. logowania), AI łatwiej zreplikuje wzorzec dla podobnych (np. rejestracja).

**Bezpieczeństwo Danych Wrażliwych (Praca z AI):**

1.  **Świadomość:** Modele nie są globalną bazą. Firmy filtrują dane.
2.  **Opcje Prywatności:** Włącz w narzędziach AI (Cursor, Copilot, ChatGPT).
3.  **Pliki Wykluczeń:** Używaj `.gitignore`, `.cursorignore`, itp.
4.  **Przechowywanie Sekretów:** NIE w kodzie/repozytorium. Używaj zmiennych środowiskowych, sekretów CI/CD, Vaulta.
5.  **Anonimizacja:** Unikaj konkretnych danych wrażliwych w promptach.
