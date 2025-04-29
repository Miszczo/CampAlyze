# Plan Wdrożenia Usługi OpenRouter

## 1. Opis Usługi

Usługa OpenRouter to integracyjna warstwa służąca do komunikacji z API OpenRouter, które zapewnia dostęp do różnych modeli LLM (Large Language Models) poprzez jeden zunifikowany interfejs. Usługa ta będzie kluczowym komponentem aplikacji campAlyze, umożliwiającym generowanie automatycznych podsumowań kampanii reklamowych, wykrywanie anomalii w danych, tworzenie rekomendacji optymalizacyjnych oraz generowanie raportów z wnioskami.

Główne funkcje usługi:
- Zunifikowany dostęp do różnych modeli AI (OpenAI, Anthropic, Google i inne)
- Dynamiczny wybór modeli w zależności od zadania, priorytetu i budżetu
- Formatowanie zapytań i odpowiedzi zgodnie z wymaganiami API OpenRouter
- Obsługa strukturyzowanych odpowiedzi poprzez schematy JSON
- Monitorowanie i kontrola kosztów używania API
- Zaawansowana obsługa błędów i mechanizmy ponownych prób
- Strategiczna optymalizacja parametrów modeli dla różnych zadań analitycznych

## 2. Opis Konstruktora

```typescript
/**
 * Klasa OpenRouterService zarządzająca komunikacją z API OpenRouter
 */
class OpenRouterService {
  /**
   * Tworzy nową instancję usługi OpenRouter
   * 
   * @param config - Konfiguracja usługi
   * @param config.apiKey - Klucz API do usługi OpenRouter
   * @param config.defaultModel - Domyślny model do używania, jeśli nie określono inaczej
   * @param config.modelRegistry - Rejestr dostępnych modeli z ich parametrami
   * @param config.budgetLimit - Miesięczny limit budżetu w USD (opcjonalny)
   * @param config.cacheOptions - Opcje mechanizmu cache (opcjonalny)
   * @param config.retryOptions - Opcje strategii ponownych prób (opcjonalny)
   */
  constructor(config: OpenRouterConfig) {
    // Inicjalizacja
  }
}
```

Typ konfiguracji:

```typescript
/**
 * Konfiguracja usługi OpenRouter
 */
interface OpenRouterConfig {
  /** Klucz API do usługi OpenRouter */
  apiKey: string;
  
  /** Domyślny model do używania, jeśli nie określono inaczej */
  defaultModel: string;
  
  /** Rejestr dostępnych modeli z ich parametrami */
  modelRegistry?: ModelRegistry;
  
  /** Miesięczny limit budżetu w USD (opcjonalny) */
  budgetLimit?: number;
  
  /** Opcje mechanizmu cache (opcjonalny) */
  cacheOptions?: CacheOptions;
  
  /** Opcje strategii ponownych prób (opcjonalny) */
  retryOptions?: RetryOptions;
}
```

## 3. Publiczne Metody i Pola

### 3.1 Metody

