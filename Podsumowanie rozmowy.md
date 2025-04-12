
## Decyzje

<decisions>

1. Skupienie się wyłącznie na integracji z Google Ads i Meta Ads poprzez import plików CSV/XLSX w ramach MVP.
2. Ograniczenie rozbudowanych funkcjonalności i personalizacji dashboardu w celu szybkiego dostarczenia wartości użytkownikom (specjalistom i kierownictwu).
3. Ustalenie kluczowych metryk (CPC, CTR, konwersje, koszt/konwersję, ROAS) jako podstawowych parametrów do prezentacji w dashboardzie.
4. Uwzględnienie w projekcie prostych alertów informujących o błędach podczas importowania plików.
5. Opracowanie prostego systemu logowania użytkowników (auth), wykorzystującego np. Firebase dla łatwej integracji.
6. Podział prac na krótkie etapy (maksymalnie 3–4 tygodnie) z uwzględnieniem priorytetów i minimalnych środków bezpieczeństwa danych.
7. Implementacja podstawowego mechanizmu walidacji plików CSV oraz prostego systemu logów w celu monitorowania aktywności.
8. Wprowadzenie przynajmniej jednego scenariusza testu (unit lub e2e) i konfiguracji CI/CD (np. GitHub Actions) do automatycznego uruchamiania testów.

</decisions>

## Dopasowane rekomendacje

<matched_recommendations>

1. Użycie Firebase Authentication jako szybkiego rozwiązania do zarządzania logowaniem użytkowników.
2. Dodanie minimalnej walidacji plików CSV (sprawdzenie wymaganych kolumn i formatów danych) oraz prostych alertów błędów.
3. Zapewnienie podstawowych zabezpieczeń, takich jak szyfrowanie komunikacji (HTTPS) i kontrola dostępu do danych.
4. Podział prac na etapy: konfiguracja logowania, zaimplementowanie logiki biznesowej, przygotowanie CRUD, testy i konfiguracja CI/CD.
5. Stworzenie jednego sensownego testu, który sprawdzi kluczowe funkcjonalności (unit test lub e2e test).
6. Rozszerzenie CI/CD o automatyczne uruchamianie testów po każdym pushu, co usprawni proces rozwoju i wykrywanie błędów.

</matched_recommendations>

## Podsumowanie planowania PRD

<prd_planning_summary>

Projekt koncentruje się na stworzeniu MVP narzędzia do analizy kampanii z Google Ads i Meta Ads, korzystającego z ręcznego importu plików CSV. Główne wymagania obejmują prosty system logowania (preferowane Firebase), weryfikację i walidację danych, dashboard z kluczowymi metrykami (CPC, CTR, konwersje, koszt/konwersję, ROAS) oraz podstawowe mechanizmy porównania wyników kampanii. Kluczowe historie użytkownika skupiają się na szybkim imporcie i analizie danych, możliwości identyfikowania kampanii wymagających optymalizacji oraz przeglądzie zmian wprowadzonych przez specjalistów.

Najważniejsze kryteria sukcesu to ograniczenie czasu analizy o przynajmniej 40% i uzyskanie wysokiej częstotliwości korzystania z aplikacji wśród grupy docelowej (minimum 2 razy w tygodniu). Z uwagi na ograniczony budżet i krótki czas realizacji (3–4 tygodnie), zastosowane zostaną minimalne środki bezpieczeństwa danych (m.in. szyfrowanie połączeń, prosta kontrola uprawnień). W projekcie uwzględniono również podstawowy system alertów przy błędach importu, a w ramach CI/CD na GitHub Actions uruchamiane będą testy (unit lub e2e) po każdym wprowadzeniu zmian.

</prd_planning_summary>

## Nierozwiązane kwestie

<unresolved_issues>

1. Szczegółowy schemat wymagań dotyczących kolumn i formatów plików CSV (np. dokładne nazwy kolumn i oczekiwane typy danych) pozostaje do ustalenia.
2. Zakres i sposób raportowania logów w celu monitorowania aktywności użytkowników wymaga dodatkowego doprecyzowania.
3. Konieczne jest ustalenie konkretnej architektury i środowiska docelowego (np. wybór bazy danych, docelowy hosting) w kontekście krótkoterminowej i dalszej rozbudowy projektu.

</unresolved_issues>