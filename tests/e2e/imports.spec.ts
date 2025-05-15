import { test, expect } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";
import { createMockImport, cleanupMockImport } from "./utils/db-utils";
import { HOME_URL, IMPORTS_URL } from "./utils/constants";
import { initPlatformCache } from "./utils/platform-utils";

// Pomijamy cały plik jeśli brak niezbędnych zmiennych środowiskowych
test.skip(!process.env.TEST_USER_ID || !process.env.TEST_ORGANIZATION_ID, "Brak TEST_USER_ID lub TEST_ORGANIZATION_ID w env – pomijam test imports.");

test.describe("Przepływ obsługi importów", () => {
  // Inicjalizuj cache platform przed wszystkimi testami
  test.beforeAll(async () => {
    await initPlatformCache();
    console.log("Cache platform zainicjalizowany przed testami importów");
  });
  
  test.beforeEach(async ({ page, browser }) => {
    // 1. Zaloguj użytkownika
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(process.env.TEST_USER_EMAIL, process.env.TEST_USER_PASSWORD);

    // 2. Poczekaj na przekierowanie po zalogowaniu (główna lub dashboard)
    await page.waitForURL(/\/(|dashboard)$/);
    
    // 3. (Optional) Możemy potwierdzić zalogowanie po obecności tokena sesji lub URL.
    //    Pomijamy asercję widoczności przycisku profilu, aby test był bardziej odporny na zmiany UI.
  });

  // Przygotuj testId do czyszczenia w afterEach
  let testImportId: string;
  
  test.afterEach(async () => {
    // Sprzątamy po każdym teście
    if (testImportId) {
      await cleanupMockImport(testImportId);
      console.log(`Usunięto testowy import ${testImportId}`);
    }
  });

  test("powinien wyświetlać listę importów i umożliwiać usuwanie importu", async ({ page }) => {
    // 1. Utwórz testowy import w bazie danych (bezpośrednio przez API Supabase)
    testImportId = await createMockImport({
      original_filename: "test_import_e2e.csv",
      status: "completed",
      platform_id: "google", // Helper automatycznie zamieni na UUID platformy
    });
    
    console.log(`Utworzono testowy import ${testImportId}`);

    // 2. Przejdź do strony z listą importów
    await page.goto(IMPORTS_URL);
    
    // 3. Sprawdź czy nagłówek strony jest widoczny
    await expect(page.getByRole("heading", { name: /Historia importów/i })).toBeVisible();
    
    // 4. Wyszukaj nasz testowy import w tabeli
    const importRow = page.locator("tr", { hasText: "test_import_e2e.csv" });
    await expect(importRow).toBeVisible();
    
    // 5. Sprawdź czy w wierszu jest widoczny status "Zakończony"
    await expect(importRow.locator("span", { hasText: /Zakończony/i })).toBeVisible();
    
    // 6. Znajdź i kliknij przycisk "Usuń" dla naszego importu
    const deleteButton = importRow.locator("button", { hasText: /Usuń/i });
    
    // Symuluj dialog potwierdzenia (zwracamy true, czyli akceptujemy)
    page.on("dialog", (dialog) => dialog.accept());
    
    // 7. Kliknij przycisk usuwania
    await deleteButton.click();
    
    // 8. Sprawdź czy pojawia się notyfikacja o pomyślnym usunięciu
    const notification = page.locator("#notification");
    await expect(notification).toBeVisible();
    await expect(notification).toHaveText(/Import został usunięty/i);
    
    // 9. Sprawdź czy wiersz zniknął z tabeli (nie powinien być już widoczny)
    await expect(importRow).not.toBeVisible({ timeout: 5000 });
    
    // Czyścimy ID, bo usunęliśmy już import w teście
    testImportId = null;
  });
});

/**
 * Dodaj poniższy kod do pliku utils/constants.ts:
 * export const HOME_URL = process.env.BASE_URL || "http://localhost:4321";
 * export const IMPORTS_URL = `${HOME_URL}/imports`;
 */

/**
 * Dodaj poniższy kod do pliku utils/db-utils.ts:
 * 
 * import { createClient } from "@supabase/supabase-js";
 * import { randomUUID } from "crypto";
 * 
 * // Utworzenie klienta supabase dla testów E2E
 * const supabase = createClient(
 *   process.env.SUPABASE_URL,
 *   process.env.SUPABASE_KEY,
 *   {
 *     auth: {
 *       persistSession: false,
 *     },
 *   }
 * );
 * 
 * interface MockImportParams {
 *   original_filename: string;
 *   status: "pending" | "processing" | "completed" | "failed";
 *   platform_id: "google" | "meta";
 *   error_message?: string | null;
 * }
 * 
 * export async function createMockImport(params: MockImportParams): Promise<string> {
 *   try {
 *     const id = randomUUID();
 *     const user_id = process.env.TEST_USER_ID;
 *     const organization_id = process.env.TEST_ORGANIZATION_ID;
 *     
 *     if (!user_id || !organization_id) {
 *       throw new Error("Brak ID użytkownika lub organizacji w zmiennych środowiskowych");
 *     }
 *     
 *     const { error } = await supabase.from("imports").insert({
 *       id,
 *       original_filename: params.original_filename,
 *       file_path: `${organization_id}/${params.platform_id}/test/${params.original_filename}`,
 *       status: params.status,
 *       user_id,
 *       organization_id,
 *       platform_id: params.platform_id,
 *       error_message: params.error_message || null,
 *     });
 *     
 *     if (error) {
 *       console.error("Błąd podczas tworzenia testowego importu:", error);
 *       throw error;
 *     }
 *     
 *     return id;
 *   } catch (error) {
 *     console.error("Nieoczekiwany błąd podczas tworzenia testowego importu:", error);
 *     throw error;
 *   }
 * }
 * 
 * export async function cleanupMockImport(id: string): Promise<void> {
 *   try {
 *     const { error } = await supabase.from("imports").delete().eq("id", id);
 *     
 *     if (error) {
 *       console.error("Błąd podczas usuwania testowego importu:", error);
 *     }
 *   } catch (error) {
 *     console.error("Nieoczekiwany błąd podczas usuwania testowego importu:", error);
 *   }
 * }
 **/ 