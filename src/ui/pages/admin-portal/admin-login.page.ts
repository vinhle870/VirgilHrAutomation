import { expect } from "@playwright/test";
import { BasePage } from "../base-page";
import { AdminLoginLocators } from "./locators";

export class AdminLoginPage extends BasePage {
  async loginWithValidAccount(
    url: string,
    username: string,
    password: string,
  ) {
    await this.page.goto(url);
    const userField = await this.getLocator(AdminLoginLocators.username);
    await userField.fill(username);

    const passField = await this.getLocator(AdminLoginLocators.password);
    await passField.fill(password);

    const signInBtn = await this.getLocator(AdminLoginLocators.signIn);
    await signInBtn.click();
  }

  async validateLoginButtonIsHidden() {
    const btnSignIn = this.page.locator(AdminLoginLocators.signIn).first();
    await expect(btnSignIn, "Login Button Should Be HIDDEN").not.toBeVisible();
  }
}
