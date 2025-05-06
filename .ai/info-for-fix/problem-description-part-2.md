kontynuacja z problem-description-part-1.md

#### 2.4. Problem: Błędy asercji dotyczące `initialMessage` i komunikatów błędów
    *   **Plik:** `src/components/hooks/useLoginForm.test.ts`
    *   **Komunikaty błędów:**
        *   `AssertionError: expected null to be 'Test error message'`
        *   `AssertionError: expected null to be 'Test success message'`
        *   `AssertionError: expected 'Email not verified' to contain 'verify your email address'`
    *   **Przyczyna:**
        *   Dla `initialMessage`: Hook `useLoginForm` prawdopodobnie nie inicjalizuje poprawnie stanów `error` i `successMessage` na podstawie przekazanego propa `initialMessage`.
        *   Dla komunikatu "Email not verified": Oczekiwany komunikat błędu w teście różni się od rzeczywistego komunikatu ustawianego przez hook (który może pochodzić z mockowanej odpowiedzi API).
    *   **Rozwiązanie:**
        1.  **Logika `initialMessage` w `useLoginForm.ts`:**
            Sprawdź implementację hooka. Powinna zawierać logikę podobną do:
            ```typescript
            // w useLoginForm.ts
            interface UseLoginFormProps {
              initialMessage?: { type: 'error' | 'success'; text: string };
              // ... inne propsy
            }

            export function useLoginForm(props?: UseLoginFormProps) {
              const [error, setError] = useState<string | null>(
                props?.initialMessage?.type === 'error' ? props.initialMessage.text : null
              );
              const [successMessage, setSuccessMessage] = useState<string | null>(
                props?.initialMessage?.type === 'success' ? props.initialMessage.text : null
              );
              // ... reszta logiki
            }
            ```
        2.  **Komunikat "Email not verified":**
            *   **Opcja A (Preferowana, jeśli komunikat jest spójny):** Zmień asercję w teście, aby pasowała do rzeczywistego komunikatu.
                ```typescript
                // w src/components/hooks/useLoginForm.test.ts
                // Zamiast:
                // expect(result.current.error).toContain("verify your email address");
                // Poprawnie (jeśli API/mock zwraca "Email not verified"):
                expect(result.current.error).toBe("Email not verified");
                ```
            *   **Opcja B:** Jeśli UI ma wyświetlać "verify your email address", a API zwraca "Email not verified", to hook lub komponent powinien transformować ten komunikat. Wtedy test hooka powinien sprawdzać komunikat z API, a test komponentu powinien sprawdzać finalny komunikat w UI. W tym przypadku, jeśli testujemy hooka, asercja powinna odpowiadać temu, co hook bezpośrednio ustawia.

### Kategoria 3: Problemy z Testami Klienta API OpenRouter (`api-client.test.ts`)

#### 3.1. Problem: Obietnice rozwiązują się zamiast odrzucać dla błędów API
    *   **Plik:** `src/lib/ai/openrouter/api-client.test.ts`
    *   **Testy:**
        *   `should throw RateLimitError for 429 responses`
        *   `should throw ModelUnavailableError for model unavailable errors`
    *   **Komunikat błędu:** `AssertionError: promise resolved "{ result: 'success' }" instead of rejecting`
    *   **Przyczyna:** Mock `fetch` w tych testach nie jest poprawnie skonfigurowany do symulowania odpowiedzi błędów (np. status 429). Zamiast tego zwraca odpowiedź, która jest interpretowana jako sukces przez logikę klienta.
    *   **Rozwiązanie:** Popraw mocki `fetch` w tych testach, aby zwracały `Response` z odpowiednim statusem błędu i, jeśli to konieczne, ciałem odpowiedzi JSON.
        ```typescript
        // Przykład dla RateLimitError (429)
        it('should throw RateLimitError for 429 responses', async () => {
          global.fetch = vi.fn(() =>
            Promise.resolve({
              ok: false,
              status: 429,
              headers: new Headers({ 'retry-after': '60' }),
              json: async () => ({ error: { message: 'Too Many Requests' } }),
              text: async () => JSON.stringify({ error: { message: 'Too Many Requests' } }),
            } as Response)
          );
          const client = new OpenRouterApiClient('test-key');
          await expect(client.sendRequest('/endpoint', {})).rejects.toThrow(RateLimitError);
        });

        // Przykład dla ModelUnavailableError (np. status 404 lub specyficzny kod błędu w ciele)
        it('should throw ModelUnavailableError for model unavailable errors', async () => {
          global.fetch = vi.fn(() =>
            Promise.resolve({
              ok: false,
              status: 404, // lub inny status wskazujący na błąd
              json: async () => ({ error: { code: 'model_not_found', message: 'Model not found' } }),
              text: async () => JSON.stringify({ error: { code: 'model_not_found', message: 'Model not found' } }),
            } as Response)
          );
          const client = new OpenRouterApiClient('test-key');
          await expect(client.sendRequest('/endpoint', { model: 'nonexistent-model' })).rejects.toThrow(ModelUnavailableError);
        });
        ```