```typescript
/**
 * Wysyła zapytanie do modelu AI z określonymi parametrami
 * 
 * @param params - Parametry zapytania
 * @returns Odpowiedź z modelu AI
 * @throws OpenRouterError w przypadku wystąpienia błędu
 */
async query(params: QueryParams): Promise<ModelResponse>

/**
 * Generuje analizę kampanii reklamowej na podstawie dostarczonych danych
 * 
 * @param data - Dane kampanii do analizy
 * @param options - Opcje analizy (opcjonalne)
 * @returns Obiekt zawierający analizę kampanii
 * @throws OpenRouterError w przypadku wystąpienia błędu
 */
async analyzeCampaign(data: CampaignData, options?: AnalysisOptions): Promise<CampaignAnalysis>

/**
 * Generuje rekomendacje optymalizacyjne dla kampanii reklamowej
 * 
 * @param data - Dane kampanii do optymalizacji
 * @param options - Opcje rekomendacji (opcjonalne)
 * @returns Obiekt zawierający rekomendacje optymalizacyjne
 * @throws OpenRouterError w przypadku wystąpienia błędu
 */
async generateOptimizationRecommendations(data: CampaignData, options?: RecommendationOptions): Promise<OptimizationRecommendations>

/**
 * Wykrywa anomalie w danych kampanii reklamowej
 * 
 * @param data - Dane kampanii do analizy anomalii
 * @param options - Opcje wykrywania anomalii (opcjonalne)
 * @returns Obiekt zawierający wykryte anomalie
 * @throws OpenRouterError w przypadku wystąpienia błędu
 */
async detectAnomalies(data: CampaignData, options?: AnomalyDetectionOptions): Promise<AnomalyDetectionResults>

/**
 * Generuje raport z analizy kampanii reklamowej
 * 
 * @param data - Dane kampanii do raportu
 * @param options - Opcje raportu (opcjonalne)
 * @returns Obiekt zawierający wygenerowany raport
 * @throws OpenRouterError w przypadku wystąpienia błędu
 */
async generateReport(data: CampaignData, options?: ReportOptions): Promise<CampaignReport>

/**
 * Pobiera informacje o aktualnym zużyciu API
 * 
 * @returns Obiekt zawierający informacje o zużyciu
 * @throws OpenRouterError w przypadku wystąpienia błędu
 */
async getUsageInfo(): Promise<UsageInfo>

/**
 * Pobiera dostępne modele z API OpenRouter
 * 
 * @returns Lista dostępnych modeli
 * @throws OpenRouterError w przypadku wystąpienia błędu
 */
async getAvailableModels(): Promise<Model[]>

/**
 * Zmienia domyślny model używany przez usługę
 * 
 * @param modelName - Nazwa modelu do ustawienia jako domyślny
 * @throws OpenRouterError w przypadku gdy model jest niedostępny
 */
setDefaultModel(modelName: string): void

/**
 * Ustawia limit budżetu miesięcznego dla usługi
 * 
 * @param limitUSD - Limit w USD
 */
setBudgetLimit(limitUSD: number): void

/**
 * Przetwarza dane wejściowe do formatu odpowiedniego dla API OpenRouter
 * 
 * @param input - Dane wejściowe do przetworzenia
 * @param options - Opcje przetwarzania (opcjonalne)
 * @returns Przetworzone dane gotowe do wysłania do API
 */
prepareInputData(input: any, options?: ProcessingOptions): FormattedInput
```

### 3.2 Pola Publiczne

```typescript
/** 
 * Domyślny model używany przez usługę
 */
readonly defaultModel: string;

/**
 * Aktualny status usługi
 */
readonly status: ServiceStatus;

/**
 * Informacje o bieżącym wykorzystaniu API
 */
readonly currentUsage: UsageStats;

/**
 * Rejestr dostępnych modeli
 */
readonly modelRegistry: ModelRegistry;
```

## 4. Prywatne Metody i Pola

### 4.1 Metody Prywatne

