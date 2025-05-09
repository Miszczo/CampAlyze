# Plan Testów - campAlyze

## 1. Wprowadzenie

### 1.1 Cel dokumentu

Celem tego dokumentu jest określenie strategii, zakresu, zasobów i harmonogramu działań testowych dla aplikacji webowej `campAlyze` (MVP). Plan ten ma zapewnić systematyczne podejście do weryfikacji jakości, funkcjonalności, wydajności i bezpieczeństwa aplikacji przed jej wdrożeniem.

### 1.2 Zakres testowania

Testowanie obejmie wszystkie kluczowe funkcjonalności zdefiniowane w wymaganiach MVP, w tym:

- Uwierzytelnianie i zarządzanie użytkownikami (Rejestracja, Logowanie, Weryfikacja Email, Reset Hasła).
- Import danych z plików CSV/XLSX (Google Ads, Meta Ads).
- Walidacja i przetwarzanie danych.
- Interaktywny dashboard (wizualizacja metryk, filtrowanie, segmentacja).
- Porównywanie efektywności kampanii i platform.
- Porównywanie okresów.
- Podstawowe funkcje AI (automatyczne podsumowania, proste rekomendacje, detekcja anomalii).
- Eksport danych (CSV/XLSX/PDF - _zgodnie z US-015_).
- System alertów i flagowania (_zgodnie z US-011_).
- Dziennik zmian (_zgodnie z US-012, US-013, US-014_).
- Testy niefunkcjonalne: wydajność, bezpieczeństwo, użyteczność, kompatybilność.

Poza zakresem MVP (i tym samym tego planu) znajdują się funkcje wymienione w sekcji 4 PRD (np. automatyczna integracja API, zaawansowane AI, atrybucja wielokanałowa).

### 1.3 Odniesienia do dokumentacji projektu

- Dokument wymagań produktu (PRD): `.ai/prd.md`
- Stack technologiczny: `.ai/tech-stack.md`
- Historyjki użytkowników (US-xxx) zawarte w PRD.

## 2. Strategia testowania

### 2.1 Podejście do testowania

Przyjęte zostanie podejście oparte na ryzyku, koncentrujące się na krytycznych ścieżkach użytkownika i funkcjonalnościach mających największy wpływ na wartość biznesową. Wykorzystane zostaną zarówno techniki testowania manualnego, jak i automatycznego, ze szczególnym naciskiem na automatyzację testów regresji dla kluczowych przepływów. Testy będą przeprowadzane na różnych poziomach, aby zapewnić kompleksowe pokrycie.

### 2.2 Poziomy testowania

- **Testy jednostkowe (Unit Tests):** Weryfikacja poszczególnych komponentów i funkcji (głównie w `src/lib`, komponentach React, funkcjach Supabase Edge Functions). Wykonywane przez deweloperów.
- **Testy integracyjne (Integration Tests):** Sprawdzanie interakcji między komponentami (np. frontend <-> API Supabase, komponenty React <-> biblioteki wizualizacji, proces importu <-> baza danych, API <-> usługa AI).
- **Testy systemowe (System Tests):** Testowanie aplikacji jako całości z perspektywy użytkownika końcowego (end-to-end), obejmujące przepływy pracy zdefiniowane w historyjkach użytkowników. W dużej mierze automatyzowane dla krytycznych ścieżek.
- **Testy akceptacyjne użytkownika (UAT):** Przeprowadzane przez interesariuszy lub wybraną grupę użytkowników w celu potwierdzenia zgodności z wymaganiami biznesowymi i oczekiwaniami.

### 2.3 Typy testów

