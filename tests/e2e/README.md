# CampAlyze - Testy E2E

## Tryby testowania

Testy E2E w aplikacji CampAlyze mogą być uruchamiane w dwóch trybach:

1. **Tryb mockowy** (domyślny) - wykorzystuje MSW (Mock Service Worker) do przechwytywania i symulowania odpowiedzi API bez rzeczywistych wywołań do backendu.
2. **Tryb integracyjny** - używa rzeczywistego API, wymaga skonfigurowanego środowiska z działającym Supabase.

## Uruchamianie testów

### Tryb mockowy (domyślny)

```bash
# Uruchomienie wszystkich testów w trybie mockowym (domyślnie)
npm run test:e2e

# Lub z jawnym ustawieniem trybu mockowego
TEST_MODE=mock npm run test:e2e
```

### Tryb integracyjny

```bash
# Uruchomienie testów z rzeczywistym API
TEST_MODE=integration npm run test:e2e
```

## Testowanie blokowania konta

Test blokowania konta po 5 nieudanych próbach logowania działa w pełni tylko w trybie mockowym. W trybie integracyjnym test sprawdza jedynie, czy błędy logowania są poprawnie wyświetlane, nie oczekując pełnej funkcjonalności blokowania.

### Jak test działa:

1. W trybie mockowym:

   - Po 5 nieudanych próbach logowania, konto jest blokowane na 15 minut
   - Wyświetlany jest komunikat o zablokowaniu konta
   - Nawet poprawne dane logowania są odrzucane

2. W trybie integracyjnym:
   - Test wykonuje 5 prób logowania z nieprawidłowym hasłem
   - Sprawdza, czy system wyświetla komunikaty o błędzie logowania
   - Nie oczekuje faktycznego zablokowania konta

## Debugowanie testów

W obu trybach testowania dodano rozszerzone logowanie, które pomaga zidentyfikować problemy:

- Logi `[MSW Route]` pokazują przechwycone żądania API
- Logi `[MSW]` zawierają informacje o przetwarzaniu żądań przez mockowy serwer
- Logi `[Test]` pokazują postęp testu i wartości sprawdzane w asercjach

## Rozwiązywanie problemów

Jeśli test blokowania konta nie działa poprawnie:

1. Upewnij się, że uruchamiasz go w trybie mockowym (domyślnie lub z `TEST_MODE=mock`)
2. Sprawdź logi konsoli pod kątem informacji o przechwytywaniu żądań
3. Jeśli żądania nie są przechwytywane, może być problem z konfiguracją MSW
