import { Page, expect } from "@playwright/test";
import { LocatorHandling } from "../../utilities/locator-handling";
import { LeftMenuLocators } from "../locators/leftmenu-locators";

export class LeftMenu {
  page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Validate The Dealer Name Displayed Correctly on HomePage Heading.
   * @param dealerName
   */
  async validateDisplayedMenuContainText(value: string) {
    await this.page.waitForSelector(LeftMenuLocators.ul_menuItems);

    const menuItems = await LocatorHandling.getLocator(
      this.page,
      LeftMenuLocators.ul_menuItems
    );
    let count = await menuItems.count();

    for (let i = 0; i < count; i++) {
      let menu = await menuItems.nth(i);

      let actualResult = await menu.textContent();

      await expect(actualResult?.toLowerCase()).toContain(value.toLowerCase());
    }
  }

  /**
   * Search for the Menu with text contain. E.g: Admin, admin
   */
  async searchForMenuWithText(value: string) {
    const searchField = await LocatorHandling.getLocator(
      this.page,
      LeftMenuLocators.txt_search
    );

    searchField.fill(value);
  }
}
