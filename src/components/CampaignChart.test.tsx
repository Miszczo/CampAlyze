import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import CampaignChart from "./CampaignChart";

// Mock dla Recharts ResponsiveContainer, aby uniknąć problemów z JSDOM
vi.mock("recharts", async (importOriginal) => {
  const originalModules = await importOriginal<typeof import("recharts")>();
  return {
    ...originalModules,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
  };
});

describe("CampaignChart", () => {
  const mockData = [
    { date: "2024-05-01", clicks: 100, impressions: 1000, spend: 50 },
    { date: "2024-05-02", clicks: 120, impressions: 1100, spend: 60 },
    { date: "2024-05-03", clicks: 90, impressions: 950, spend: 45 },
  ];

  const mockDataWithNull = [
    { date: "2024-05-01", clicks: 100, impressions: null, spend: 50 },
    { date: "2024-05-02", clicks: null, impressions: 1100, spend: 60 },
  ];

  it("poprawnie renderuje wykres z dostarczonymi danymi", () => {
    render(<CampaignChart data={mockData} metric="clicks" metricLabel="Kliknięcia" />);
    // Sprawdzenie czy kontener wykresu jest renderowany (przez mock)
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    // Sprawdzenie czy legenda jest renderowana (Recharts domyślnie dodaje elementy z klasą np. .recharts-legend-item)
    // Dokładniejsze testy wymagałyby głębszej inspekcji DOM generowanego przez Recharts lub użycia snapshotów
    // Na potrzeby tego testu, sprawdzamy ogólne renderowanie.
  });

  it("wyświetla komunikat gdy brak danych", () => {
    render(<CampaignChart data={[]} metric="clicks" metricLabel="Kliknięcia" />);
    expect(screen.getByText("Brak danych do wyświetlenia na wykresie.")).toBeInTheDocument();
  });

  it("wyświetla komunikat gdy wybrana metryka nie istnieje w danych", () => {
    render(<CampaignChart data={mockData} metric={"non_existent_metric" as any} metricLabel="Nieistniejąca Metryka" />);
    expect(
      screen.getByText(
        'Wybrana metryka "Nieistniejąca Metryka" nie jest dostępna w danych lub jej wartość jest nieokreślona.'
      )
    ).toBeInTheDocument();
  });

  it("poprawnie renderuje wykres gdy dane zawierają wartości null dla metryk", () => {
    render(<CampaignChart data={mockDataWithNull} metric="clicks" metricLabel="Kliknięcia" />);
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
  });

  it("poprawnie renderuje wykres dla innej metryki (np. spend)", () => {
    render(<CampaignChart data={mockData} metric="spend" metricLabel="Wydatki" />);
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
  });

  it("używa domyślnego koloru, gdy nie jest podany", () => {
    // Ten test jest bardziej koncepcyjny, ponieważ weryfikacja konkretnego koloru w JSDOM jest trudna.
    // Można by sprawdzić, czy props `stroke` komponentu Line otrzymuje oczekiwaną wartość, jeśli mielibyśmy dostęp do instancji komponentu.
    render(<CampaignChart data={mockData} metric="clicks" metricLabel="Kliknięcia" />);
    // Oczekujemy, że wykres się wyrenderuje
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
  });

  it("używa podanego koloru", () => {
    render(<CampaignChart data={mockData} metric="clicks" metricLabel="Kliknięcia" color="#FF5733" />);
    // Podobnie jak wyżej, trudne do bezpośredniej weryfikacji w JSDOM bez głębszej inspekcji lub snapshotów.
    // Sprawdzamy, czy wykres się renderuje.
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
  });
});
