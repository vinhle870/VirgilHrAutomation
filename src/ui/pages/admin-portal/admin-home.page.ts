import { expect } from "@playwright/test";
import { BasePage } from "../base-page";
import { AdminHomeLocators } from "./locators";

export class AdminHomePage extends BasePage {
  async validateHeadingContainsText(value: string) {
    const heading = await this.getLocator(AdminHomeLocators.heading);
    await expect(heading).toContainText(value);
  }

  async validateUserNameInfo(user: any) {
    const userImage = await this.getLocator(AdminHomeLocators.profilePicture);
    const src = await userImage.getAttribute("src");
    expect(src).toEqual(user["ImgSrc"]);

    const userName = await this.getLocator(AdminHomeLocators.userName);
    await expect(userName.textContent()).not.toBe("");
  }

  async validateWidgetDisplayed() {}
}