```typescript
/**
 * Wysyła żądanie do API OpenRouter
 * 
 * @param endpoint - Punkt końcowy API
 * @param payload - Dane do wysłania
 * @returns Odpowiedź z API
 * @throws OpenRouterError w przypadku wystąpienia błędu
 */
private async _sendRequest(endpoint: string, payload: any): Promise<any>

/**
 * Wybiera optymalny model dla danego zadania na podstawie jego typu, priorytetu i aktualnego zużycia budżetu
 * 
 * @param task - Typ zadania
 * @param priority - Priorytet zadania (opcjonalny)
 * @returns Nazwa wybranego modelu
 */
private _selectOptimalModel(task: TaskType, priority?: Priority): string

/**
 * Przygotowuje parametry modelu na podstawie typu zadania i kontekstu
 * 
 * @param task - Typ zadania
 * @param context - Kontekst zadania (opcjonalny)
 * @returns Parametry modelu
 */
private _prepareModelParameters(task: TaskType, context?: TaskContext): ModelParameters

/**
 * Generuje odpowiedni prompt systemowy dla danego zadania
 * 
 * @param task - Typ zadania
 * @param context - Kontekst zadania (opcjonalny)
 * @returns Wygenerowany prompt systemowy
 */
private _generateSystemPrompt(task: TaskType, context?: TaskContext): string

/**
 * Formatuje dane użytkownika do wiadomości zgodnej z API OpenRouter
 * 
 * @param data - Dane użytkownika
 * @param task - Typ zadania
 * @returns Sformatowana wiadomość użytkownika
 */
private _formatUserMessage(data: any, task: TaskType): UserMessage

/**
 * Przygotowuje schemat JSON dla strukturyzowanej odpowiedzi
 * 
 * @param task - Typ zadania
 * @returns Schema JSON do użycia w response_format
 */
private _prepareResponseFormat(task: TaskType): ResponseFormat

/**
 * Waliduje odpowiedź z modelu względem oczekiwanego schematu
 * 
 * @param response - Odpowiedź z modelu
 * @param schema - Schemat do walidacji
 * @returns Zwalidowana odpowiedź lub rzuca wyjątek w przypadku niepowodzenia
 * @throws ValidationError w przypadku nieprawidłowej odpowiedzi
 */
private _validateResponse(response: any, schema: object): any

/**
 * Aktualizuje statystyki wykorzystania API
 * 
 * @param usageData - Dane o wykorzystaniu API
 */
private _updateUsageStats(usageData: UsageData): void

/**
 * Sprawdza, czy nie przekroczono limitu budżetu
 * 
 * @returns true jeśli limit nie został przekroczony, false w przeciwnym wypadku
 */
private _checkBudgetLimit(): boolean

/**
 * Implementuje logikę ponownych prób w przypadku tymczasowych błędów
 * 
 * @param operation - Funkcja do wykonania
 * @param options - Opcje ponownych prób (opcjonalne)
 * @returns Wynik wykonania funkcji
 * @throws OpenRouterError po wyczerpaniu wszystkich prób
 */
private async _withRetry<T>(operation: () => Promise<T>, options?: RetryOptions): Promise<T>

/**
 * Obsługuje odpowiedź z API i mapuje błędy na odpowiednie typy wyjątków
 * 
 * @param response - Odpowiedź z API
 * @returns Przetworzona odpowiedź
 * @throws OpenRouterError w przypadku błędu API
 */
private _handleApiResponse(response: any): any

/**
 * Sprawdza dostępność cache dla danego zapytania
 * 
 * @param query - Zapytanie do sprawdzenia
 * @returns Wynik z cache lub null jeśli brak w cache
 */
private _checkCache(query: string): any | null

/**
 * Zapisuje wynik zapytania do cache
 * 
 * @param query - Zapytanie do zapisania
 * @param result - Wynik do zapisania
 */
private _saveToCache(query: string, result: any): void
```

### 4.2 Pola Prywatne

```typescript
/**
 * Klucz API do usługi OpenRouter
 */
private _apiKey: string;

/**
 * Instancja klienta HTTP
 */
private _httpClient: HttpClient;

/**
 * Manager cache
 */
private _cacheManager: CacheManager;

/**
 * Tracker wykorzystania API
 */
private _usageTracker: UsageTracker;

/**
 * Konfiguracja ponownych prób
 */
private _retryConfig: RetryConfig;

/**
 * Status ostatniego zapytania
 */
private _lastRequestStatus: RequestStatus;

/**
 * Limit budżetu miesięcznego w USD
 */
private _budgetLimit: number;

/**
 * Schematy JSON dla różnych typów zadań
 */
private _responseSchemas: Record<TaskType, object>;

/**
 * Szablony promptów systemowych
 */
private _systemPromptTemplates: Record<TaskType, string>;
```

## 5. Obsługa Błędów

### 5.1 Hierarchia Błędów

