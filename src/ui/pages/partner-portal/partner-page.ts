import { Locator, Page } from "@playwright/test";
import { BasePage } from "../base-page";
import { LoginFormLocators } from "../shared-pages/locators/login-form";
import { ClientPartnerPortalLocators } from "./locators/client";
import { BusinessLocator } from "./locators/business";
import { Partner, UserInfo } from "src/objects";
import { CommonPartnerPortalLocator } from "./locators/common";

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

  public getOwnerRoleInClientPage(email: string): Locator {
    return this.page.locator(ClientPartnerPortalLocators.role.replace("emailValue", email));
  }

  public async getPlanToBuy(plan: string): Promise<Locator> {
    return this.page.locator(plan);
  }

  public async fillFormToCreateBusiness(partnerInfo: Partner, owner?: UserInfo) {
    await this.page.locator(CommonPartnerPortalLocator.clientButton).click({ timeout: 10000 });

    await this.page.locator(BusinessLocator.businessTab).click({ timeout: 10000 });

    await this.page.locator(BusinessLocator.addBussinessButton).click({ timeout: 5000 });

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

  public async eraseModal() {
    try {
      await this.page.locator(CommonPartnerPortalLocator.closeButton).click({ timeout: 7000 });
    } catch (error) {
      console.log("There is no closing button");
    }

    try {
      await this.page.locator(CommonPartnerPortalLocator.closeTestModal).first().click({ timeout: 7000 });
    } catch (error) {
      console.log("There is no modal");
    }
  }
}
