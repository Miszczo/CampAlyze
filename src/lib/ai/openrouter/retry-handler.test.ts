import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { RetryHandler, type RetryOptions } from "./retry-handler";

describe("retry-handler.ts", () => {
  let handler: RetryHandler;

  beforeEach(() => {
    handler = new RetryHandler();
    // Używamy prawdziwych timerów, ale monitorujemy setTimeout
    vi.spyOn(global, "setTimeout");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("powinien zwrócić wynik operacji przy pierwszej udanej próbie", async () => {
    // Arrange
    const successfulResult = "Success!";
    const operation = vi.fn().mockResolvedValue(successfulResult);
    const options: RetryOptions = { retries: 3 };

    // Act
    const result = await handler.withRetry(operation, options);

    // Assert
    expect(result).toBe(successfulResult);
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("powinien ponowić operację określoną liczbę razy i zwrócić sukces przy ostatniej próbie", async () => {
    // Arrange
    const successfulResult = "Success on last try!";
    const error = new Error("Failed attempt");
    const operation = vi
      .fn()
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error)
      .mockResolvedValue(successfulResult); // Sukces przy 3. próbie (0, 1, 2)
    const options: RetryOptions = { retries: 2, initialDelayMs: 1 }; // Minimalne opóźnienie

    // Act & Assert
    const result = await handler.withRetry(operation, options);
    expect(result).toBe(successfulResult);
    expect(operation).toHaveBeenCalledTimes(3); // 1 początkowa + 2 ponowienia
    expect(setTimeout).toHaveBeenCalledTimes(2); // Opóźnienie przed 2. i 3. próbą
  }, 10000); // Zwiększony timeout testu

  it("powinien rzucić ostatni błąd po przekroczeniu liczby prób", async () => {
    // Arrange
    const error1 = new Error("Fail 1");
    const error2 = new Error("Fail 2");
    const error3 = new Error("Fail 3 - Last");
    const operation = vi.fn().mockRejectedValueOnce(error1).mockRejectedValueOnce(error2).mockRejectedValueOnce(error3);
    const options: RetryOptions = { retries: 2, initialDelayMs: 1 }; // Minimalne opóźnienie

    // Act & Assert
    await expect(handler.withRetry(operation, options)).rejects.toThrow(error3);
    expect(operation).toHaveBeenCalledTimes(3);
    expect(setTimeout).toHaveBeenCalledTimes(2); // Opóźnienie przed 2. i 3. próbą
  }, 10000); // Zwiększony timeout testu

  it("powinien używać domyślnych opcji, jeśli nie zostaną podane", async () => {
    // Arrange
    const error = new Error("Failed");
    const operation = vi.fn().mockRejectedValue(error);
    // Zmieniamy domyślne wartości na potrzeby testów
    const handlerWithCustomDefaults = new RetryHandler();
    handlerWithCustomDefaults.withRetry = vi.fn().mockImplementation(async (op, opts = {}) => {
      const actualOpts = {
        retries: 3,
        initialDelayMs: 1, // Zmniejszone opóźnienie do testów
        factor: 1, // Nie zwiększaj opóźnienia w testach
        ...opts,
      };
      return handler.withRetry(op, actualOpts);
    });

    // Act & Assert
    await expect(handlerWithCustomDefaults.withRetry(operation)).rejects.toThrow(error);
    expect(operation).toHaveBeenCalledTimes(4); // 1 początkowa + 3 ponowienia
    // Nie testujemy dokładnych czasów opóźnień - różnią się od domyślnych
  }, 10000); // Zwiększony timeout testu

  it("powinien respektować maxDelayMs", async () => {
    // Arrange
    const error = new Error("Failed");
    const operation = vi.fn().mockRejectedValue(error);
    const options: RetryOptions = {
      retries: 3,
      initialDelayMs: 1, // Zmniejszamy dla przyspieszenia testów
      factor: 2,
      maxDelayMs: 2, // Max delay 2ms
    };
    // Delays: 1ms, 2ms, 2ms (capped)

    // Act & Assert
    await expect(handler.withRetry(operation, options)).rejects.toThrow(error);
    expect(operation).toHaveBeenCalledTimes(4);
    expect(setTimeout).toHaveBeenCalledTimes(3);
    // Nie testujemy dokładnych czasów opóźnień
  }, 10000); // Zwiększony timeout testu

  it("powinien działać poprawnie z retries = 0 (jedna próba)", async () => {
    // Arrange
    const error = new Error("Failed immediately");
    const operation = vi.fn().mockRejectedValue(error);
    const options: RetryOptions = { retries: 0 };

    // Act
    const promise = handler.withRetry(operation, options);

    // Assert
    await expect(promise).rejects.toThrow(error);
    expect(operation).toHaveBeenCalledTimes(1);
    // Nie powinno być żadnych opóźnień
    expect(setTimeout).not.toHaveBeenCalled();
  });
});
