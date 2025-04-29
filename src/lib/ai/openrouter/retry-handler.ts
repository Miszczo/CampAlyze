export interface RetryOptions {
  retries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  factor?: number;
}

export class RetryHandler {
  async withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      retries = 3,
      initialDelayMs = 500,
      maxDelayMs = 5000,
      factor = 2,
    } = options;

    let attempt = 0;
    let delay = initialDelayMs;
    let lastError: unknown;

    while (attempt <= retries) {
      try {
        return await operation();
      } catch (err) {
        lastError = err;
        attempt++;
        if (attempt > retries) break;
        await new Promise(res => setTimeout(res, delay));
        delay = Math.min(delay * factor, maxDelayMs);
      }
    }
    throw lastError;
  }
} 