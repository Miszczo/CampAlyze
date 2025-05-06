# Raport z przeprowadzenia testów E2E dla funkcjonalności logowania

## Podsumowanie

Przeprowadzono testy end-to-end dla funkcjonalności logowania w aplikacji campAlyze. Testy wykazały kilka problemów związanych z integracją komponentu formularza logowania z systemem mockowania API w środowisku testowym.

## Wykonane scenariusze testowe

Testy obejmowały następujące scenariusze:

1. **Logowanie z prawidłowymi danymi (US-002)** - Test sprawdzający, czy użytkownik może zalogować się z poprawnymi danymi i zostać przekierowany na stronę dashboard.
2. **Logowanie z nieprawidłowym hasłem (US-002)** - Test sprawdzający, czy system wyświetla odpowiedni komunikat błędu przy niepoprawnym haśle.
3. **Logowanie z nieistniejącym kontem (US-002)** - Test sprawdzający, czy system wyświetla odpowiedni komunikat błędu przy próbie logowania na nieistniejące konto.
4. **Logowanie na niezweryfikowane konto (US-002)** - Test sprawdzający, czy system wyświetla odpowiedni komunikat i przycisk do ponownego wysłania weryfikacji.
5. **Blokada konta po 5 nieudanych próbach (US-002)** - Test sprawdzający mechanizm blokady konta po 5 nieudanych próbach logowania.
6. **Nawigacja do formularza odzyskiwania hasła** - Test sprawdzający poprawność nawigacji do formularza odzyskiwania hasła.
7. **Nawigacja do formularza rejestracji** - Test sprawdzający poprawność nawigacji do formularza rejestracji.
8. **Walidacja pustych pól** - Test sprawdzający, czy formularz wyświetla błędy walidacji dla pustych pól.

## Wyniki testów

### Testy, które zakończyły się sukcesem:
- Nawigacja do formularza odzyskiwania hasła
- Nawigacja do formularza rejestracji
- Walidacja pustych pól

### Testy, które zakończyły się niepowodzeniem:
- Logowanie z prawidłowymi danymi (US-002)
- Logowanie z nieprawidłowym hasłem (US-002)
- Logowanie z nieistniejącym kontem (US-002)
- Logowanie na niezweryfikowane konto (US-002)
- Blokada konta po 5 nieudanych próbach (US-002)

## Zidentyfikowane problemy

1. **Problem z mockowaniem API** - Żądania API nie są prawidłowo przechwytywane przez MSW, co skutkuje tym, że zamiast symulowanych odpowiedzi z mocka, żądania trafiają do rzeczywistego API Supabase.

2. **Brak odpowiedzi z mockowanego API** - Mimo prób przekierowania żądań do lokalnego serwera MSW, odpowiedzi nie są poprawnie generowane lub nie są odbierane przez aplikację.

3. **Problemy z wyświetlaniem komunikatów błędów** - Element `login-alert-error` nie jest wyświetlany po nieudanej próbie logowania, mimo że testy jednostkowe wskazują, że komponent LoginForm powinien go wyświetlać.

4. **Problemy z przekierowaniem po zalogowaniu** - Test oczekuje przekierowania do `/dashboard`, ale nie następuje ono w środowisku testowym.

## Przyczyny problemów

Na podstawie analizy logów i konfiguracji ustalono następujące przyczyny:

1. **Nieprawidłowa konfiguracja przechwytywania żądań** - Mimo modyfikacji pliku `intercept-setup.ts`, żądania nadal nie są przechwytywane przez MSW. Widoczne jest, że wysyłane żądania otrzymują odpowiedź 401 (Unauthorized) z API Supabase zamiast z mockowanego serwera.

2. **Konflikty portów i przekierowań** - Aplikacja działa na porcie 3003, ale żądania mogą być przekierowywane nieprawidłowo lub przechwytywane przez inne middleware.

3. **Problemy z typowaniem w handlerach MSW** - Występują błędy typowania w handlerach, które mogą powodować nieprawidłowe przetwarzanie żądań.

## Sugestie rozwiązania

1. **Zmiana podejścia do mockowania API**:
   - Należy zrezygnować z przekierowywania żądań i zastosować natywne mechanizmy mockowania w Playwright.
   - Rozważyć użycie `page.route()` bezpośrednio w testach zamiast globalnej konfiguracji.

2. **Uproszczenie struktury testów**:
   ```typescript
   test('powinien zalogować się z poprawnymi danymi', async ({ page }) => {
     await page.route('**/api/auth/signin', async (route) => {
       return route.fulfill({
         status: 200,
         contentType: 'application/json',
         body: JSON.stringify({ success: true })
       });
     });
     
     // reszta testu
   });
   ```

3. **Zmiana struktury projektu testowego**:
   - Oddzielić testy jednostkowe komponentów od testów E2E.
   - Użyć dedykowanego środowiska testowego z własną bazą danych lub aplikację testową.

4. **Debugowanie komunikacji serwer-klient**:
   - Dodać więcej logów po stronie serwera w endpointach API.
   - Sprawdzić czy żądania CORS są prawidłowo obsługiwane.

## Kolejne kroki

1. Implementacja zaproponowanych zmian w konfiguracji mockowania API.
2. Refaktoryzacja testów E2E z przeniesieniem logiki mockowania do poszczególnych testów.
3. Dodanie testów integracyjnych z prawdziwą bazą danych testową.
4. Uzupełnienie dokumentacji testowej o szczegółowe instrukcje uruchamiania w różnych środowiskach. 