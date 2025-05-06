import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { OpenRouterApiClient } from "./api-client";
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
        json: async () => ({ choices: [{ message: { content: "test response" } }] }),
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
        headers: new Headers(),
      });

      await expect(client.sendRequest("/endpoint", { data: "test" })).rejects.toThrow(AuthorizationError);
    });

    it("should throw RateLimitError for 429 responses", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ error: { message: "Rate limit exceeded" } }),
        headers: new Headers({
          "retry-after": "60",
        }),
      });

      await expect(client.sendRequest("/endpoint", { data: "test" })).rejects.toThrow(RateLimitError);
    });

    it("should throw ContentPolicyError for 403 responses", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: { message: "Content policy violation" } }),
        headers: new Headers(),
      });

      await expect(client.sendRequest("/endpoint", { data: "test" })).rejects.toThrow(ContentPolicyError);
    });

    it("should throw BudgetLimitError for budget exceeded errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 402,
        json: async () => ({ error: { message: "Budget limit has been exceeded" } }),
        headers: new Headers(),
      });

      await expect(client.sendRequest("/endpoint", { data: "test" })).rejects.toThrow(BudgetLimitError);
    });

    it("should throw ModelUnavailableError for model unavailable errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: { message: "Model not found" } }),
        headers: new Headers(),
      });

      await expect(client.sendRequest("/endpoint", { model: "test-model" })).rejects.toThrow(ModelUnavailableError);
    });

    it("should retry on network errors", async () => {
      // First call fails with network error
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      // Second call succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: "success after retry" }),
        headers: new Headers(),
      });

      const result = await client.sendRequest("/endpoint", { data: "test" });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ result: "success after retry" });
    });

    it("should retry on rate limit errors", async () => {
      // First call gets rate limited
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ error: { message: "Rate limit exceeded" } }),
        headers: new Headers({
          "retry-after": "0", // Set to 0 for tests to avoid actual waiting
        }),
      });

      // Second call succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: "success after rate limit" }),
        headers: new Headers(),
      });

      const result = await client.sendRequest("/endpoint", { data: "test" });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ result: "success after rate limit" });
    });

    it("should not retry on authentication errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: "Invalid API key" } }),
        headers: new Headers(),
      });

      await expect(client.sendRequest("/endpoint", { data: "test" })).rejects.toThrow(AuthorizationError);

      expect(mockFetch).toHaveBeenCalledTimes(1); // No retry attempted
    });

    it("should throw TimeoutError when request times out", async () => {
      // Mock global AbortError
      const abortError = new Error("The operation was aborted");
      abortError.name = "AbortError";

      mockFetch.mockRejectedValueOnce(abortError);

      await expect(client.sendRequest("/endpoint", { data: "test" })).rejects.toThrow(TimeoutError);
    });

    it("should throw NetworkError for general fetch errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Generic fetch error"));

      // Set retries to 0 to prevent retry logic for this test
      const clientNoRetry = new OpenRouterApiClient({
        apiKey: "test-api-key",
        retries: 0,
      });

      await expect(clientNoRetry.sendRequest("/endpoint", { data: "test" })).rejects.toThrow(NetworkError);
    });
  });
});
