# Wdrożenie CI/CD z GitHub Actions dla projektu Node.js

## 1. Przygotowanie projektu

1. Upewnij się, że Twój projekt Node.js posiada następujące skrypty w pliku `package.json`:
   - `lint` - do sprawdzania zgodności kodu ze standardami
   - `test` - do uruchamiania testów jednostkowych
   - `test:e2e` - do uruchamiania testów E2E (jeśli używasz)
   - `build` - do budowania aplikacji produkcyjnej

2. Utwórz katalog `.github/workflows` w głównym katalogu projektu:
   ```
   mkdir -p .github/workflows
   ```

3. Przygotuj plik `.gitignore` aby wykluczyć niepotrzebne pliki:
   - Upewnij się, że zawiera `node_modules`, `.env`, `.env.local`, pliki z sekretami

4. Przygotuj skrypty testowe:
   - Upewnij się, że testy są niezależne od zewnętrznych zasobów lub użyj mocków
   - Dla testów E2E zaplanuj sposób obsługi zmiennych środowiskowych

5. Dodaj plik `.nvmrc` jeśli chcesz wymusić konkretną wersję Node.js:
   ```
   echo "18" > .nvmrc
   ```

## 2. Konfiguracja GitHub

1. Otwórz swoje repozytorium na GitHub i przejdź do zakładki "Settings".

2. Skonfiguruj ochronę głównego brancha:
   - Przejdź do "Branches" > "Branch protection rules" > "Add rule"
   - Wpisz nazwę głównego brancha (np. `main` lub `master`)
   - Zaznacz "Require a pull request before merging"
   - Zaznacz "Require status checks to pass before merging"
   - Po utworzeniu pierwszego workflow, wróć i wybierz jego status checks jako wymagane

3. Skonfiguruj sekrety potrzebne do testów i wdrożenia:
   - Przejdź do "Secrets and variables" > "Actions"
   - Kliknij "New repository secret"
   - Dodaj następujące sekrety (dostosuj do swoich potrzeb):
     - `SUPABASE_URL_E2E` - URL do testowej bazy Supabase
     - `SUPABASE_PUBLIC_KEY_E2E` - Klucz publiczny do testowej bazy Supabase
     - `E2E_USERNAME` i `E2E_PASSWORD` - Dane do testów E2E
     - `DEPLOY_TOKEN` - Token do wdrażania (np. dla Netlify, Vercel, itp.)

4. Skonfiguruj środowiska (opcjonalnie dla bardziej zaawansowanego workflow):
   - Przejdź do "Environments" > "New environment"
   - Utwórz środowiska "staging" i "production"
   - Dodaj wymagane recenzje dla środowiska "production"
   - Dodaj sekrety specyficzne dla środowisk

## 3. Implementacja workflow CI (dla PR)

1. Utwórz plik `.github/workflows/pull-request.yml` z następującą zawartością:

```yaml
name: Pull Request Validation

on:
  pull_request:
    branches: [master, main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Run linter
        run: npm run lint

  unit-tests:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Run unit tests
        run: npm test

  e2e-tests:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL_E2E }}
          SUPABASE_PUBLIC_KEY: ${{ secrets.SUPABASE_PUBLIC_KEY_E2E }}
          E2E_USERNAME: ${{ secrets.E2E_USERNAME }}
          E2E_PASSWORD: ${{ secrets.E2E_PASSWORD }}

  build:
    runs-on: ubuntu-latest
    needs: [unit-tests, e2e-tests]
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build
          path: dist/
          retention-days: 7
```

## 4. Implementacja workflow CD (dla wdrożeń)

1. Utwórz plik `.github/workflows/deploy.yml` z następującą zawartością:

```yaml
name: Deploy

on:
  push:
    branches:
      - main
      - master

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Build
        run: npm run build
        env:
          PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          PUBLIC_SUPABASE_KEY: ${{ secrets.SUPABASE_PUBLIC_KEY }}
      - name: Deploy to Staging
        uses: netlify/actions/cli@master
        with:
          args: deploy --dir=dist --prod
        env:
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
          NETLIFY_AUTH_TOKEN: ${{ secrets.DEPLOY_TOKEN }}

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master'
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
        env:
          PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          PUBLIC_SUPABASE_KEY: ${{ secrets.SUPABASE_PUBLIC_KEY }}
      - name: Deploy to Production
        uses: netlify/actions/cli@master
        with:
          args: deploy --dir=dist --prod
        env:
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_PROD_SITE_ID }}
          NETLIFY_AUTH_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
```

