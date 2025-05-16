# Raport: Problemy z mockowaniem funkcji randomUUID z modułu crypto w testach Vitest

## Opis problemu

Podczas tworzenia testów jednostkowych dla endpointów API w aplikacji Astro napotkaliśmy problemy z mockowaniem funkcji `randomUUID` z wbudowanego modułu Node.js `crypto`. Funkcja ta jest używana w kodzie produkcyjnym do generowania unikalnych identyfikatorów, ale w kontekście testów potrzebujemy przewidywalnych, deterministycznych wartości.

Wyjściowy błąd, który otrzymywaliśmy podczas prób mockowania tej funkcji to:

```
No default export is defined on the crypto mock
```

## Próby rozwiązania

### Podejście 1: Podstawowe mockowanie

Pierwsza próba polegała na użyciu standardowego podejścia do mockowania modułu:

```typescript
vi.mock("crypto", () => ({
  randomUUID: vi.fn().mockReturnValue("123e4567-e89b-12d3-a456-426614174000"),
}));
```

Problem: To podejście całkowicie zastępowało moduł `crypto` naszą implementacją, która zawierała tylko funkcję `randomUUID`. Ponieważ moduł `crypto` zawiera wiele innych funkcji używanych potencjalnie w innych miejscach kodu, spowodowało to problemy z brakiem tych funkcji.

### Podejście 2: Wykorzystanie vi.mocked

```typescript
import { randomUUID } from "crypto";

vi.mock("crypto");
vi.mocked(randomUUID).mockReturnValue("123e4567-e89b-12d3-a456-426614174000");
```

Problem: Ten kod generował błąd: "randomUUID is not a function", ponieważ mockowanie całego modułu `crypto` bez określenia implementacji funkcji skutecznie usuwało tę funkcję z modułu.

### Podejście 3: Użycie vi.hoisted()

```typescript
const mockRandomUUID = vi.hoisted(() => vi.fn().mockReturnValue("123e4567-e89b-12d3-a456-426614174000"));

vi.mock("crypto", () => ({
  randomUUID: mockRandomUUID,
}));
```

Problem: Nadal występowały błędy z referencjami do pozostałych funkcji modułu `crypto`, których teraz brakowało w mocku.

## Rozwiązanie

Ostatecznie rozwiązanie zostało znalezione w dokumentacji Vitest i bazowało na użyciu parametru `importOriginal` w funkcji `vi.mock()`. Pozwala to na zaimportowanie oryginalnego modułu, a następnie nadpisanie tylko tych funkcji, które chcemy zmockować.

```typescript
import type * as Crypto from "crypto";

vi.mock("crypto", async (importOriginal) => {
  const actual = await importOriginal<typeof Crypto>();
  return {
    ...actual,
    randomUUID: vi.fn().mockReturnValue("123e4567-e89b-12d3-a456-426614174000"),
  };
});
```

### Kluczowe elementy rozwiązania:

1. **Importowanie typu**: `import type * as Crypto from 'crypto'` - pozwala na uzyskanie poprawnych typów TypeScript dla całego modułu.

2. **Użycie importOriginal**: `importOriginal<typeof Crypto>()` - pobiera oryginalną implementację modułu z wszystkimi jego funkcjami.

3. **Spread operator**: `...actual` - zachowuje wszystkie oryginalne funkcje modułu `crypto`.

4. **Nadpisanie konkretnej funkcji**: `randomUUID: vi.fn()...` - nadpisuje tylko tę jedną funkcję, którą chcemy zmockować.

## Dodatkowe problemy TypeScript

W trakcie implementacji powyższego rozwiązania napotkaliśmy również błąd TypeScript:

```
Spread types may only be created from object types
```

Wynikał on z niepoprawnego typu zwracanego przez funkcję `importOriginal()`. Rozwiązaniem było jawne określenie typu poprzez użycie zapisu generycznego `importOriginal<typeof Crypto>()`, który zapewnia, że TypeScript wie, iż zwracany obiekt jest zgodny z typem modułu `crypto`.

## Weryfikacja rozwiązania

Aby potwierdzić, że nasze rozwiązanie działa poprawnie, stworzyliśmy prosty test sprawdzający funkcję mockującą:

```typescript
describe("Mockowanie crypto.randomUUID", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("powinno zwrócić zamockowaną wartość UUID", () => {
    const result = randomUUID();
    expect(result).toBe("123e4567-e89b-12d3-a456-426614174000");
    expect(vi.mocked(randomUUID)).toHaveBeenCalledTimes(1);
  });
});
```

Test ten potwierdził, że:

1. Funkcja `randomUUID()` zwraca zamockowaną wartość
2. Możemy śledzić wywołania tej funkcji za pomocą `vi.mocked()`

## Zastosowanie w testach API

Dzięki pomyślnemu mockowaniu `randomUUID` mogliśmy przejść do testowania endpointów API, które korzystają z tej funkcji:

```typescript
describe("POST /api/imports/upload - scenariusz podstawowy", () => {
  const mockSupabase = {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("powinno zwrócić 401 dla nieautoryzowanego użytkownika", async () => {
    mockSupabase.auth.getSession.mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });

    const mockContext = {
      locals: { supabase: mockSupabase },
      request: new Request("http://localhost/api/imports/upload", { method: "POST" }),
    } as unknown as APIContext;

    const response = await POST(mockContext);
    const responseBody = await response.json();

    expect(response.status).toBe(401);
    expect(responseBody.error).toBe("Unauthorized");
    expect(mockSupabase.auth.getSession).toHaveBeenCalled();
  });
});
```

## Wnioski i rekomendacje

1. **Preferowane podejście**: Zawsze używaj `importOriginal` podczas mockowania wbudowanych modułów Node.js, aby zachować niezmockowane funkcje.

2. **Ważność typowania**: Poprawne określenie typów w testach TypeScript pomaga uniknąć problemów z typami i błędów w czasie wykonania.

3. **Weryfikacja mocków**: Warto zawsze pisać osobne testy sprawdzające tylko mockowanie, aby upewnić się, że mocki działają zgodnie z oczekiwaniami.

4. **Dokumentacja Vitest**: Przy złożonych problemach z mockowaniem warto zajrzeć do oficjalnej dokumentacji Vitest, która zawiera wiele przykładów różnych scenariuszy mockowania.

## Przydatne linki

- [Dokumentacja Vitest - Mocking](https://vitest.dev/guide/mocking.html)
- [Dokumentacja Node.js crypto module](https://nodejs.org/api/crypto.html#cryptorandomuuidoptions)
- [TypeScript - Working with Type Declarations](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html)
