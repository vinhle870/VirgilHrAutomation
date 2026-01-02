import { Page, expect } from "@playwright/test";
import { LoginPageLocators } from "../locators/login-page-locators";
import { LocatorHandling } from "../../utilities/locator-handling";

export class LoginPage {
  page: Page;
  constructor(page: Page) {
    this.page = page;
  }
  /**
   * Login to Dealer Portal with dealer account
   * @param dealer
   */
  async loginWithValidAccount(url: string, username: string, password: string) {
    await this.page.goto(url);
    const userField = await LocatorHandling.getLocator(
      this.page,
      LoginPageLocators.txt_UserName
    );
    await userField.fill(username);
    const passField = await LocatorHandling.getLocator(
      this.page,
      LoginPageLocators.txt_Password
    );
    await passField.fill(password);
    const signInBtn = await LocatorHandling.getLocator(
      this.page,
      LoginPageLocators.btn_SignIn
    );
    await signInBtn.click();
  }

  /**
   * Validate Login Button Is Hidden
   */
  async validateLoginButtonIsHidden() {
    let btn_SignIn = await LocatorHandling.getLocator(
      this.page,
      LoginPageLocators.btn_SignIn
    );
    await expect(btn_SignIn, "Login Button Should Be HIDDEN").not.toBeVisible();
  }
}
