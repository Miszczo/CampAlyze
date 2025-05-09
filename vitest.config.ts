import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react"; // Potrzebne jeśli testujesz komponenty React
import path from "node:path"; // Potrzebne do aliasów

export default defineConfig({
  plugins: [react()], // Dodaj plugin React jeśli jest używany w testach
  test: {
    globals: true, // Umożliwia używanie globalnych API Vitest bez importowania
    environment: "jsdom", // Ustawia środowisko DOM dla testów (przydatne dla React Testing Library)
    setupFiles: ["src/setupTests.ts"], // Dodajemy plik setupowy
    coverage: {
      provider: "v8", // lub 'istanbul'
      reporter: ["text", "json", "html"], // Formaty raportów pokrycia
      // Ustaw progi pokrycia zgodnie ze standardami (vitest-unit-testing.mdc)
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 75,
        statements: 85,
      },
      include: ["src/**/*.{ts,tsx}"], // Jakie pliki uwzględniać w pokryciu
      exclude: [
        // Jakie pliki wykluczyć z pokrycia
        "src/components/ui/**", // Komponenty Shadcn/ui
        "src/**/*.config.{js,ts}",
        "src/env.d.ts",
        "src/pages/api/**", // Można rozważyć testowanie API w przyszłości
        "src/middleware/**",
        "src/db/**", // Zależnie od strategii testowania interakcji z bazą
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
        "src/setupTests.ts", // Wykluczamy plik setupowy z pokrycia
      ],
    },
    // Wykluczenie testów E2E z testów Vitest
    exclude: [
      "node_modules",
      "dist",
      ".idea",
      ".git",
      ".cache",
      "tests/e2e/**", // Wykluczamy wszystkie testy E2E
    ],
    // Konfiguracja dla React Testing Library (jeśli używasz setupFiles)
    // clearMocks: true,
  },
  // Konfiguracja aliasów ścieżek (ważne dla importów typu @/)
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
