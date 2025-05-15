// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DropdownSelect } from "./DropdownSelect";
import React from "react";
import type { SelectOption } from "@/types";

// Mock Element.prototype.scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Bardziej stabilne mockowanie window.location
let mockLocation: Location;

beforeEach(() => {
  mockLocation = {
    ...window.location,
    assign: vi.fn(),
    reload: vi.fn(),
    replace: vi.fn(),
    href: "http://localhost/", // Domyślny URL
  };
  Object.defineProperty(window, "location", {
    writable: true,
    value: mockLocation,
  });
});

afterEach(() => {
  Object.defineProperty(window, "location", {
    writable: true,
    value: originalLocation,
  });
  vi.restoreAllMocks();
});

const originalLocation = window.location;

const mockOptions: SelectOption[] = [
  { value: "all", label: "Wszystkie" },
  { value: "option1", label: "Opcja 1" },
  { value: "option2", label: "Opcja 2" },
];

describe("DropdownSelect", () => {
  it("powinien poprawnie renderować się z placeholderem", () => {
    render(<DropdownSelect options={mockOptions} paramName="platform" placeholder="Wybierz platformę" />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("Wybierz platformę");
  });

  it("powinien wyświetlać wybraną wartość", () => {
    render(<DropdownSelect options={mockOptions} value="option1" paramName="platform" />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("Opcja 1");
  });

  it("powinien otwierać listę opcji po kliknięciu i wyświetlać opcje", async () => {
    render(<DropdownSelect options={mockOptions} paramName="platform" />);
    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    // Poczekaj na pojawienie się opcji (SelectContent jest renderowany w portalu)
    await waitFor(() => {
      expect(screen.getByRole("option", { name: "Wszystkie" })).toBeInTheDocument();
    });
    expect(screen.getByRole("option", { name: "Opcja 1" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Opcja 2" })).toBeInTheDocument();
  });

  it("powinien próbować zmienić URL po wybraniu opcji", async () => {
    mockLocation.href = "http://localhost/test"; // Ustawienie początkowego URL dla tego testu
    render(<DropdownSelect options={mockOptions} paramName="campaign" placeholder="Wybierz kampanię" />);
    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    const optionToSelect = await screen.findByRole("option", { name: "Opcja 2" });
    fireEvent.click(optionToSelect);

    await waitFor(() => {
      expect(mockLocation.href).toBe("http://localhost/test?campaign=option2");
    });
  });

  it("powinien usuwać parametr z URL po wybraniu opcji 'all'", async () => {
    mockLocation.href = "http://localhost/test?campaign=option1";

    render(<DropdownSelect options={mockOptions} value="option1" paramName="campaign" />);
    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    const allOption = await screen.findByRole("option", { name: "Wszystkie" });
    fireEvent.click(allOption);

    await waitFor(() => {
      expect(mockLocation.href).toBe("http://localhost/test");
    });
  });
});
