# Dokument wymagań produktu (PRD) - Narzędzie analityczne do kampanii reklamowych

## 1. Przegląd produktu

Narzędzie analityczne do kampanii reklamowych to aplikacja webowa zaprojektowana z myślą o specjalistach ds. reklam, którzy potrzebują szybkiego i efektywnego sposobu analizowania danych z różnych platform reklamowych. MVP produktu skupia się na importowaniu i analizie danych z plików CSV/XLSX eksportowanych z Google Ads i Meta Ads, oferując interaktywny dashboard z kluczowymi metrykami oraz możliwość porównania efektywności kampanii. Dodatkowo, już na etapie MVP zaimplementujemy podstawowe funkcje AI do generowania automatycznych podsumowań i prostych rekomendacji.

Rozwiązanie to adresuje problem zbyt długiego czasu poświęcanego na manualne zbieranie, łączenie i analizowanie danych reklamowych, co ogranicza zdolność specjalistów do szybkiego reagowania i optymalizowania kampanii. Dzięki narzędziu użytkownicy mogą szybciej podejmować decyzje oparte na danych, co prowadzi do bardziej efektywnego wykorzystania budżetów reklamowych.

Czas realizacji MVP wynosi 3-4 tygodnie, z naciskiem na dostarczenie podstawowej, ale wartościowej funkcjonalności, która przyniesie natychmiastowe korzyści użytkownikom.

## 2. Problem użytkownika

Specjaliści ds. reklam stoją przed następującymi wyzwaniami:

1. Tracą zbyt wiele czasu na manualne zbieranie, łączenie i analizowanie danych z różnych platform reklamowych (Google Ads, Meta Ads).
2. Rozproszenie danych między różnymi platformami utrudnia szybkie podejmowanie decyzji i reagowanie na zmiany w efektywności kampanii.
3. Brak kompleksowego widoku wszystkich kampanii w jednym miejscu ogranicza możliwość porównania ich efektywności.
4. Trudno jest śledzić wprowadzone zmiany w kampaniach i weryfikować ich wpływ na wyniki.
5. Brak automatycznych alertów o kampaniach wymagających uwagi powoduje opóźnienia w optymalizacji.
6. Brak automatycznej analizy danych przez AI wymaga ręcznego wyciągania wniosków, co jest czasochłonne i podatne na błędy.

Te wyzwania znacząco ograniczają zdolność specjalistów do szybkiego reagowania i optymalizacji kampanii, co w konsekwencji prowadzi do nieefektywnego wykorzystania budżetów reklamowych.

## 3. Wymagania funkcjonalne

### 3.1 Import i przetwarzanie danych

- Import danych z plików CSV/XLSX eksportowanych z Google Ads i Meta Ads
- Walidacja plików pod kątem wymaganych kolumn i formatów danych
- Alerty informujące o błędach podczas importowania plików
- Możliwość przetwarzania podstawowych metryk: CPC, CTR, konwersje, koszt/konwersję, ROAS

### 3.2 Interaktywny dashboard

- Wizualizacja kluczowych metryk (CPC, CTR, konwersje, koszt/konwersję, ROAS)
- Widok porównawczy platform - zestawienie efektywności kampanii z różnych platform na jednym ekranie
- Podstawowa segmentacja danych według platform, kampanii i okresu czasu
- Porównanie okresów - zestawienie wyników bieżącego tygodnia/miesiąca z poprzednim

### 3.3 System alertów i flagowania

- System prostych flag wskazujący kampanie z potencjalnymi problemami na podstawie progów wydajności
- Powiadomienia o kampaniach wymagających uwagi

### 3.4 Dziennik zmian

- Rejestrowanie wprowadzonych zmian w kampaniach z datą i opisem
- Oznaczenie daty planowanej weryfikacji efektów
- Lista nadchodzących weryfikacji widoczna na dashboardzie
- Możliwość porównania metryk przed i po wprowadzeniu zmiany

### 3.5 Eksport danych

- Eksport raportów do formatów CSV/PDF/XLSX
- Możliwość wyboru zakresu danych do eksportu

### 3.6 System kont użytkowników

- Prosty system logowania użytkowników z wykorzystaniem **Supabase Authentication**
- Podstawowe zarządzanie dostępem i uprawnieniami
- Rejestrowanie aktywności użytkowników

### 3.7 Funkcje AI

- Automatyczne generowanie tekstowych podsumowań wyników kampanii
- Wskazywanie potencjalnych trendów i anomalii w danych
- Proste rekomendacje dotyczące optymalizacji kampanii
- Generowanie krótkich raportów na podstawie wybranych metryk i okresów