```typescript
/**
 * Bazowa klasa błędu dla usługi OpenRouter
 */
class OpenRouterError extends Error {
  constructor(message: string, public code: string, public cause?: Error) {
    super(message);
    this.name = 'OpenRouterError';
  }
}

/**
 * Błąd autoryzacji
 */
class AuthorizationError extends OpenRouterError {
  constructor(message: string, cause?: Error) {
    super(message, 'AUTHORIZATION_ERROR', cause);
    this.name = 'AuthorizationError';
  }
}

/**
 * Błąd przekroczenia limitu
 */
class RateLimitError extends OpenRouterError {
  constructor(message: string, public retryAfter?: number, cause?: Error) {
    super(message, 'RATE_LIMIT_ERROR', cause);
    this.name = 'RateLimitError';
  }
}

/**
 * Błąd przekroczenia budżetu
 */
class BudgetLimitError extends OpenRouterError {
  constructor(message: string, public currentUsage: number, public limit: number) {
    super(message, 'BUDGET_LIMIT_ERROR');
    this.name = 'BudgetLimitError';
  }
}

/**
 * Błąd niedostępności modelu
 */
class ModelUnavailableError extends OpenRouterError {
  constructor(message: string, public modelName: string, cause?: Error) {
    super(message, 'MODEL_UNAVAILABLE_ERROR', cause);
    this.name = 'ModelUnavailableError';
  }
}

/**
 * Błąd walidacji odpowiedzi
 */
class ValidationError extends OpenRouterError {
  constructor(message: string, public response: any, public schema: object) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

/**
 * Błąd sieci
 */
class NetworkError extends OpenRouterError {
  constructor(message: string, cause?: Error) {
    super(message, 'NETWORK_ERROR', cause);
    this.name = 'NetworkError';
  }
}

/**
 * Błąd przekroczenia czasu
 */
class TimeoutError extends OpenRouterError {
  constructor(message: string, public timeoutMs: number, cause?: Error) {
    super(message, 'TIMEOUT_ERROR', cause);
    this.name = 'TimeoutError';
  }
}

/**
 * Błąd naruszenia polityki treści
 */
class ContentPolicyError extends OpenRouterError {
  constructor(message: string, public violationType: string, cause?: Error) {
    super(message, 'CONTENT_POLICY_ERROR', cause);
    this.name = 'ContentPolicyError';
  }
}
```

### 5.2 Strategie Obsługi Błędów

1. **Błędy Autoryzacji**: Natychmiastowe powiadomienie użytkownika o potrzebie aktualizacji klucza API lub problemach z autoryzacją.

2. **Przekroczenie Limitu (Rate Limiting)**: 
   - Implementacja wykładniczego wycofania (exponential backoff)
   - Ponowne próby z rosnącymi opóźnieniami
   - Respektowanie nagłówków 'Retry-After' jeśli są dostępne

3. **Przekroczenie Budżetu**:
   - Przełączenie na tańsze modele
   - Ograniczenie funkcjonalności wymagających drogich modeli
   - Powiadomienie administratora o zbliżaniu się do limitu (80% wykorzystania)

4. **Niedostępność Modelu**:
   - Automatyczne przełączenie na alternatywny model o podobnych możliwościach
   - Degradacja do modelu niższej klasy w przypadku braku alternatyw

5. **Błędy Walidacji**:
   - Ponowne próby z poprawionymi parametrami
   - Przełączenie na model, który lepiej obsługuje strukturyzowane odpowiedzi

6. **Błędy Sieci**:
   - Strategia ponownych prób z wykładniczym wycofaniem
   - Przełączenie na lokalny tryb offline dla krytycznych funkcji

7. **Przekroczenie Czasu**:
   - Zwiększenie limitu czasu dla kolejnych prób
   - Możliwość anulowania długotrwałych operacji przez użytkownika

8. **Naruszenia Polityki Treści**:
   - Logowanie naruszenia bez ujawniania szczegółów użytkownikowi
   - Sugestie alternatywnego sformułowania zapytania

## 6. Kwestie Bezpieczeństwa

### 6.1 Zabezpieczenie Klucza API

