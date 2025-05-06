import { OpenRouterApiClient } from "./api-client";
import { ModelRegistry } from "./model-registry";
import { ModelSelector } from "./model-selector";
import { RetryHandler } from "./retry-handler";
import { SystemPromptGenerator } from "./system-prompt-generator";
import { UserMessageFormatter } from "./user-message-formatter";
import { CacheManager } from "./cache-manager";
import { UsageTracker } from "./usage-tracker";
import { responseSchemas } from "./response-schemas";
import {
  OpenRouterError,
  AuthorizationError,
  RateLimitError,
  BudgetLimitError,
  ModelUnavailableError,
  ValidationError,
  NetworkError,
  TimeoutError,
  ContentPolicyError,
} from "./errors";
import type {
  OpenRouterConfig,
  QueryParams,
  ModelResponse,
  CampaignData,
  CampaignAnalysis,
  OptimizationRecommendations,
  AnomalyDetectionResults,
  CampaignReport,
  UsageInfo,
  Model,
  ReportOptions,
  RecommendationOptions,
  AnomalyDetectionOptions,
  AnalysisOptions,
  ProcessingOptions,
  UsageStats,
  ServiceStatus,
  TaskType,
  ModelParameters,
  UserMessage,
  ResponseFormat,
  UsageData,
} from "./types";
import type { Priority } from "./model-selector";

export class OpenRouterService {
  private apiClient: OpenRouterApiClient;
  private modelRegistry: ModelRegistry;
  private modelSelector: ModelSelector;
  private retryHandler: RetryHandler;
  private promptGenerator: SystemPromptGenerator;
  private messageFormatter: UserMessageFormatter;
  private cacheManager: CacheManager;
  private usageTracker: UsageTracker;
  // Pozostałe zależności (np. persistent cache) można dodać później

  constructor(config: OpenRouterConfig) {
    this.apiClient = new OpenRouterApiClient(config.apiKey);
    this.modelRegistry = config.modelRegistry || new ModelRegistry();
    this.modelSelector = new ModelSelector(this.modelRegistry);
    this.retryHandler = new RetryHandler();
    this.promptGenerator = new SystemPromptGenerator();
    this.messageFormatter = new UserMessageFormatter();
    this.cacheManager = new CacheManager();
    this.usageTracker = new UsageTracker();
    // Inicjalizacja pozostałych zależności
  }

  async query(params: QueryParams): Promise<ModelResponse> {
    const cacheKey = this.cacheManager.generateKey(params);
    const cached = this._checkCache(cacheKey);
    if (cached) {
      return cached;
    }
    if (!this._checkBudgetLimit()) {
      throw new BudgetLimitError("Przekroczono limit budżetu", 0, 0); // TODO: przekazać usage i limit
    }
    try {
      const response = await this._withRetry(() => this._sendRequest("/chat/completions", params));
      const validated = this._validateResponse(response, {}); // Schemat przekazywany w domenowych
      this._saveToCache(cacheKey, validated);
      this._updateUsageStats({ tokens: 1000, modelName: params.model });
      return validated;
    } catch (err: any) {
      if (err instanceof OpenRouterError) throw err;
      if (err?.response?.status === 401) throw new AuthorizationError("Błąd autoryzacji", err);
      if (err?.response?.status === 429)
        throw new RateLimitError("Przekroczono limit zapytań", err?.response?.headers?.["retry-after"], err);
      if (err?.response?.status === 403) throw new ContentPolicyError("Naruszenie polityki treści", "forbidden", err);
      if (err?.code === "ECONNABORTED" || err?.name === "TimeoutError")
        throw new TimeoutError("Przekroczono czas oczekiwania", 60000, err);
      if (err?.message?.includes("budget")) throw new BudgetLimitError("Przekroczono limit budżetu", 0, 0);
      if (err?.message?.includes("model unavailable"))
        throw new ModelUnavailableError("Model niedostępny", params.model, err);
      throw new NetworkError("Błąd sieci", err);
    }
  }

