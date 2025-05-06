import { describe, it, expect, beforeEach } from "vitest";
// Importuj funkcję do testowania
// import { formatUserMessage } from './user-message-formatter';
import { UserMessageFormatter, type UserMessage } from "./user-message-formatter";
import type { TaskType } from "./model-selector"; // Importujemy typ TaskType

describe("user-message-formatter.ts", () => {
  describe("UserMessageFormatter", () => {
    let formatter: UserMessageFormatter;

    beforeEach(() => {
      formatter = new UserMessageFormatter();
    });

    it("powinien poprawnie sformatować obiekt danych do wiadomości użytkownika JSON", () => {
      // Arrange
      const campaignData = {
        name: "Kampania Testowa",
        metrics: { clicks: 100, impressions: 1000, cost: 50 },
        period: { start: "2024-01-01", end: "2024-01-07" },
      };
      const task: TaskType = "campaign_analysis";
      const expectedMessage: UserMessage = {
        role: "user",
        content: JSON.stringify(campaignData), // Oczekujemy stringa JSON
      };

      // Act
      const result = formatter.formatMessage(campaignData, task);

      // Assert
      expect(result).toEqual(expectedMessage); // Używamy toEqual do porównania obiektów
    });

    it("powinien zwrócić wiadomość z niezmienionym contentem, jeśli dane wejściowe są stringiem", () => {
      // Arrange
      const rawStringData = "To są surowe dane tekstowe.";
      const task: TaskType = "report";
      const expectedMessage: UserMessage = {
        role: "user",
        content: rawStringData,
      };

      // Act
      const result = formatter.formatMessage(rawStringData, task);

      // Assert
      expect(result).toEqual(expectedMessage);
    });

    it("powinien poprawnie sformatować pusty obiekt", () => {
      // Arrange
      const emptyData = {};
      const task: TaskType = "recommendations";
      const expectedMessage: UserMessage = {
        role: "user",
        content: JSON.stringify(emptyData),
      };

      // Act
      const result = formatter.formatMessage(emptyData, task);

      // Assert
      expect(result).toEqual(expectedMessage);
    });

    it("powinien poprawnie sformatować tablicę obiektów", () => {
      // Arrange
      const dataArray = [{ id: 1 }, { id: 2 }];
      const task: TaskType = "anomaly_detection";
      const expectedMessage: UserMessage = {
        role: "user",
        content: JSON.stringify(dataArray),
      };

      // Act
      const result = formatter.formatMessage(dataArray, task);

      // Assert
      expect(result).toEqual(expectedMessage);
    });

    // Aktualna implementacja nie zależy od `task`, więc testowanie różnych tasków
    // przy tych samych danych nie wnosi dodatkowej wartości.
    // Jeśli logika formatowania zacznie zależeć od `task`, należy dodać odpowiednie testy.
  });
});
