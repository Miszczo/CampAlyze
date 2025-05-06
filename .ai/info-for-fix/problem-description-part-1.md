Na podstawie dostarczonych logów z testów oraz podsumowania agenta, zidentyfikowałem następujące problemy i przygotowałem szczegółowy plan naprawczy.

## Zidentyfikowane Problemy Główne:

1.  **Błędy Konfiguracji Środowiska Testowego / Importu Modułów:**
    *   Niepoprawne ścieżki importu dla komponentów `LoginForm` i jego podkomponentów.
    *   Konflikt między konfiguracją Vitest a testami E2E Playwright.
    *   Problem z mockowaniem modułu `crypto` w teście `upload.test.ts`.
2.  **Błędy w Logice Hooka `useLoginForm` i Jego Testach:**
    *   `TypeError: Failed to parse URL from /api/auth/...`: Błąd parsowania URL dla `fetch` w środowisku testowym Node.js.
    *   Ostrzeżenia `act(...)`: Aktualizacje stanu React poza blokiem `act`.
    *   Błędy asercji dotyczące mocków (spy not called / incorrect arguments).
    *   Błędy asercji dotyczące inicjalizacji stanu na podstawie `initialMessage` oraz oczekiwanych komunikatów błędów.
3.  **Problemy z Testami Klienta API OpenRouter (`api-client.test.ts`):**
    *   Niepoprawne działanie mocków `fetch` prowadzące do tego, że obietnice rozwiązują się zamiast odrzucać w przypadkach błędów (np. RateLimitError, ModelUnavailableError).
    *   Problem z testowaniem logiki ponawiania prób przy błędach sieciowych.
4.  **Ogólne Błędy Sieciowe w Testach Komponentów:**
    *   Występowanie nieobsłużonych błędów sieciowych (`Error: Network Error`, `Error: Network request failed`) w testach komponentów UI, co sugeruje brakujące lub niepoprawne mockowanie `fetch`.

## Szczegółowy Plan Naprawczy:

### Kategoria 1: Błędy Konfiguracji Środowiska Testowego / Importu Modułów

#### 1.1. Problem: Błędne ścieżki importu dla komponentów `LoginForm`
    *   **Pliki:**
        *   `src/components/LoginForm/__tests__/LoginForm.test.tsx`
        *   `src/components/LoginForm/__tests__/LoginFormActions.test.tsx`
        *   `src/components/LoginForm/__tests__/LoginFormAlerts.test.tsx`
        *   `src/components/LoginForm/__tests__/LoginFormFields.test.tsx`
        *   `src/components/LoginForm/__tests__/LoginFormFooter.test.tsx`
    *   **Komunikat błędu:** `Error: Failed to resolve import "../LoginForm" from "..."` (i analogiczne dla innych komponentów).
    *   **Przyczyna:** Testy próbują importować komponenty ze ścieżki względnej (`../LoginForm`), która nie prowadzi do istniejącego pliku lub modułu. Prawdopodobnie pliki komponentów (`LoginForm.tsx`, `LoginFormActions.tsx` itd.) znajdują się bezpośrednio w katalogu `src/components/LoginForm/`.
    *   **Rozwiązanie:**
        1.  **Weryfikacja struktury plików:** Upewnij się, że pliki komponentów (np. `LoginForm.tsx`, `LoginFormActions.tsx`) istnieją w katalogu `src/components/LoginForm/`.
        2.  **Poprawa importów:** W plikach testowych zmień ścieżki importu.
            *   Przykład dla `src/components/LoginForm/__tests__/LoginForm.test.tsx`:
                ```typescript
                // Zamiast:
                // import { LoginForm } from "../LoginForm";
                // Poprawnie (jeśli LoginForm.tsx jest w src/components/LoginForm/):
                import { LoginForm } from '../LoginForm'; // lub '../LoginForm.tsx' jeśli nie ma index.ts
                ```
            *   Analogicznie dla pozostałych plików testowych w `src/components/LoginForm/__tests__/`, np. dla `LoginFormActions.test.tsx`:
                ```typescript
                // Zamiast:
                // import { LoginFormActions } from "../LoginFormActions";
                // Poprawnie:
                import { LoginFormActions } from '../LoginFormActions';
                ```
            *   **Alternatywa:** Jeśli w `src/components/LoginForm/` istnieje plik `index.ts` (lub `index.tsx`) eksportujący wszystkie te komponenty, import powinien wyglądać tak:
                ```typescript
                import { LoginForm, LoginFormActions /*, etc. */ } from '..';
                ```

