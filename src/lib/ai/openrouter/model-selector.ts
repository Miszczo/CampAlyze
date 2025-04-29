import { ModelRegistry } from './model-registry';
import type { ModelConfig } from './model-registry';

export type TaskType = 'campaign_analysis' | 'recommendations' | 'anomaly_detection' | 'report' | string;
export type Priority = 'low' | 'normal' | 'high';

export class ModelSelector {
  constructor(
    private registry: ModelRegistry,
    // private usageTracker: UsageTracker // można dodać w przyszłości
  ) {}

  selectModel(task: TaskType, priority?: Priority): string {
    // Prosta logika wyboru modelu na podstawie tasku i priorytetu
    if (task === 'campaign_analysis' || task === 'report') {
      return 'google/gemini-2.5-flash-preview';
    }
    if (task === 'recommendations' || task === 'anomaly_detection') {
      return 'google/gemini-2.5-flash-preview';
    }
    // Domyślny model
    return 'google/gemini-2.5-flash-preview';
  }
} 