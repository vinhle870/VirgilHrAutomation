import { Locator, Page } from "@playwright/test";

import { MemberOnboardingPage } from "../pages/member-portal/member-onboarding.page";

import { CommonPartnerPortalLocator } from "../pages/partner-portal/locators/common";
import { BusinessLocator } from "../pages/partner-portal/locators/business";
import { Partner, UserInfo } from "src/objects";
import { TempEmailFreePage } from "../pages/shared-pages/tempemailfree.page";
import { LoginPage } from "../pages/shared-pages/login.page";
import { LoginFormLocators } from "../pages/shared-pages/locators/login-form";
import { PurchaseFlow } from "./purchase.flow";

/**
 * This flow class contains methods related to the onboarding process of both partner and member users, such as accepting invitations, credentialing, buying plans, and creating a business.
*Flows:
* Flow #1: Create Partner From different portals-> Add Partner member with different role
* Flow #2: Create Partner from different portals -> Add Business -> Add team members
* Flow #3: Create Customer Under Partner -> Add Business -> Add team members
* Flow #4: Sign up Individual Customer from member portal

*/

export class OnboardingFlow {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  public async createBusinessFromPartnerPortal(PartnerPage: Page, partnerInfo: Partner, owner?: UserInfo) {
    if (partnerInfo.partnerInfo?.paymentOption !== "Member Portal Consumer" && partnerInfo.partnerInfo?.paymentOption !== "Partner/Consultant Owner")
      throw new Error("Payment option must be Member Portal Consumer or Partner/Consultant Owner");

    try {
      await partnerPage.locator(CommonPartnerPortalLocator.closeButton).click({ timeout: 7000 });
    } catch (error) {
      console.log("There is no closing button");
    }

    try {
      await partnerPage.locator(CommonPartnerPortalLocator.closeTestModal).first().click({ timeout: 7000 });
    } catch (error) {
      console.log("There is no modal");
    }

    await partnerPage.locator(CommonPartnerPortalLocator.clientButton).click({ timeout: 30000 });

    try {
      await partnerPage.locator(BusinessLocator.businessTab).click({ timeout: 5000 });
      await partnerPage.locator(BusinessLocator.addBussinessButton).click({ timeout: 5000 });
    } catch (error) {
      await partnerPage.locator(CommonPortalLocators.popupClosingButton).click();

      await partnerPage.locator(BusinessLocator.businessTab).click({ timeout: 5000 });
      await partnerPage.locator(BusinessLocator.addBussinessButton).click({ timeout: 5000 });
    }

    await partnerPage.locator(BusinessLocator.teamNameInput).fill("Team", { timeout: 5000 });

    if (partnerInfo.partnerInfo?.paymentOption === "Member Portal Consumer") {
      if (!owner) throw new Error("Owner infor is missing");

      await partnerPage.locator(BusinessLocator.emailInput).fill(owner.email);

      const firstName = partnerPage.locator(BusinessLocator.firstNameInput);
      await firstName.fill(owner.firstName);

      await partnerPage.locator(BusinessLocator.lastNameInput).fill(owner.lastName);

      await partnerPage.locator(BusinessLocator.phoneNumberInput).fill(owner.phoneNumber);

      await partnerPage.locator(BusinessLocator.jobTitleInput).fill(owner.jobTitle);
    }

    await partnerPage.locator(BusinessLocator.firstAddButton).first().click({ timeout: 5000 });

    await partnerPage.locator(BusinessLocator.seccondAddButton).first().click({ timeout: 5000 });

    await PartnerPage.locator(BusinessLocator.viewButton).click({ timeout: 20000 });

    await PartnerPage.locator(BusinessLocator.ownerText).waitFor({ state: "visible", timeout: 5000 });

    return PartnerPage.locator(BusinessLocator.ownerText);
  }

  /*

  public async getHomeTitle(page = this.page, timeout = 600000000) {
    const locator = page.getByRole("heading", { level: 2, name: "Home" });
    await locator.waitFor({ state: "visible", timeout });
    return locator;
  }
*/
}