- **Testy funkcjonalne:** Weryfikacja zgodności działania aplikacji z wymaganiami funkcjonalnymi (historyjkami użytkowników). Obejmuje testowanie poprawności działania importu, obliczeń metryk, filtrowania, wizualizacji, AI itp.
- **Testy niefunkcjonalne:**
  - **Testy wydajnościowe:** Ocena szybkości reakcji aplikacji pod obciążeniem. Definiowanie i weryfikacja akceptowalnych czasów odpowiedzi dla kluczowych operacji (np. import pliku 100k wierszy < 2 minuty, ładowanie dashboardu z danymi z 6 miesięcy < 5s, średni czas odpowiedzi API < 500ms pod obciążeniem X użytkowników - _konkretne cele TBD_). Wykorzystanie narzędzi do testów obciążeniowych (np. k6) i profilowania bazy danych.
  - **Testy bezpieczeństwa:** Weryfikacja odporności na podstawowe zagrożenia (np. XSS przez wgranie spreparowanego pliku, SQL Injection - choć Supabase częściowo mityguje, walidacja danych wejściowych na frontendzie i backendzie, kontrola dostępu oparta na rolach Supabase RLS i testy `broken access control`, bezpieczeństwo przechowywania plików w Supabase Storage, sprawdzanie nagłówków bezpieczeństwa HTTP, weryfikacja braku wycieku wrażliwych informacji w API).
  - **Testy użyteczności (Usability Testing):** Ocena intuicyjności interfejsu, łatwości nawigacji, czytelności prezentowanych danych i komunikatów. Planowane wykorzystanie testów zadaniowych (task-based testing) podczas UAT oraz potencjalnie zbieranie ustrukturyzowanego feedbacku (np. kwestionariusze typu SUS lub dedykowane).
  - **Testy kompatybilności:** Sprawdzenie poprawnego działania aplikacji w najnowszych stabilnych wersjach przeglądarek (Chrome, Firefox, Edge, Safari) na systemach Windows i macOS.
- **Testy regresji:** Weryfikacja, czy wprowadzone zmiany (nowe funkcje, poprawki błędów) nie wpłynęły negatywnie na istniejące funkcjonalności. Prowadzone głównie za pomocą zautomatyzowanych zestawów testów (E2E dla krytycznych ścieżek, integracyjne dla API) uruchamianych regularnie (np. w CI/CD).

## 3. Środowiska testowe

- **Środowisko deweloperskie (Lokalne):** Wykorzystywane do testów jednostkowych i wstępnych integracyjnych.
- **Środowisko testowe (Staging):** Odizolowana instancja aplikacji, maksymalnie zbliżona do środowiska produkcyjnego. Wykorzystuje oddzielną instancję Supabase. Służy do testów systemowych, integracyjnych, wydajnościowych i UAT.
- **Środowisko produkcyjne (Production):** Ostateczne testy "dymne" (smoke tests) po wdrożeniu.

**Konfiguracje:**

- Przeglądarki: Najnowsze stabilne wersje Chrome, Firefox, Edge, Safari.
- Systemy operacyjne: Windows 10/11, najnowsza wersja macOS.

**Dane testowe:**

- Zestawy plików CSV/XLSX:
  - Poprawne pliki Google Ads i Meta Ads (różne rozmiary: małe, średnie, duże - np. 100, 1k, 10k, 100k wierszy).
  - Pliki z brakującymi wymaganymi kolumnami.
  - Pliki z niepoprawnymi formatami danych w kolumnach (liczbowe, daty, tekstowe).
  - Pliki puste lub zawierające tylko nagłówki.
  - Pliki z danymi rozdzielanymi różnymi separatorami (jeśli dotyczy).
  - Pliki o różnym kodowaniu znaków (jeśli relevantne).
  - Pliki zawierające potencjalnie szkodliwy kod (np. formuły w XLSX, skrypty w komórkach tekstowych) do testów bezpieczeństwa/sanityzacji.
- Zestawy danych w bazie Supabase symulujące różne scenariusze (brak danych, dane z jednego okresu, dane z wielu okresów, dane z anomaliami, duża liczba kampanii/grup reklam).
- "Złoty zestaw" danych (Golden Dataset): Reprezentatywny zestaw danych wejściowych z predefiniowanymi, oczekiwanymi wynikami metryk i potencjalnie oczekiwanymi/akceptowalnymi odpowiedziami AI, służący do weryfikacji kluczowych obliczeń i funkcji.

## 4. Szczegółowe przypadki testowe (Przykłady wysokopoziomowe)