- Przechowywanie klucza API w zmiennych środowiskowych
- Nigdy nie umieszczanie klucza API w kodzie źródłowym
- Wykorzystanie Supabase Vault do bezpiecznego przechowywania kluczy
- Możliwość rotacji kluczy API bez przerw w działaniu usługi

### 6.2 Ochrona Danych

- Minimalizacja danych przesyłanych do API (tylko niezbędne informacje)
- Unikanie przesyłania danych osobowych (PII) do modeli LLM
- Sanityzacja danych wejściowych przed wysłaniem do API
- Weryfikacja odpowiedzi pod kątem potencjalnych wycieków danych

### 6.3 Kontrola Dostępu

- Implementacja systemu uprawnień do różnych funkcji usługi
- Logowanie wszystkich zapytań do modeli AI
- Możliwość ograniczenia dostępu do określonych modeli dla różnych ról użytkowników
- Audyt wykorzystania zasobów AI

### 6.4 Ochrona Przed Atakami

- Walidacja wszystkich danych wejściowych
- Ochrona przed atakami prompt injection
- Implementacja limitów częstotliwości zapytań na poziomie użytkownika
- Monitorowanie nietypowych wzorców wykorzystania

### 6.5 Zgodność Z Regulacjami

- Zapewnienie zgodności z RODO/GDPR
- Przejrzyste informowanie użytkowników o wykorzystaniu AI
- Możliwość usunięcia danych użytkownika z systemu
- Dokumentacja polityki bezpieczeństwa i prywatności

## 7. Plan Wdrożenia Krok po Kroku

### Krok 1: Konfiguracja Środowiska

1. Utworzenie modułu `src/lib/ai/openrouter` w strukturze projektu
2. Konfiguracja zmiennych środowiskowych do przechowywania klucza API
   ```
   OPENROUTER_API_KEY=your_api_key_here
   OPENROUTER_DEFAULT_MODEL=openai/gpt-3.5-turbo
   OPENROUTER_BUDGET_LIMIT=100
   ```
3. Utworzenie pliku konfiguracyjnego dla usługi OpenRouter

### Krok 2: Implementacja Klienta API

1. Utworzenie klasy bazowej klienta API z obsługą autoryzacji:
   ```typescript
   // src/lib/ai/openrouter/api-client.ts
   export class OpenRouterApiClient {
     private readonly baseUrl = 'https://openrouter.ai/api/v1';
     
     constructor(private apiKey: string) {}
     
     async sendRequest(endpoint: string, payload: any): Promise<any> {
       // Implementacja logiki wysyłania zapytań do API
     }
   }
   ```

2. Implementacja mechanizmu retry i obsługi błędów:
   ```typescript
   // src/lib/ai/openrouter/retry-handler.ts
   export class RetryHandler {
     async withRetry<T>(
       operation: () => Promise<T>, 
       options?: RetryOptions
     ): Promise<T> {
       // Implementacja logiki ponownych prób
     }
   }
   ```

3. Utworzenie hierarchii klas błędów:
   ```typescript
   // src/lib/ai/openrouter/errors.ts
   export class OpenRouterError extends Error {
     // Implementacja bazowej klasy błędów
   }
   
   // Implementacja pozostałych klas błędów
   ```

### Krok 3: Implementacja Managera Modeli

1. Utworzenie rejestru modeli z konfiguracjami:
   ```typescript
   // src/lib/ai/openrouter/model-registry.ts
   export class ModelRegistry {
     private models: Record<string, ModelConfig> = {
       'openai/gpt-3.5-turbo': {
         capabilities: ['quick_analysis', 'summarization'],
         costPer1kTokens: 0.001,
         // Inne parametry modelu
       },
       'openai/gpt-4': {
         capabilities: ['deep_analysis', 'recommendations', 'anomaly_detection'],
         costPer1kTokens: 0.03,
         // Inne parametry modelu
       },
       // Inne modele
     };
     
     getModel(name: string): ModelConfig | undefined {
       return this.models[name];
     }
     
     // Inne metody rejestru modeli
   }
   ```

