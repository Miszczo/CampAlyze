import { describe, it, expect } from "vitest";
import { ModelRegistry, type ModelConfig } from "./model-registry";

describe("ModelRegistry", () => {
  let modelRegistry: ModelRegistry;

  beforeEach(() => {
    modelRegistry = new ModelRegistry();
    // Reset or re-initialize registry if needed, though current implementation is static
  });

  it("should return the correct config for a registered model", () => {
    const modelName = "openai/gpt-4";
    const expectedConfig: ModelConfig = {
      capabilities: ["deep_analysis", "recommendations", "anomaly_detection"],
      costPer1kTokens: 0.03,
    };

    const config = modelRegistry.getModel(modelName);
    expect(config).toBeDefined();
    expect(config).toEqual(expectedConfig);
  });

  it("should return the correct config for another registered model", () => {
    const modelName = "openai/gpt-3.5-turbo";
    const expectedConfig: ModelConfig = {
      capabilities: ["quick_analysis", "summarization"],
      costPer1kTokens: 0.001,
    };

    const config = modelRegistry.getModel(modelName);
    expect(config).toBeDefined();
    expect(config).toEqual(expectedConfig);
  });

  it("should return undefined for an unregistered model name", () => {
    const modelName = "nonexistent/model";
    const config = modelRegistry.getModel(modelName);
    expect(config).toBeUndefined();
  });

  it("should return undefined for an empty model name", () => {
    const modelName = "";
    const config = modelRegistry.getModel(modelName);
    expect(config).toBeUndefined();
  });

  it("should return undefined for a null or undefined model name (if applicable)", () => {
    // TypeScript should prevent this, but good practice for JS interop
    // @ts-expect-error Testing invalid input
    expect(modelRegistry.getModel(null)).toBeUndefined();
    // @ts-expect-error Testing invalid input
    expect(modelRegistry.getModel(undefined)).toBeUndefined();
  });
});