_Poniższe przykłady ilustrują zakres testów. **Szczegółowe przypadki testowe** z precyzyjnymi krokami, danymi wejściowymi i oczekiwanymi rezultatami zostaną opracowane w dedykowanych plikach `.md` (zgodnie z sekcją 9) lub w narzędziu do zarządzania testami, jeśli zapadnie taka decyzja. Rozwiązanie zidentyfikowanych niejasności (sekcja 10) jest warunkiem koniecznym do stworzenia precyzyjnych przypadków._

### 4.1 Import danych (US-004, US-005)

- **TC-IMP-001:** Pomyślny import poprawnego pliku CSV Google Ads (mały/średni/duży). _Oczekiwany rezultat:_ Komunikat sukcesu, dane poprawnie zmapowane i zapisane w DB, widoczne w historii importu i na dashboardzie, platforma poprawnie rozpoznana.
- **TC-IMP-002:** Pomyślny import poprawnego pliku XLSX Meta Ads (mały/średni/duży). (Analogicznie)
- **TC-IMP-003:** Walidacja - Nieudany import pliku z brakującą wymaganą kolumną. _Oczekiwany rezultat:_ Czytelny komunikat błędu wskazujący brakującą kolumnę, import odrzucony.
- **TC-IMP-004:** Walidacja - Nieudany/częściowy import pliku z niepoprawnym formatem danych (np. tekst w kolumnie numerycznej). _Oczekiwany rezultat:_ Zależnie od strategii (patrz sekcja 10) - komunikat błędu wskazujący problematyczny wiersz/kolumnę, import odrzucony LUB import poprawnych wierszy z logiem błędów dla odrzuconych.
- **TC-IMP-005:** Wydajność - Import dużego pliku (np. 100k wierszy). _Oczekiwany rezultat:_ Import zakończony w akceptowalnym czasie (cel: < 2 minuty), brak timeoutów, responsywność interfejsu podczas importu (np. widoczny progress bar).
- **TC-IMP-006:** Bezpieczeństwo - Próba wgrania pliku z kodem JS/formułą w komórce. _Oczekiwany rezultat:_ Import zakończony (lub odrzucony - zależnie od strategii), ale potencjalnie szkodliwa zawartość jest poprawnie sanityzowana i nie wykonuje się w aplikacji.
- **TC-IMP-007:** Testowanie różnych separatorów i kodowań (jeśli dotyczy).

### 4.2 Interaktywny dashboard (US-007, US-008, US-009, US-010)

- **TC-DSH-001:** Weryfikacja poprawności obliczania metryk (CPC, CTR, Konwersje, Koszt/konw., ROAS) - porównanie z "Golden Dataset" i manualnymi obliczeniami.
- **TC-DSH-002:** Poprawność wizualizacji danych na wykresach (zgodność z danymi tabelarycznymi, poprawność typów wykresów, czytelność).
- **TC-DSH-003:** Filtrowanie (platforma, zakres dat, kampania) - sprawdzenie poprawności filtrowania i aktualizacji danych oraz wizualizacji.
- **TC-DSH-004:** Segmentacja danych - weryfikacja poprawności grupowania i agregacji danych.
- **TC-DSH-005:** Porównanie platform - sprawdzenie poprawności wyświetlania zagregowanych metryk i wizualizacji porównawczych.
- **TC-DSH-006:** Porównanie okresów - weryfikacja poprawności obliczeń procentowych zmian, obsługa braku danych w poprzednim okresie.
- **TC-DSH-007:** Wydajność - Czas ładowania dashboardu z różną ilością danych (mało/średnio/dużo). _Oczekiwany rezultat:_ Ładowanie w akceptowalnym czasie (cel: < 5s dla danych z 6 miesięcy).
- **TC-DSH-008:** Responsywność dashboardu (desktop, tablet, mobile).

### 4.3 Funkcje AI (US-017, US-018, US-019, US-020)

