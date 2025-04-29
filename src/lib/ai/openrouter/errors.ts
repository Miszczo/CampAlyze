export class OpenRouterError extends Error {
  constructor(message: string, public code: string, public cause?: Error) {
    super(message);
    this.name = 'OpenRouterError';
  }
}

export class AuthorizationError extends OpenRouterError {
  constructor(message: string, cause?: Error) {
    super(message, 'AUTHORIZATION_ERROR', cause);
    this.name = 'AuthorizationError';
  }
}

export class RateLimitError extends OpenRouterError {
  constructor(message: string, public retryAfter?: number, cause?: Error) {
    super(message, 'RATE_LIMIT_ERROR', cause);
    this.name = 'RateLimitError';
  }
}

export class BudgetLimitError extends OpenRouterError {
  constructor(message: string, public currentUsage: number, public limit: number) {
    super(message, 'BUDGET_LIMIT_ERROR');
    this.name = 'BudgetLimitError';
  }
}

export class ModelUnavailableError extends OpenRouterError {
  constructor(message: string, public modelName: string, cause?: Error) {
    super(message, 'MODEL_UNAVAILABLE_ERROR', cause);
    this.name = 'ModelUnavailableError';
  }
}

export class ValidationError extends OpenRouterError {
  constructor(message: string, public response: any, public schema: object) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NetworkError extends OpenRouterError {
  constructor(message: string, cause?: Error) {
    super(message, 'NETWORK_ERROR', cause);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends OpenRouterError {
  constructor(message: string, public timeoutMs: number, cause?: Error) {
    super(message, 'TIMEOUT_ERROR', cause);
    this.name = 'TimeoutError';
  }
}

export class ContentPolicyError extends OpenRouterError {
  constructor(message: string, public violationType: string, cause?: Error) {
    super(message, 'CONTENT_POLICY_ERROR', cause);
    this.name = 'ContentPolicyError';
  }
} 