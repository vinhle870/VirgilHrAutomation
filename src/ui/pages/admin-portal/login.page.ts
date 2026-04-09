import { BasePage } from "../base-page";
import { LoginLocator } from "./locators/login.locator";
import { CommonLocator } from "./locators/common.locator";
import { Page } from "@playwright/test";

export class LoginAdminPage extends BasePage {
  async login(newPage?: Page): Promise<void> {
    const url = process.env.ADMIN_PORTAL_BASE_URL;

    if (newPage) this.page = newPage;

    await this.page.goto(url!);

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