- **TC-AI-001:** Generowanie podsumowania dla kampanii/zakresu z danymi - Weryfikacja czy podsumowanie jest: zwięzłe, zawiera kluczowe metryki, jest zgodne z danymi, językowo poprawne i **trafne** (ocena jakościowa).
- **TC-AI-002:** Generowanie podsumowania przy braku/niewystarczającej ilości danych - sprawdzenie komunikatu zwrotnego.
- **TC-AI-003:** Weryfikacja wykrywania prostych anomalii (np. nagły spadek CTR, wzrost CPC) - użycie danych testowych z wprowadzonymi anomaliami, weryfikacja czy system je flaguje. Sprawdzenie obsługi fałszywych pozytywów (jeśli możliwe).
- **TC-AI-004:** Ocena jakości generowanych rekomendacji - Czy są logiczne, **oparte na danych**, potencjalnie **użyteczne** (ocena jakościowa), zgodne z zdefiniowanym poziomem "prostych" rekomendacji (patrz sekcja 10).
- **TC-AI-005:** Generowanie raportu AI dla wybranego zakresu - sprawdzenie poprawności danych, wniosków i spójności raportu.
- **TC-AI-006:** Test obsługi błędów API OpenRouter.ai (limity, niedostępność modelu, niepoprawny API key) - sprawdzenie czytelnych komunikatów dla użytkownika i logowania błędów.
- **TC-AI-007:** Testowanie spójności odpowiedzi AI (dla tych samych danych wejściowych, odpowiedzi powinny być podobne, choć niekoniecznie identyczne).
- **TC-AI-008:** Testowanie prompt injection (jeśli dane użytkownika są częścią promptu) - próba manipulacji promptem przez spreparowane dane wejściowe (np. w nazwach kampanii).
- **Strategia oceny jakości AI:** Ze względu na niedeterministyczną naturę LLM, ocena jakości będzie opierać się na kombinacji:
  - Porównania z predefiniowanymi oczekiwaniami dla "Golden Dataset".
  - Ręcznej oceny przez testerów QA wg zdefiniowanych kryteriów (np. trafność, spójność, użyteczność w skali 1-5).
  - Weryfikacji, czy AI nie generuje treści szkodliwych, nieprawdziwych lub niezwiązanych z kontekstem.

### 4.4 Uwierzytelnianie (US-001, US-002, US-XXX - Reset Hasła)

- **TC-AUTH-001:** Pomyślna rejestracja nowego użytkownika.
- **TC-AUTH-002:** Walidacja pól rejestracji (format email, siła hasła, wymagane pola).
- **TC-AUTH-003:** Obsługa rejestracji z istniejącym adresem email.
- **TC-AUTH-004:** Weryfikacja email (poprawność linku, aktywacja konta).
- **TC-AUTH-005:** Ponowne wysłanie linku weryfikacyjnego.
- **TC-AUTH-006:** Pomyślne logowanie.
- **TC-AUTH-007:** Nieudane logowanie (błędne hasło, nieistniejący użytkownik, konto niezweryfikowane). Sprawdzenie mechanizmu blokady konta (np. po 5 nieudanych próbach).
- **TC-AUTH-008:** Proces resetowania hasła (generowanie linku, ważność linku, ustawienie nowego hasła).
- **TC-AUTH-009:** Zarządzanie sesją (wylogowanie, ważność sesji).
- **TC-AUTH-010:** Kontrola dostępu - próba dostępu do zasobów wymagających logowania bez aktywnej sesji.

## 5. Harmonogram i zasoby

- **Harmonogram:** Testy będą prowadzone równolegle z rozwojem poszczególnych funkcjonalności (zgodnie ze sprintami/cyklami rozwojowymi). UAT planowane na ostatni tydzień przed planowanym końcem MVP. Szczegółowy harmonogram zostanie doprecyzowany w narzędziu do zarządzania projektem (np. GitHub Projects).
- **Zasoby:**
  - 1-2 Inżynierów QA. **Uwaga:** Zakres MVP jest szeroki. Przy ograniczonej liczbie testerów kluczowe jest rygorystyczne priorytetyzowanie zadań testowych w oparciu o ryzyko i ścisła komunikacja na temat potencjalnych wąskich gardeł lub obszarów o ograniczonym pokryciu testowym.
  - Dostęp do środowisk testowych (w tym dedykowanej instancji Supabase).
  - Narzędzia do automatyzacji (Vitest, Playwright/Cypress).
  - Narzędzie do zarządzania testami i defektami (GitHub Issues + Markdown/GitHub Projects - patrz sekcja 9).
  - Narzędzia do testów wydajności (np. k6, Supabase `pg_stat_statements`).
  - Narzędzia do podstawowych skanów bezpieczeństwa (np. ZAP, wbudowane narzędzia przeglądarek).
