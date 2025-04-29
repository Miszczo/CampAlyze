# Status implementacji widoku OpenRouterService

## Zrealizowane kroki
- Utworzono strukturę katalogów `src/lib/ai/openrouter` zgodnie z planem.
- Zaimplementowano klasę `OpenRouterApiClient` (szkielet) do komunikacji z API.
- Zaimplementowano pełną hierarchię błędów (`OpenRouterError` i pochodne).
- Utworzono klasę `ModelRegistry` z przykładowymi modelami.
- Utworzono klasę `RetryHandler` z obsługą ponownych prób.
- Utworzono klasę `ModelSelector` do wyboru modelu na podstawie zadania.
- Utworzono plik z typami konfiguracyjnymi i domenowymi (`types.ts`).
- Utworzono szkielet głównej klasy `OpenRouterService` i zainicjalizowano zależności.
- Utworzono klasy pomocnicze: `SystemPromptGenerator`, `UserMessageFormatter`, `CacheManager`, `UsageTracker`.
- Zaimplementowano logikę cache i budżetu w metodach prywatnych serwisu.
- Zaimplementowano logikę wyboru modelu, generowania promptów i formatowania danych.
- Zaimplementowano obsługę żądań, retry i walidację odpowiedzi.
- Zaimplementowano publiczną metodę `query` (obsługa cache, retry, budżet, walidacja, usage).
- Zaimplementowano pełny workflow w `analyzeCampaign` oraz szkielety pozostałych metod domenowych (`generateOptimizationRecommendations`, `detectAnomalies`, `generateReport`).

## Kolejne kroki
- Implementacja metod: `getUsageInfo`, `getAvailableModels`, `setDefaultModel`, `setBudgetLimit`, `prepareInputData`.
- Uzupełnienie typów parametrów i zwracanych wartości w publicznych metodach oraz dokumentacji.
- Przygotowanie kodu do testów jednostkowych i dalszej rozbudowy (np. walidacja schematów, obsługa usage z API). 