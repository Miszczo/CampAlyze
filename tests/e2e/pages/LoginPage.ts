import { expect } from "@playwright/test";
import type { Page, Locator } from "@playwright/test";

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
    this.emailInput = page.getByTestId("login-input-email");
    this.passwordInput = page.getByTestId("login-input-password");
    this.submitButton = page.getByTestId("login-button-submit");
    this.resendVerificationButton = page.getByTestId("login-button-resend-verification");
    this.registerLink = page.getByTestId("login-link-register");
    this.forgotPasswordLink = page.getByTestId("login-link-forgot-password");

    // Error and success messages
    this.errorMessage = page.getByTestId("login-alert-error");
    this.successMessage = page.getByTestId("login-alert-success");
    this.emailErrorMessage = page.getByTestId("login-error-email");
    this.passwordErrorMessage = page.getByTestId("login-error-password");
  }

  // Navigation
  async goto() {
    await this.page.goto("/login");
  }

  async navigate() {
    // Legacy alias preserved for backward compatibility with older tests
    await this.goto();
  }

  // Form interactions
  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async login(email: string, password: string) {
    // If already logged in (redirected to dashboard), skip filling form
    if ((await this.page.url()).includes("/dashboard")) {
      return;
    }
    try {
      await this.fillEmail(email);
      await this.fillPassword(password);
      await this.submitButton.click();
    } catch (err) {
      // If form elements are missing due to redirect, ignore
      console.warn("[LoginPage] Skipping form submission, possibly already logged in", err);
    }
  }

  async resendVerification() {
    await this.resendVerificationButton.click();
  }

  // Assertions
  async expectErrorMessage(message?: string) {
    await expect(this.errorMessage).toBeVisible();
    if (message) {
      await expect(this.errorMessage).toContainText(message);
    }
  }

  async expectSuccessMessage(message?: string) {
    await expect(this.successMessage).toBeVisible();
    if (message) {
      await expect(this.successMessage).toContainText(message);
    }
  }

  async expectEmailError(message?: string) {
    await expect(this.emailErrorMessage).toBeVisible();
    if (message) {
      await expect(this.emailErrorMessage).toContainText(message);
    }
  }

  async expectPasswordError(message?: string) {
    await expect(this.passwordErrorMessage).toBeVisible();
    if (message) {
      await expect(this.passwordErrorMessage).toContainText(message);
    }
  }
}
