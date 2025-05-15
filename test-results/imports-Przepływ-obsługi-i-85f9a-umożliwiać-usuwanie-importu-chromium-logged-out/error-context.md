# Test info

- Name: Przepływ obsługi importów >> powinien wyświetlać listę importów i umożliwiać usuwanie importu
- Location: D:\www\campAlyze\tests\e2e\imports.spec.ts:41:3

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/imports
Call log:
  - navigating to "http://localhost:4321/imports", waiting until "load"

    at D:\www\campAlyze\tests\e2e\imports.spec.ts:52:16
```

# Test source

```ts
   1 | import { test, expect } from "@playwright/test";
   2 | import { LoginPage } from "./pages/LoginPage";
   3 | import { createMockImport, cleanupMockImport } from "./utils/db-utils";
   4 | import { HOME_URL, IMPORTS_URL } from "./utils/constants";
   5 | import { initPlatformCache } from "./utils/platform-utils";
   6 |
   7 | // Pomijamy cały plik jeśli brak niezbędnych zmiennych środowiskowych
   8 | test.skip(!process.env.TEST_USER_ID || !process.env.TEST_ORGANIZATION_ID, "Brak TEST_USER_ID lub TEST_ORGANIZATION_ID w env – pomijam test imports.");
   9 |
   10 | test.describe("Przepływ obsługi importów", () => {
   11 |   // Inicjalizuj cache platform przed wszystkimi testami
   12 |   test.beforeAll(async () => {
   13 |     await initPlatformCache();
   14 |     console.log("Cache platform zainicjalizowany przed testami importów");
   15 |   });
   16 |   
   17 |   test.beforeEach(async ({ page, browser }) => {
   18 |     // 1. Zaloguj użytkownika
   19 |     const loginPage = new LoginPage(page);
   20 |     await loginPage.navigate();
   21 |     await loginPage.login(process.env.TEST_USER_EMAIL, process.env.TEST_USER_PASSWORD);
   22 |
   23 |     // 2. Poczekaj na przekierowanie po zalogowaniu (główna lub dashboard)
   24 |     await page.waitForURL(/\/(|dashboard)$/);
   25 |     
   26 |     // 3. (Optional) Możemy potwierdzić zalogowanie po obecności tokena sesji lub URL.
   27 |     //    Pomijamy asercję widoczności przycisku profilu, aby test był bardziej odporny na zmiany UI.
   28 |   });
   29 |
   30 |   // Przygotuj testId do czyszczenia w afterEach
   31 |   let testImportId: string;
   32 |   
   33 |   test.afterEach(async () => {
   34 |     // Sprzątamy po każdym teście
   35 |     if (testImportId) {
   36 |       await cleanupMockImport(testImportId);
   37 |       console.log(`Usunięto testowy import ${testImportId}`);
   38 |     }
   39 |   });
   40 |
   41 |   test("powinien wyświetlać listę importów i umożliwiać usuwanie importu", async ({ page }) => {
   42 |     // 1. Utwórz testowy import w bazie danych (bezpośrednio przez API Supabase)
   43 |     testImportId = await createMockImport({
   44 |       original_filename: "test_import_e2e.csv",
   45 |       status: "completed",
   46 |       platform_id: "google", // Helper automatycznie zamieni na UUID platformy
   47 |     });
   48 |     
   49 |     console.log(`Utworzono testowy import ${testImportId}`);
   50 |
   51 |     // 2. Przejdź do strony z listą importów
>  52 |     await page.goto(IMPORTS_URL);
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/imports
   53 |     
   54 |     // 3. Sprawdź czy nagłówek strony jest widoczny
   55 |     await expect(page.getByRole("heading", { name: /Historia importów/i })).toBeVisible();
   56 |     
   57 |     // 4. Wyszukaj nasz testowy import w tabeli
   58 |     const importRow = page.locator("tr", { hasText: "test_import_e2e.csv" });
   59 |     await expect(importRow).toBeVisible();
   60 |     
   61 |     // 5. Sprawdź czy w wierszu jest widoczny status "Zakończony"
   62 |     await expect(importRow.locator("span", { hasText: /Zakończony/i })).toBeVisible();
   63 |     
   64 |     // 6. Znajdź i kliknij przycisk "Usuń" dla naszego importu
   65 |     const deleteButton = importRow.locator("button", { hasText: /Usuń/i });
   66 |     
   67 |     // Symuluj dialog potwierdzenia (zwracamy true, czyli akceptujemy)
   68 |     page.on("dialog", (dialog) => dialog.accept());
   69 |     
   70 |     // 7. Kliknij przycisk usuwania
   71 |     await deleteButton.click();
   72 |     
   73 |     // 8. Sprawdź czy pojawia się notyfikacja o pomyślnym usunięciu
   74 |     const notification = page.locator("#notification");
   75 |     await expect(notification).toBeVisible();
   76 |     await expect(notification).toHaveText(/Import został usunięty/i);
   77 |     
   78 |     // 9. Sprawdź czy wiersz zniknął z tabeli (nie powinien być już widoczny)
   79 |     await expect(importRow).not.toBeVisible({ timeout: 5000 });
   80 |     
   81 |     // Czyścimy ID, bo usunęliśmy już import w teście
   82 |     testImportId = null;
   83 |   });
   84 | });
   85 |
   86 | /**
   87 |  * Dodaj poniższy kod do pliku utils/constants.ts:
   88 |  * export const HOME_URL = process.env.BASE_URL || "http://localhost:4321";
   89 |  * export const IMPORTS_URL = `${HOME_URL}/imports`;
   90 |  */
   91 |
   92 | /**
   93 |  * Dodaj poniższy kod do pliku utils/db-utils.ts:
   94 |  * 
   95 |  * import { createClient } from "@supabase/supabase-js";
   96 |  * import { randomUUID } from "crypto";
   97 |  * 
   98 |  * // Utworzenie klienta supabase dla testów E2E
   99 |  * const supabase = createClient(
  100 |  *   process.env.SUPABASE_URL,
  101 |  *   process.env.SUPABASE_KEY,
  102 |  *   {
  103 |  *     auth: {
  104 |  *       persistSession: false,
  105 |  *     },
  106 |  *   }
  107 |  * );
  108 |  * 
  109 |  * interface MockImportParams {
  110 |  *   original_filename: string;
  111 |  *   status: "pending" | "processing" | "completed" | "failed";
  112 |  *   platform_id: "google" | "meta";
  113 |  *   error_message?: string | null;
  114 |  * }
  115 |  * 
  116 |  * export async function createMockImport(params: MockImportParams): Promise<string> {
  117 |  *   try {
  118 |  *     const id = randomUUID();
  119 |  *     const user_id = process.env.TEST_USER_ID;
  120 |  *     const organization_id = process.env.TEST_ORGANIZATION_ID;
  121 |  *     
  122 |  *     if (!user_id || !organization_id) {
  123 |  *       throw new Error("Brak ID użytkownika lub organizacji w zmiennych środowiskowych");
  124 |  *     }
  125 |  *     
  126 |  *     const { error } = await supabase.from("imports").insert({
  127 |  *       id,
  128 |  *       original_filename: params.original_filename,
  129 |  *       file_path: `${organization_id}/${params.platform_id}/test/${params.original_filename}`,
  130 |  *       status: params.status,
  131 |  *       user_id,
  132 |  *       organization_id,
  133 |  *       platform_id: params.platform_id,
  134 |  *       error_message: params.error_message || null,
  135 |  *     });
  136 |  *     
  137 |  *     if (error) {
  138 |  *       console.error("Błąd podczas tworzenia testowego importu:", error);
  139 |  *       throw error;
  140 |  *     }
  141 |  *     
  142 |  *     return id;
  143 |  *   } catch (error) {
  144 |  *     console.error("Nieoczekiwany błąd podczas tworzenia testowego importu:", error);
  145 |  *     throw error;
  146 |  *   }
  147 |  * }
  148 |  * 
  149 |  * export async function cleanupMockImport(id: string): Promise<void> {
  150 |  *   try {
  151 |  *     const { error } = await supabase.from("imports").delete().eq("id", id);
  152 |  *     
```