- **Role i odpowiedzialności:**
  - Deweloperzy: Testy jednostkowe, code reviews, poprawa zgłoszonych defektów.
  - Inżynierowie QA: Projektowanie i utrzymanie przypadków testowych (manualnych i automatycznych), wykonywanie testów integracyjnych, systemowych, niefunkcjonalnych, regresji, raportowanie i weryfikacja defektów, utrzymanie automatyzacji, analiza wyników testów.
  - Product Owner/Interesariusze: Udział w UAT, definiowanie priorytetów, akceptacja funkcjonalności, pomoc w wyjaśnianiu niejasności (sekcja 10).

## 6. Zarządzanie ryzykiem

| Ryzyko                                           | Prawdopodobieństwo | Wpływ  | Strategia mitygacji                                                                                                                                             |
| :----------------------------------------------- | :----------------- | :----- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Błędy w logice obliczeń metryk                   | Średnie            | Wysoki | Dokładne testy jednostkowe i integracyjne, porównanie z "Golden Dataset" i manualnymi obliczeniami, code reviews logiki biznesowej.                             |
| Problemy z wydajnością importu/dashboardu        | Średnie            | Średni | Zdefiniowane cele wydajnościowe (NFRs), testy wydajnościowe z dużymi zestawami danych, profilowanie zapytań SQL/Edge Functions, optymalizacje.                  |
| Luki bezpieczeństwa przy imporcie/API            | Średnie            | Wysoki | Testy bezpieczeństwa (XSS, walidacja inputów, RLS, nagłówki HTTP, skanowanie), stosowanie Supabase RLS, sanityzacja danych, bezpieczna konfiguracja.            |
| Niska jakość/trafność/bezpieczeństwo wyników AI  | Średnie            | Średni | Zdefiniowana strategia oceny jakości (sekcja 4.3), testowanie z różnorodnymi danymi, monitoring, testy prompt injection, możliwość dostosowania promptów.       |
| Problemy z kompatybilnością przeglądarek         | Niskie             | Niski  | Testy na głównych przeglądarkach, wykorzystanie frameworków dbających o kompatybilność (Astro, React), potencjalna automatyzacja E2E cross-browser.             |
| Niezgodność importu z różnymi formatami plików   | Średnie            | Średni | Jasne zdefiniowanie wymagań formatu (sekcja 10), dokładna walidacja, testowanie z różnymi plikami eksportowanymi, czytelne błędy dla użytkownika.               |
| Błędy w integracji z Supabase/OpenRouter         | Niskie             | Wysoki | Testy integracyjne, monitorowanie logów, kompleksowa obsługa błędów API (retry logic, circuit breaker - jeśli zasadne), testy kontraktowe (jeśli API stabilne). |
| Niedostateczne pokrycie testami z powodu zasobów | Średnie            | Średni | Priorytetyzacja oparta na ryzyku, automatyzacja krytycznych ścieżek, transparentna komunikacja o pokryciu i ryzyku szczątkowym.                                 |

## 7. Kryteria akceptacji

### 7.1 Kryteria wejścia (Rozpoczęcie testów danej funkcjonalności/sprintu)

- Dostępna stabilna wersja aplikacji/funkcjonalności na środowisku testowym (Staging).
- Ukończone i zdane testy jednostkowe oraz code review dla danej funkcjonalności.
- Dostępna dokumentacja (Historyjki użytkownika, wymagania).
- Przygotowane środowisko testowe i wstępne dane testowe.
- Rozwiązane kluczowe niejasności (sekcja 10) dotyczące danej funkcjonalności.

### 7.2 Kryteria wyjścia (Zakończenie testów / Akceptacja MVP)

