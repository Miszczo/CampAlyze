import { describe, it, expect } from "vitest";
// Importuj testowane funkcje z utils.ts
// import { funkcjaDoPrzetestowania } from './utils';
import { cn } from "./utils"; // Importujemy funkcję cn

describe("utils.ts", () => {
  describe("funkcjaDoPrzetestowania", () => {
    it("powinien robić X, gdy Y", () => {
      // Arrange
      const input = "przykład";
      const expectedOutput = "oczekiwany wynik";

      // Act
      // const result = funkcjaDoPrzetestowania(input);

      // Assert
      // expect(result).toBe(expectedOutput);
      expect(true).toBe(true); // Placeholder assertion
    });

    // Dodaj więcej testów dla tej funkcji...
  });

  describe("cn", () => {
    // Zmieniamy nazwę describe na nazwę testowanej funkcji
    it("powinien poprawnie łączyć stringi klas", () => {
      // Arrange
      const input1 = "klasa1";
      const input2 = "klasa2";
      const expectedOutput = "klasa1 klasa2"; // tailwind-merge nie zmienia tu nic

      // Act
      const result = cn(input1, input2); // Wywołujemy cn

      // Assert
      expect(result).toBe(expectedOutput); // Weryfikujemy wynik
      // expect(true).toBe(true); // Placeholder assertion // Usuwamy placeholder
    });

    it("powinien obsługiwać warunkowe dodawanie klas (obiekty)", () => {
      // Arrange
      const condition1 = true;
      const condition2 = false;
      const expectedOutput = "klasa-bazowa klasa-gdy-true"; // tailwind-merge nie zmienia

      // Act
      const result = cn("klasa-bazowa", {
        "klasa-gdy-true": condition1,
        "klasa-gdy-false": condition2,
      });

      // Assert
      expect(result).toBe(expectedOutput);
    });

    it("powinien obsługiwać tablice klas", () => {
      // Arrange
      const classes = ["klasa1", "klasa2"];
      const expectedOutput = "klasa1 klasa2";

      // Act
      const result = cn(classes);

      // Assert
      expect(result).toBe(expectedOutput);
    });

    it("powinien ignorować wartości null, undefined i false", () => {
      // Arrange
      const expectedOutput = "klasa-aktywna";

      // Act
      const result = cn(null, false, "klasa-aktywna", undefined);

      // Assert
      expect(result).toBe(expectedOutput);
    });

    it("powinien poprawnie scalać klasy Tailwind (tailwind-merge)", () => {
      // Arrange
      // tailwind-merge powinien usunąć zduplikowane i konfliktujące klasy
      const expectedOutput = "p-4 m-2"; // px-2 i p-2 zostaną nadpisane przez p-4

      // Act
      const result = cn("px-2", "p-4", "m-2");

      // Assert
      expect(result).toBe(expectedOutput);
    });

    it("powinien poprawnie scalać klasy Tailwind z obiektami warunkowymi", () => {
      // Arrange
      const isActive = true;
      const expectedOutput = "block p-4"; // 'hidden' zostanie nadpisane przez 'block'

      // Act
      const result = cn("p-2", { hidden: !isActive, "block p-4": isActive });

      // Assert
      expect(result).toBe(expectedOutput);
    });

    // Dodaj więcej testów dla tej funkcji... // Można dodać bardziej złożone przypadki tailwind-merge
  });

  // Dodaj więcej bloków describe dla innych funkcji... // Na razie jest tylko cn
});
