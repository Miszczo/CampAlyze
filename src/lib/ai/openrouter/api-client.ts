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

export interface OpenRouterApiClientOptions {
  apiKey: string;
  baseUrl?: string;
  timeoutMs?: number;
  retries?: number;
  defaultHeaders?: Record<string, string>;
}

export class OpenRouterApiClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly timeoutMs: number;
  private readonly retries: number;
  private readonly defaultHeaders: Record<string, string>;

  constructor(apiKeyOrOptions: string | OpenRouterApiClientOptions) {
    if (typeof apiKeyOrOptions === "string") {
      this.apiKey = apiKeyOrOptions;
      this.baseUrl = "https://openrouter.ai/api/v1";
      this.timeoutMs = 60000; // 60 sekund
      this.retries = 2;
      this.defaultHeaders = {};
    } else {
      this.apiKey = apiKeyOrOptions.apiKey;
      this.baseUrl = apiKeyOrOptions.baseUrl || "https://openrouter.ai/api/v1";
      this.timeoutMs = apiKeyOrOptions.timeoutMs || 60000;
      this.retries = apiKeyOrOptions.retries || 2;
      this.defaultHeaders = apiKeyOrOptions.defaultHeaders || {};
    }
  }

  /**
   * Wysyła zapytanie do API OpenRouter
   * @param endpoint - endpoint API, np. '/chat/completions'
   * @param payload - dane zapytania
   * @returns Odpowiedź z API
   * @throws OpenRouterError w przypadku błędu
   */
  async sendRequest(endpoint: string, payload: any): Promise<any> {
    const url = this._buildUrl(endpoint);
    const headers = this._prepareHeaders();

    let lastError: Error | undefined = undefined;
    let attempts = 0;

    while (attempts <= this.retries) {
      attempts++;

      try {
        let controller;
        try {
          controller = new AbortController();
        } catch (e) {
          // Fallback for environments where AbortController is not available (e.g., test environments)
          controller = { signal: null, abort: () => {} };
        }

        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

        const response = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json();

        if (!response.ok) {
          const error = this._handleErrorResponse(response, data, payload);
          if (this._shouldRetry(error) && attempts <= this.retries) {
            // Exponential backoff (100ms, 200ms, 400ms, etc.)
            const delay = Math.min(100 * Math.pow(2, attempts - 1), 5000);
            await new Promise((resolve) => setTimeout(resolve, delay));
            lastError = error;
            continue;
          }
          throw error;
        }

        return data;
      } catch (error: any) {
        if (error instanceof OpenRouterError) {
          throw error;
        }

        if (error.name === "AbortError") {
          throw new TimeoutError("Request timed out", this.timeoutMs, error);
        }

        if (this._shouldRetry(error) && attempts <= this.retries) {
          // Exponential backoff for network errors
          const delay = Math.min(100 * Math.pow(2, attempts - 1), 5000);
          await new Promise((resolve) => setTimeout(resolve, delay));
          lastError = error;
          continue;
        }

        throw new NetworkError("Request failed", error);
      }
    }

    // If we've exhausted retries, throw the last error
    throw lastError || new NetworkError("Maximum retry attempts exceeded", new Error("Unknown error"));
  }

  /**
   * Buduje pełny URL do endpointu API
   */
  private _buildUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    return `${this.baseUrl}${cleanEndpoint}`;
  }

  /**
   * Przygotowuje nagłówki dla zapytania
   */
  private _prepareHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
      "HTTP-Referer": "https://campalyze.app",
      "X-Title": "campAlyze", // Nazwa applikacji
      ...this.defaultHeaders,
    };
  }

  /**
   * Obsługuje odpowiedź błędu z API
   */
  private _handleErrorResponse(response: Response, data: any, requestPayload: any): OpenRouterError {
    const statusCode = response.status;
    const errorMessage = data.error?.message || data.message || "Unknown API error";

    if (statusCode === 401) {
      return new AuthorizationError("Invalid API key", data);
    }

    if (statusCode === 429) {
      const retryAfter = response.headers.get("retry-after")
        ? parseInt(response.headers.get("retry-after") || "60", 10)
        : 60;
      return new RateLimitError("Rate limit exceeded", retryAfter, data);
    }

    if (statusCode === 403) {
      return new ContentPolicyError("Content policy violation", errorMessage, data);
    }

    if (statusCode === 400) {
      return new ValidationError("Invalid request", errorMessage, data);
    }

    if (errorMessage.toLowerCase().includes("budget")) {
      return new BudgetLimitError("Budget limit exceeded", 0, 0);
    }

    if (errorMessage.toLowerCase().includes("model unavailable") || statusCode === 404) {
      const model = data.model || requestPayload?.model || "unknown";
      return new ModelUnavailableError("Model unavailable", model, data);
    }

    return new OpenRouterError("API error", errorMessage, data);
  }

  /**
   * Określa, czy ponowić próbę dla danego błędu
   */
  private _shouldRetry(error: any): boolean {
    // Retry network-related errors and rate limits
    if (error instanceof NetworkError || error instanceof TimeoutError) {
      return true;
    }

    if (error instanceof RateLimitError) {
      return true;
    }

    if (error instanceof ModelUnavailableError) {
      return true;
    }

    // Don't retry auth, validation or content policy errors
    if (
      error instanceof AuthorizationError ||
      error instanceof ValidationError ||
      error instanceof ContentPolicyError ||
      error instanceof BudgetLimitError
    ) {
      return false;
    }

    return false;
  }
}