- Wykonanie wszystkich zaplanowanych, priorytetowych przypadków testowych dla zakresu MVP.
- Osiągnięcie wymaganego pokrycia testami (np. 100% wykonanych testów krytycznych, >90% wykonanych testów wysokiego priorytetu, >80% zdanych z wykonanych). _Dokładne progi % do potwierdzenia z PO._
- Brak otwartych defektów o priorytecie `critical`.
- Brak otwartych defektów o priorytecie `high`.
- Liczba otwartych defektów `medium` i `low` mieści się w akceptowalnym progu **(Próg TBD z Product Ownerem)**.
- Spełnienie kluczowych metryk sukcesu z PRD, zweryfikowanych przez **udokumentowane wyniki testów** (np. raporty z testów wydajności, wyniki testów zadaniowych z UAT, pokrycie wymagań).
- Pomyślne przejście testów UAT i formalna akceptacja przez Product Ownera.
- Podpisanie protokołu odbioru testów (lub jego cyfrowy odpowiednik).

## 8. Raportowanie i śledzenie defektów

- **Proces raportowania:** Wszystkie znalezione defekty będą raportowane jako **Issues w repozytorium GitHub** projektu. Każdy raport będzie tworzony przy użyciu zdefiniowanego szablonu (issue template) i będzie zawierał co najmniej:
  - Tytuł (zwięzły opis problemu, np. `[Bug] Dashboard - Niepoprawne obliczenie CTR dla Meta Ads`).
  - Środowisko testowe (`staging`, `local`, `prod`).
  - Wersja/Build aplikacji (jeśli dostępna).
  - Kroki do reprodukcji (numerowane, precyzyjne).
  - Wynik aktualny (opis, screenshot, logi).
  - Wynik oczekiwany.
  - Etykiety (Labels):
    - **Priorytet:** `priority:critical`, `priority:high`, `priority:medium`, `priority:low` (ustalany wspólnie z PO/dev teamem).
    - **Typ:** `type:bug`, `type:enhancement`, `type:task`.
    - **Status:** `status:open`, `status:in-progress`, `status:ready-for-qa`, `status:closed`, `status:reopened`.
    - **Moduł/Funkcjonalność:** np. `module:import`, `module:dashboard`, `module:auth`, `module:ai`.
  - Przypisanie (Assignee).
  - Severity (Opcjonalnie: `severity:blocker`, `severity:major`, `severity:minor`, `severity:trivial` - jeśli potrzebne jest rozróżnienie wpływu technicznego od priorytetu biznesowego).
  - Załączniki (dodawane w komentarzach: zrzuty ekranu, GIFy/wideo, logi konsoli, logi backendu, problematyczne pliki).
- **Cykl życia defektu:** Zarządzany za pomocą etykiet statusu i przypisań w GitHub Issues. Standardowy przepływ: `status:open` -> `status:in-progress` (Developer) -> `status:ready-for-qa` (Developer po rozwiązaniu) -> `status:in-progress` (QA podczas weryfikacji) -> `status:closed` (QA po pomyślnej weryfikacji) / `status:reopened` (QA jeśli błąd nadal występuje).
- **Narzędzia:** **GitHub Issues** i **GitHub Projects** do wizualizacji postępu i zarządzania backlogiem defektów.
- **Raporty:** Status defektów i postęp testów będą regularnie omawiane (np. na daily stand-up). Widoki GitHub Projects będą służyć jako dashboard postępu. Generowanie formalnych raportów (np. tygodniowych podsumowań) może odbywać się manualnie na podstawie danych z GitHub Issues/Projects.

## 9. Proponowane narzędzia testowe

