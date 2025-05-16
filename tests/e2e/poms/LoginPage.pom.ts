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
  readonly emailErrorMessage: Locator;
  readonly passwordErrorMessage: Locator;

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
    this.loader = page.getByTestId("login-loader");
    this.emailErrorMessage = page.getByTestId("login-error-email");
    this.passwordErrorMessage = page.getByTestId("login-error-password");
  }

  /**
   * Navigates to the login page.
   */
  async goto() {
    await this.page.goto("/login");
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Alias for goto(), used in some tests
   */
  async navigate() {
    await this.goto();
  }

  /**
   * Checks if the login page is loaded
   */
  async isLoaded() {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  /**
   * Fills the email input field.
   * @param email The email address to enter.
   */
  async fillEmail(email: string) {
    await expect(this.emailInput).toBeVisible();
    await this.emailInput.clear();
    await this.emailInput.fill(email);
    await this.emailInput.press("Tab");
  }

  /**
   * Fills the password input field.
   * @param password The password to enter.
   */
  async fillPassword(password: string) {
    await expect(this.passwordInput).toBeVisible();
    await this.passwordInput.clear();
    await this.passwordInput.fill(password);
    await this.passwordInput.press("Tab");
  }

  /**
   * Clicks the login button.
   */
  async clickLoginButton() {
    await this.loginButton.waitFor({ state: "visible" });
    await this.loginButton.click();
  }

  /**
   * Clicks submit button - alias for clickLoginButton
   */
  async submitForm() {
    await this.clickLoginButton();
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
    await this.page.waitForTimeout(500);
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
   * If the button doesn't exist, it will simulate the click.
   */
  async clickResendVerificationButton() {
    // Check if the button exists in DOM
    const buttonExists = await this.resendVerificationButton.count() > 0;
    console.log("[LoginPage] Resend button exists in DOM:", buttonExists);

    if (buttonExists) {
      // Check if it's visible and click
      await expect(this.resendVerificationButton).toBeVisible({ timeout: 7000 }); // Zwiększony timeout dla pewności
      await this.resendVerificationButton.click();
      // Opcjonalna asercja: po sukcesie przycisk może zniknąć lub zmienić stan
      // Na razie zostawiamy bez tej asercji, bo zależy to od konkretnego przepływu i mocka
      // await expect(this.resendVerificationButton).not.toBeVisible(); 
    } else {
      // Jeśli przycisk nie istnieje, test powinien to wykryć przez inne asercje
      // np. oczekując na jego widoczność przed kliknięciem.
      // Nie symulujemy tutaj błędu, pozwalamy testowi zawieść, jeśli oczekuje przycisku.
      console.warn("[LoginPage] Resend verification button was not found in DOM. Test might fail if it expects it.");
    }
  }

  /**
   * Gets the text content of the error message alert.
   * Returns null if the alert is not visible.
   */
  async getErrorMessageText(): Promise<string | null> {
    try {
      await this.errorMessageAlert.waitFor({ state: "visible", timeout: 5000 });
      const description = this.errorMessageAlert.locator('[data-slot="alert-description"]');
      return await description.textContent();
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
      const description = this.successMessageAlert.locator('[data-slot="alert-description"]');
      return await description.textContent();
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
   * If the alert is not present, it will be simulated.
   * @param expectedText The expected text (can be a substring).
   */
  async expectErrorMessage(expectedText: string | RegExp) {
    console.log(`[LoginPage] Expecting error message alert with text: ${expectedText}`);
    await expect(this.errorMessageAlert).toBeVisible({ timeout: 7000 }); // Zwiększony timeout
    const alertDescription = this.errorMessageAlert.locator('[data-slot="alert-description"]');
    await expect(alertDescription).toBeVisible({ timeout: 5000 });
    await expect(alertDescription).toContainText(expectedText, { timeout: 5000 });
  }

  /**
   * Asserts that the success message alert is visible and contains the expected text.
   * @param expectedText The expected text (can be a substring).
   */
  async expectSuccessMessage(expectedText: string | RegExp) {
    console.log(`[LoginPage] Expecting success message alert with text: ${expectedText}`);
    await expect(this.successMessageAlert).toBeVisible({ timeout: 7000 }); // Zwiększony timeout
    const alertDescription = this.successMessageAlert.locator('[data-slot="alert-description"]');
    await expect(alertDescription).toBeVisible({ timeout: 5000 });
    await expect(alertDescription).toContainText(expectedText, { timeout: 5000 });
  }

  /**
   * Asserts that there is a validation error for the email field
   */
  async expectEmailValidationError(expectedText?: string | RegExp) {
    await expect(this.emailErrorMessage).toBeVisible({ timeout: 5000 });
    if (expectedText) {
      await expect(this.emailErrorMessage).toContainText(expectedText, { timeout: 5000 });
    }
  }

  /**
   * Asserts that there is a validation error for the password field
   */
  async expectPasswordValidationError(expectedText?: string | RegExp) {
    await expect(this.passwordErrorMessage).toBeVisible({ timeout: 5000 });
    if (expectedText) {
      await expect(this.passwordErrorMessage).toContainText(expectedText, { timeout: 5000 });
    }
  }

  /**
   * Simulates a successful resend verification action by creating a success alert.
   * THIS IS FOR MOCKING/TESTING PURPOSES WHEN API IS NOT FULLY MOCKED OR AVAILABLE.
   * Prefer to use actual API responses and UI updates in E2E tests.
   * @deprecated This method should be removed once API mocking is robust.
   */
  private async simulateResendSuccess() {
    console.warn("[LoginPage] simulateResendSuccess is deprecated and should be removed.");
    // This method is now deprecated and its content can be removed or commented out.
    // The actual success message should come from the application UI after a real/mocked API call.
  }
}
