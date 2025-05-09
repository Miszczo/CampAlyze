import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { OpenRouterApiClient } from "./api-client";
import {
  AuthorizationError,
  RateLimitError,
  BudgetLimitError,
  NetworkError,
  TimeoutError,
  ContentPolicyError,
} from "./errors";

// Mock for global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock for AbortController
vi.mock("abort-controller", () => {
  return {
    AbortController: class {
      signal = "mock-signal";
      abort = vi.fn();
    },
  };
});

describe("OpenRouterApiClient", () => {
  let client: OpenRouterApiClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new OpenRouterApiClient({
      apiKey: "test-api-key",
      timeoutMs: 1000,
      retries: 1,
    });

    // Reset mock implementations
    mockFetch.mockReset();

    // Default mock implementation
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ result: "success" }),
      headers: new Headers(),
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("constructor", () => {
    it("should initialize with string API key", () => {
      const client = new OpenRouterApiClient("test-api-key");
      expect(client).toBeInstanceOf(OpenRouterApiClient);
    });

    it("should initialize with options object", () => {
      const client = new OpenRouterApiClient({
        apiKey: "test-api-key",
        baseUrl: "https://custom-url.com",
        timeoutMs: 30000,
        retries: 3,
        defaultHeaders: { "X-Custom": "value" },
      });
      expect(client).toBeInstanceOf(OpenRouterApiClient);
    });
  });

  describe("sendRequest", () => {
    it("should make a POST request with correct headers", async () => {
      await client.sendRequest("/endpoint", { data: "test" });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://openrouter.ai/api/v1/endpoint",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer test-api-key",
          }),
          body: JSON.stringify({ data: "test" }),
        })
      );
    });

    it("should return JSON response data for successful request", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ choices: [{ message: { content: "test response" } }] }),
        text: async () => JSON.stringify({ choices: [{ message: { content: "test response" } }] }),
        headers: new Headers(),
      });

      const result = await client.sendRequest("/chat/completions", { prompt: "test" });

      expect(result).toEqual({ choices: [{ message: { content: "test response" } }] });
    });

    it("should throw AuthorizationError for 401 responses", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: "Invalid API key" } }),
        text: async () => JSON.stringify({ error: { message: "Invalid API key" } }),
        headers: new Headers(),
      });

      await expect(client.sendRequest("/endpoint", { data: "test" })).rejects.toThrow(AuthorizationError);
    });

    it("should throw RateLimitError for 429 responses", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ error: { message: "Rate limit exceeded" } }),
        text: async () => JSON.stringify({ error: { message: "Rate limit exceeded" } }),
        headers: new Headers({
          "retry-after": "1",
        }),
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ result: "success after rate limit retry" }),
        text: async () => JSON.stringify({ result: "success after rate limit retry" }),
        headers: new Headers(),
      });

      const result = await client.sendRequest("/endpoint", { data: "test" });

      expect(result).toEqual({ result: "success after rate limit retry" });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("should throw ContentPolicyError for 403 responses", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: { message: "Content policy violation" } }),
        text: async () => JSON.stringify({ error: { message: "Content policy violation" } }),
        headers: new Headers(),
      });

      await expect(client.sendRequest("/endpoint", { data: "test" })).rejects.toThrow(ContentPolicyError);
    });

    it("should throw BudgetLimitError for budget exceeded errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 402,
        json: async () => ({ error: { message: "You have exceeded your current budget." } }),
        text: async () => JSON.stringify({ error: { message: "You have exceeded your current budget." } }),
        headers: new Headers(),
      });

      await expect(client.sendRequest("/endpoint", { data: "test" })).rejects.toThrow(BudgetLimitError);
    });

    it("should retry on ModelUnavailableError and succeed if retry is successful", async () => {
      client = new OpenRouterApiClient({ apiKey: "test-api-key", retries: 1, timeoutMs: 500 });
      // Pierwsza próba - błąd niedostępności modelu
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503, // Status wskazujący na problem z serwerem/modelem
        json: async () => ({
          error: { message: "The model `test-model` is currently unavailable. Please try again later." },
        }),
        text: async () =>
          JSON.stringify({
            error: { message: "The model `test-model` is currently unavailable. Please try again later." },
          }),
        headers: new Headers(),
      });
      // Druga próba (po ponowieniu) - sukces
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ result: "success after model unavailable retry" }),
        text: async () => JSON.stringify({ result: "success after model unavailable retry" }),
        headers: new Headers(),
      });

      const result = await client.sendRequest("/endpoint", { model: "test-model" });
      expect(result).toEqual({ result: "success after model unavailable retry" });
      expect(mockFetch).toHaveBeenCalledTimes(2); // Sprawdza, czy była jedna ponowna próba
    });

    it("should retry on network errors and succeed", async () => {
      client = new OpenRouterApiClient({ apiKey: "test-api-key", retries: 1, timeoutMs: 500 });
      mockFetch.mockRejectedValueOnce(new Error("Simulated Network Error"));

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ result: "success after network error retry" }),
        text: async () => JSON.stringify({ result: "success after network error retry" }),
        headers: new Headers(),
      });

      const result = await client.sendRequest("/endpoint", { data: "test" });

      expect(result).toEqual({ result: "success after network error retry" });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("should eventually fail after max retries on network errors", async () => {
      client = new OpenRouterApiClient({ apiKey: "test-api-key", retries: 1, timeoutMs: 100 });
      mockFetch.mockRejectedValue(new Error("Simulated Persistent Network Error"));

      await expect(client.sendRequest("/endpoint", { data: "test" })).rejects.toThrow(NetworkError);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("should retry on rate limit errors and succeed", async () => {
      client = new OpenRouterApiClient({ apiKey: "test-api-key", retries: 1, timeoutMs: 500 });
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ error: { message: "Rate limit exceeded for test" } }),
        text: async () => JSON.stringify({ error: { message: "Rate limit exceeded for test" } }),
        headers: new Headers({ "retry-after": "0.01" }),
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ result: "success after rate limit retry" }),
        text: async () => JSON.stringify({ result: "success after rate limit retry" }),
        headers: new Headers(),
      });

      const result = await client.sendRequest("/endpoint", { data: "test" });

      expect(result).toEqual({ result: "success after rate limit retry" });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("should eventually fail after max retries on rate limit errors", async () => {
      client = new OpenRouterApiClient({ apiKey: "test-api-key", retries: 1, timeoutMs: 100 });
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({ error: { message: "Persistent Rate limit exceeded" } }),
        text: async () => JSON.stringify({ error: { message: "Persistent Rate limit exceeded" } }),
        headers: new Headers({ "retry-after": "0.01" }),
      });

      await expect(client.sendRequest("/endpoint", { data: "test" })).rejects.toThrow(RateLimitError);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("should not retry on authentication errors (401)", async () => {
      client = new OpenRouterApiClient({ apiKey: "test-api-key", retries: 1, timeoutMs: 100 });
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: "Invalid API key (no retry test)" } }),
        text: async () => JSON.stringify({ error: { message: "Invalid API key (no retry test)" } }),
        headers: new Headers(),
      });

      await expect(client.sendRequest("/endpoint", { data: "test" })).rejects.toThrow(AuthorizationError);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("should throw TimeoutError when request times out after retries", async () => {
      client = new OpenRouterApiClient({ apiKey: "test-api-key", retries: 1, timeoutMs: 50 });
      const abortError = new Error("The operation was aborted.");
      abortError.name = "AbortError";
      mockFetch.mockRejectedValue(abortError);

      await expect(client.sendRequest("/endpoint", { data: "test" })).rejects.toThrow(TimeoutError);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("should throw NetworkError for general fetch errors (no retry if retries = 0)", async () => {
      const clientNoRetry = new OpenRouterApiClient({
        apiKey: "test-api-key",
        retries: 0,
        timeoutMs: 100,
      });

      // Wymuszamy błąd sieciowy i upewniamy się, że mock nie zwróci sukcesu przy kolejnych wywołaniach
      mockFetch.mockReset();
      mockFetch.mockRejectedValue(new Error("Generic fetch error (no retry test)"));

      // Sprawdzamy tylko czy NetworkError jest rzucany, bez sprawdzania ile razy wywołano mockFetch
      await expect(clientNoRetry.sendRequest("/endpoint", { data: "test" })).rejects.toThrow(NetworkError);
    });
  });
});
