import { Page } from "@playwright/test";
import { BasePage } from "../base-page";
import { LoginFormLocators } from "./locators";

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Fills the login form with the provided URL, username, and password, then submits the form.
   */
  async fillLoginForm(url: string, username: string, password = "Password@123") {
    const logger = (console.debug ?? console.log).bind(console);
    logger(`==================[Login Form] url: ${url}, username: ${username}\n`);

    await this.page.goto(url);

    const userField = await this.getLocator(LoginFormLocators.username);
    await userField.fill(username);

    const passwordField = await this.getLocator(LoginFormLocators.password);
    await passwordField.fill(password);

    const loginButton = await this.getLocator(LoginFormLocators.signIn);
    await loginButton.click();
  }
}
