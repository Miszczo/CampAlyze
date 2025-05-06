# Przewodnik testowania CampAlyze

Ten dokument zawiera wskazówki dotyczące testowania aplikacji CampAlyze, ze szczególnym uwzględnieniem testów z mockowanym API.

## Struktura testów

Testy w CampAlyze są podzielone na kilka kategorii:

1. **Testy jednostkowe** - testują poszczególne komponenty w izolacji
2. **Testy integracyjne** - testują współpracę komponentów
3. **Testy E2E** - testują całą aplikację z perspektywy użytkownika

## Technologie wykorzystywane do testów

- **Vitest** - framework do testów jednostkowych i integracyjnych
- **Playwright** - framework do testów E2E
- **MSW (Mock Service Worker)** - biblioteka do mockowania odpowiedzi API
- **Testing Library** - biblioteka pomocnicza do testowania komponentów React

## Tryby testowania

Aplikacja obsługuje dwa tryby testowania, które można przełączać za pomocą zmiennej środowiskowej `TEST_MODE`:

1. **Mock Mode** (`TEST_MODE=mock`) - wszystkie żądania API są przechwytywane przez MSW, nie ma komunikacji z prawdziwym Supabase
2. **Integration Mode** (`TEST_MODE=integration`) - testy używają prawdziwego API Supabase

Wybór trybu testowania zależy od potrzeb konkretnego scenariusza testowego. Tryb mock jest szybszy i bardziej przewidywalny, ale może nie wykryć problemów z integracją z rzeczywistym API. Tryb integracji jest wolniejszy, ale lepiej odzwierciedla rzeczywiste zachowanie aplikacji.

## Konfiguracja środowiska testowego

Aby skonfigurować środowisko testowe, należy utworzyć plik `.env.test` w katalogu głównym projektu z następującymi zmiennymi:

```
# Zmienne środowiskowe dla testów
PLAYWRIGHT_BASE_URL=http://localhost:3002
TEST_MODE=mock

# Testowi użytkownicy
TEST_USER_EMAIL=verified-user@example.com
TEST_USER_PASSWORD=Password123!
TEST_UNVERIFIED_EMAIL=unverified-user@example.com
TEST_NONEXISTENT_EMAIL=nonexistent@example.com

# Ustawienia dla mockowanego Supabase w testach
MOCK_SUPABASE_URL=mock-supabase-url
MOCK_SUPABASE_KEY=mock-supabase-key
```

## Mockowanie API z MSW

Aplikacja używa MSW (Mock Service Worker) do mockowania odpowiedzi API podczas testów. Dzięki temu możemy testować komponenty bez konieczności łączenia się z prawdziwym API Supabase.

### Konfiguracja MSW

Konfiguracja MSW znajduje się w katalogu `tests/e2e/mocks`:

- `handlers.ts` - zawiera definicje mockowanych endpointów
- `browser.ts` - konfiguracja MSW dla testów w przeglądarce
- `setup-msw.ts` - integracja MSW z Playwright

### Używanie MSW w testach E2E

Aby używać MSW w testach E2E, należy:

1. Zaimportować `test` i `expect` z pliku `setup-msw.ts`:

```typescript
import { test, expect } from "./setup-msw";
```

2. Pisać testy jak normalnie, korzystając z POM (Page Object Model):

```typescript
test("should display an error message with incorrect password", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login("verified-user@example.com", "wrong-password");
  await loginPage.expectErrorMessage(/invalid credentials/i);
});
```

### Dodawanie nowych mocków

Aby dodać nowy mockowany endpoint:

1. Otwórz plik `handlers.ts` w katalogu `tests/e2e/mocks`
2. Dodaj nowy handler dla endpointu, który chcesz mockować:

```typescript
http.post("/api/auth/new-endpoint", async ({ request }) => {
  try {
    const body = await request.json();
    console.log("[MSW] Handling new endpoint request:", body);
    
    // Logika obsługi endpointu
    return HttpResponse.json(
      {
        success: true,
        data: { /* dane odpowiedzi */ },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[MSW] Error handling request:", error);
    return HttpResponse.json({ error: "Error message" }, { status: 400 });
  }
}),
```

## Pattern obiektów stron (Page Object Model)

Testy E2E wykorzystują pattern POM, który enkapsuluje logikę interakcji ze stronami w klasach:

- Każda strona ma swoją klasę POM (np. `LoginPage`)
- Klasy POM zawierają metody do interakcji ze stroną
- Testy używają metod POM zamiast bezpośrednio manipulować elementami strony

Przykładowa klasa POM:

```typescript
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByTestId("login-input-email");
  }
  
  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }
}
```

## Dobre praktyki testowe

1. **Niezależność testów** - każdy test powinien być niezależny od innych testów
2. **Czytelność** - używaj jasnych nazw testów i asercji
3. **Stabilność** - unikaj flaky testów, używaj odpowiednich timeoutów i retry'ów
4. **Łatwość utrzymania** - używaj POM i innych wzorców do enkapsulacji logiki testowej
5. **Szybkość** - optymalizuj testy pod kątem szybkości wykonania
6. **Izolacja** - używaj mocków do izolacji testowanych komponentów

## Debugowanie testów

Aby debugować testy E2E:

1. Uruchom testy z opcją `--debug`:
   ```
   npx playwright test --debug
   ```

2. Użyj logów z MSW do analizy przechwyconych żądań:
   ```typescript
   console.log("[MSW] Request:", JSON.stringify(await request.json()));
   ```

3. Używaj narzędzia Playwright Inspector do interaktywnego debugowania:
   ```
   npx playwright test --ui
   ```

## Rozwiązywanie problemów

### Testy nie przechwytują żądań API

1. Sprawdź, czy ustawiono `TEST_MODE=mock` w `.env.test`
2. Upewnij się, że ścieżka API w handlerze dokładnie odpowiada ścieżce używanej w aplikacji
3. Sprawdź, czy MSW został poprawnie zainicjalizowany w `setup-msw.ts`

### Middleware nie rozpoznaje trybu testowego

1. Sprawdź, czy zmienne środowiskowe są poprawnie wczytywane
2. Upewnij się, że middleware obsługuje flagę `isTestEnvironment`
3. Sprawdź, czy klient Supabase jest poprawnie inicjalizowany w trybie testowym

### Testy są niestabilne (flaky)

1. Zwiększ timeouty dla operacji sieciowych
2. Dodaj opcje retry dla niestabilnych asercji
3. Upewnij się, że testy czekają na zakończenie animacji przed asercjami
4. Używaj `waitForLoadState` i podobnych metod do oczekiwania na pełne załadowanie strony 