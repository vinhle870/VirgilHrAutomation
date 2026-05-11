import { Locator, Page } from "@playwright/test";
import { BasePage } from "../base-page";
import { LoginFormLocators } from "../shared-pages/locators/login-form";
import { ClientPartnerPortalLocators } from "./locators/client";
import { BusinessLocator } from "./locators/business";
import { Partner, UserInfo } from "src/objects";

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

  public async getPlanToBuy(plan: string): Promise<Locator> {
    return this.page.locator(plan);
  }

  public async fillFormToCreateBusiness(partnerInfo: Partner, owner?: UserInfo) {
    await this.page.locator(BusinessLocator.teamNameInput).fill("Team", { timeout: 5000 });

    if (partnerInfo.partnerInfo?.paymentOption === "Member Portal Consumer") {
      if (!owner) throw new Error("Owner infor is missing");

      await this.page.locator(BusinessLocator.emailInput).fill(owner.email);

      const firstName = this.page.locator(BusinessLocator.firstNameInput);
      await firstName.fill(owner.firstName);

      await this.page.locator(BusinessLocator.lastNameInput).fill(owner.lastName);

      await this.page.locator(BusinessLocator.phoneNumberInput).fill(owner.phoneNumber);

      await this.page.locator(BusinessLocator.jobTitleInput).fill(owner.jobTitle);
    }

    await this.page.locator(BusinessLocator.firstAddButton).click({ timeout: 20000 });

    await this.page.locator(BusinessLocator.seccondAddButton).first().click({ timeout: 20000 });

    await this.page.locator(BusinessLocator.viewButton).click({ timeout: 20000 });

    await this.page.locator(BusinessLocator.ownerText).waitFor({ state: "visible", timeout: 5000 });
  }
}