#### 1.2. Problem: Konflikt między Vitest a testami E2E Playwright
    *   **Pliki:**
        *   `tests/e2e/login.spec.ts`
        *   `tests/e2e/resend-verification.spec.ts`
    *   **Komunikat błędu:** `Error: Playwright Test did not expect test.describe() to be called here.`
    *   **Przyczyna:** Vitest próbuje uruchomić pliki testowe Playwright, które używają składni (`test.describe()`) specyficznej dla Playwright i niekompatybilnej z Vitest.
    *   **Rozwiązanie:**
        1.  **Wykluczenie plików E2E z Vitest:** W konfiguracji Vitest (`vite.config.ts` lub `vitest.config.ts`) dodaj regułę wykluczającą katalog z testami E2E.
            ```typescript
            import { defineConfig } from 'vitest/config';
            import { configDefaults } from 'vitest/config';

            export default defineConfig({
              test: {
                // ... inne opcje
                exclude: [
                  ...configDefaults.exclude,
                  'tests/e2e/**/*', // Wyklucz wszystkie pliki w tests/e2e
                ],
              },
            });
            ```
        2.  **Oddzielne skrypty uruchamiania:** Upewnij się, że masz oddzielne skrypty w `package.json` do uruchamiania testów Vitest i testów Playwright.

#### 1.3. Problem: Błąd mockowania modułu `crypto`
    *   **Plik:** `src/pages/api/imports/upload.test.ts` (pośrednio wpływa na `upload.ts`)
    *   **Komunikat błędu:** `Error: [vitest] No "default" export is defined on the "crypto" mock. Did you forget to return it from "vi.mock"?`
    *   **Przyczyna:** Plik `upload.ts` importuje `randomUUID` jako nazwany export z modułu `crypto`. Mock modułu `crypto` w teście nie dostarcza tej funkcji poprawnie.
    *   **Rozwiązanie:** Popraw mockowanie modułu `crypto` w pliku `upload.test.ts` (lub w globalnym pliku setup dla testów, jeśli jest to potrzebne szerzej).
        ```typescript
        // W pliku src/pages/api/imports/upload.test.ts lub pliku setup
        import { vi } from 'vitest';

        vi.mock('crypto', async (importOriginal) => {
          const actual = await importOriginal(); // Aby zachować inne funkcjonalności, jeśli są potrzebne
          return {
            ...actual,
            randomUUID: vi.fn(() => 'mocked-test-uuid-12345'), // Dostarcz mock dla randomUUID
          };
        });

        // Alternatywnie, jeśli tylko randomUUID jest używane i reszta nie jest potrzebna:
        // vi.mock('crypto', () => ({
        //   randomUUID: vi.fn(() => 'mocked-test-uuid-12345'),
        // }));
        ```

### Kategoria 2: Błędy w Logice Hooka `useLoginForm` i Jego Testach

#### 2.1. Problem: `TypeError: Failed to parse URL from /api/auth/...`
    *   **Pliki:**
        *   `src/components/hooks/useLoginForm.ts`
        *   `src/components/hooks/__tests__/useLoginForm.test.ts` (wiele testów)
    *   **Komunikat błędu:** `TypeError: Failed to parse URL from /api/auth/signin` oraz `TypeError: Failed to parse URL from /api/auth/resend-verification`
    *   **Przyczyna:** Funkcja `fetch` w środowisku Node.js (domyślnym dla Vitest) wymaga pełnego adresu URL. Użycie względnej ścieżki (np. `/api/auth/signin`) powoduje błąd, ponieważ brakuje domeny bazowej.
    *   **Rozwiązanie:**
        1.  **Mockowanie `fetch`:** Najlepszym rozwiązaniem jest konsekwentne mockowanie globalnego `fetch` w testach, które wykonują zapytania API. Można to zrobić za pomocą `vi.spyOn(global, 'fetch')` lub użyć biblioteki takiej jak `msw` (Mock Service Worker) dla bardziej zaawansowanego mockowania.
        2.  **Dla `useLoginForm.test.ts`:** W sekcji `beforeEach` lub na początku każdego testu, który wywołuje `onSubmit` lub `handleResendVerification`, zmockuj `fetch`:
            ```typescript
            // Na początku pliku testowego
            const mockFetch = vi.spyOn(global, 'fetch');

            // Wewnątrz testu, przed wywołaniem funkcji z hooka
            // Przykład dla udanego logowania
            mockFetch.mockResolvedValueOnce({
              ok: true,
              json: async () => ({ success: true }), // Lub cokolwiek API zwraca
              status: 200,
            } as Response);

            // Przykład dla błędu "user not found" (który powodował błąd parsowania URL)
            // Teraz mockujemy, że fetch się powiedzie, ale API zwraca błąd
            mockFetch.mockResolvedValueOnce({
              ok: false, // lub true, zależnie jak API jest zbudowane
              json: async () => ({ error: "User not found", status: 404 }), // Dopasuj do odpowiedzi API
              status: 404, // lub inny odpowiedni status
            } as Response);
            ```
        3.  Upewnij się, że `useLoginForm.ts` używa `fetch` w sposób, który można łatwo mockować. Jeśli `signIn` z `next-auth/react` jest używany, to mockuj `signIn` bezpośrednio. Logi wskazują, że `onSubmit` w `useLoginForm.ts:44` i `handleResendVerification` w `useLoginForm.ts:103` bezpośrednio używają `fetch`.

