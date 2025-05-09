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
  async sendRequest(endpoint: string, payload: Record<string, unknown>): Promise<unknown> {
    const url = this._buildUrl(endpoint);
    const headers = this._prepareHeaders();

    let lastError: Error | undefined = undefined;
    let attempts = 0;

    for (attempts = 0; attempts <= this.retries; attempts++) {
      try {
        let controller: AbortController;
        try {
          controller = new AbortController();
        } catch (controllerError) {
          console.warn(
            "AbortController not available, using fallback. Timeout may not work as expected.",
            controllerError
          );
          controller = {
            signal: null,
            abort: () => {
              console.warn("AbortController.abort() called on fallback.");
            },
          } as unknown as AbortController;
        }

        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

        try {
          const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(payload),
            signal: controller.signal as AbortSignal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            let responseBodyText = "<empty_response_body>"; // Domyślna wartość, jeśli odczyt zawiedzie
            let data: Record<string, unknown> = {};
            try {
              // Najpierw pobierz tekst, aby mieć go w razie problemów z JSON
              responseBodyText = await response.text();
              data = JSON.parse(responseBodyText) as Record<string, unknown>;
            } catch (parseError) {
              console.error("Failed to parse JSON from error response:", parseError, "Raw body:", responseBodyText);
              data = { error: { message: `HTTP error ${response.status}. Raw body: ${responseBodyText}` } };
            }
            const error = this._handleErrorResponse(response, data, payload);

            if (attempts === this.retries || !this._shouldRetry(error)) {
              throw error;
            }
            lastError = error;
            const delay = Math.min(100 * Math.pow(2, attempts), 5000);
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }

          const responseData = (await response.json()) as Record<string, unknown>;
          return responseData;
        } catch (fetchError) {
          clearTimeout(timeoutId);
          throw fetchError; // Rzuć błąd, aby został przechwycony w zewnętrznym bloku catch
        }
      } catch (error: unknown) {
        if (error instanceof OpenRouterError) {
          if (attempts === this.retries || !this._shouldRetry(error)) {
            throw error;
          }
          lastError = error;
        } else if (error instanceof Error && error.name === "AbortError") {
          lastError = new TimeoutError("Request timed out", this.timeoutMs, error);
          throw lastError;
        } else {
          const cause = error instanceof Error ? error : new Error(String(error));
          const newNetworkError = new NetworkError(
            "Request failed during fetch operation or other unexpected error",
            cause
          );

          // Jeśli retries=0 lub to ostatnia próba, rzucamy błąd
          if (attempts === this.retries || this.retries === 0) {
            throw newNetworkError;
          }

          if (!this._shouldRetry(newNetworkError)) {
            throw newNetworkError;
          }
          lastError = newNetworkError;
        }

        const delay = Math.min(100 * Math.pow(2, attempts), 5000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw (
      lastError ||
      new NetworkError("Maximum retry attempts exceeded without a specific error", new Error("Unknown retry error"))
    );
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
      "X-Title": "campAlyze",
      ...this.defaultHeaders,
    };
  }

  /**
   * Obsługuje odpowiedź błędu z API
   */
  private _handleErrorResponse(
    response: Response,
    data: Record<string, unknown>,
    requestPayload: Record<string, unknown>
  ): OpenRouterError {
    const statusCode = response.status;
    const errorCause = new Error(`API Error Data: ${JSON.stringify(data)}`); // Tworzymy Error z data

    const errorMessage =
      typeof data.error === "object" && data.error !== null && "message" in data.error
        ? String((data.error as { message: string }).message)
        : data.message
          ? String(data.message)
          : "Unknown API error";

    if (statusCode === 401) {
      return new AuthorizationError("Invalid API key", errorCause);
    }

    if (statusCode === 429) {
      const retryAfterHeader = response.headers.get("retry-after");
      const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 60;
      return new RateLimitError("Rate limit exceeded", isNaN(retryAfter) ? 60 : retryAfter, errorCause);
    }

    if (statusCode === 403) {
      return new ContentPolicyError("Content policy violation", errorMessage, errorCause);
    }

    if (statusCode === 400) {
      return new ValidationError("Invalid request", errorMessage, errorCause);
    }

    if (errorMessage.toLowerCase().includes("budget")) {
      // Usunięto `data` jako czwarty argument, ponieważ konstruktor BudgetLimitError go nie oczekuje
      // Jeśli BudgetLimitError ma przechowywać oryginalne `data`, jego definicja musi zostać zmieniona
      return new BudgetLimitError("Budget limit exceeded", 0, 0);
    }

    const modelFromPayload = typeof requestPayload.model === "string" ? requestPayload.model : undefined;
    const modelFromData =
      typeof data.error === "object" && data.error !== null && "model" in data.error
        ? String((data.error as { model: string }).model)
        : undefined;

    // Sprawdzamy czy wiadomość zawiera informację o niedostępności modelu
    if (
      (errorMessage.toLowerCase().includes("model") && errorMessage.toLowerCase().includes("unavailable")) ||
      statusCode === 503 ||
      statusCode === 404
    ) {
      const model = modelFromData || modelFromPayload || "unknown";
      return new ModelUnavailableError("Model unavailable", model, errorCause);
    }

    return new OpenRouterError("API error", errorMessage, errorCause);
  }

  /**
   * Określa, czy ponowić próbę dla danego błędu
   */
  private _shouldRetry(error: unknown): boolean {
    if (error instanceof NetworkError || error instanceof TimeoutError) {
      return true;
    }
    if (error instanceof RateLimitError) {
      return true;
    }
    if (error instanceof ModelUnavailableError) {
      return true;
    }
    if (
      error instanceof AuthorizationError ||
      error instanceof ValidationError ||
      error instanceof ContentPolicyError ||
      error instanceof BudgetLimitError
    ) {
      return false;
    }
    if (error instanceof OpenRouterError) {
      return false;
    }
    if (error instanceof Error) {
      return true;
    }
    return false;
  }
}