## 4. Granice produktu

Następujące funkcjonalności są poza zakresem MVP:

1. Automatyczna integracja z API Google Ads i Meta Ads (zamiast tego import CSV/XLSX)
2. Zaawansowany system wykrywania anomalii w wynikach kampanii
3. Automatyczne raportowanie cykliczne wysyłane e-mailem
4. Zaawansowane algorytmy predykcyjne i modele uczenia maszynowego
5. Wielokanałowa atrybucja konwersji
6. Integracja z innymi platformami reklamowymi poza Google Ads i Meta Ads
7. Automatyzacja wdrażania rekomendacji bezpośrednio na platformach
8. Zaawansowane porównania benchmarkowe z danymi branżowymi
9. Integracja z systemami CRM, marketing automation i analityką webową
10. Funkcje współpracy zespołowej i zarządzania zadaniami
11. Personalizowane dashboardy tworzone przez użytkowników
12. Analizy semantyczne treści reklamowych
13. Automatyczne powiadomienia e-mail o zaplanowanych weryfikacjach zmian

## 4.1 Minimal MVP (na ostatni moment przed terminem)

Aby spełnić wymagania projektu zaliczeniowego z minimalnym nakładem pracy, należy skupić się na następujących zadaniach:

### 4.1.1 CRUD dla importów (minimalny zakres)

- Endpoint `GET /api/imports` – lista importów (bez paginacji)
- Endpoint `DELETE /api/imports/:id` – usunięcie importu
- UI: prosta strona `/imports` z tabelą importów i przyciskiem usunięcia

### 4.1.2 Test E2E dla przepływu użytkownika

- Test E2E (Playwright) obejmujący:
  - Logowanie użytkownika
  - Przejście do listy importów
  - Usunięcie importu

### 4.1.3 Prosta analiza AI z OpenRouter

- Prosty endpoint `POST /api/ai-insights/analyze` analizujący dane z importu
- Integracja z OpenRouter używając gpt-3.5-turbo
- Podstawowy prompt systemowy dla analizy kampanii
- Prosty UI pokazujący wyniki analizy
- Strona szczegółów importu (`/imports/[id]`) z listą kampanii i przyciskiem analizy AI
- Testy jednostkowe dla endpointu i komponentu UI

### 4.1.4 Podstawowe wymagania projektu zaliczeniowego (już zaimplementowane)
- Obsługa logowania użytkownika (Auth)
- Podstawowa logika biznesowa – import pliku CSV i zapis do bazy
- Scenariusz CI/CD na GitHub Actions (uruchamianie testów automatycznie)

## 5. Historyjki użytkowników

### Uwierzytelnianie i zarządzanie kontami

#### US-001

- Tytuł: Rejestracja nowego użytkownika
- Opis: Jako nowy użytkownik, chcę zarejestrować się w systemie, aby uzyskać dostęp do narzędzia analitycznego.
- Kryteria akceptacji:
  1. Użytkownik może się zarejestrować podając email, hasło i pełne imię
  2. System weryfikuje poprawność formatu adresu email
  3. System wymaga hasła o odpowiedniej sile (min. 8 znaków, w tym litery i cyfry)
  4. Po rejestracji system wysyła email weryfikacyjny na podany adres
  5. Użytkownik nie może korzystać z pełnej funkcjonalności (poza możliwością weryfikacji emaila i ponownego wysłania linku) bez potwierdzenia adresu email

#### US-002

- Tytuł: Logowanie użytkownika
- Opis: Jako zarejestrowany użytkownik, chcę zalogować się do systemu, aby korzystać z narzędzia.
- Kryteria akceptacji:
  1. Użytkownik może zalogować się podając prawidłowy email i hasło
  2. System blokuje konto na 15 minut po 5 nieudanych próbach logowania (wyświetlając odpowiedni komunikat)
  3. System oferuje opcję \"Zapomniałem hasła\"
  4. Po zalogowaniu użytkownik jest przekierowany na dashboard
  5. Użytkownik z niezweryfikowanym adresem email jest przekierowywany do strony weryfikacji

#### US-XXX (Nowy)

