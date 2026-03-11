import { BasePage } from "../base-page";
import { LoginLocator } from "./locators/login.locator";
import { CommonLocator } from "./locators/common.locator";

export class LoginPage extends BasePage {
  async login(): Promise<void> {
    const url = process.env.ANOTHER_ADMIN_PORTAL_BASE_URL;

    this.page.goto(url!);

    const usernameElement = await this.getLocator(LoginLocator.username);
    const passwordElement = await this.getLocator(LoginLocator.password);
    const loginButtonElement = await this.getLocator(LoginLocator.loginButton);

    await usernameElement.fill(process.env.API_USERNAME!);
    await passwordElement.fill(process.env.API_PASSWORD!);
    await loginButtonElement.click();

    const managementCategoryElement = await this.getLocator(
      CommonLocator.managementCategory,
    );

    await managementCategoryElement.waitFor({
      state: "visible",
      timeout: 30000,
    });
  }
}
