import { describe, it, expect, beforeEach, vi } from "vitest";
import { ModelSelector, type TaskType, type Priority } from "./model-selector";
import { ModelRegistry } from "./model-registry"; // Importujemy, mimo że nie jest używane aktywnie

// Mock ModelRegistry - na razie prosty, bo nie jest używany w selectModel
vi.mock("./model-registry", () => {
  const ModelRegistryMock = vi.fn();
  // Można dodać mockowane metody, jeśli będą potrzebne w przyszłości
  ModelRegistryMock.prototype.getModel = vi.fn();
  return { ModelRegistry: ModelRegistryMock };
});

describe("model-selector.ts", () => {
  let selector: ModelSelector;
  let mockRegistry: ModelRegistry;

  beforeEach(() => {
    // Resetujemy mock przed każdym testem
    vi.clearAllMocks();
    // Tworzymy instancję mocka ModelRegistry
    mockRegistry = new (vi.mocked(ModelRegistry))(); // Wywołujemy mockowany konstruktor bez argumentów
    selector = new ModelSelector(mockRegistry);
  });

  it("powinien wybrać google/gemini-2.5-flash-preview dla campaign_analysis", () => {
    // Arrange
    const task: TaskType = "campaign_analysis";
    const expectedModel = "google/gemini-2.5-flash-preview";

    // Act
    const result = selector.selectModel(task);

    // Assert
    expect(result).toBe(expectedModel);
  });

  it("powinien wybrać google/gemini-2.5-flash-preview dla report", () => {
    // Arrange
    const task: TaskType = "report";
    const expectedModel = "google/gemini-2.5-flash-preview";

    // Act
    const result = selector.selectModel(task);

    // Assert
    expect(result).toBe(expectedModel);
  });

  it("powinien wybrać google/gemini-2.5-flash-preview dla recommendations", () => {
    // Arrange
    const task: TaskType = "recommendations";
    const expectedModel = "google/gemini-2.5-flash-preview";

    // Act
    const result = selector.selectModel(task);

    // Assert
    expect(result).toBe(expectedModel);
  });

  it("powinien wybrać google/gemini-2.5-flash-preview dla anomaly_detection", () => {
    // Arrange
    const task: TaskType = "anomaly_detection";
    const expectedModel = "google/gemini-2.5-flash-preview";

    // Act
    const result = selector.selectModel(task);

    // Assert
    expect(result).toBe(expectedModel);
  });

  it("powinien wybrać domyślny model (google/gemini-2.5-flash-preview) dla nieznanego zadania", () => {
    // Arrange
    const task: TaskType = "nieznane_zadanie";
    const expectedModel = "google/gemini-2.5-flash-preview";

    // Act
    const result = selector.selectModel(task);

    // Assert
    expect(result).toBe(expectedModel);
  });

  it("powinien ignorować priorytet w obecnej implementacji", () => {
    // Arrange
    const task: TaskType = "campaign_analysis";
    const priority: Priority = "high";
    const expectedModel = "google/gemini-2.5-flash-preview";

    // Act
    const result = selector.selectModel(task, priority);

    // Assert
    expect(result).toBe(expectedModel); // Wynik taki sam jak bez priorytetu
  });

  // Jeśli logika selectModel zacznie używać ModelRegistry, należy dodać testy
  // sprawdzające interakcję z mockRegistry.getModel()
});
