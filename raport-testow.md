# Raport z testów E2E komponentu logowania

## Wprowadzenie

Niniejszy raport prezentuje wyniki testów End-to-End (E2E) przeprowadzonych na komponencie logowania w aplikacji campAlyze. Testy zostały wykonane z wykorzystaniem frameworka Playwright oraz metodologii Page Object Model (POM).

## Znalezione problemy

### 1. Problem z importem typów

```
[ERROR] [vite] The requested module 'react-hook-form' does not provide an export named 'UseFormReturn'
```

Wykryto błąd w importowaniu typu `UseFormReturn` z biblioteki react-hook-form. Problem został częściowo rozwiązany poprzez zmianę sposobu importu na import typu:

```typescript
import type { UseFormReturn } from "react-hook-form";
```

### 2. Niezgodność selektorów w POM

Selektory definiowane w Page Object Model (POM) nie odpowiadały rzeczywistym atrybutom data-testid w komponentach. Przykładowo:

- POM szukał `error-message`, podczas gdy w komponencie było `login-alert-error`
- POM szukał przycisku o nazwie "Log in", podczas gdy w komponencie było "Login"

Problem został częściowo rozwiązany poprzez aktualizację POM, jednak nadal testy nie mogą znaleźć elementów w strukturze DOM.

### 3. Problemy z renderowaniem komponentów w testach

Testy E2E nie mogą znaleźć elementów formularza logowania, co sugeruje, że:

- Komponenty mogą nie być prawidłowo renderowane w środowisku testowym
- Selektory data-testid mogą nie być zgodne między POM a rzeczywistymi komponentami
- Komponenty React mogą nie być w pełni załadowane przed próbą ich testowania

### 4. Brak synchronizacji w działaniu API mockowego

API mockowe nie przechwytuje poprawnie żądań. Główne problemy:

- W testach używane są ścieżki `/api/auth/signin`, które zostały skonfigurowane w MSW, ale żądania mogą być wysyłane do innych ścieżek
- Konfiguracja MSW z `onUnhandledRequest: "bypass"` pokazuje, że niektóre żądania nie są przechwytywane
- Brakuje odpowiedniej wizualizacji i debugowania żądań API podczas testów

### 5. Problemy z końcami linii

Linter zgłasza liczne błędy związane z końcami linii (CRLF vs LF), co może powodować problemy w różnych środowiskach. Problem został częściowo rozwiązany, ale nadal wymaga uwagi, szczególnie w pliku `global-setup.ts`.

### 6. Niespójność między różnymi wersjami Page Object Model

W projekcie istnieją dwa osobne pliki implementujące Page Object Model dla strony logowania:

- `tests/e2e/poms/LoginPage.pom.ts`
- `tests/e2e/pages/LoginPage.ts`

To prowadzi do niespójności w testach, które mogą importować różne wersje tego samego POM.

### 7. Problemy z testami walidacji formularza

Testy związane z walidacją pól formularza nie działają poprawnie, ponieważ:

- Komunikaty o błędach walidacji nie są wykrywane przez selektory
- Mechanizm validacji formularza może działać odmiennie w środowisku testowym

## Rekomendowane rozwiązania

### 1. Ujednolicenie konwencji data-testid

Stworzyć i udokumentować standaryzowany system nazewnictwa dla atrybutów data-testid, np.:

```
[komponenta]-[typ_elementu]-[opis]
```

Przykład: `login-button-submit`, `login-alert-error`

### 2. Weryfikacja rzeczywistych atrybutów data-testid w komponentach

Przeprowadzić dokładną inspekcję komponentów w przeglądarce, aby zweryfikować, czy atrybuty data-testid są faktycznie renderowane w DOM zgodnie z oczekiwaniami. Można to zrobić za pomocą narzędzi deweloperskich przeglądarki.

### 3. Ujednolicenie Page Object Model

Usunąć jedną z wersji POM i upewnić się, że wszystkie testy importują tę samą, spójną wersję:

```typescript
// Preferować jedną lokalizację, np.:
import { LoginPage } from "./poms/LoginPage.pom";
```

### 4. Debugowanie renderowania komponentów

Dodać dodatkowe logowanie i asercje w testach, aby sprawdzić, czy komponenty są prawidłowo renderowane, np.:

```typescript
// Sprawdzić, czy podstawowa struktura DOM jest widoczna
await expect(page.locator("form")).toBeVisible();
console.log("DOM Structure:", await page.content());
```

### 5. Poprawa konfiguracji mockowania API

Zweryfikować, czy ścieżki API w mockach dokładnie odpowiadają tym używanym w aplikacji:

```typescript
// W handlers.ts
http.post("/api/auth/signin", async ({ request }) => { ... });

// W komponencie logowania - upewnić się, że używana jest dokładnie ta sama ścieżka
const response = await fetch("/api/auth/signin", { ... });
```

### 6. Rozwiązanie problemu react-hook-form

Zaktualizować definicję typu w hookach:

```typescript
// W pliku useLoginForm.ts
import type { UseFormReturn } from "react-hook-form";

export type LoginFormReturn = Omit<ReturnType<typeof useLoginForm>, "form"> & {
  form: UseFormReturn<LoginFormValues>;
};
```

### 7. Standaryzacja końców linii

Skonfigurować Git, EditorConfig i Prettier, aby wymuszały jednolity styl końca linii (LF):

```bash
git config --global core.autocrlf input
```

## Wnioski

Testy E2E dla komponentu logowania nadal wykazują problemy pomimo naprawy części z nich. Najważniejsze kwestie to problemy z renderowaniem komponentów w środowisku testowym oraz brak komunikacji z mockami API. Dalsza debugging i zwiększona instrumentacja testów może pomóc w identyfikacji źródła problemów.

Dwa kluczowe obszary, które należy zbadać w pierwszej kolejności:

1. Czy komponenty React są poprawnie renderowane z odpowiednimi atrybutami data-testid
2. Czy mockowane API prawidłowo przechwytuje i obsługuje żądania od komponentów