2. Implementacja logiki wyboru modelu:
   ```typescript
   // src/lib/ai/openrouter/model-selector.ts
   export class ModelSelector {
     constructor(
       private registry: ModelRegistry,
       private usageTracker: UsageTracker
     ) {}
     
     selectModel(task: TaskType, priority?: Priority): string {
       // Implementacja logiki wyboru modelu
     }
   }
   ```

### Krok 4: Implementacja Formatterów Wiadomości

1. Utworzenie generatora promptów systemowych:
   ```typescript
   // src/lib/ai/openrouter/system-prompt-generator.ts
   export class SystemPromptGenerator {
     private templates: Record<TaskType, string> = {
       campaign_analysis: "Jesteś ekspertem w analizie kampanii reklamowych...",
       // Inne szablony promptów
     };
     
     generatePrompt(task: TaskType, context?: TaskContext): string {
       // Implementacja generatora promptów
     }
   }
   ```

2. Implementacja formattera wiadomości użytkownika:
   ```typescript
   // src/lib/ai/openrouter/user-message-formatter.ts
   export class UserMessageFormatter {
     formatMessage(data: any, task: TaskType): UserMessage {
       // Implementacja formatowania wiadomości użytkownika
     }
   }
   ```

3. Utworzenie schematów odpowiedzi JSON:
   ```typescript
   // src/lib/ai/openrouter/response-schemas.ts
   export const responseSchemas: Record<TaskType, object> = {
     campaign_analysis: {
       type: "object",
       required: ["summary", "key_findings", "recommendations"],
       properties: {
         // Definicja schematu
       }
     },
     // Inne schematy
   };
   ```

### Krok 5: Implementacja Monitorowania Wykorzystania

1. Utworzenie trackera wykorzystania API:
   ```typescript
   // src/lib/ai/openrouter/usage-tracker.ts
   export class UsageTracker {
     private currentMonthUsage = 0;
     
     trackUsage(tokens: number, modelName: string): void {
       // Implementacja śledzenia wykorzystania
     }
     
     checkBudgetLimit(budgetLimit: number): boolean {
       // Implementacja sprawdzania limitu budżetu
     }
   }
   ```

2. Integracja z bazą danych Supabase dla persistent storage:
   ```typescript
   // src/lib/ai/openrouter/usage-storage.ts
   export class UsageStorage {
     constructor(private supabaseClient: SupabaseClient) {}
     
     async saveUsage(usageData: UsageData): Promise<void> {
       // Implementacja zapisu danych wykorzystania
     }
     
     async getMonthlyUsage(): Promise<number> {
       // Implementacja pobierania miesięcznego wykorzystania
     }
   }
   ```

### Krok 6: Implementacja Cache

1. Utworzenie managera cache:
   ```typescript
   // src/lib/ai/openrouter/cache-manager.ts
   export class CacheManager {
     private cache = new Map<string, CachedItem>();
     
     get(key: string): any | null {
       // Implementacja pobierania z cache
     }
     
     set(key: string, value: any, ttl: number): void {
       // Implementacja zapisu do cache
     }
     
     generateKey(query: any): string {
       // Implementacja generowania klucza cache
     }
   }
   ```

2. Integracja z bazą danych dla trwałego cache:
   ```typescript
   // src/lib/ai/openrouter/persistent-cache.ts
   export class PersistentCache {
     constructor(private supabaseClient: SupabaseClient) {}
     
     async get(key: string): Promise<any | null> {
       // Implementacja pobierania z trwałego cache
     }
     
     async set(key: string, value: any, ttl: number): Promise<void> {
       // Implementacja zapisu do trwałego cache
     }
   }
   ```

### Krok 7: Implementacja Głównej Klasy Usługi

