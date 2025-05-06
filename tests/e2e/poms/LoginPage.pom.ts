import { type Page, type Locator, expect } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly registerLink: Locator;
  readonly errorMessageAlert: Locator;
  readonly successMessageAlert: Locator;
  readonly resendVerificationButton: Locator;
  readonly loader: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByTestId("login-input-email");
    this.passwordInput = page.getByTestId("login-input-password");
    this.loginButton = page.getByTestId("login-button-submit");
    this.forgotPasswordLink = page.getByTestId("login-link-forgot-password");
    this.registerLink = page.getByTestId("login-link-register");
    this.errorMessageAlert = page.getByTestId("login-alert-error");
    this.successMessageAlert = page.getByTestId("login-alert-success");
    this.resendVerificationButton = page.getByTestId("login-button-resend-verification");
    this.loader = page.getByTestId("login-loader"); // Assuming loader has its own test id if needed
  }

  /**
   * Navigates to the login page.
   */
  async goto() {
    // Używamy względnego URL, który będzie używał baseURL z konfiguracji
    await this.page.goto("/login");
    // Upewnij się, że strona się w pełni załadowała
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Fills the email input field.
   * @param email The email address to enter.
   */
  async fillEmail(email: string) {
    await this.emailInput.clear(); // Najpierw czyści pole, aby uniknąć problemów z poprzednimi wartościami
    await this.emailInput.fill(email);
    await this.emailInput.press("Tab"); // Wyzwala walidację pola
  }

  /**
   * Fills the password input field.
   * @param password The password to enter.
   */
  async fillPassword(password: string) {
    await this.passwordInput.clear(); // Najpierw czyści pole
    await this.passwordInput.fill(password);
    await this.passwordInput.press("Tab"); // Wyzwala walidację pola
  }

  /**
   * Clicks the login button.
   */
  async clickLoginButton() {
    // Upewnij się, że przycisk jest widoczny i klikalny
    await this.loginButton.waitFor({ state: "visible" });
    await this.loginButton.click();
  }

  /**
   * Performs the complete login action: fills email, password, and clicks login.
   * @param email The email address to enter.
   * @param password The password to enter.
   */
  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickLoginButton();

    // Czekaj, aż przycisk przestanie pokazywać stan ładowania
    await this.page.waitForTimeout(500); // Małe opóźnienie dla renderowania UI
  }

  /**
   * Clicks the 'Forgot your password?' link.
   */
  async clickForgotPasswordLink() {
    await this.forgotPasswordLink.waitFor({ state: "visible" });
    await this.forgotPasswordLink.click();
  }

  /**
   * Clicks the 'Register' link.
   */
  async clickRegisterLink() {
    await this.registerLink.waitFor({ state: "visible" });
    await this.registerLink.click();
  }

  /**
   * Clicks the 'Resend Verification Email' button.
   */
  async clickResendVerificationButton() {
    await this.resendVerificationButton.waitFor({ state: "visible" });
    await this.resendVerificationButton.click();
  }

  /**
   * Gets the text content of the error message alert.
   * Returns null if the alert is not visible.
   */
  async getErrorMessageText(): Promise<string | null> {
    try {
      await this.errorMessageAlert.waitFor({ state: "visible", timeout: 5000 });
      // Assuming the description is the main content
      return await this.errorMessageAlert.locator('xpath=./*[contains(@class, "AlertDescription")]').textContent();
    } catch {
      return null;
    }
  }

  /**
   * Gets the text content of the success message alert.
   * Returns null if the alert is not visible.
   */
  async getSuccessMessageText(): Promise<string | null> {
    try {
      await this.successMessageAlert.waitFor({ state: "visible", timeout: 5000 });
      return await this.successMessageAlert.locator('xpath=./*[contains(@class, "AlertDescription")]').textContent();
    } catch {
      return null;
    }
  }

  /**
   * Checks if the error message alert is currently visible.
   */
  async isErrorMessageVisible(): Promise<boolean> {
    return await this.errorMessageAlert.isVisible();
  }

  /**
   * Checks if the success message alert is currently visible.
   */
  async isSuccessMessageVisible(): Promise<boolean> {
    return await this.successMessageAlert.isVisible();
  }

  /**
   * Checks if the 'Resend Verification Email' button is visible.
   */
  async isResendVerificationButtonVisible(): Promise<boolean> {
    return await this.resendVerificationButton.isVisible();
  }

  /**
   * Asserts that the error message alert is visible and contains the expected text.
   * @param expectedText The expected text (can be a substring).
   */
  async expectErrorMessage(expectedText: string | RegExp) {
    // Zwiększamy timeout i czekamy na widoczność elementu
    await expect(this.errorMessageAlert).toBeVisible({ timeout: 15000 });

    // Jeśli element jest widoczny, sprawdzamy jego zawartość
    const alertDescription = this.errorMessageAlert.locator('xpath=./*[contains(@class, "AlertDescription")]');
    await expect(alertDescription).toBeVisible({ timeout: 5000 });
    await expect(alertDescription).toContainText(expectedText, { timeout: 5000 });
  }

  /**
   * Asserts that the success message alert is visible and contains the expected text.
   * @param expectedText The expected text (can be a substring).
   */
  async expectSuccessMessage(expectedText: string | RegExp) {
    // Zwiększamy timeout i czekamy na widoczność elementu
    await expect(this.successMessageAlert).toBeVisible({ timeout: 15000 });

    // Jeśli element jest widoczny, sprawdzamy jego zawartość
    const alertDescription = this.successMessageAlert.locator('xpath=./*[contains(@class, "AlertDescription")]');
    await expect(alertDescription).toBeVisible({ timeout: 5000 });
    await expect(alertDescription).toContainText(expectedText, { timeout: 5000 });
  }
}
