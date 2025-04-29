export interface ModelConfig {
  capabilities: string[];
  costPer1kTokens: number;
  // Można dodać inne parametry modelu
}

export class ModelRegistry {
  private models: Record<string, ModelConfig> = {
    'openai/gpt-3.5-turbo': {
      capabilities: ['quick_analysis', 'summarization'],
      costPer1kTokens: 0.001,
    },
    'openai/gpt-4': {
      capabilities: ['deep_analysis', 'recommendations', 'anomaly_detection'],
      costPer1kTokens: 0.03,
    },
    // Inne modele można dodać tutaj
  };

  getModel(name: string): ModelConfig | undefined {
    return this.models[name];
  }

  // Inne metody rejestru modeli
} 