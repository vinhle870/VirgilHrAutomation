import { Page } from "@playwright/test";
import { CommonPartnerPortalLocator } from "../pages/partner-portal/locators/common";
import { BusinessLocator } from "../pages/partner-portal/locators/business";
import { Partner, UserInfo } from "src/objects";

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
      await PartnerPage.locator(CommonPartnerPortalLocator.closeButton).click({ timeout: 7000 });
    } catch (error) {
      console.log("There is no closing button");
    }

    try {
      await PartnerPage.locator(CommonPartnerPortalLocator.closeTestModal).first().click({ timeout: 7000 });
    } catch (error) {
      console.log("There is no modal");
    }

    await PartnerPage.locator(CommonPartnerPortalLocator.clientButton).click({ timeout: 10000 });

    await PartnerPage.locator(BusinessLocator.businessTab).click({ timeout: 10000 });

    await PartnerPage.locator(BusinessLocator.addBussinessButton).click({ timeout: 5000 });

    await PartnerPage.locator(BusinessLocator.teamNameInput).fill("Team", { timeout: 5000 });

    if (partnerInfo.partnerInfo?.paymentOption === "Member Portal Consumer") {
      if (!owner) throw new Error("Owner infor is missing");

      await PartnerPage.locator(BusinessLocator.emailInput).fill(owner.email);

      const firstName = PartnerPage.locator(BusinessLocator.firstNameInput);
      await firstName.fill(owner.firstName);

      await PartnerPage.locator(BusinessLocator.lastNameInput).fill(owner.lastName);

      await PartnerPage.locator(BusinessLocator.phoneNumberInput).fill(owner.phoneNumber);

      await PartnerPage.locator(BusinessLocator.jobTitleInput).fill(owner.jobTitle);
    }

    await PartnerPage.locator(BusinessLocator.firstAddButton).click({ timeout: 20000 });

    await PartnerPage.locator(BusinessLocator.seccondAddButton).first().click({ timeout: 20000 });

    await PartnerPage.locator(BusinessLocator.viewButton).click({ timeout: 20000 });

    await PartnerPage.locator(BusinessLocator.ownerText).waitFor({ state: "visible", timeout: 5000 });

    return PartnerPage.locator(BusinessLocator.ownerText);
  }

  /*

  public async getHomeTitle(page?: Page) {
    const locator = (page || this.page).getByRole("heading", { level: 2, name: "Home" });
    await locator.waitFor({ state: "visible", timeout: 20000 });
    return locator;
  }
*/
}