2. Alternatywnie, jeśli używasz Vercel jako platformy hostingowej, utwórz plik `.github/workflows/deploy-vercel.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches:
      - main
      - master

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Install Vercel CLI
        run: npm install -g vercel
      - name: Deploy to Vercel
        run: |
          if [[ "${{ github.ref }}" == "refs/heads/main" || "${{ github.ref }}" == "refs/heads/master" ]]; then
            vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
          else
            vercel --token ${{ secrets.VERCEL_TOKEN }}
          fi
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

## 5. Weryfikacja działania CI/CD

1. Sprawdź działanie workflow CI:
   - Utwórz nowy branch: `git checkout -b feature/test-ci`
   - Wprowadź zmiany do kodu
   - Zatwierdź zmiany: `git commit -am "Test CI workflow"`
   - Wypchnij zmiany: `git push origin feature/test-ci`
   - Utwórz Pull Request na GitHub
   - Weryfikuj, czy workflow CI został uruchomiony i wszystkie kroki przeszły pomyślnie

2. Sprawdź działanie workflow CD:
   - Po zatwierdzeniu i scaleniu PR z branchem głównym
   - Przejdź do zakładki "Actions" na GitHub
   - Zweryfikuj, czy workflow CD został uruchomiony
   - Sprawdź, czy aplikacja została poprawnie wdrożona na platformie hostingowej

3. Zweryfikuj działanie wdrożonych środowisk:
   - Otwórz adres URL środowiska staging
   - Przetestuj podstawowe funkcjonalności
   - Po weryfikacji środowiska staging, sprawdź czy wdrożenie produkcyjne działa poprawnie

## 6. Rozwiązywanie typowych problemów

### Problem: Workflow nie uruchamia się

1. Sprawdź nazwę pliku workflow - musi mieć rozszerzenie `.yml` lub `.yaml`
2. Sprawdź składnię YAML - użyj validatora online
3. Sprawdź, czy zdarzenie wyzwalające jest poprawnie skonfigurowane
4. Sprawdź, czy jesteś na właściwym branchu

### Problem: Testy zawodzą w CI, ale działają lokalnie

1. Sprawdź różnice w wersjach Node.js - dodaj `.nvmrc` lub ustal wersję w workflow
2. Sprawdź, czy wszystkie zmienne środowiskowe są poprawnie ustawione w sekretach GitHub
3. Sprawdź problemy z zależnościami - usuń `node_modules` i `package-lock.json` lokalnie, a następnie uruchom `npm install`
4. Dodaj flagi debugowania do testów w CI: `npm test -- --verbose`

### Problem: Wdrożenie nie działa

1. Sprawdź, czy wszystkie sekrety są poprawnie skonfigurowane
2. Sprawdź logi wdrożenia w zakładce Actions
3. Upewnij się, że token wdrożeniowy ma odpowiednie uprawnienia
4. Sprawdź, czy ścieżka do wdrażanych plików jest poprawna (np. `dist/` zamiast `build/`)
5. Zaktualizuj tokeny dostępu, jeśli wygasły

### Problem: Wyciek sekretów

1. Natychmiast zresetuj wszystkie ujawnione sekrety/tokeny
2. Sprawdź, czy sekrety nie są logowane w workflow
3. Upewnij się, że `GITHUB_TOKEN` ma tylko niezbędne uprawnienia
4. Włącz powiadomienia o podatnościach w ustawieniach repozytorium

### Problem: Workflow trwa zbyt długo

1. Używaj cache'owania - szczególnie dla `node_modules`
2. Uruchamiaj tylko niezbędne testy w workflow PR
3. Równoległe uruchamianie zadań, które nie są od siebie zależne
4. Ogranicz liczbę kroków lub optymalizuj istniejące 