- Tytuł: Weryfikacja adresu email
- Opis: Jako nowo zarejestrowany użytkownik, chcę zweryfikować swój adres email, klikając link w otrzymanej wiadomości, aby uzyskać pełen dostęp do aplikacji.
- Kryteria akceptacji:
  1. Po kliknięciu linku weryfikacyjnego system potwierdza weryfikację adresu email
  2. Użytkownik jest informowany o pomyślnej weryfikacji i może przejść do logowania lub dashboardu (jeśli jest już zalogowany)
  3. System udostępnia opcję ponownego wysłania linku weryfikacyjnego, jeśli użytkownik go nie otrzymał lub link wygasł
  4. Link weryfikacyjny jest ważny przez określony czas (np. 24 godziny)

#### US-XXX (Nowy)

- Tytuł: Odzyskiwanie hasła (Zapomniałem hasła)
- Opis: Jako zarejestrowany użytkownik, który zapomniał hasła, chcę zainicjować proces resetowania hasła, aby odzyskać dostęp do konta.
- Kryteria akceptacji:
  1. Użytkownik może podać swój adres email na dedykowanej stronie \"Zapomniałem hasła\"
  2. System wysyła email z linkiem do resetowania hasła na podany adres, jeśli konto istnieje
  3. Email zawiera instrukcje i unikalny, ograniczony czasowo link do strony resetowania hasła
  4. Użytkownik jest informowany o wysłaniu emaila (lub o tym, że konto nie istnieje, bez ujawniania tej informacji wprost ze względów bezpieczeństwa)

#### US-XXX (Nowy)

- Tytuł: Resetowanie hasła
- Opis: Jako użytkownik, który otrzymał link do resetowania hasła, chcę ustawić nowe hasło, aby móc ponownie zalogować się na swoje konto.
- Kryteria akceptacji:
  1. Po kliknięciu linku resetującego użytkownik jest przekierowywany na stronę ustawiania nowego hasła
  2. Użytkownik musi podać nowe hasło i je potwierdzić
  3. System wymaga, aby nowe hasło spełniało kryteria siły (min. 8 znaków, litery i cyfry)
  4. Po pomyślnym ustawieniu nowego hasła użytkownik jest informowany o sukcesie i może się zalogować
  5. Link do resetowania hasła jest jednorazowy i wygasa po użyciu lub po określonym czasie (np. 1 godzinie)

#### US-003

- Tytuł: Zarządzanie uprawnieniami użytkowników
- Opis: Jako administrator, chcę zarządzać uprawnieniami użytkowników, aby kontrolować dostęp do danych i funkcjonalności.
- Kryteria akceptacji:
  1. Administrator może przypisywać role użytkownikom (admin, standardowy użytkownik)
  2. Administrator może dezaktywować konta użytkowników
  3. System pokazuje listę wszystkich użytkowników z ich rolami
  4. Zmiany uprawnień są natychmiast zastosowywane

### Import i przetwarzanie danych

#### US-004

- Tytuł: Import danych z plików CSV/XLSX
- Opis: Jako specjalista ds. reklam, chcę importować dane z plików CSV/XLSX z Google Ads i Meta Ads, aby analizować efektywność kampanii.
- Kryteria akceptacji:
  1. System pozwala na wybór i przesłanie plików CSV/XLSX
  2. System rozpoznaje platformę źródłową (Google Ads, Meta Ads)
  3. System weryfikuje, czy plik zawiera wymagane kolumny
  4. System informuje o błędach podczas importu
  5. Dane są poprawnie zapisywane w bazie danych

#### US-005

- Tytuł: Rozpoznawanie formatu danych
- Opis: Jako specjalista ds. reklam, chcę aby system automatycznie rozpoznawał format danych z różnych platform, aby zaoszczędzić czas na ręcznej konfiguracji.
- Kryteria akceptacji:
  1. System automatycznie rozpoznaje, czy plik pochodzi z Google Ads czy Meta Ads
  2. System mapuje kolumny z pliku na standardowy format wewnętrzny
  3. System informuje o problemach z mapowaniem
  4. Użytkownik może dostosować mapowanie w przypadku problemów

#### US-006

- Tytuł: Historia importów
- Opis: Jako specjalista ds. reklam, chcę widzieć historię importowanych plików, aby kontrolować zakres dostępnych danych.
- Kryteria akceptacji:
  1. System wyświetla listę wszystkich importów z datą, platformą i statusem
  2. Użytkownik może zobaczyć szczegóły każdego importu
  3. Użytkownik może usunąć dane z wybranego importu
  4. System pokazuje błędy, które wystąpiły podczas importu

### Dashboard i wizualizacja

#### US-007