  async analyzeCampaign(data: CampaignData, options?: AnalysisOptions): Promise<CampaignAnalysis> {
    const task: TaskType = "campaign_analysis";
    const model = this._selectOptimalModel(task, options?.priority as Priority);
    const systemPrompt = this._generateSystemPrompt(task, { campaignType: data.type });
    const userMessage = this._formatUserMessage(data, task);
    const responseFormat = this._prepareResponseFormat(task);
    const modelParams = this._prepareModelParameters(task, options);

    const params: QueryParams = {
      model,
      messages: [{ role: "system", content: systemPrompt }, userMessage],
      response_format: responseFormat,
      ...modelParams,
    };

    const cacheKey = this.cacheManager.generateKey({ task, data, options });
    const cached = this._checkCache(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.query(params);
    const validated = this._validateResponse(response, responseSchemas[task]);
    this._saveToCache(cacheKey, validated);
    return validated;
  }

  async generateOptimizationRecommendations(
    data: CampaignData,
    options?: RecommendationOptions
  ): Promise<OptimizationRecommendations> {
    const task: TaskType = "recommendations";
    const model = this._selectOptimalModel(task, options?.priority as Priority);
    const systemPrompt = this._generateSystemPrompt(task, { campaignType: data.type });
    const userMessage = this._formatUserMessage(data, task);
    const responseFormat = this._prepareResponseFormat(task);
    const modelParams = this._prepareModelParameters(task, options);

    const params: QueryParams = {
      model,
      messages: [{ role: "system", content: systemPrompt }, userMessage],
      response_format: responseFormat,
      ...modelParams,
    };
    const response = await this.query(params);
    const validated = this._validateResponse(response, responseSchemas[task]);
    return validated;
  }

  async detectAnomalies(data: CampaignData, options?: AnomalyDetectionOptions): Promise<AnomalyDetectionResults> {
    const task: TaskType = "anomaly_detection";
    const model = this._selectOptimalModel(task, options?.priority as Priority);
    const systemPrompt = this._generateSystemPrompt(task, { campaignType: data.type });
    const userMessage = this._formatUserMessage(data, task);
    const responseFormat = this._prepareResponseFormat(task);
    const modelParams = this._prepareModelParameters(task, options);

    const params: QueryParams = {
      model,
      messages: [{ role: "system", content: systemPrompt }, userMessage],
      response_format: responseFormat,
      ...modelParams,
    };
    const response = await this.query(params);
    const validated = this._validateResponse(response, responseSchemas[task]);
    return validated;
  }

  async generateReport(data: CampaignData, options?: ReportOptions): Promise<CampaignReport> {
    const task: TaskType = "report";
    const model = this._selectOptimalModel(task, options?.priority as Priority);
    const systemPrompt = this._generateSystemPrompt(task, { campaignType: data.type });
    const userMessage = this._formatUserMessage(data, task);
    const responseFormat = this._prepareResponseFormat(task);
    const modelParams = this._prepareModelParameters(task, options);

    const params: QueryParams = {
      model,
      messages: [{ role: "system", content: systemPrompt }, userMessage],
      response_format: responseFormat,
      ...modelParams,
    };
    const response = await this.query(params);
    const validated = this._validateResponse(response, responseSchemas[task]);
    return validated;
  }

  async getUsageInfo(): Promise<UsageInfo> {
    // Pobierz usage z trackera i limit z configu lub domyślnego pola
    const currentMonthUsage = this.usageTracker.getCurrentUsage();
    const usageByModel = {}; // MVP: brak wsparcia per model
    const budgetLimit = (this as any)._budgetLimit || 100;
    return {
      currentMonthUsage,
      budgetLimit,
      usageByModel,
    };
  }

  async getAvailableModels(): Promise<Model[]> {
    // Pobierz modele z prywatnego pola ModelRegistry
    const modelsRaw = (this.modelRegistry as any).models || {};
    return Object.entries(modelsRaw).map(([name, config]: [string, any]) => ({
      name,
      ...config,
    }));
  }

  setDefaultModel(modelName: string): void {
    // Ustaw domyślny model w serwisie
    (this as any)._defaultModel = modelName;
  }

  setBudgetLimit(limitUSD: number): void {
    // Ustaw limit budżetu w serwisie
    (this as any)._budgetLimit = limitUSD;
  }

  prepareInputData(input: any, options?: ProcessingOptions): any {
    // Prosta sanityzacja: usuwamy __proto__, constructor, prototype
    if (typeof input === "object" && input !== null) {
      const sanitized: Record<string, any> = {};
      for (const key of Object.keys(input)) {
        if (["__proto__", "constructor", "prototype"].includes(key)) continue;
        let value = input[key];
        // Usuwanie potencjalnych <script> w stringach
        if (typeof value === "string") {
          value = value.replace(/<script.*?>.*?<\/script>/gi, "");
          value = value.replace(/<img.*?>/gi, "");
          value = value.replace(/<iframe.*?>.*?<\/iframe>/gi, "");
          value = value.replace(/<svg.*?>.*?<\/svg>/gi, "");
          value = value.replace(/<object.*?>.*?<\/object>/gi, "");
        }
        // Ochrona przed prompt injection: logowanie podejrzanych ciągów
        if (typeof value === "string" && /({{|<script|<img|<iframe|<svg|<object)/i.test(value)) {
          // Można dodać logowanie do monitoringu/alertowania
          console.warn("Potential prompt injection attempt:", { key, value });
        }
        sanitized[key] = value;
      }
      if (options?.sanitize) {
        // Można dodać dodatkowe sanityzacje, np. usuwanie whitespace, normalizacja
      }
      return sanitized;
    }
    // Walidacja typów podstawowych
    if (typeof input === "string") {
      if (/<script|<img|<iframe|<svg|<object|{{/i.test(input)) {
        console.warn("Potential prompt injection attempt in string input:", input);
        return input
          .replace(/<script.*?>.*?<\/script>/gi, "")
          .replace(/<img.*?>/gi, "")
          .replace(/<iframe.*?>.*?<\/iframe>/gi, "")
          .replace(/<svg.*?>.*?<\/svg>/gi, "")
          .replace(/<object.*?>.*?<\/object>/gi, "");
      }
    }
    return input;
  }

  // --- Prywatne metody pomocnicze ---

  private async _sendRequest(endpoint: string, payload: any): Promise<any> {
    try {
      const response = await this.apiClient.sendRequest(endpoint, payload);
      return this._handleApiResponse(response);
    } catch (error) {
      // Przekazujemy błędy dalej - są już obsługiwane w metodzie query
      throw error;
    }
  }

  private _selectOptimalModel(task: TaskType, priority?: Priority): string {
    if (priority) {
      return this.modelSelector.selectModelForTask(task, priority);
    }
    return (this as any)._defaultModel || this.modelRegistry.getDefaultModel().name;
  }

  private _generateSystemPrompt(task: TaskType, context?: any): string {
    return this.promptGenerator.generatePrompt(task, context);
  }

  private _formatUserMessage(data: any, task: TaskType): UserMessage {
    return this.messageFormatter.formatMessage(data, task);
  }

  private _prepareModelParameters(task: TaskType, options?: any): ModelParameters {
    const defaultParams: ModelParameters = {
      temperature: 0.7,
      max_tokens: 1000,
    };

    if (!options) return defaultParams;

    return {
      ...defaultParams,
      temperature: options.temperature ?? defaultParams.temperature,
      max_tokens: options.maxTokens ?? options.max_tokens ?? defaultParams.max_tokens,
    };
  }

  private _prepareResponseFormat(task: TaskType): ResponseFormat {
    // Domyślny format odpowiedzi to JSON dla większości zadań
    return { type: "json_object" };
  }

  private _validateResponse(response: any, schema: object): any {
    // W rzeczywistej implementacji można użyć biblioteki walidacyjnej jak Zod/Ajv
    if (!response) {
      throw new ValidationError("Empty response", response, schema);
    }

    // Sprawdź, czy response zawiera błędy API
    if (response.error) {
      throw new ValidationError(`API error: ${response.error.message || "Unknown error"}`, response, schema);
    }

    // Sprawdź podstawową strukturę odpowiedzi dla zapytań chat
    if (response.choices && Array.isArray(response.choices)) {
      if (response.choices.length === 0) {
        throw new ValidationError("Empty choices array in response", response, schema);
      }

      // Zwróć tylko treść wiadomości dla uproszczenia integracji
      const content = response.choices[0]?.message?.content;
      if (content) {
        try {
          // Próba parsowania JSON jeśli to możliwe
          return typeof content === "string" && content.trim().startsWith("{") ? JSON.parse(content) : content;
        } catch (error) {
          // Jeśli parsowanie się nie powiedzie, zwróć oryginał
          return content;
        }
      }
    }

    // Jeśli nie ma choices, zwróć całą odpowiedź
    return response;
  }

  private _checkCache(key: string): any | null {
    return this.cacheManager.get(key);
  }

  private _saveToCache(key: string, result: any): void {
    this.cacheManager.set(key, result);
  }

  private _checkBudgetLimit(): boolean {
    // W rzeczywistej implementacji sprawdź limity wykorzystania
    return true; // dla MVP zawsze zezwalaj
  }

  private _updateUsageStats(usageData: UsageData): void {
    this.usageTracker.trackUsage(usageData);
  }

  private async _withRetry<T>(operation: () => Promise<T>, options?: any): Promise<T> {
    return this.retryHandler.executeWithRetry(operation, options);
  }

  private _handleApiResponse(response: any): any {
    // W rzeczywistej implementacji można dodać bardziej złożoną logikę analizy odpowiedzi
    // i ekstrahowania istotnych danych
    return response;
  }
}
