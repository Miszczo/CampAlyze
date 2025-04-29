# Architektura UI dla Narzędzie Analityczne do Kampanii Reklamowych

## 1. Przegląd struktury UI

- Interfejs składa się z responsywnego layoutu z bocznym paskiem nawigacyjnym (sidebar) oraz głównym obszarem wyświetlania treści.
- Po zalogowaniu użytkownik trafia do dashboardu, który prezentuje kluczowe metryki, wykresy, alerty oraz umożliwia szybki dostęp do importu danych i generowania raportów AI.
- Nawigacja opiera się na sidebar z ikonami i nazwami widoków, zoptymalizowanym pod urządzenia desktopowe i mobilne.

## 2. Lista widoków

- **Widok Logowania/Rejestracji**
  - Ścieżka: `/login`
  - Główny cel: Uwierzytelnienie użytkownika.
  - Kluczowe informacje: Formularz logowania/rejestracji, komunikaty błędów.
  - Kluczowe komponenty: Formularz, przycisk submit, walidacja inputu.
  - UX, dostępność i bezpieczeństwo: Prosty, czytelny interfejs z odpowiednimi komunikatami błędów, focus na inputy, responsywność.

- **Dashboard**
  - Ścieżka: `/dashboard`
  - Główny cel: Przedstawienie kluczowych metryk kampanii oraz alertów.
  - Kluczowe informacje: Metryki (CPC, CTR, konwersje, koszt/konwersję, ROAS), wykresy trendów, lista alertów, filtry zakresu dat.
  - Kluczowe komponenty: Wykresy, karty metryk, lista alertów, przyciski do importu danych i generowania raportów AI.
  - UX, dostępność i bezpieczeństwo: Automatyczne odświeżanie po imporcie danych, spinner podczas ładowania, toast notifications, responsywność, automatyczne wylogowanie po timeout.

- **Widok Importu Danych**
  - Ścieżka: `/import`
  - Główny cel: Umożliwienie przesłania pliku z danymi oraz monitorowanie statusu importu.
  - Kluczowe informacje: Formularz przesyłania pliku, lista ostatnich importów z statusami, komunikaty o błędach.
  - Kluczowe komponenty: Formularz upload, lista statusów, modal do potwierdzania operacji destrukcyjnych, alerty błędów.
  - UX, dostępność i bezpieczeństwo: Informacje o limitach rozmiaru plików, wizualne potwierdzenia sukcesu (toast), responsywność.

- **Widok Kampanii**
  - Ścieżka: `/kampanie`
  - Główny cel: Przegląd i zarządzanie kampaniami.
  - Kluczowe informacje: Lista kampanii z możliwością sortowania po dacie, filtrowania po nazwie, akcje (podgląd, edycja, usunięcie).
  - Kluczowe komponenty: Tabela lub lista kampanii, wyszukiwarka, paginacja, przyciski akcji.
  - UX, dostępność i bezpieczeństwo: Czytelny układ listy, responsywny design, feedback (toast notifications) dla operacji.

- **Widok Dziennika Zmian**
  - Ścieżka: `/dziennik-zmian`
  - Główny cel: Przeglądanie historii zmian dokonanych w kampaniach.
  - Kluczowe informacje: Data zmiany, typ zmiany, opis, użytkownik dokonujący zmiany.
  - Kluczowe komponenty: Tabela lub lista zmian, opcje sortowania i filtrowania.
  - UX, dostępność i bezpieczeństwo: Czytelny układ umożliwiający szybkie wyszukiwanie i sortowanie, responsywność.

- **Widok Alertów**
  - Ścieżka: `/alerty`
  - Główny cel: Przegląd alertów dotyczących kampanii.
  - Kluczowe informacje: Szczegóły alertów (metryki, status, data), opcje aktualizacji statusu.
  - Kluczowe komponenty: Lista alertów, przyciski do zmiany statusu (dismiss), modale dla krytycznych błędów.
  - UX, dostępność i bezpieczeństwo: Jasne oznaczenie krytycznych alertów, intuicyjne akcje, responsywność.

