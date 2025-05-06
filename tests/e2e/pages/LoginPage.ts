import { Page, Locator, expect } from "@playwright/test";

export class LoginPage {
  readonly page: Page;

  // Form elements
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly resendVerificationButton: Locator;
  readonly registerLink: Locator;
  readonly forgotPasswordLink: Locator;

  // Error and success messages
  readonly errorMessage: Locator;
  readonly successMessage: Locator;
  readonly emailErrorMessage: Locator;
  readonly passwordErrorMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // Form elements
    this.emailInput = page.getByLabel("Email");
    this.passwordInput = page.getByLabel("Password");
    this.submitButton = page.getByRole("button", { name: "Log in" });
    this.resendVerificationButton = page.getByRole("button", { name: /resend verification/i });
    this.registerLink = page.getByRole("link", { name: /don't have an account\? register/i });
    this.forgotPasswordLink = page.getByRole("link", { name: /forgot password\?/i });

    // Error and success messages
    this.errorMessage = page.getByTestId("error-message");
    this.successMessage = page.getByTestId("success-message");
    this.emailErrorMessage = page.locator('[data-error-for="email"]');
    this.passwordErrorMessage = page.locator('[data-error-for="password"]');
  }

  // Navigation
  async goto() {
    await this.page.goto("/login");
  }

  // Form interactions
  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async submitForm() {
    await this.submitButton.click();
  }

  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submitForm();
  }

  async clickResendVerification() {
    await this.resendVerificationButton.click();
  }

  async clickRegisterLink() {
    await this.registerLink.click();
  }

  async clickForgotPasswordLink() {
    await this.forgotPasswordLink.click();
  }

  // Assertions
  async expectErrorMessage(messagePattern: RegExp | string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(messagePattern);
  }

  async expectSuccessMessage(messagePattern: RegExp | string) {
    await expect(this.successMessage).toBeVisible();
    await expect(this.successMessage).toContainText(messagePattern);
  }

  async expectEmailValidationError() {
    await expect(this.emailErrorMessage).toBeVisible();
    await expect(this.emailErrorMessage).toContainText(/required|empty/i);
  }

  async expectPasswordValidationError() {
    await expect(this.passwordErrorMessage).toBeVisible();
    await expect(this.passwordErrorMessage).toContainText(/required|empty/i);
  }

  async expectEmailFormatError() {
    await expect(this.emailErrorMessage).toBeVisible();
    await expect(this.emailErrorMessage).toContainText(/invalid|format/i);
  }

  async expectResendVerificationButtonVisible() {
    await expect(this.resendVerificationButton).toBeVisible();
  }
}