#### 3.2. Problem: Błąd testu ponawiania prób przy błędach sieciowych
    *   **Plik:** `src/lib/ai/openrouter/api-client.test.ts`
    *   **Test:** `should retry on network errors`
    *   **Komunikat błędu:** `NetworkError: Request failed ... Caused by: Error: Network error`
    *   **Przyczyna:** Test poprawnie symuluje błąd sieciowy, a klient rzuca `NetworkError`. Jednak test może oczekiwać, że klient ponowi próbę określoną liczbę razy i albo ostatecznie się powiedzie, albo rzuci błąd po wyczerpaniu prób. Obecny błąd wskazuje, że klient rzuca błąd, co jest poprawne, jeśli nie ma udanych ponowień. Problem może leżeć w asercji testu lub w konfiguracji mocka `fetch` do symulowania udanego ponowienia.
    *   **Rozwiązanie:**
        1.  **Zweryfikuj logikę ponawiania:** Upewnij się, że `OpenRouterApiClient` ma zaimplementowaną logikę ponawiania prób.
        2.  **Skonfiguruj mock `fetch` do symulowania ponowień:** Mock `fetch` powinien rzucać błąd sieciowy zadaną liczbę razy, a następnie (jeśli testujemy udane ponowienie) zwrócić sukces.
            ```typescript
            it('should retry on network errors and eventually succeed', async () => {
              let attempt = 0;
              const maxAttempts = 3; // Załóżmy, że klient próbuje 3 razy
              global.fetch = vi.fn(async () => {
                attempt++;
                if (attempt < maxAttempts) {
                  throw new TypeError('Simulated network error'); // Typowy błąd sieciowy
                }
                return {
                  ok: true,
                  status: 200,
                  json: async () => ({ data: 'success after retries' }),
                  text: async () => JSON.stringify({ data: 'success after retries' }),
                } as Response;
              });

              const client = new OpenRouterApiClient('test-key', { retries: maxAttempts -1 }); // lub jakkolwiek konfigurujesz liczbę ponowień
              
              await expect(client.sendRequest('/endpoint', {})).resolves.toEqual({ data: 'success after retries' });
              expect(fetch).toHaveBeenCalledTimes(maxAttempts);
            });

            it('should retry on network errors and fail after max retries', async () => {
              const maxAttempts = 3;
              global.fetch = vi.fn(async () => {
                  throw new TypeError('Simulated network error');
              });

              const client = new OpenRouterApiClient('test-key', { retries: maxAttempts -1 });
              
              await expect(client.sendRequest('/endpoint', {})).rejects.toThrow(NetworkError); // lub specyficzny błąd po ponowieniach
              expect(fetch).toHaveBeenCalledTimes(maxAttempts); // Klient powinien próbować X razy
            });
            ```

### Kategoria 4: Ogólne Błędy Sieciowe w Testach Komponentów

#### 4.1. Problem: Niezamockowane lub źle mockowane `fetch` w testach komponentów UI
    *   **Pliki:**
        *   `src/components/auth/ForgotPasswordForm.test.tsx`
        *   `src/components/auth/ResendVerification.test.tsx`
        *   `src/components/auth/ResetPasswordForm.test.tsx`
        *   `src/components/auth/RegisterForm.test.tsx`
    *   **Komunikat błędu:** `Password reset request failed: Error: Network Error`, `Resend verification failed: Error: Network failed`, etc.
    *   **Przyczyna:** Komponenty te wykonują zapytania `fetch`. W testach, jeśli `fetch` nie jest zmockowany, próbuje wykonać rzeczywiste zapytanie (co zwykle kończy się błędem w środowisku testowym) lub mock `fetch` jest ustawiony na `mockRejectedValue(new Error('Network Error'))`, co jest zbyt generyczne. Testy powinny symulować różne odpowiedzi API (sukces, błędy walidacji, błędy serwera).
    *   **Rozwiązanie:**
        1.  **Użyj `msw` lub mockuj `fetch` w każdym teście:** Dla każdego przypadku testowego (np. udane wysłanie, błąd serwera, błąd walidacji) zmockuj `fetch` tak, aby zwracał odpowiednią odpowiedź `Response`.
            ```typescript
            // Przykład dla ForgotPasswordForm.test.tsx
            // Na początku pliku lub w beforeEach
            const mockFetch = vi.spyOn(global, 'fetch');

            // W teście dla udanego wysłania
            it('powinien wywołać fetch, pokazać sukces...', async () => {
              mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ message: 'Password reset email sent' }),
              } as Response);

              render(<ForgotPasswordForm />);
              // ... interakcje użytkownika ...
              fireEvent.click(screen.getByRole('button', { name: /send/i })); // Dopasuj selektor

              await waitFor(() => {
                expect(screen.getByText(/Password reset email sent/i)).toBeInTheDocument();
              });
              expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/auth/request-password-reset'), expect.any(Object));
            });

            // W teście dla błędu API (np. 404)
            it('powinien pokazać generyczny komunikat sukcesu przy błędzie API (np. 404)...', async () => {
              mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                json: async () => ({ error: 'User not found' }), // API może zwracać błąd
              } as Response);
              // ... reszta testu, asercja na generyczny komunikat jak opisano w teście
            });
            ```
        2.  **Pamiętaj o `act` i `waitFor`:** Interakcje użytkownika i asercje dotyczące zmian w DOM po asynchronicznych operacjach powinny być odpowiednio opakowane.

Ten plan powinien pomóc w systematycznym rozwiązaniu zidentyfikowanych problemów i doprowadzeniu testów do stanu "passing". Ważne jest, aby naprawiać problemy w podanej kolejności, ponieważ niektóre błędy (np. parsowanie URL) blokują inne.