# Dokumentacja testów dla komponentu LoginForm

Ten dokument opisuje strukturę i sposób uruchamiania testów dla zrefaktoryzowanego komponentu LoginForm.

## Struktura komponentów

LoginForm został podzielony na następujące komponenty:

1. **useLoginForm.ts** - Custom hook zarządzający stanem formularza i logiką biznesową
2. **LoginFormAlerts.tsx** - Wyświetla komunikaty błędów i sukcesów
3. **LoginFormFields.tsx** - Pola formularza email i hasło z walidacją
4. **LoginFormActions.tsx** - Przyciski submit i resend verification
5. **LoginFormFooter.tsx** - Link do rejestracji
6. **LoginForm.tsx** - Główny komponent składający wszystkie podkomponenty

## Rodzaje testów

Dla komponentu LoginForm zaimplementowano dwa rodzaje testów:

1. **Testy jednostkowe** - wykorzystujące Vitest i React Testing Library
2. **Testy E2E** - wykorzystujące Playwright

## Struktura testów jednostkowych

Testy jednostkowe znajdują się w następujących lokalizacjach:

- **src/components/hooks/**tests**/useLoginForm.test.ts** - Testy dla custom hooka
- **src/components/LoginForm/**tests**/LoginFormAlerts.test.tsx** - Testy dla komponentu alertów
- **src/components/LoginForm/**tests**/LoginFormFields.test.tsx** - Testy dla pól formularza
- **src/components/LoginForm/**tests**/LoginFormActions.test.tsx** - Testy dla przycisków
- **src/components/LoginForm/**tests**/LoginFormFooter.test.tsx** - Testy dla stopki formularza
- **src/components/LoginForm/**tests**/LoginForm.test.tsx** - Testy dla głównego komponentu

## Struktura testów E2E

Testy E2E znajdują się w następujących lokalizacjach:

- **tests/e2e/login.spec.ts** - Testy E2E dla całego procesu logowania
- **tests/e2e/pages/LoginPage.ts** - Page Object Model dla strony logowania
- **tests/e2e/mocks/handlers.ts** - Handlery MSW do mockowania odpowiedzi API
- **tests/e2e/setup-msw.ts** - Konfiguracja integracji Playwright z MSW

## Uruchamianie testów

### Testy jednostkowe

```bash
# Uruchomienie wszystkich testów jednostkowych
npm run test:unit

# Uruchomienie testów w trybie watch
npm run test:unit:watch

# Uruchomienie testów z UI
npm run test:unit:ui

# Generowanie raportu pokrycia
npm run test:unit:coverage
```

### Testy E2E

```bash
# Uruchomienie wszystkich testów E2E
npm run test:e2e

# Uruchomienie testów E2E z UI
npm run test:e2e:ui

# Uruchomienie generatora kodu dla testów E2E
npm run test:e2e:codegen
```

### Uruchomienie wszystkich testów

```bash
npm run test
```

## Tryby testowania

Aplikacja obsługuje dwa tryby testowania, które można przełączać za pomocą zmiennej środowiskowej `TEST_MODE`:

1. **Mock Mode** (`TEST_MODE=mock`) - wszystkie żądania API są przechwytywane przez MSW, nie ma komunikacji z prawdziwym Supabase
2. **Integration Mode** (`TEST_MODE=integration`) - testy używają prawdziwego API Supabase

Aby uruchomić testy w określonym trybie, należy ustawić zmienną środowiskową:

```bash
# Testy z mockowanym API
TEST_MODE=mock npm run test:e2e

# Testy z prawdziwym API
TEST_MODE=integration npm run test:e2e
```

## Mockowane scenariusze testowe

W testach E2E zmockowano następujące scenariusze:

1. **Pomyślne logowanie** (`verified-user@example.com` / `Password123!`)
2. **Użytkownik niezweryfikowany** (`unverified-user@example.com` / dowolne hasło)
3. **Nieprawidłowe hasło** (`verified-user@example.com` / dowolne hasło poza `Password123!`)
4. **Użytkownik nie istnieje** (dowolny inny adres email)

## Najważniejsze scenariusze testowe

### Testy jednostkowe

- Inicjalizacja stanu formularza
- Obsługa pomyślnego logowania
- Obsługa błędów (401, 404, niezweryfikowany email)
- Obsługa ponownego wysłania emaila weryfikacyjnego
- Renderowanie komponentów UI
- Walidacja formularza
- Obsługa zdarzeń (kliknięcia, zmiany wartości pól)

### Testy E2E

- Happy path: wypełnienie poprawnych danych i pomyślne logowanie
- Walidacja formularza dla pustych pól
- Walidacja formularza dla niepoprawnego formatu emaila
- Obsługa błędu 401 (złe hasło)
- Obsługa błędu 404 (użytkownik nie istnieje)
- Scenariusz wymagający weryfikacji emaila
- Scenariusz z ponownym wysłaniem emaila weryfikacyjnego

## Debugowanie testów

Aby debugować testy E2E:

1. Uruchom testy z opcją `--debug`:

   ```bash
   npx playwright test --debug
   ```

2. Użyj UI Playwright do interaktywnego debugowania:

   ```bash
   npm run test:e2e:ui
   ```

3. Sprawdź logi MSW w konsoli, aby zobaczyć przechwycone żądania.
