# API Endpoint Implementation Plan: /api/imports/upload

## 1. Przegląd punktu końcowego
- Celem endpointu jest umożliwienie użytkownikowi przesyłania pliku importu danych poprzez żądanie multipart/form-data.
- Endpoint tworzy rekord w tabeli `imports` z statusem "pending" oraz zapisuje przesłany plik w systemie storage (np. Supabase Storage).

## 2. Szczegóły żądania
- **Metoda HTTP:** POST
- **Struktura URL:** `/api/imports/upload`
- **Parametry:**
  - **Wymagane:**
    - Plik przesyłany w ciele żądania (multipart/form-data) – klucz: `file`
  - **Opcjonalne:**
    - Ewentualne metadane (np. informacje o platformie lub organizacji), jeśli nie są pozyskiwane z kontekstu autoryzacji
- **Request Body:** Multipart form-data z załączonym plikiem

## 3. Wykorzystywane typy i modele
- **DTO:** `ImportFileResponseDTO`
  - Definicja: 
    ```typescript
    export interface ImportFileResponseDTO {
      id: string;
      original_filename: string;
      status: string; // 'pending'
    }
    ```
- **Tabela:** `imports` (zgodnie z dokumentacją bazy danych)
- **Command Model (opcjonalnie):** `ProcessFileCommandModel`
  - Używany do dalszego przetwarzania plików, jeśli wymagane, definiowany jako:
    ```typescript
    export interface ProcessFileCommandModel {
      file: File;
      platform_id: string;
      organization_id: string;
    }
    ```

## 4. Szczegóły odpowiedzi
- **Struktura odpowiedzi:**
    ```json
    {
      "id": "uuid",
      "original_filename": "string",
      "status": "pending"
    }
    ```
- **Kody statusu:**
  - 201 Created – powodzenie operacji przesłania pliku
  - 400 Bad Request – brak pliku lub nieprawidłowy format danych
  - 401 Unauthorized – użytkownik nie jest uwierzytelniony
  - 413 Payload Too Large – rozmiar pliku przekracza dozwolony limit
  - 500 Internal Server Error – błąd serwera

## 5. Przepływ danych
1. Użytkownik wysyła żądanie POST do `/api/imports/upload` z plikiem (multipart form-data).
2. Endpoint parsuje dane żądania i waliduje obecność pliku.
3. Walidacja pliku – sprawdzenie typu MIME i rozmiaru, zgodnie z ustalonymi limitami.
4. Plik jest przesyłany do systemu storage (np. Supabase Storage), a otrzymana ścieżka jest zapisywana.
5. Tworzony jest rekord w tabeli `imports` z następującymi danymi:
   - `original_filename` – nazwa przesłanego pliku
   - `file_path` – lokalizacja pliku w storage
   - `status` ustawiony na "pending"
   - `organization_id`, `user_id`, `platform_id` – pobierane z kontekstu autoryzacji lub przekazane w żądaniu
6. Endpoint zwraca odpowiedź JSON zawierającą `id`, `original_filename` i `status` rekordu.

## 6. Względy bezpieczeństwa
- **Autoryzacja:** Endpoint dostępny wyłącznie dla uwierzytelnionych użytkowników. Weryfikacja tokena JWT.
- **Walidacja danych:** Dokładna walidacja obecności i właściwości przesłanego pliku (rodzaj, rozmiar).
- **Bezpieczne przechowywanie:** Zapewnienie, że przesłane pliki są przechowywane w bezpiecznym środowisku oraz dostęp do nich jest kontrolowany.
- **Ograniczenie rozmiaru pliku:** Implementacja mechanizmu odrzucania dużych plików (kod 413).

## 7. Obsługa błędów
- **400 Bad Request:** Brak pliku lub nieprawidłowe dane wejściowe.
- **401 Unauthorized:** Użytkownik nie jest uwierzytelniony.
- **413 Payload Too Large:** Rozmiar pliku przekracza dozwolony limit.
- **500 Internal Server Error:** Błąd podczas zapisu pliku lub operacji na bazie danych.
- **Logowanie błędów:** Implementacja systemu logowania błędów w celu monitorowania krytycznych problemów.

## 8. Rozważania dotyczące wydajności
- **Streaming upload:** Użycie mechanizmów do przesyłania plików w strumieniu dla dużych plików.
- **Optymalizacja operacji IO:** Minimalizacja opóźnień przy zapisie do storage i bazy danych.
- **Asynchroniczne przetwarzanie:** Rozważenie kolejkowania dalszego przetwarzania plików po pomyślnym przesłaniu.

## 9. Kroki implementacji
1. Utworzenie nowego endpointu w pliku `src/pages/api/imports/upload.ts`.
2. Implementacja obsługi multipart form-data, np. za pomocą `request.formData()` dostępnego w Astro.
3. Walidacja danych wejściowych: sprawdzanie obecności pliku, weryfikacja typu MIME i rozmiaru.
4. Integracja z systemem storage (np. Supabase Storage) w celu zapisania przesłanego pliku.
5. Utworzenie rekordu w tabeli `imports` z odpowiednimi danymi (w tym `original_filename`, `file_path` i `status` ustawionym na "pending").
6. Implementacja mechanizmu obsługi błędów, zwracającego odpowiednie kody statusu (400, 401, 413, 500).
7. Testowanie endpointu – scenariusze sukcesu, brak pliku, przekroczenie limitu rozmiaru oraz autoryzacja.
8. Dokładna dokumentacja endpointu w systemie dokumentacyjnym API. 