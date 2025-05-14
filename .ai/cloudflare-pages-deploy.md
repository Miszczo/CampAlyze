## Linki do Dokumentacji (do pobrania za pomocą `curl`)

Poniżej znajdują się linki do relevantnych dokumentacji, które zostały zidentyfikowane w przesłanym materiale. Możesz użyć `curl`, aby pobrać ich treść (pamiętaj, że `curl` pobierze surowy HTML/tekst strony, co może wymagać dalszego przetworzenia do czytelnej formy):

- **Feature Toggles (koncepcja ogólna):**
  ```bash
  curl -L "https://martinfowler.com/articles/feature-toggles.html"
  ```
- **Cloudflare Pages - Strona główna:**
  ```bash
  curl -L "https://pages.cloudflare.com/"
  ```
- **Astro - Integracja z Cloudflare (zmienne środowiskowe):**
  ```bash
  curl -L "https://docs.astro.build/en/guides/integrations-guide/cloudflare/#environment-variables-and-secrets"
  ```
- **Astro - Typy zmiennych środowiskowych:**
  ```bash
  curl -L "https://docs.astro.build/en/guides/environment-variables/#variable-types"
  ```
- **Cloudflare Workers - Kompatybilność z Node.js API:**
  ```bash
  curl -L "https://developers.cloudflare.com/workers/runtime-apis/nodejs/#supported-nodejs-apis"
  ```
- **Cloudflare Workers - Flagi kompatybilności Node.js:**
  ```bash
  curl -L "https://developers.cloudflare.com/workers/runtime-apis/nodejs/"
  ```
- **GitHub Actions - Tworzenie Composite Actions (dla zaawansowanych scenariuszy CI/CD):**
  ```bash
  curl -L "https://docs.github.com/en/actions/sharing-automations/creating-actions/creating-a-composite-action"
  ```

---

## Instrukcje Wdrożenia Aplikacji Astro na Cloudflare Pages

Poniższe kroki przeprowadzą Cię przez proces publikacji Twojej aplikacji Astro.

### Krok 1: Analiza i Wybór Platformy Hostingowej

Jak wspomniano w materiale kursowym, dla projektów Astro istnieje kilka dobrych darmowych opcji hostingowych, takich jak:

- **Cloudflare Pages:** Dobra integracja z Astro, globalna sieć CDN, funkcje serverless (Workers), darmowy plan. Szczegółowo opisany w tej instrukcji.
- **Vercel:** Popularna platforma, również z dobrą obsługą Astro i darmowym planem dla projektów hobbystycznych (dla projektów komercyjnych może wymagać płatnej subskrypcji, zgodnie z polityką z kwietnia 2024 – data w HTML to prawdopodobnie pomyłka, powinno być 2024, nie 2025).
- **Netlify:** Kolejna solidna opcja z darmowym planem, oferująca podobne funkcjonalności.

Ta instrukcja skupi się na **Cloudflare Pages** ze względu na szczegółowe omówienie w dostarczonym HTML.

### Krok 2: Przygotowanie Projektu Astro

Aby wdrożyć aplikację Astro na Cloudflare Pages, musisz najpierw przygotować swój projekt.

1.  **Zainstaluj adapter Cloudflare:**
    Adapter `@astrojs/cloudflare` konfiguruje Twój projekt Astro do działania w środowisku Cloudflare.

    ```bash
    npx astro add cloudflare
    # lub
    npm install @astrojs/cloudflare
    # lub
    yarn add @astrojs/cloudflare
    # lub
    pnpm add @astrojs/cloudflare
    ```

    Postępuj zgodnie z instrukcjami wyświetlanymi przez CLI. Zazwyczaj sprowadza się to do automatycznej aktualizacji pliku `astro.config.mjs`.

2.  **Sprawdź konfigurację `astro.config.mjs`:**
    Upewnij się, że Twój plik `astro.config.mjs` zawiera adapter Cloudflare i jest poprawnie skonfigurowany. Powinien wyglądać mniej więcej tak:

    ```javascript
    // astro.config.mjs
    import { defineConfig } from "astro/config";
    import cloudflare from "@astrojs/cloudflare";
    import react from "@astrojs/react"; // Jeśli używasz React
    import tailwind from "@astrojs/tailwind"; // Jeśli używasz Tailwind CSS

    export default defineConfig({
      output: "server", // Lub 'hybrid' jeśli używasz prerenderingu dla niektórych stron
      adapter: cloudflare({
        mode: "directory", // 'directory' jest zalecane dla Pages
        // 'advanced' dla bardziej złożonych konfiguracji z Workers
      }),
      integrations: [
        react(), // Dodaj swoje integracje
        tailwind(),
      ],
    });
    ```

    - `output: 'server'` (lub `'hybrid'`) jest wymagane dla adapterów serverless.
    - `mode: "directory"` generuje statyczne zasoby i funkcję serverless w sposób kompatybilny z Cloudflare Pages.

