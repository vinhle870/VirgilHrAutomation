import { HomePageLocators } from "../locators/home-page-locators";
import { Page, expect } from "@playwright/test";
import { LocatorHandling } from "../../utilities/locator-handling";

export class HomePage {
  page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Validate The Dealer Name Displayed Correctly on HomePage Heading.
   * @param dealerName
   */
  async validateHeadingContainsText(value: string) {
    const heading = await LocatorHandling.getLocator(
      this.page,
      HomePageLocators.heading_DashBoard,
    );
    await expect(heading).toContainText(value);
  }

  async validateUserNameInfo(user: any) {
    const userImage = await LocatorHandling.getLocator(
      this.page,
      HomePageLocators.img_ProfilePicture,
    );

    const src = await userImage.getAttribute("src");

    expect(src).toEqual(user["ImgSrc"]);

    const UserName = await LocatorHandling.getLocator(
      this.page,
      HomePageLocators.lbl_UserName,
    );

    await expect(UserName.textContent()).not.toBe("");
  }

  async validateWidgetDisplayed() {}
}