- Tytuł: Wyświetlanie kluczowych metryk na dashboardzie
- Opis: Jako specjalista ds. reklam, chcę widzieć kluczowe metryki na dashboardzie, aby szybko ocenić efektywność kampanii.
- Kryteria akceptacji:
  1. Dashboard wyświetla metryki: CPC, CTR, konwersje, koszt/konwersję, ROAS
  2. Metryki są prezentowane w formie wykresów i liczb
  3. Użytkownik może wybrać zakres czasowy dla danych
  4. Dashboard odświeża się automatycznie po imporcie nowych danych

#### US-008

- Tytuł: Porównanie platform reklamowych
- Opis: Jako specjalista ds. reklam, chcę porównywać wyniki kampanii z różnych platform, aby zidentyfikować najskuteczniejsze kanały.
- Kryteria akceptacji:
  1. System wyświetla zestawienie tych samych metryk dla Google Ads i Meta Ads
  2. Użytkownik może filtrować dane według platform
  3. System prezentuje dane w formie wykresów porównawczych
  4. Użytkownik może przełączać się między różnymi widokami porównawczymi

#### US-009

- Tytuł: Segmentacja danych
- Opis: Jako specjalista ds. reklam, chcę segmentować dane według kampanii, platform i czasu, aby głębiej analizować wyniki.
- Kryteria akceptacji:
  1. System umożliwia filtrowanie danych według kampanii
  2. System umożliwia filtrowanie danych według platform
  3. System umożliwia filtrowanie danych według przedziałów czasowych
  4. Wszystkie wykresy i metryki aktualizują się po zastosowaniu filtrów

#### US-010

- Tytuł: Porównanie okresów
- Opis: Jako specjalista ds. reklam, chcę porównywać wyniki z różnych okresów, aby ocenić trendy i postępy w optymalizacji.
- Kryteria akceptacji:
  1. System umożliwia porównanie bieżącego tygodnia/miesiąca z poprzednim
  2. System wyświetla procentowe zmiany między okresami
  3. System prezentuje trendy na wykresach
  4. Użytkownik może definiować niestandardowe okresy do porównania

### System alertów

#### US-011

- Tytuł: Automatyczne flagi dla problemowych kampanii
- Opis: Jako specjalista ds. reklam, chcę otrzymywać automatyczne powiadomienia o kampaniach z problemami, aby szybko reagować na spadki efektywności.
- Kryteria akceptacji:
  1. System oznacza kampanie, które nie spełniają zdefiniowanych progów wydajności
  2. System sortuje kampanie według ważności problemów
  3. Użytkownik może zobaczyć szczegółowe informacje o każdym problemie
  4. System pozwala na dostosowanie progów dla alertów

### Dziennik zmian

#### US-012

- Tytuł: Rejestrowanie zmian w kampaniach
- Opis: Jako specjalista ds. reklam, chcę rejestrować wprowadzone zmiany w kampaniach, aby śledzić ich wpływ na wyniki.
- Kryteria akceptacji:
  1. Użytkownik może dodać wpis o wprowadzonej zmianie z datą i opisem
  2. Użytkownik może określić datę planowanej weryfikacji efektów
  3. System pozwala na kategoryzację zmian
  4. Wpisy są przypisane do konkretnych kampanii

#### US-013

- Tytuł: Lista nadchodzących weryfikacji
- Opis: Jako specjalista ds. reklam, chcę widzieć listę nadchodzących weryfikacji zmian, aby nie przeoczyć terminu oceny efektów.
- Kryteria akceptacji:
  1. Dashboard wyświetla listę nadchodzących weryfikacji
  2. System sortuje weryfikacje według daty
  3. System wyróżnia przeterminowane weryfikacje
  4. Użytkownik może przejść bezpośrednio do szczegółów zmiany z listy

#### US-014

- Tytuł: Porównanie wyników przed i po zmianie
- Opis: Jako specjalista ds. reklam, chcę porównać wyniki kampanii przed i po wprowadzeniu zmiany, aby ocenić jej skuteczność.
- Kryteria akceptacji:
  1. System pokazuje metryki kampanii przed i po dacie wprowadzenia zmiany
  2. System wylicza procentowe zmiany kluczowych metryk
  3. System prezentuje dane na wykresach z oznaczoną datą zmiany
  4. Użytkownik może dostosować zakres dat do porównania

### Eksport danych

#### US-015

- Tytuł: Eksport raportów
- Opis: Jako specjalista ds. reklam, chcę eksportować dane do różnych formatów, aby udostępniać je innym osobom lub używać w innych narzędziach.
- Kryteria akceptacji:
  1. System umożliwia eksport danych do formatów CSV, PDF i XLSX
  2. Użytkownik może wybrać zakres danych do eksportu
  3. Eksportowane raporty zawierają wszystkie widoczne metryki i filtry
  4. Eksportowane raporty zawierają datę wygenerowania i zastosowane filtry