1. Połączenie wszystkich komponentów w główną klasę usługi:
   ```typescript
   // src/lib/ai/openrouter/index.ts
   import { OpenRouterApiClient } from './api-client';
   import { ModelRegistry } from './model-registry';
   import { ModelSelector } from './model-selector';
   import { SystemPromptGenerator } from './system-prompt-generator';
   import { UserMessageFormatter } from './user-message-formatter';
   import { UsageTracker } from './usage-tracker';
   import { CacheManager } from './cache-manager';
   import { RetryHandler } from './retry-handler';
   import { responseSchemas } from './response-schemas';
   import type { OpenRouterConfig, QueryParams, ModelResponse } from './types';
   
   export class OpenRouterService {
     private apiClient: OpenRouterApiClient;
     private modelRegistry: ModelRegistry;
     private modelSelector: ModelSelector;
     private promptGenerator: SystemPromptGenerator;
     private messageFormatter: UserMessageFormatter;
     private usageTracker: UsageTracker;
     private cacheManager: CacheManager;
     private retryHandler: RetryHandler;
     
     constructor(config: OpenRouterConfig) {
       // Inicjalizacja komponentów
     }
     
     // Implementacja metod publicznych
     
     // Implementacja metod prywatnych
   }
   ```

2. Utworzenie typów danych dla usługi:
   ```typescript
   // src/lib/ai/openrouter/types.ts
   export interface OpenRouterConfig {
     // Definicja typu konfiguracji
   }
   
   export interface QueryParams {
     // Definicja typu parametrów zapytania
   }
   
   export interface ModelResponse {
     // Definicja typu odpowiedzi modelu
   }
   
   // Pozostałe definicje typów
   ```

### Krok 8: Implementacja Metod Domenowych Dla Konkretnych Przypadków Użycia

1. Implementacja metody analizy kampanii:
   ```typescript
   // Wewnątrz klasy OpenRouterService w src/lib/ai/openrouter/index.ts
   
   async analyzeCampaign(data: CampaignData, options?: AnalysisOptions): Promise<CampaignAnalysis> {
     const task = 'campaign_analysis';
     const model = this._selectOptimalModel(task, options?.priority);
     const systemPrompt = this._generateSystemPrompt(task, { campaignType: data.type });
     const userMessage = this._formatUserMessage(data, task);
     const responseFormat = this._prepareResponseFormat(task);
     
     const params = {
       model,
       messages: [
         { role: 'system', content: systemPrompt },
         { role: 'user', content: userMessage }
       ],
       response_format: responseFormat,
       temperature: options?.temperature ?? 0.3,
       max_tokens: options?.maxTokens ?? 1000
     };
     
     const cacheKey = this._cacheManager.generateKey({ task, data, options });
     const cachedResult = this._checkCache(cacheKey);
     
     if (cachedResult) {
       return cachedResult;
     }
     
     const response = await this.query(params);
     const validatedResponse = this._validateResponse(response, responseSchemas[task]);
     
     this._saveToCache(cacheKey, validatedResponse);
     
     return validatedResponse;
   }
   ```

2. Implementacja pozostałych metod domenowych według podobnego wzorca.

### Krok 9: Integracja z Frontendem

1. Utworzenie hooka React do korzystania z usługi OpenRouter:
   ```typescript
   // src/components/hooks/useOpenRouter.ts
   import { useState } from 'react';
   import { OpenRouterService } from '../../lib/ai/openrouter';
   
   export function useOpenRouter() {
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<Error | null>(null);
     
     const openRouter = new OpenRouterService({
       apiKey: import.meta.env.OPENROUTER_API_KEY,
       defaultModel: import.meta.env.OPENROUTER_DEFAULT_MODEL,
       budgetLimit: Number(import.meta.env.OPENROUTER_BUDGET_LIMIT)
     });
     
     const analyzeCampaign = async (data, options) => {
       setLoading(true);
       setError(null);
       
       try {
         const result = await openRouter.analyzeCampaign(data, options);
         setLoading(false);
         return result;
       } catch (err) {
         setError(err as Error);
         setLoading(false);
         throw err;
       }
     };
     
     // Pozostałe metody
     
     return {
       loading,
       error,
       analyzeCampaign,
       // Pozostałe funkcje
     };
   }
   ```

