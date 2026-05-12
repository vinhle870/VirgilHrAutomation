import { Page } from "@playwright/test";
import { BasePage } from "../base-page";
import { LoginFormLocators } from "./locators";

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async login(): Promise<void> {
    const url = process.env.ADMIN_PORTAL_BASE_URL ?? process.env.BASE_URL ?? "";
    const username = process.env.ADMIN_USERNAME ?? "";
    const password = process.env.ADMIN_PASSWORD ?? "";
    await this.fillLoginForm(url, username, password);
  }

  /**
   * Fills the login form with the provided URL, username, and password, then submits the form.
   */
  async fillLoginForm(url: string, username: string, password: string) {
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

  public async changePassword(currentPassword: string, newPassword: string) {
    const currentpasswordTxt = await this.getLocator(LoginFormLocators.currentPasswordInput);
    await currentpasswordTxt.fill(currentPassword);

    const newPasswordField = await this.getLocator(LoginFormLocators.newPasswordTxt);
    await newPasswordField.fill(newPassword);

    const continueBtn = await this.getLocator(LoginFormLocators.continueBtn);
    await continueBtn.click();

    //If "Completed safely!" modal is shown - click "Continue" button if visible
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
    }
  }

  public async setPassword(password: string) {
    const setPasswordTxt = await this.getLocator(LoginFormLocators.setPasswordTxt);
    await setPasswordTxt.fill(password);
  }

  public async clickOnJoinTeamLink() {
    const joinTeamLink = await this.getLocator(LoginFormLocators.joinTeamLnk);
    await joinTeamLink.click();
  }
}
