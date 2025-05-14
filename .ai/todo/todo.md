# TODO: campAlyze – Stan, Zadania i Wymagania

**Wersja:** 2025-05-14 21:56:00

## 1. Aktualny stan (co mamy zaimplementowane)

### Autoryzacja (Auth)
- UI: strony `/register`, `/login`, `/verify-email`, `/forgot-password`, `/reset-password` w Astro
- Backend: endpointy Supabase w `src/pages/api/auth/*` (register, signin, signout, resend-verification, request-password-reset, update-password)
- Testy:
  - Unit-testy dla wszystkich endpointów auth (`*.test.ts`)
  - E2E-testy Playwright dla logowania, rejestracji, weryfikacji email

### Podstawowa logika biznesowa i import danych
- API: `POST /api/imports/upload` w `src/pages/api/imports/upload.ts`
- UI:
  - Strona uploadu: `src/pages/imports-upload.astro` z formularzem i obsługą statusów
  - Widok importu: `src/pages/import.astro` (placeholder, blokuje upload)
- Migracje DB: tabele `imports`, `platforms`, `organizations`, plus RLS i widok `campaign_metrics_derived`
- Testy:
  - Unit-testy dla uploadu (`upload.test.ts`)
  - E2E-testy przepływu upload + nawigacja (`home.spec.ts`, etc.)

### Dashboard (UI + Backend)
- UI:
  - Plik: `src/pages/dashboard.astro`
  - Pokazuje sidebar, nagłówek, filtry, przyciski, metryki, alerty, weryfikacje – wszystkie dane są hardkodowane (przykładowe)
  - Komponent `PlatformTabs.tsx` z placeholderami dla wykresów platform
- Backend:
  - Endpoint `GET /api/dashboard/metrics` do pobierania danych z widoku `campaign_metrics_derived`
  - Obsługa parametrów filtrowania: organization_id, zakres dat, platforma, kampania
  - Szczegółowe testy jednostkowe dla endpointu (`metrics.test.ts`)
  - Rozszerzone typy TS dla struktur danych dashboardu

### Struktura CI/CD
- `.github/workflows/pull-request.yml`: lint → unit-tests → e2e-tests → build + artefakty
- `.github/workflows/deploy.yml`: test → build → deploy (Netlify) na `main/master`

### Testy globalne i konfiguracyjne
- Vitest + Playwright skonfigurowane (`vitest.config.ts`, `playwright.config.ts`)
- Skrypty `npm run test:unit`, `npm run test:e2e`, `npm run test:e2e:snap` , `npm run lint`, `npm run build`


## 2. Co należy zrobić (zadania do realizacji przed MVP)

### ✅ 2.1 Dashboard – integracja z backendem i dynamiczne dane
- ✅ Utworzenie endpointu GET `/api/dashboard/metrics` bazującego na widoku `campaign_metrics_derived`
- ✅ Obsługa parametrów filtrów: zakres dat, platforma, kampania
- ✅ Rozszerzenie typów w `src/types.ts` o interfejsy dla dashboardu
- ✅ Implementacja testów jednostkowych dla endpointu

Pozostałe zadania do wykonania w przyszłości:
- W `.astro` pobierać dane (np. `Astro.server.fetch` lub fetch w React) i zastąpić hardkod
- Wyświetlać nowe metryki: Zasięg (reach) i Typ wyniku (conversion_type) dla platform, które je dostarczają
- Zaimplementować wykresy (np. Chart.js lub Recharts) dla trendów i porównań okresów
- Odświeżanie dashboardu po imporcie (webhook, polling lub SSE)