2. Utworzenie komponentu kontekstu dla dostępu do usługi OpenRouter:
   ```typescript
   // src/components/context/OpenRouterContext.tsx
   import { createContext, useContext, useState, useEffect } from 'react';
   import { OpenRouterService } from '../../lib/ai/openrouter';
   
   const OpenRouterContext = createContext<{
     service: OpenRouterService;
     usageInfo: UsageInfo | null;
     loading: boolean;
     error: Error | null;
   } | null>(null);
   
   export function OpenRouterProvider({ children }: { children: React.ReactNode }) {
     // Implementacja providera kontekstu
     
     return (
       <OpenRouterContext.Provider value={{ service, usageInfo, loading, error }}>
         {children}
       </OpenRouterContext.Provider>
     );
   }
   
   export function useOpenRouterContext() {
     const context = useContext(OpenRouterContext);
     if (!context) {
       throw new Error('useOpenRouterContext must be used within an OpenRouterProvider');
     }
     return context;
   }
   ```

### Krok 10: Testowanie i Monitoring

1. Utworzenie testów jednostkowych:
   ```typescript
   // src/lib/ai/openrouter/__tests__/openrouter-service.test.ts
   import { describe, it, expect, vi } from 'vitest';
   import { OpenRouterService } from '../index';
   
   describe('OpenRouterService', () => {
     // Implementacja testów jednostkowych
   });
   ```

2. Utworzenie narzędzi monitoringu:
   ```typescript
   // src/lib/ai/openrouter/monitoring.ts
   export class OpenRouterMonitoring {
     logRequest(request: any, response: any, duration: number): void {
       // Implementacja logowania zapytań
     }
     
     alertOnError(error: Error): void {
       // Implementacja alertów o błędach
     }
     
     alertOnBudgetThreshold(usage: number, threshold: number): void {
       // Implementacja alertów o progu budżetu
     }
   }
   ```

### Krok 11: Dokumentacja i Przykłady Użycia

1. Utworzenie dokumentacji API:
   ```markdown
   # Dokumentacja API OpenRouterService
   
   ## Inicjalizacja
   
   ```typescript
   const openRouter = new OpenRouterService({
     apiKey: 'your_api_key',
     defaultModel: 'openai/gpt-3.5-turbo',
     budgetLimit: 100
   });
   ```
   
   ## Metody
   
   ### analyzeCampaign
   
   ...
   ```

2. Utworzenie przykładów użycia:
   ```typescript
   // examples/campaign-analysis.ts
   import { OpenRouterService } from '../src/lib/ai/openrouter';
   
   async function exampleCampaignAnalysis() {
     const openRouter = new OpenRouterService({
       apiKey: process.env.OPENROUTER_API_KEY!,
       defaultModel: 'openai/gpt-3.5-turbo'
     });
     
     const campaignData = {
       // Przykładowe dane kampanii
     };
     
     try {
       const analysis = await openRouter.analyzeCampaign(campaignData);
       console.log(analysis);
     } catch (error) {
       console.error('Error analyzing campaign:', error);
     }
   }
   
   exampleCampaignAnalysis();
   ```

### Podsumowanie

Plan implementacji usługi OpenRouter umożliwia:

1. Zunifikowany dostęp do różnych modeli AI poprzez jeden interfejs
2. Automatyczny wybór najlepszego modelu dla każdego zadania
3. Optymalizację kosztów poprzez inteligentne zarządzanie wykorzystaniem API
4. Zaawansowaną obsługę błędów i mechanizmy recovery
5. Wykorzystanie struktur JSON dla ustandaryzowanych odpowiedzi
6. Efektywne wykorzystanie cache dla powtarzających się zapytań
7. Bezpieczne przechowywanie kluczy API i danych użytkowników

Implementacja jest zgodna z określonym stackiem technologicznym (TypeScript, React, Astro) i strukturą projektu. Wszystkie kluczowe aspekty usługi OpenRouter zostały uwzględnione, w tym obsługa błędów, kwestie bezpieczeństwa oraz szczegółowe instrukcje implementacji.