### Bezpieczeństwo i monitorowanie

#### US-016

- Tytuł: Monitorowanie aktywności użytkowników
- Opis: Jako administrator, chcę monitorować aktywność użytkowników w systemie, aby zapewnić bezpieczeństwo danych.
- Kryteria akceptacji:
  1. System rejestruje logowania i wylogowania użytkowników
  2. System rejestruje akcje importu i eksportu danych
  3. Administrator może przeglądać logi aktywności
  4. System przechowuje logi przez określony czas

### AI i analiza danych

#### US-017

- Tytuł: Automatyczne podsumowania kampanii
- Opis: Jako specjalista ds. reklam, chcę otrzymywać automatycznie generowane podsumowania wyników kampanii, aby szybko zrozumieć ich wydajność bez konieczności analizowania wszystkich metryk.
- Kryteria akceptacji:
  1. System generuje zwięzłe podsumowanie tekstowe dla wybranych kampanii
  2. Podsumowanie zawiera kluczowe metryki i ich porównanie z poprzednim okresem
  3. Podsumowanie jest aktualizowane po każdym imporcie nowych danych
  4. Użytkownik może wygenerować podsumowanie dla dowolnego zakresu dat

#### US-018

- Tytuł: Wykrywanie trendów i anomalii
- Opis: Jako specjalista ds. reklam, chcę aby system automatycznie wykrywał trendy i anomalie w danych kampanii, aby szybciej identyfikować problemy i szanse.
- Kryteria akceptacji:
  1. System wykrywa i oznacza nietypowe wzrosty lub spadki w kluczowych metrykach
  2. System identyfikuje trendy w wydajności kampanii
  3. Anomalie są prezentowane w formie alertów na dashboardzie
  4. Użytkownik może dostosować czułość wykrywania anomalii

#### US-019

- Tytuł: Proste rekomendacje optymalizacyjne
- Opis: Jako specjalista ds. reklam, chcę otrzymywać podstawowe rekomendacje dotyczące optymalizacji kampanii, aby szybciej podejmować decyzje.
- Kryteria akceptacji:
  1. System generuje proste rekomendacje bazujące na analizie danych kampanii
  2. Rekomendacje są powiązane z konkretnymi metrykami i kampaniami
  3. System uzasadnia każdą rekomendację konkretnymi danymi
  4. Użytkownik może oznaczyć rekomendacje jako zaimplementowane lub odrzucone

#### US-020

- Tytuł: Generowanie raportów AI
- Opis: Jako specjalista ds. reklam, chcę generować automatyczne raporty AI na podstawie wybranych metryk i okresów, aby efektywniej raportować wyniki.
- Kryteria akceptacji:
  1. Użytkownik może wybrać kampanie, metryki i zakres dat do raportu
  2. System generuje raport tekstowy z kluczowymi wnioskami
  3. Raport zawiera porównania z poprzednimi okresami
  4. Użytkownik może edytować i dostosowywać wygenerowany raport
  5. Raport można eksportować do PDF lub wysłać e-mailem

## 6. Metryki sukcesu

Sukces produktu będzie mierzony następującymi wskaźnikami:

1. Redukcja czasu poświęcanego na analizę danych i raportowanie o minimum 40%
2. 75% użytkowników korzysta z narzędzia co najmniej 2 razy w tygodniu
3. 60% użytkowników dokumentuje wprowadzane zmiany w kampaniach w dzienniku zmian
4. 90% użytkowników uznaje, że narzędzie ułatwia im dostęp do kluczowych metryk kampanii
5. 80% użytkowników deklaruje, że narzędzie pozwala im podejmować lepsze decyzje dotyczące kampanii
6. Wizualna atrakcyjność i intuicyjność interfejsu zostaje oceniona na co najmniej 8/10 przez testerów
7. Czas potrzebny na import i przetworzenie danych nie przekracza 2 minut
8. Wskaźnik błędów podczas importu danych poniżej 5%
9. Średni czas odpowiedzi aplikacji poniżej 1,5 sekundy
10. 90% użytkowników nie zgłasza problemów z dostępnością aplikacji
11. 70% użytkowników ocenia funkcje AI jako przydatne w codziennej pracy
12. 60% rekomendacji generowanych przez AI jest uznawanych za trafne przez użytkowników