#### 2.2. Problem: Ostrzeżenia `act(...)`
    *   **Pliki:**
        *   `src/components/hooks/useLoginForm.test.ts` (kilka testów)
        *   `src/components/auth/ResendVerification.test.tsx`
    *   **Komunikat błędu:** `An update to TestComponent inside a test was not wrapped in act(...).`
    *   **Przyczyna:** Asynchroniczne operacje (np. `fetch`, aktualizacje stanu po rozwiązaniu Promisy) powodują aktualizacje stanu React, które nie są opakowane w `act(...)` z `@testing-library/react`.
    *   **Rozwiązanie:**
        1.  Wszystkie wywołania funkcji, które prowadzą do asynchronicznych aktualizacji stanu, powinny być opakowane w `await act(async () => { ... });`.
            ```typescript
            // Przykład dla src/components/hooks/useLoginForm.test.ts
            import { act, renderHook } from '@testing-library/react';
            // ...

            it('should handle form submission with verification required', async () => {
              // ... mockFetch setup ...
              const { result } = renderHook(() => useLoginForm());

              await act(async () => {
                await result.current.onSubmit({ email: 'test@example.com', password: 'password' });
              });

              expect(result.current.requiresVerification).toBe(true);
              // ... inne asercje
            });
            ```
        2.  Podobnie dla testów komponentów, np. `fireEvent.click` na przycisku, który wywołuje asynchroniczną akcję:
            ```typescript
            // Przykład dla src/components/auth/ResendVerification.test.tsx
            await act(async () => {
              fireEvent.click(screen.getByRole('button', { name: /resend/i }));
            });
            // Asercje po zakończeniu operacji
            ```

#### 2.3. Problem: Błędy asercji dotyczące mocków (spy not called / incorrect arguments)
    *   **Pliki:**
        *   `src/components/hooks/__tests__/useLoginForm.test.ts` (wiele testów)
        *   `src/components/hooks/useLoginForm.test.ts` (jeden test dotyczący `mockFetch`)
    *   **Komunikat błędu:** `expected "spy" to be called with arguments: [...] Number of calls: 0`
    *   **Przyczyna:** Głównie spowodowane przez wcześniejszy błąd `Failed to parse URL`. Jeśli `fetch` rzuca błąd na etapie tworzenia URL, to mockowane funkcje `signIn` (z `next-auth/react` lub własny mock `fetch`) nie są w ogóle wywoływane lub są wywoływane w nieoczekiwany sposób.
    *   **Rozwiązanie:**
        1.  **Napraw problem 2.1 (Failed to parse URL) jako priorytet.** To powinno rozwiązać większość tych problemów.
        2.  **Weryfikacja mocków:** Po naprawie problemu 2.1, jeśli błędy nadal występują:
            *   Upewnij się, że mockujesz odpowiednie funkcje (`fetch`, `signIn` z `next-auth/react`, itp.).
            *   Sprawdź, czy argumenty przekazywane do mockowanych funkcji w kodzie (`useLoginForm.ts`) zgadzają się z tymi oczekiwanymi w asercjach (`expect(mockSignIn).toHaveBeenCalledWith(...)`).
            *   Dla `src/components/hooks/useLoginForm.test.ts > ... > should handle resend verification success`: upewnij się, że `mockFetch` jest poprawnie skonfigurowany i że asercja `toHaveBeenCalledWith` sprawdza poprawny URL (np. `/api/auth/resend-verification`, a nie pełny URL jeśli mockujesz tylko ścieżkę) i opcje.

----------
ciąg dalszy w @problem-description-part-2.md