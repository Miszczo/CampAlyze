/**
 * Ten plik został usunięty, ponieważ powodował problemy z testami Playwright.
 * Zamiast niego używamy global-setup.ts, który inicjalizuje MSW na poziomie globalnym
 * dla wszystkich testów Playwright.
 *
 * Jeśli potrzebujesz używać MSW w testach, zaimportuj bezpośrednio z '@playwright/test'.
 * Nie importuj już z tego pliku, bo to powoduje konflikt między różnymi instancjami
 * modułu testowego.
 */

export { test, expect } from "@playwright/test";