### 2.2 CRUD dla importów (pełne zarządzanie)
- Endpoint `GET /api/imports` – lista importów z paginacją i filtrowaniem
- Endpoint `DELETE /api/imports/:id` lub `PATCH /api/imports/:id` (cancel, retry)
- UI: strona `/imports` lub `/history-imports` z tabelą historii importów, akcjami (usun, retry)
- Zaimplementować parser Meta Ads CSV z mapowaniem kolumn:
  * "Nazwa kampanii" → identyfikator kampanii (wyszukać lub utworzyć w tabeli `campaigns`)
  * "Dzień" → `metrics.date`
  * "Kliknięcia linku" → `metrics.clicks` 
  * "Zasięg" → `metrics.reach` (nowe pole)
  * "Wyświetlenia" → `metrics.impressions`
  * "Typ wyniku" → `metrics.conversion_type` (nowe pole)
  * "Wyniki" → `metrics.conversions`
  * "Wydana kwota (PLN)" → `metrics.spend`
- Uwzględnić obsługę pustych pól (NULL) w CSV
- Testy unit + E2E dla CRUD importów (upload → lista → usuń)
- Dodać testy dla parsera CSV Meta Ads

### 2.3 CRUD zasobu Campaigns
- DB + API: tabele `campaigns`, endpointy CRUD w `src/pages/api/campaigns/*`
- UI: strona `/kampanie` (lista kampanii), widok szczegółów, formularz edycji, usuwanie
- Testy dla CRUD kampanii (unit + E2E)

### 2.4 Campaign Changes (Dziennik zmian)
- DB + API: tabele `campaign_changes`, endpointy CRUD w `src/pages/api/campaign_changes/*`
- UI: strona `/dziennik-zmian`, listowanie, dodawanie, edycja weryfikacji
- Testy dla campaign_changes flow

### 2.5 Alerty kampanii
- Zaimplementować serwis (`src/lib/alerts.ts`) generujący alerty na podstawie progów (threshold) z `campaign_metrics_derived`
- Endpoint `GET /api/alerts`
- UI: strona `/alerty` i sekcja na dashboardzie, filtrowanie, dismiss

### 2.6 Eksport raportów
- Endpoint `POST /api/exports` generujący CSV/XLSX/PDF wg zakresu dat i filtrów
- UI: strona `/eksport`, formularz wyboru zakresu + format, przycisk eksportu
- Testy integracyjne generowania plików

### 2.7 AI Insights / Automatyczne podsumowania
- Serwis AI (`src/lib/ai.ts`): wrapper do OpenAI lub innego modelu
- Endpoint `POST /api/ai-insights`, zapisywanie w tabeli `ai_insights`
- UI: strona `/ai-insights`, przycisk generuj, lista wygenerowanych insightów, oznaczanie statusu (implemented, dismissed)
- Testy E2E dla generowania i wyświetlania insightów

### 2.8 Inne zadania
- Konsolidacja widoków importu: połączyć `import.astro` i `imports-upload.astro` w jedną, spójną stronę zarządzania importami
- Obsługa błędów, spinnerów i toast notifications we wszystkich nowych widokach
- Dodanie obsługi Dark Mode (opcjonalnie)
- Dokumentacja kodu i uaktualnienie `README.md` z instrukcjami uruchomienia, testów, CI/CD


## 3. Wymogi projektu zaliczeniowego

Aby projekt został zaliczony jako praca zaliczeniowa, musi spełniać następujące minimalne kryteria:

1. Obsługa logowania użytkownika (Auth) – ✔️
2. Podstawowa logika biznesowa – import pliku CSV i zapis do bazy – ✔️
3. CRUD co najmniej jednego zasobu (Create, Read, Update, Delete) – ❌ (do uzupełnienia)  
   • Proponowany zasób: imports

4. Działający, sensowny test:  
   • Unit-test dla co najmniej jednej funkcji lub endpointu – ✔️ (auth, upload, dashboard metrics)  
   • E2E-test pokrywający przepływ użytkownika (np. upload + lista importów) – częściowo (auth)  ❌ (do uzupełnienia)

5. Scenariusz CI/CD na GitHub Actions (uruchamianie testów automatycznie) – ✔️


---

_Przygotowane na podstawie specyfikacji PRD (`prd.md`), UI-plan (`ui-plan.md`) oraz dotychczasowej implementacji w repozytorium._ 