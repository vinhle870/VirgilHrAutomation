import { Page } from "playwright/test";
import { BasePage } from "../base-page";
import { CommonAdminPortalLocator } from "./locators/common/common";

export class LoginAdminPage extends BasePage {
  async login(newPage?: Page): Promise<void> {
    try {
      const url = process.env.ADMIN_PORTAL_BASE_URL;

      if (newPage) this.page = newPage;

      await this.page.goto(url!);

      const usernameElement = await this.getLocator(CommonAdminPortalLocator.username, 15000);
      const passwordElement = await this.getLocator(CommonAdminPortalLocator.password);
      const loginButtonElement = await this.getLocator(CommonAdminPortalLocator.loginButton);

      await usernameElement.fill(process.env.API_USERNAME!);
      await passwordElement.fill(process.env.API_PASSWORD!);
      await loginButtonElement.click();
    } catch (error) {
      console.log("Loggin already");
    }
  }
}
