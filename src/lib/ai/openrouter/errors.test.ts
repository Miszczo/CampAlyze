import { describe, it, expect } from "vitest";
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

describe("errors.ts", () => {
  describe("OpenRouterError", () => {
    it("powinien poprawnie ustawiać właściwości", () => {
      const message = "Base error message";
      const code = "BASE_CODE";
      const cause = new Error("Original cause");
      const error = new OpenRouterError(message, code, cause);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(OpenRouterError);
      expect(error.message).toBe(message);
      expect(error.name).toBe("OpenRouterError");
      expect(error.code).toBe(code);
      expect(error.cause).toBe(cause);
    });
  });

  describe("AuthorizationError", () => {
    it("powinien poprawnie ustawiać właściwości", () => {
      const message = "Auth failed";
      const cause = new Error("Underlying auth issue");
      const error = new AuthorizationError(message, cause);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(OpenRouterError);
      expect(error).toBeInstanceOf(AuthorizationError);
      expect(error.message).toBe(message);
      expect(error.name).toBe("AuthorizationError");
      expect(error.code).toBe("AUTHORIZATION_ERROR");
      expect(error.cause).toBe(cause);
    });
  });

  describe("RateLimitError", () => {
    it("powinien poprawnie ustawiać właściwości, w tym retryAfter", () => {
      const message = "Rate limited";
      const retryAfter = 5000;
      const cause = new Error("API limit exceeded");
      const error = new RateLimitError(message, retryAfter, cause);

      expect(error).toBeInstanceOf(RateLimitError);
      expect(error.message).toBe(message);
      expect(error.name).toBe("RateLimitError");
      expect(error.code).toBe("RATE_LIMIT_ERROR");
      expect(error.retryAfter).toBe(retryAfter);
      expect(error.cause).toBe(cause);
    });
  });

  describe("BudgetLimitError", () => {
    it("powinien poprawnie ustawiać właściwości, w tym currentUsage i limit", () => {
      const message = "Budget exceeded";
      const currentUsage = 100;
      const limit = 90;
      const error = new BudgetLimitError(message, currentUsage, limit);

      expect(error).toBeInstanceOf(BudgetLimitError);
      expect(error.message).toBe(message);
      expect(error.name).toBe("BudgetLimitError");
      expect(error.code).toBe("BUDGET_LIMIT_ERROR");
      expect(error.currentUsage).toBe(currentUsage);
      expect(error.limit).toBe(limit);
    });
  });

  describe("ModelUnavailableError", () => {
    it("powinien poprawnie ustawiać właściwości, w tym modelName", () => {
      const message = "Model not found";
      const modelName = "gpt-nonexistent";
      const cause = new Error("404 from API");
      const error = new ModelUnavailableError(message, modelName, cause);

      expect(error).toBeInstanceOf(ModelUnavailableError);
      expect(error.message).toBe(message);
      expect(error.name).toBe("ModelUnavailableError");
      expect(error.code).toBe("MODEL_UNAVAILABLE_ERROR");
      expect(error.modelName).toBe(modelName);
      expect(error.cause).toBe(cause);
    });
  });

  describe("ValidationError", () => {
    it("powinien poprawnie ustawiać właściwości, w tym response i schema", () => {
      const message = "Invalid response format";
      const response = { data: "incorrect" };
      const schema = { type: "object", properties: { data: { type: "string" } } };
      const error = new ValidationError(message, response, schema);

      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe(message);
      expect(error.name).toBe("ValidationError");
      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.response).toBe(response);
      expect(error.schema).toBe(schema);
    });
  });

  describe("NetworkError", () => {
    it("powinien poprawnie ustawiać właściwości", () => {
      const message = "Connection failed";
      const cause = new Error("TCP timeout");
      const error = new NetworkError(message, cause);

      expect(error).toBeInstanceOf(NetworkError);
      expect(error.message).toBe(message);
      expect(error.name).toBe("NetworkError");
      expect(error.code).toBe("NETWORK_ERROR");
      expect(error.cause).toBe(cause);
    });
  });

  describe("TimeoutError", () => {
    it("powinien poprawnie ustawiać właściwości, w tym timeoutMs", () => {
      const message = "Operation timed out";
      const timeoutMs = 10000;
      const cause = new Error("API call exceeded limit");
      const error = new TimeoutError(message, timeoutMs, cause);

      expect(error).toBeInstanceOf(TimeoutError);
      expect(error.message).toBe(message);
      expect(error.name).toBe("TimeoutError");
      expect(error.code).toBe("TIMEOUT_ERROR");
      expect(error.timeoutMs).toBe(timeoutMs);
      expect(error.cause).toBe(cause);
    });
  });

  describe("ContentPolicyError", () => {
    it("powinien poprawnie ustawiać właściwości, w tym violationType", () => {
      const message = "Content blocked";
      const violationType = "hate_speech";
      const cause = new Error("Moderation filter triggered");
      const error = new ContentPolicyError(message, violationType, cause);

      expect(error).toBeInstanceOf(ContentPolicyError);
      expect(error.message).toBe(message);
      expect(error.name).toBe("ContentPolicyError");
      expect(error.code).toBe("CONTENT_POLICY_ERROR");
      expect(error.violationType).toBe(violationType);
      expect(error.cause).toBe(cause);
    });
  });
});