- **Widok Eksportu Danych**
  - Ścieżka: `/eksport`
  - Główny cel: Umożliwienie eksportu danych w wybranych formatach.
  - Kluczowe informacje: Wybór zakresu dat, format eksportu (CSV, XLSX, PDF).
  - Kluczowe komponenty: Formularz wyboru, przycisk do eksportu, opcje formatów.
  - UX, dostępność i bezpieczeństwo: Przejrzysta konfiguracja eksportu, feedback (toast notifications), responsywność.

- **Widok AI Insights**
  - Ścieżka: `/ai-insights`
  - Główny cel: Generowanie podsumowań AI oraz raportów.
  - Kluczowe informacje: Podsumowania, rekomendacje, treść raportu, status operacji generowania.
  - Kluczowe komponenty: Przycisk generowania, sekcja wyświetlania podsumowań, spinner podczas generowania, toast notifications.
  - UX, dostępność i bezpieczeństwo: Intuicyjny interfejs, jasne komunikaty statusu, responsywność.

## 3. Mapa podróży użytkownika

1. **Logowanie/Rejestracja**: Użytkownik loguje się poprzez formularz na ścieżce `/login`.
2. **Dashboard**: Po pomyślnym logowaniu użytkownik trafia do dashboardu na `/dashboard`, gdzie widzi przegląd kluczowych metryk, wykresy trendów i alerty.
3. **Import Danych**: Jeśli użytkownik potrzebuje wprowadzić nowe dane, przechodzi do widoku importu na `/import`, gdzie przesyła plik, a status importu jest monitorowany. Po zakończeniu importu, dashboard automatycznie się odświeża.
4. **Widok Kampanii**: Użytkownik przegląda listę kampanii na `/kampanie`, korzystając z opcji sortowania, filtrowania oraz wykonuje akcje podglądu lub edycji.
5. **Dziennik Zmian**: Aby sprawdzić historię modyfikacji, użytkownik odwiedza widok `/dziennik-zmian` i analizuje wprowadzone zmiany.
6. **Alerty**: Użytkownik może sprawdzić szczegóły alertów na dedykowanej ścieżce `/alerty` lub korzystając z sekcji alertów na dashboardzie.
7. **Eksport Danych**: Przez widok `/eksport` użytkownik wybiera zakres dat oraz format eksportu (CSV, XLSX, PDF) i generuje raport.
8. **AI Insights**: Użytkownik przechodzi do `/ai-insights`, aby wygenerować podsumowania AI i raporty, korzystając z dedykowanych przycisków i opcji.
9. **Wylogowanie**: W przypadku braku aktywności lub ręcznego wyboru, następuje automatyczne (lub manualne) wylogowanie użytkownika.

## 4. Układ i struktura nawigacji

- **Sidebar**: Główny element nawigacji umieszczony po lewej stronie ekranu, zawierający ikony i etykiety widoków.
  - Elementy: Dashboard, Kampanie, Import Danych, Dziennik Zmian, Alerty, Eksport Danych, AI Insights.
  - Na urządzeniach mobilnych sidebar zamieniany jest na menu hamburgera.
- Każdy element sidebar jest klikalny i prowadzi do odpowiedniego widoku.
- Dodatkowy przycisk umożliwia powrót do dashboardu z każdego widoku.

## 5. Kluczowe komponenty

- **Spinner**: Wskaźnik ładowania podczas oczekiwania na odpowiedź z API.
- **Toast Notifications**: Komponent do wyświetlania krótkich komunikatów o sukcesie, błędach lub informacjach.
- **Modale**: Używane do potwierdzania operacji destrukcyjnych oraz prezentacji krytycznych komunikatów błędów.
- **Formularze**: Stosowane w widokach logowania, importu danych, eksportu oraz generowania raportów.
- **Tabele/Listy**: Prezentacja list kampanii, importów, alertów i dziennika zmian z funkcjami sortowania, filtrowania i paginacji.
- **Wykresy**: Wizualizacja metryk i trendów na dashboardzie.
- **Sidebar**: Globalny element nawigacyjny umożliwiający przechodzenie między widokami. 