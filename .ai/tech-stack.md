# Stack Technologiczny - Narzędzie Analityczne do Kampanii Reklamowych

## Przegląd

Stack technologiczny został dobrany pod kątem szybkiego dostarczenia MVP (3-4 tygodnie) z jednoczesnym zapewnieniem solidnych podstaw do dalszego rozwoju. Priorytetami były: wydajność przetwarzania danych, łatwość implementacji dashboardu analitycznego, wsparcie dla funkcji AI oraz bezpieczeństwo danych użytkowników.

## Frontend

### Astro 5 + React 19

Astro 5 zostało wybrane jako główny framework ze względu na:
- **Wydajność** - generowanie statycznego HTML na serwerze z selektywną hydratacją komponentów interaktywnych
- **Islands Architecture** - tylko te komponenty, które wymagają interaktywności, otrzymują JavaScript
- **Szybkość ładowania** - mniejsza ilość JS przesyłana do klienta, co jest kluczowe dla aplikacji analitycznej
- **Łatwość integracji** - możliwość używania komponentów React tylko tam, gdzie potrzebna jest interaktywność

React 19 będzie używany w formie wysp dla komponentów wymagających interaktywności:
- Formularze importu danych
- Interaktywne filtry i selekcja dat
- Panele konfiguracyjne alertów
- Interaktywne wykresy

### Biblioteki i narzędzia

- **TypeScript 5** - statyczne typowanie dla lepszej jakości kodu i wsparcia IDE
- **Tailwind 4** - szybkie prototypowanie i spójny design
- **Shadcn/UI** - gotowe, dostępne komponenty UI oparte na Radix UI
- **React Query** - zarządzanie stanem i cache dla zapytań do API
- **Recharts / Nivo** - biblioteki do tworzenia wykresów i wizualizacji danych
- **date-fns** - manipulacja i formatowanie dat
- **Papa Parse** - parsowanie CSV bezpośrednio w przeglądarce
- **xlsx** - obsługa plików Excel

## Backend

### Supabase

Supabase zostało wybrane jako kompleksowe rozwiązanie backendowe, ponieważ:
- **PostgreSQL** - wydajna baza danych idealna do złożonych zapytań analitycznych i agregacji danych
- **Row Level Security (RLS)** - zaawansowane mechanizmy bezpieczeństwa na poziomie wierszy
- **Autentykacja** - gotowy system zarządzania użytkownikami z różnymi metodami logowania
- **Storage** - przechowywanie zaimportowanych plików CSV/XLSX
- **Edge Functions** - bezserwerowe funkcje do przetwarzania danych
- **Realtime** - aktualizacje w czasie rzeczywistym dla alertów i powiadomień
- **API REST/GraphQL** - elastyczny dostęp do danych

To podejście eliminuje potrzebę budowania własnego backendu, przyspieszając znacząco czas dostarczenia MVP.

## AI

### OpenRouter.ai

Dla funkcji AI wybranym rozwiązaniem jest:
- **OpenRouter.ai** - dostęp do szerokiej gamy modeli AI (OpenAI, Anthropic, Google i inne) przez jeden interfejs API
- **Supabase Vector Store** - przechowywanie wektorów dla efektywnego wyszukiwania podobnych kampanii
- **pgvector** - rozszerzenie PostgreSQL do obsługi wektorów embeddings, zintegrowane z Supabase

Kluczowe korzyści OpenRouter.ai:
- **Elastyczność modeli** - możliwość testowania różnych modeli AI w celu znalezienia optymalnego stosunku jakości do ceny
- **Limity finansowe** - wbudowane mechanizmy kontroli kosztów dla kluczy API
- **Niezawodność** - dostęp do alternatywnych modeli w przypadku niedostępności jednego dostawcy
- **Optymalizacja kosztów** - możliwość wyboru modeli o różnym stosunku ceny do wydajności dla różnych zadań

