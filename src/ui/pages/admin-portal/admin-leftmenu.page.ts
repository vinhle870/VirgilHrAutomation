import { expect } from "@playwright/test";
import { BasePage } from "../base-page";
import { AdminLeftMenuLocators } from "./locators";

export class AdminLeftMenu extends BasePage {
  async validateDisplayedMenuContainText(value: string) {
    const menuItems = await this.getLocator(AdminLeftMenuLocators.menuItems);
    const count = await menuItems.count();

    for (let i = 0; i < count; i++) {
      const menu = menuItems.nth(i);
      const actualResult = await menu.textContent();
      expect(actualResult?.toLowerCase()).toContain(value.toLowerCase());
    }
  }

  async searchForMenuWithText(value: string) {
    const searchField = await this.getLocator(AdminLeftMenuLocators.search);
    await searchField.fill(value);
  }
}
