# Raport z rozwiązania problemów testów E2E z Mock Service Worker

## Zidentyfikowane problemy

1. **Nieprawidłowe przechwytywanie żądań API** - MSW poprawnie się uruchamiał, ale żądania API nie były skutecznie przechwytywane i były przekierowywane do prawdziwego API Supabase.
2. **Problemy z dopasowaniem ścieżek URL** - Handlery MSW nie przechwytywały odpowiednio żądań API.
3. **Problemy z portami deweloperskimi** - Dynamiczne porty (3002/3003) powodowały problemy z konfiguracją.

## Wprowadzone zmiany

### 1. Dodanie modułu interceptora API (`tests/e2e/intercept-setup.ts`)

Stworzono nowy moduł do przechwytywania i przekierowywania żądań API. Moduł ten:
- Przechwytuje wszystkie żądania pasujące do wzorca `**/(api|auth)/**`
- Przekierowuje je do lokalnego serwera MSW na odpowiednim porcie
- Zachowuje oryginalne nagłówki i ciało żądania
- Dodaje szczegółowe logowanie dla lepszego diagnozowania problemów

### 2. Aktualizacja handlerów MSW (`tests/e2e/mocks/handlers.ts`)

- Zmieniono wzorce ścieżek z `/api/auth/signin` na bardziej ogólne `*/api/auth/signin`, aby dopasować różne formaty URL
- Dodano handlery przechwytujące dla wszystkich endpointów uwierzytelniania
- Dodano handler catch-all dla nieobsługiwanych endpointów
- Rozszerzono logowanie dla lepszego diagnozowania problemów

### 3. Poprawienie konfiguracji MSW (`tests/e2e/setup-msw.ts`)

- Zaktualizowano sposób inicjalizacji MSW z lepszym logowaniem nieobsługiwanych żądań
- Zaimplementowano ulepszony mechanizm przechwytywania żądań z wykorzystaniem nowego modułu `intercept-setup.ts`
- Usunięto duplikujące się handlery odpowiedzi

### 4. Aktualizacja konfiguracji globalnej (`tests/e2e/global-setup.ts`)

- Dodano wykrywanie dynamicznego portu i automatyczne dostosowanie konfiguracji
- Udostępniono serwer MSW globalnie dla całego środowiska testowego
- Dodano szczegółowe logowanie dla lepszego diagnozowania problemów

## Jak uruchomić testy

1. Uruchom serwer deweloperski: `npm run dev`
2. Uruchom testy z flagą debugowania: `npx playwright test --debug`

## Porady dotyczące rozwiązywania problemów

1. **Sprawdź porty** - Upewnij się, że serwer deweloperski jest dostępny pod oczekiwanym portem
2. **Logowanie przechwytywania** - Monitoruj logi przechwytywanych żądań z tagami `[MSW]`, `[Intercept]` i `[Network Request]`
3. **Debugowanie w trybie interaktywnym** - Uruchom testy z flagą `--debug` dla lepszej widoczności

## Uwagi końcowe

Główny problem wynikał z niewłaściwego przechwytywania żądań API przez MSW. Wprowadzone zmiany znacznie poprawiają ten aspekt poprzez dokładniejsze przechwytywanie i przekierowywanie żądań do lokalnego serwera MSW.

Największym wyzwaniem było zapewnienie, że żądania są poprawnie przechwytywane niezależnie od formatu URL (względne, bezwzględne) oraz że MSW poprawnie na nie odpowiada.