Ta kombinacja pozwala na:
- Generowanie tekstowych podsumowań kampanii z optymalnym modelem
- Wykrywanie anomalii w danych poprzez porównanie z historycznymi wzorcami
- Tworzenie rekomendacji optymalizacyjnych
- Generowanie raportów z wnioskami
- Kontrolę kosztów dzięki zarządzaniu limitami API

## Przechowywanie i przetwarzanie danych

- **PostgreSQL** (w ramach Supabase) - główna baza danych
- **pgvector** - rozszerzenie PostgreSQL do przechowywania i wyszukiwania wektorów

## CI/CD i hosting

- **GitHub Actions** - automatyzacja procesów CI/CD
- **Docker** - konteneryzacja aplikacji
- **DigitalOcean** - hosting aplikacji za pośrednictwem obrazu docker

## Narzędzia deweloperskie

- **ESLint / Prettier** - utrzymanie jakości kodu
- **Vitest** - szybkie testy jednostkowe
- **GitHub** - hosting kodu i zarządzanie projektem

## Narzędzia testowe

### Testy jednostkowe i integracyjne
- **Vitest** - framework do szybkiego testowania jednostkowego i integracyjnego, dedykowany do testowania logiki biznesowej, komponentów React oraz interakcji z API

### Testy End-to-End (E2E)
- **Playwright** - narzędzie do automatyzacji testów systemowych i akceptacyjnych, umożliwiające testowanie krytycznych ścieżek użytkownika

### Testy wydajnościowe
- **k6** - narzędzie do testów obciążeniowych i wydajnościowych API
- **Supabase Tools** - narzędzia do profilowania zapytań PostgreSQL (`pg_stat_statements`, `explain analyze`)

### Testy bezpieczeństwa
- **OWASP ZAP** - skaner do automatycznego wykrywania podstawowych luk bezpieczeństwa
- **Narzędzia developerskie przeglądarek** - do analizy nagłówków bezpieczeństwa HTTP i innych aspektów bezpieczeństwa

### Zarządzanie testami
- **GitHub Issues & Projects** - śledzenie defektów i organizacja pracy testowej
- **Markdown Files** - dokumentacja przypadków testowych w repozytorium

## Korzyści wybranego stacku

1. **Szybkość rozwoju** - wykorzystanie gotowych rozwiązań (Supabase, Shadcn/UI) przyspiesza proces wytwarzania
2. **Wydajność** - Astro 5 minimalizuje ilość JS, a PostgreSQL zapewnia wydajne przetwarzanie danych analitycznych
3. **Skalowalność** - architektura pozwala na łatwe skalowanie w miarę wzrostu liczby użytkowników i danych
4. **Bezpieczeństwo** - Supabase oferuje zaawansowane mechanizmy bezpieczeństwa i autentykacji
5. **Koszty** - minimalne koszty początkowe z możliwością skalowania w miarę wzrostu projektu
6. **Elastyczność AI** - OpenRouter.ai zapewnia dostęp do różnych modeli i możliwość optymalizacji kosztów

## Zalecenia dotyczące implementacji

1. **Etapowy rozwój** - zacząć od podstawowego importu danych i dashboardu, następnie dodać funkcje AI
2. **Prototypowanie interfejsu** - wykorzystać Shadcn/UI do szybkiego prototypowania interfejsu użytkownika
3. **Modelowanie danych** - zaprojektować schemat bazy danych z myślą o wydajnych analizach i agregacjach
4. **Izolacja funkcji AI** - zaimplementować funkcje AI jako osobne mikrousługi, aby ułatwić skalowanie
5. **Optymalizacja AI** - rozpocząć z prostszymi i tańszymi modelami, stopniowo testując bardziej zaawansowane
6. **Caching** - zaimplementować strategię cachowania dla często używanych danych i zapytań
7. **Kontrola kosztów** - ustanowić limity miesięczne dla API AI i monitoring zużycia 