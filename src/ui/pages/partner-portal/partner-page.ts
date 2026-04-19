import { Locator, Page } from "playwright/test";
import { BasePage } from "../base-page";
import { LoginFormLocators } from "../shared/locators/login-form";
import { ClientPartnerPortalLocators } from "./locators/client";
import { BusinessLocator } from "./locators/business";

export class PartnerPage extends BasePage {
  private readonly URL: string;
  constructor(page: Page) {
    super(page);
    this.URL = "https://partner.qa.virgilhr.com";
  }
  public getURL() {
    return this.URL;
  }

  public getAccountNotExist() {
    return this.page.locator(LoginFormLocators.accountNotExist);
  }

  public getOwnerRoleInClientPage(email: string, page = this.page): Locator {
    return page.locator(ClientPartnerPortalLocators.role.replace("emailValue", email));
  }

  public async moveToPage(path: string, page = this.page): Promise<void> {
    await page.locator(`xpath=//a[@href='${path}']`).click();
  }

  public async closeBusinessDetail(page = this.page): Promise<void> {
    await page.locator(BusinessLocator.closeDetailBusinessButton).click();
  }
}
