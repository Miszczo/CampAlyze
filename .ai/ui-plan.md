# Architektura UI dla Narzędzie Analityczne do Kampanii Reklamowych

## 1. Przegląd struktury UI

- Interfejs składa się z responsywnego layoutu z bocznym paskiem nawigacyjnym (sidebar) oraz głównym obszarem wyświetlania treści.
- Po zalogowaniu użytkownik trafia do dashboardu, który prezentuje kluczowe metryki, wykresy, alerty oraz umożliwia szybki dostęp do importu danych i generowania raportów AI.
- Nawigacja opiera się na sidebar z ikonami i nazwami widoków, zoptymalizowanym pod urządzenia desktopowe i mobilne.

## 2. Lista widoków

- **Widok Rejestracji**

  - Ścieżka: `/register`
  - Główny cel: Rejestracja nowego użytkownika.
  - Kluczowe komponenty: Formularz (`email`, `password`, `confirm_password`, `full_name`), przycisk "Zarejestruj się", link do strony logowania.
  - Formularz: pola `email`, `password`, `confirm_password`, `full_name`.
  - Walidacje po stronie klienta: poprawność formatu emaila, hasło min. 8 znaków (litery+cyfry), zgodność haseł, pole `full_name` niepuste.
  - Stany błędów: Komunikaty pod polami formularza dla błędów walidacji, ogólny komunikat błędu (np. "Email już istnieje", "Błąd serwera").
  - Stany sukcesu: Komunikat informujący o wysłaniu emaila weryfikacyjnego i konieczności sprawdzenia skrzynki, przycisk "Zarejestruj się" nieaktywny podczas wysyłania.
  - UX: Czytelny formularz, jasne komunikaty, wskazówki dotyczące wymagań hasła.

- **Widok Logowania**

  - Ścieżka: `/login`
  - Główny cel: Uwierzytelnienie istniejącego użytkownika.
  - Kluczowe komponenty: Formularz (`email`, `password`), przycisk "Zaloguj się", link do strony rejestracji, link do strony "Zapomniałem hasła".
  - Formularz: pola `email`, `password`.
  - Walidacje po stronie klienta: Pola niepuste, podstawowa walidacja formatu email.
  - Stany błędów: Komunikat o błędnych danych logowania, komunikat o zablokowanym koncie ("Konto zablokowane na X minut z powodu zbyt wielu prób logowania."), komunikat o niezweryfikowanym emailu, ogólny komunikat błędu serwera.
  - Stany sukcesu: Przekierowanie do dashboardu (`/dashboard`) lub strony weryfikacji emaila (`/verify-email`) jeśli email niezweryfikowany, przycisk "Zaloguj się" nieaktywny podczas wysyłania.
  - UX: Prosty formularz, wyraźne komunikaty błędów, linki do powiązanych akcji.

- **Widok Weryfikacji Emaila**

  - Ścieżka: `/verify-email`
  - Główny cel: Informowanie użytkownika o statusie weryfikacji emaila i umożliwienie ponownego wysłania linku.
  - Kluczowe informacje: Komunikat o konieczności weryfikacji, status weryfikacji (np. "Oczekuje na weryfikację", "Email zweryfikowany!"), informacja o wysłaniu linku.
  - Kluczowe komponenty: Przycisk "Wyślij link ponownie", komunikat statusu.
  - Stany błędów: Komunikat o błędzie podczas wysyłania linku.
  - Stany sukcesu: Komunikat potwierdzający ponowne wysłanie linku, informacja o pomyślnej weryfikacji (jeśli użytkownik trafi tu po kliknięciu linku).
  - UX: Jasne instrukcje, łatwy dostęp do ponownego wysłania linku.

