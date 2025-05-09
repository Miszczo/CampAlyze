# Lekcja 14: Wdrażanie CI/CD z GitHub Actions

**Cel:** Automatyzacja procesów integracji kodu, testowania i potencjalnie wdrażania aplikacji przy użyciu GitHub Actions (GHA).

**Kluczowe Koncepcje i Narzędzia GitHub Actions:**

- **Workflow:** Zautomatyzowany proces (.yml) w `.github/workflows/`.
- **Event/Trigger:** Zdarzenie uruchamiające workflow (np. `push`, `pull_request`).
- **Job:** Zestaw kroków wykonywanych na jednym runnerze (serwerze). Joby mogą działać równolegle lub sekwencyjnie (`needs`).
- **Step:** Pojedyncze zadanie w jobie (np. `uses: actions/checkout@v4`, `run: npm test`).
- **Action:** Reużywalny, sparametryzowany step (np. z Marketplace lub własny).
- **Runner:** Serwer wykonujący joby (np. `ubuntu-latest`).
- **Sekrety (Secrets):** Szyfrowane zmienne środowiskowe (np. `secrets.SUPABASE_KEY`) dostępne w GHA. Konfiguruj w Ustawieniach Repozytorium > Secrets and variables > Actions.
- **Środowiska (Environments):** Sposób na grupowanie reguł wdrożenia i sekretów dla różnych środowisk (np. staging, produkcja).
- **Artefakty (Artifacts):** Pliki generowane przez workflow (np. raporty z testów, build aplikacji), które można przechowywać i przekazywać między jobami.
- **Reguły dla AI (np. `github-action.mdc`):** Instrukcje dla modelu AI dotyczące tworzenia workflowów GHA, mogą zawierać polecenia terminalowe do weryfikacji akcji.

**Implementacja (Przykład Workflow dla Pull Request):**
**Cel:** Weryfikacja jakości kodu w każdym Pull Request do `master`/`main`.

```yaml
# .github/workflows/pull-request.yml
name: Pull Request Validation

on:
  pull_request:
    branches: [master, main] # Dostosuj do nazwy głównego brancha

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18" # lub wersja z projektu
      - name: Install dependencies
        run: npm ci
      - name: Run linter
        run: npm run lint

  unit-tests:
    runs-on: ubuntu-latest
    needs: lint # Uruchom po lint
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
      - name: Install dependencies
        run: npm ci
      - name: Run unit tests
        run: npm test # Zakładając, że `npm test` uruchamia Vitest/Jest

  e2e-tests:
    runs-on: ubuntu-latest
    needs: lint # Uruchom po lint
    # Opcjonalnie: environment: integration # Jeśli masz zdefiniowane środowisko w GHA
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      - name: Run E2E tests
        run: npm run test:e2e # Zakładając skrypt dla testów E2E
        env: # Przekazanie sekretów jako zmiennych środowiskowych
          SUPABASE_URL: ${{ secrets.SUPABASE_URL_E2E }}
          SUPABASE_PUBLIC_KEY: ${{ secrets.SUPABASE_PUBLIC_KEY_E2E }}
          E2E_USERNAME: ${{ secrets.E2E_USERNAME }}
          E2E_PASSWORD: ${{ secrets.E2E_PASSWORD }}
          # Inne potrzebne zmienne

  status-comment: # Opcjonalny job do komentowania PR
    runs-on: ubuntu-latest
    needs: [unit-tests, e2e-tests] # Uruchom po testach
    if: always() # Uruchom zawsze, aby skomentować nawet przy błędach
    steps:
      - name: Comment on PR
        uses: actions/github-script@v6
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            const issue_number = context.issue.number;
            const owner = context.repo.owner;
            const repo = context.repo.repo;
            let body = `✅ All checks passed!`;
            if (context.payload.workflow_run.conclusion === 'failure') {
              body = `❌ Some checks failed. Please review logs.`;
            }
            github.rest.issues.createComment({
              owner,
              repo,
              issue_number,
              body
            });
```
