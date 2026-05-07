import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "../base-page";
import { LoginFormLocators } from "../shared-pages/locators/login-form";
import { ClientPartnerPortalLocators } from "./locators/client";
import { BusinessLocator } from "./locators/business";
import { Partner } from "src/objects";
import refreshPage from "src/utilities/refresh";

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
    return this.page.locator(LoginFormLocators.validationMsg);
  }

  public getOwnerRoleInClientPage(email: string, page = this.page): Locator {
    return page.locator(ClientPartnerPortalLocators.role.replace("emailValue", email));
  }

  public async closeBusinessDetail(page = this.page): Promise<void> {
    await page.locator(BusinessLocator.closeDetailBusinessButton).click();
  }

  public async verifyPartnerVisible(partnerInfo: Partner, newPartner = this.page) {
    try {
      await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 5000 });
    } catch (error) {
      await refreshPage(newPartner);
      await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible();
    }
  }

  public async getPlanToBuy(plan: string): Promise<Locator> {
    return this.page.locator(plan);
  }
}
