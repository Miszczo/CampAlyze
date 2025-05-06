import type { TaskType } from "./model-selector";

export class SystemPromptGenerator {
  private templates: Record<TaskType, string> = {
    campaign_analysis:
      "Jesteś ekspertem w analizie kampanii reklamowych. Przeanalizuj dane i wygeneruj podsumowanie oraz kluczowe wnioski.",
    recommendations: "Jako AI specjalizująca się w optymalizacji kampanii, wygeneruj rekomendacje na podstawie danych.",
    anomaly_detection: "Wykryj anomalie w danych kampanii reklamowej i opisz je.",
    report: "Przygotuj szczegółowy raport z analizy kampanii reklamowej.",
  };

  generatePrompt(task: TaskType, context?: Record<string, any>): string {
    return this.templates[task] || "Wykonaj zadanie AI.";
  }
}