- **Widok Zapomniałem Hasła**

  - Ścieżka: `/forgot-password`
  - Główny cel: Umożliwienie użytkownikowi zainicjowania procesu resetowania hasła.
  - Kluczowe komponenty: Formularz (`email`), przycisk "Wyślij link resetujący", link do strony logowania.
  - Formularz: pole `email`.
  - Walidacje po stronie klienta: Poprawność formatu email.
  - Stany błędów: Ogólny komunikat błędu serwera.
  - Stany sukcesu: Komunikat potwierdzający wysłanie linku resetującego (nawet jeśli email nie istnieje w bazie, ze względów bezpieczeństwa), przycisk nieaktywny podczas wysyłania.
  - UX: Minimalistyczny formularz, jasny komunikat o dalszych krokach.

- **Widok Resetowania Hasła**

  - Ścieżka: `/reset-password` (oczekuje tokena jako parametru URL, np. `/reset-password?token=...` - Supabase może obsłużyć to inaczej, np. przez `#`)
  - Główny cel: Umożliwienie użytkownikowi ustawienia nowego hasła po kliknięciu linku resetującego.
  - Kluczowe komponenty: Formularz (`new_password`, `confirm_password`), przycisk "Ustaw nowe hasło".
  - Formularz: pola `new_password`, `confirm_password`.
  - Walidacje po stronie klienta: Hasło min. 8 znaków (litery+cyfry), zgodność haseł.
  - Stany błędów: Komunikaty pod polami formularza dla błędów walidacji, komunikat o nieważnym/wygasłym tokenie, ogólny komunikat błędu serwera.
  - Stany sukcesu: Komunikat potwierdzający zmianę hasła, przekierowanie do strony logowania (`/login`), przycisk nieaktywny podczas wysyłania.
  - UX: Bezpieczny formularz, jasne wymagania dotyczące nowego hasła.

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

1.  **Rejestracja**: Użytkownik wypełnia formularz na `/register`, otrzymuje email weryfikacyjny.
2.  **Weryfikacja Emaila**: Użytkownik klika link w emailu, jest przekierowywany (potencjalnie przez Supabase) z powrotem do aplikacji (np. na `/verify-email` lub `/login`) gdzie widzi potwierdzenie, lub trafia na `/verify-email` jeśli loguje się przed weryfikacją.
3.  **Logowanie**: Użytkownik loguje się poprzez formularz na `/login`. W przypadku błędu widzi komunikat. W przypadku sukcesu trafia na `/dashboard` (jeśli email zweryfikowany) lub `/verify-email` (jeśli niezweryfikowany).
4.  **Zapomniałem hasła**: Użytkownik przechodzi na `/forgot-password`, podaje email, otrzymuje link resetujący.
5.  **Resetowanie hasła**: Użytkownik klika link, trafia na `/reset-password`, ustawia nowe hasło i jest przekierowywany do `/login`.
6.  **Dashboard**: Po pomyślnym logowaniu i weryfikacji użytkownik trafia do dashboardu na `/dashboard`, gdzie widzi przegląd kluczowych metryk, wykresy trendów i alerty.
7.  **Import Danych**: Jeśli użytkownik potrzebuje wprowadzić nowe dane, przechodzi do widoku importu na `/import`, gdzie przesyła plik, a status importu jest monitorowany. Po zakończeniu importu, dashboard automatycznie się odświeża.
8.  **Widok Kampanii**: Użytkownik przegląda listę kampanii na `/kampanie`, korzystając z opcji sortowania, filtrowania oraz wykonuje akcje podglądu lub edycji.
9.  **Dziennik Zmian**: Aby sprawdzić historię modyfikacji, użytkownik odwiedza widok `/dziennik-zmian` i analizuje wprowadzone zmiany.
10. **Alerty**: Użytkownik może sprawdzić szczegóły alertów na dedykowanej ścieżce `/alerty` lub korzystając z sekcji alertów na dashboardzie.
11. **Eksport Danych**: Przez widok `/eksport` użytkownik wybiera zakres dat oraz format eksportu (CSV, XLSX, PDF) i generuje raport.
12. **AI Insights**: Użytkownik przechodzi do `/ai-insights`, aby wygenerować podsumowania AI i raporty, korzystając z dedykowanych przycisków i opcji.
13. **Wylogowanie**: W przypadku braku aktywności lub ręcznego wyboru, następuje automatyczne (lub manualne) wylogowanie użytkownika.

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
