import { OpenRouterApiClient } from './api-client';
import { ModelRegistry } from './model-registry';
import { ModelSelector } from './model-selector';
import { RetryHandler } from './retry-handler';
import { SystemPromptGenerator } from './system-prompt-generator';
import { UserMessageFormatter } from './user-message-formatter';
import { CacheManager } from './cache-manager';
import { UsageTracker } from './usage-tracker';
import type { OpenRouterConfig } from './types';
import type { Priority } from './model-selector';

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

  async query(params: any): Promise<any> {
    const cacheKey = this.cacheManager.generateKey(params);
    const cached = this._checkCache(cacheKey);
    if (cached) {
      return cached;
    }
    if (!this._checkBudgetLimit()) {
      throw new Error('Przekroczono limit budżetu');
    }
    const response = await this._withRetry(() => this._sendRequest('/chat/completions', params));
    const validated = this._validateResponse(response, {}); // TODO: przekazać odpowiedni schemat
    this._saveToCache(cacheKey, validated);
    // Przykładowa aktualizacja usage (w pełnej wersji: response.usage)
    this._updateUsageStats({ tokens: 1000, modelName: params.model });
    return validated;
  }

  async analyzeCampaign(data: any, options?: any): Promise<any> {
    const task = 'campaign_analysis';
    const model = this._selectOptimalModel(task, options?.priority);
    const systemPrompt = this._generateSystemPrompt(task, { campaignType: data.type });
    const userMessage = this._formatUserMessage(data, task);
    const responseFormat = this._prepareResponseFormat(task);
    const modelParams = this._prepareModelParameters(task, options);

    const params = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        userMessage,
      ],
      response_format: responseFormat,
      ...modelParams,
    };

    const cacheKey = this.cacheManager.generateKey({ task, data, options });
    const cached = this._checkCache(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.query(params);
    // TODO: przekazać odpowiedni schemat do walidacji
    const validated = this._validateResponse(response, {});
    this._saveToCache(cacheKey, validated);
    return validated;
  }

  async generateOptimizationRecommendations(data: any, options?: any): Promise<any> {
    const task = 'recommendations';
    const model = this._selectOptimalModel(task, options?.priority);
    const systemPrompt = this._generateSystemPrompt(task, { campaignType: data.type });
    const userMessage = this._formatUserMessage(data, task);
    const responseFormat = this._prepareResponseFormat(task);
    const modelParams = this._prepareModelParameters(task, options);

    const params = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        userMessage,
      ],
      response_format: responseFormat,
      ...modelParams,
    };
    return this.query(params);
  }

  async detectAnomalies(data: any, options?: any): Promise<any> {
    const task = 'anomaly_detection';
    const model = this._selectOptimalModel(task, options?.priority);
    const systemPrompt = this._generateSystemPrompt(task, { campaignType: data.type });
    const userMessage = this._formatUserMessage(data, task);
    const responseFormat = this._prepareResponseFormat(task);
    const modelParams = this._prepareModelParameters(task, options);

    const params = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        userMessage,
      ],
      response_format: responseFormat,
      ...modelParams,
    };
    return this.query(params);
  }

  async generateReport(data: any, options?: any): Promise<any> {
    const task = 'report';
    const model = this._selectOptimalModel(task, options?.priority);
    const systemPrompt = this._generateSystemPrompt(task, { campaignType: data.type });
    const userMessage = this._formatUserMessage(data, task);
    const responseFormat = this._prepareResponseFormat(task);
    const modelParams = this._prepareModelParameters(task, options);

    const params = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        userMessage,
      ],
      response_format: responseFormat,
      ...modelParams,
    };
    return this.query(params);
  }

  async getUsageInfo(): Promise<any> {
    throw new Error('Not implemented');
  }

  async getAvailableModels(): Promise<any> {
    throw new Error('Not implemented');
  }

  setDefaultModel(modelName: string): void {
    throw new Error('Not implemented');
  }

  setBudgetLimit(limitUSD: number): void {
    throw new Error('Not implemented');
  }

  prepareInputData(input: any, options?: any): any {
    throw new Error('Not implemented');
  }

  // Publiczne i prywatne metody będą dodawane w kolejnych krokach

  private async _sendRequest(endpoint: string, payload: any): Promise<any> {
    try {
      return await this.apiClient.sendRequest(endpoint, payload);
    } catch (err) {
      throw err;
    }
  }

  private _selectOptimalModel(task: string, priority?: string): string {
    return this.modelSelector.selectModel(task, priority as Priority);
  }

  private _generateSystemPrompt(task: string, context?: any): string {
    return this.promptGenerator.generatePrompt(task, context);
  }

  private _formatUserMessage(data: any, task: string): any {
    return this.messageFormatter.formatMessage(data, task);
  }

  private _prepareModelParameters(task: string, context?: any): any {
    return {
      temperature: 0.3,
      max_tokens: 1000,
    };
  }

  private _prepareResponseFormat(task: string): any {
    return { type: 'json_object' };
  }

  private _validateResponse(response: any, schema: object): any {
    if (!response) {
      throw new Error('Brak odpowiedzi z modelu');
    }
    return response;
  }

  private _checkCache(query: string): any | null {
    return this.cacheManager.get(query);
  }

  private _saveToCache(query: string, result: any): void {
    // TTL można pobierać z configu lub ustawić domyślnie np. 10 minut
    const ttl = 600;
    this.cacheManager.set(query, result, ttl);
  }

  private _checkBudgetLimit(): boolean {
    // Zakładamy, że limit budżetu jest przekazany w configu lub domyślny
    // Tu uproszczona wersja, w pełnej wersji można pobierać z this.config
    const limit = 100; // TODO: pobrać z configu
    return this.usageTracker.checkBudgetLimit(limit);
  }

  private _updateUsageStats(usageData: { tokens: number; modelName: string }): void {
    this.usageTracker.trackUsage(usageData.tokens, usageData.modelName);
  }

  private async _withRetry<T>(operation: () => Promise<T>, options?: any): Promise<T> {
    return this.retryHandler.withRetry(operation, options);
  }

  private _handleApiResponse(response: any): any {
    if (response.error) {
      throw new Error(response.error.message || 'API error');
    }
    return response;
  }
} 