### Krok 3: Konfiguracja Cloudflare Pages

1.  **Załóż darmowe konto na Cloudflare:**
    Jeśli jeszcze go nie masz, zarejestruj się na [https://pages.cloudflare.com/](https://pages.cloudflare.com/).

2.  **Utwórz nowy projekt Pages:**

    - W panelu Cloudflare przejdź do sekcji "Workers & Pages".
    - Kliknij "Create application", a następnie wybierz zakładkę "Pages".
    - Kliknij "Connect to Git".

3.  **Połącz z repozytorium GitHub:**

    - Autoryzuj Cloudflare dostęp do Twojego konta GitHub.
    - Wybierz repozytorium z Twoją aplikacją Astro.

4.  **Skonfiguruj ustawienia budowania:**

    - **Project name:** Nazwa Twojego projektu (np. `mojaprojekt-astro`).
    - **Production branch:** Wybierz branch, który będzie wdrażany na produkcję (zazwyczaj `main` lub `master`).
    - **Framework preset:** Wybierz "Astro". Cloudflare powinien automatycznie wykryć i zasugerować odpowiednie ustawienia.
    - **Build command:** Powinno być automatycznie ustawione na `npm run build` lub `astro build`.
    - **Build output directory:** Powinno być automatycznie ustawione na `dist` (dla `mode: "directory"` adaptera) lub czasami `./dist/_worker.js` lub podobne, jeśli używasz SSR. Sprawdź dokumentację Astro i Cloudflare, jeśli masz wątpliwości. Dla `mode: "directory"` powinno to być po prostu `dist`.
    - **Root directory:** Zostaw puste, jeśli `package.json` jest w głównym katalogu repozytorium.

5.  **Dodaj zmienne środowiskowe:**
    Twoja aplikacja (np. do komunikacji z Supabase) będzie potrzebować zmiennych środowiskowych.

    - W sekcji "Environment variables" dodaj potrzebne zmienne (np. `SUPABASE_URL`, `SUPABASE_ANON_KEY`).
    - **Ważne dla Astro:** Zmienne, które mają być dostępne po stronie klienta (w komponentach React/JS w przeglądarce), muszą mieć prefix `PUBLIC_`. Na przykład `PUBLIC_SUPABASE_URL`.
    - Możesz ustawić różne zmienne dla środowiska produkcyjnego ("Production") i podglądu ("Preview"). Aby skonfigurować zmienne dla Preview:
      - Po utworzeniu projektu przejdź do "Settings".
      - Wybierz środowisko "Preview" z rozwijanej listy.
      - Przejdź do sekcji "Environment variables" i dodaj/edytuj zmienne.

6.  **Zapisz i Wdróż (Save and Deploy):**
    Kliknij "Save and Deploy". Cloudflare pobierze kod, zbuduje projekt i wdroży go.

### Krok 4: Deployment

- **Automatyczny deployment:** Po początkowej konfiguracji, Cloudflare Pages będzie automatycznie budować i wdrażać Twoją aplikację za każdym razem, gdy wypchniesz zmiany do skonfigurowanego brancha produkcyjnego (np. `main`).
- **Deploymenty Preview:** Cloudflare Pages automatycznie utworzy środowiska podglądu dla każdego Pull Requestu do Twojego produkcyjnego brancha. Będą one miały unikalne adresy URL.
- **Kontrolowane deploymenty (opcjonalnie, dla zaawansowanych):**
  Materiał kursowy wspomina o wyłączeniu automatyzacji ("Branch Control") i przejściu na kontrolowane deploymenty z GitHub Actions i Cloudflare API. Jeśli zdecydujesz się na tę ścieżkę, będziesz musiał:
  1.  Wyłączyć automatyczne deploymenty w ustawieniach projektu na Cloudflare Pages.
  2.  Skonfigurować GitHub Action (np. `master.yml`), które będzie budować projekt Astro i używać narzędzi takich jak `wrangler` (CLI dla Cloudflare) lub dedykowanych akcji GitHub do publikacji na Cloudflare Pages. Ten krok wymaga głębszej znajomości GitHub Actions i API Cloudflare.

### Krok 5: Obsługa Zmiennych Środowiskowych w Astro dla Cloudflare

Jak wspomniano w materiale kursowym i dokumentacji Astro, Cloudflare ma specyficzny sposób obsługi zmiennych środowiskowych w funkcjach serverless.

- **Używaj `Astro.locals.runtime.env` (dla kodu server-side) i `import.meta.env` (dla kodu client-side):**

  - **Server-side (np. w endpointach API, funkcjach renderujących strony SSR):**
    Aby uzyskać dostęp do zmiennych środowiskowych ustawionych w panelu Cloudflare, używaj `Astro.locals.runtime.env`.

    ```typescript
    // src/pages/api/example.ts
    import type { APIRoute } from "astro";

    export const GET: APIRoute = ({ locals }) => {
      const supabaseUrl = locals.runtime.env.SUPABASE_URL;
      const supabaseAnonKey = locals.runtime.env.SUPABASE_ANON_KEY;
      // Użyj zmiennych...
      return new Response(JSON.stringify({ supabaseUrl, supabaseAnonKey }));
    };
    ```

  - **Client-side (w plikach `.astro` dla skryptów, komponentach React/Vue/Svelte):**
    Zmienne środowiskowe z prefiksem `PUBLIC_` są dostępne przez `import.meta.env`.

    ```typescript
    // src/components/MyReactComponent.tsx
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

    // Użyj zmiennych do inicjalizacji klienta Supabase itp.
    ```

- **Walidacja typów z `astro:env`:**
  Aby zapewnić bezpieczeństwo typów dla zmiennych środowiskowych, możesz użyć modułu `astro:env` (zobacz dokumentację Astro podlinkowaną wcześniej). Utwórz plik `env.d.ts` w `src/` (jeśli jeszcze nie istnieje) i zdefiniuj typy:

  ```typescript
  // src/env.d.ts
  /// <reference types="astro/client" />

  interface ImportMetaEnv {
    readonly SUPABASE_URL: string;
    readonly SUPABASE_ANON_KEY: string;
    readonly PUBLIC_SUPABASE_URL: string;
    readonly PUBLIC_SUPABASE_ANON_KEY: string;
    // inne zmienne PUBLIC_
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }

  // Dla Astro.locals.runtime.env (jeśli używasz SSR i adaptera Cloudflare)
  declare namespace App {
    interface Locals {
      runtime: {
        env: {
          SUPABASE_URL: string;
          SUPABASE_ANON_KEY: string;
          // inne zmienne non-public
        };
      };
    }
  }
  ```

### Krok 6: Node.js vs Cloudflare Runtime

Aplikacje Astro wdrażane na Cloudflare Pages działają w środowisku **Cloudflare Workers Runtime**, a nie w pełnym środowisku Node.js.

- **Różnice:** Workers Runtime jest zoptymalizowany pod kątem wydajności i bezpieczeństwa, co oznacza, że niektóre API Node.js mogą nie być dostępne lub działać inaczej. Na przykład, bezpośredni dostęp do systemu plików (`fs`) jest ograniczony. Zmienne środowiskowe nie są dostępne przez `process.env` w standardowy sposób (używaj `Astro.locals.runtime.env`).
- **Flaga `nodejs_compat`:**
  Jeśli Twoja aplikacja lub jedna z jej zależności wymaga specyficznych API Node.js, które nie są domyślnie obsługiwane, możesz włączyć flagę kompatybilności.
  - W panelu Cloudflare, w ustawieniach Twojego projektu Pages, przejdź do "Settings" → "Functions" (lub "Runtime").
  - W sekcji "Compatibility Flags" dodaj flagę `nodejs_compat`.
  - Możesz również ustawić "Compatibility date", aby zapewnić spójne działanie środowiska. Dla nowych projektów wybierz najnowszą datę.
  - Pamiętaj, że włączenie tej flagi może nieznacznie wpłynąć na wydajność "zimnego startu" funkcji.

### Krok 7: Debugowanie

Jeśli napotkasz problemy po wdrożeniu (np. strona nie ładuje się, występują błędy 500):

- **Sprawdź logi budowania:** W panelu Cloudflare, w sekcji "Deployments" dla Twojego projektu, możesz zobaczyć logi z procesu budowania. Pomogą one zidentyfikować problemy na etapie kompilacji.
- **Sprawdź logi funkcji (Runtime Logs):**
  - Przejdź do zakładki "Deployments" dla Twojego projektu.
  - Wybierz konkretny deployment.
  - Przejdź do zakładki "Functions" (lub podobnej, nazwa może się nieznacznie różnić).
  - Tutaj znajdziesz logi generowane przez Twoje funkcje server-side w czasie rzeczywistym lub historyczne, co jest kluczowe do diagnozowania błędów runtime.

### Podsumowanie

Wdrożenie aplikacji Astro na Cloudflare Pages jest stosunkowo proste dzięki dobrej integracji i automatyzacji. Kluczowe jest poprawne skonfigurowanie adaptera Astro, zarządzanie zmiennymi środowiskowymi (pamiętając o prefixie `PUBLIC_` dla klienta i dostępie przez `Astro.locals.runtime.env` po stronie serwera) oraz zrozumienie specyfiki Cloudflare Workers Runtime.

Pamiętaj, aby zaktualizować swoją dokumentację projektu (np. `README.md` lub `tech-stack.md`) o informacje dotyczące wybranej platformy hostingowej i procesu deploymentu. Powodzenia!
