import { describe, it, expect, beforeEach } from "vitest";
// Importuj klasę do testowania
import { SystemPromptGenerator } from "./system-prompt-generator";
import type { TaskType } from "./model-selector"; // Importujemy typ TaskType

describe("system-prompt-generator.ts", () => {
  describe("SystemPromptGenerator", () => {
    let generator: SystemPromptGenerator;

    // Uruchamiane przed każdym testem w tym bloku describe
    beforeEach(() => {
      generator = new SystemPromptGenerator();
    });

    it("powinien wygenerować poprawny prompt dla campaign_analysis", () => {
      // Arrange
      const task: TaskType = "campaign_analysis";
      const expectedPrompt =
        "Jesteś ekspertem w analizie kampanii reklamowych. Przeanalizuj dane i wygeneruj podsumowanie oraz kluczowe wnioski.";

      // Act
      const result = generator.generatePrompt(task);

      // Assert
      expect(result).toBe(expectedPrompt);
    });

    it("powinien wygenerować poprawny prompt dla recommendations", () => {
      // Arrange
      const task: TaskType = "recommendations";
      const expectedPrompt =
        "Jako AI specjalizująca się w optymalizacji kampanii, wygeneruj rekomendacje na podstawie danych.";

      // Act
      const result = generator.generatePrompt(task);

      // Assert
      expect(result).toBe(expectedPrompt);
    });

    it("powinien wygenerować poprawny prompt dla anomaly_detection", () => {
      // Arrange
      const task: TaskType = "anomaly_detection";
      const expectedPrompt = "Wykryj anomalie w danych kampanii reklamowej i opisz je.";

      // Act
      const result = generator.generatePrompt(task);

      // Assert
      expect(result).toBe(expectedPrompt);
    });

    it("powinien wygenerować poprawny prompt dla report", () => {
      // Arrange
      const task: TaskType = "report";
      const expectedPrompt = "Przygotuj szczegółowy raport z analizy kampanii reklamowej.";

      // Act
      const result = generator.generatePrompt(task);

      // Assert
      expect(result).toBe(expectedPrompt);
    });

    it("powinien zwrócić domyślny prompt dla nieznanego typu zadania", () => {
      // Arrange
      const unknownTask = "nieznane_zadanie" as TaskType; // Rzutujemy, aby zasymulować nieznany typ
      const expectedPrompt = "Wykonaj zadanie AI.";

      // Act
      const result = generator.generatePrompt(unknownTask);

      // Assert
      expect(result).toBe(expectedPrompt);
    });

    // Na razie metoda generatePrompt nie używa parametru `context`,
    // więc nie ma potrzeby dodawania testów z różnymi kontekstami.
    // Jeśli implementacja się zmieni, należy dodać odpowiednie testy.
  });
});