- **Testy jednostkowe/integracyjne:** **Vitest** (zgodnie z `.ai/tech-stack.md`). Celem jest pokrycie logiki biznesowej w `src/lib`, kluczowych funkcji pomocniczych, komponentów React oraz interakcji z API Supabase i OpenRouter (testy integracyjne dla kluczowych endpointów).
- **Testy E2E (Systemowe/Akceptacyjne):** **Playwright** (do wyboru przez zespół). Celem jest automatyzacja **krytycznych ścieżek użytkownika** (np. rejestracja->logowanie->import->podstawowa weryfikacja dashboardu) jako główny element zestawu testów regresji.
- **Testy wydajnościowe:** **k6** (pisanie skryptów w JS, symulacja obciążenia API i potencjalnie frontendu) oraz narzędzia **Supabase** (`pg_stat_statements`, `explain analyze`) do profilowania bazy danych.
- **Testy bezpieczeństwa (podstawowe):** **OWASP ZAP** (automatyczny skaner), narzędzia deweloperskie przeglądarek, manualna weryfikacja wg checklisty OWASP Top 10 (dla aplikacji webowych).
- **Zarządzanie przypadkami testowymi:** **Pliki Markdown (`.md`) w dedykowanym katalogu w repozytorium** (np. `/tests/test-cases/`). Struktura katalogów może odzwierciedlać moduły aplikacji. **Uwaga:** Chociaż wersjonowanie z kodem jest zaletą, zarządzanie wykonaniem i historią w `.md` może być trudne w dłuższej perspektywie. Zespół powinien być świadomy tego ograniczenia i rozważyć przejście na dedykowane narzędzie (nawet lekkie, np. TestLink, lub integracje Jira), jeśli obecne podejście okaże się niewystarczające. Status wykonania może być śledzony manualnie w plikach lub w ramach zadań w GitHub Projects.
- **Zarządzanie defektami:** **GitHub Issues** z wykorzystaniem etykiet, szablonów (issue templates) i **GitHub Projects** do organizacji pracy i wizualizacji statusu.

## 10. Niejasności i obszary do doprecyzowania

_Rozwiązanie poniższych niejasności jest **kluczowe** dla możliwości stworzenia precyzyjnych i efektywnych przypadków testowych oraz uniknięcia błędnych założeń._

- **Dokładne formaty plików CSV/XLSX (US-004):** Jakie są _wszystkie_ wymagane kolumny (nazwy nagłówków), ich oczekiwane typy danych (tekst, liczba, data - jaki format?), oraz czy kolejność kolumn ma znaczenie dla Google Ads i Meta Ads? Czy istnieją oficjalne/stabilne szablony eksportu, na których można bazować? Czy aplikacja powinna być elastyczna na zmiany nazw kolumn (np. przez mapowanie)?
- **Logika flagowania kampanii (US-011):** Jakie są _konkretne_ domyślne progi wydajności (np. spadek CTR o X% przez Y dni) dla flagowania? Czy są one globalne, czy konfigurowalne per użytkownik/platforma/typ kampanii? Jakie dokładnie metryki podlegają flagowaniu?
- **Szczegóły logiki AI (US-017, US-018, US-019):**
  - Jakie konkretnie modele AI z OpenRouter będą używane domyślnie (i czy użytkownik będzie miał wybór)?
  - Jakie są _konkretne przykłady_ oczekiwanych "prostych" rekomendacji? (np. "Zwiększ budżet kampanii X", "Wstrzymaj grupę reklam Y z niskim CTR").
  - Jak _dokładnie_ działa algorytm wykrywania anomalii (metoda statystyczna, progi, okres porównawczy)?
  - Jakie są oczekiwania dotyczące długości i szczegółowości generowanych podsumowań?
- **Obsługa błędów importu (US-004):** Jaka jest oczekiwana strategia? Czy import ma się zatrzymać przy pierwszym błędzie w wierszu/pliku (fail-fast), czy importować poprawne wiersze i szczegółowo logować/raportować błędy dla wierszy odrzuconych?
- **Role użytkowników i uprawnienia (US-003):** Poza adminem i użytkownikiem standardowym, czy MVP przewiduje inne role? Jakie są _dokładne_ różnice w dostępie do funkcji i danych między rolami (np. kto może importować dane, kto widzi dane wszystkich użytkowników, kto zarządza użytkownikami)?
- **Metryki sukcesu (PRD sekcja 6):** Należy doprecyzować progi i sposób pomiaru dla metryk jakościowych (np. "ocena 8/10 przez testerów" - ilu testerów? jaka skala? jaki kwestionariusz? Jaki jest próg akceptacji?).

Uzupełnienie tych informacji przez Product Ownera i zespół deweloperski pozwoli na stworzenie bardziej precyzyjnych przypadków testowych, lepszą estymację pracochłonności i skuteczniejszą weryfikację zgodności z oczekiwaniami.
