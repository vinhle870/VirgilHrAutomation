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



  public async getHomeTitle(page?: Page) {
    const locator = (page || this.page).getByRole("heading", { level: 2, name: "Home" });
    await locator.waitFor({ state: "visible", timeout: 20000 });
    return locator;
  }

  public async activateAccountAndSetPassword(
    tempEmailFreePage: TempEmailFreePage,
    email: string,
    portal: string = "Partner",
    changePassword: boolean = false,
  ): Promise<Page> {
    const subject =
      portal === "Member" || portal === "Consumer"
        ? "HR Compliance: Your User Portal Credentials"
        : "HR Compliance: Your Partner Portal Credentials";
    const credential = await tempEmailFreePage.extractAccountCredentialFromInBox(email, subject);
    const newPage = await tempEmailFreePage.currentPage.context().newPage();
    await new LoginPage(newPage).fillLoginForm(credential.hrefValue!, email, credential.password!);
    return newPage;
  }

  public async buyPlanInPartnerPortal(tempEmailFreePage: TempEmailFreePage, purchaseFlow: PurchaseFlow, partnerInfo: Partner): Promise<Page> {
    const partnerPage = await this.activateAccountAndSetPassword(tempEmailFreePage, partnerInfo.accountInfo!.email);
    const planName = partnerInfo.partnerInfo!.productsType?.[0] ?? "";
    await purchaseFlow.selectPlanBeforePurchase("", partnerInfo.accountInfo!.email, planName);
    await purchaseFlow.submitSubscriptionPayment();
    return partnerPage;
  }

  public async createNewEmail(tempEmailFreePage: TempEmailFreePage, email: string, navigateToInbox: boolean = false): Promise<Page> {
    if (navigateToInbox) {
      await tempEmailFreePage.currentPage.goto(process.env.MAILBOX_URL || "");
    }
    return tempEmailFreePage.currentPage;
  }

  public async getChangePasswordElement(page: Page): Promise<{ currentPasswordInputElement: Locator; newPasswordElement: Locator; url: string }> {
    const currentPasswordInputElement = page.locator(LoginFormLocators.currentPasswordInput);
    const newPasswordElement = page.locator(LoginFormLocators.newPasswordTxt);
    const url = page.url();
    return { currentPasswordInputElement, newPasswordElement, url };
  }

  public async changePassword(page: Page): Promise<void> {
    const loginPage = new LoginPage(page);
    await loginPage.changePassword("Welcome@123", "NewPassword@123!");
  }

  public async acceptInvitation(tempEmailFreePage: TempEmailFreePage, localPart: string): Promise<void> {
    const email = `${localPart}@polandcampus.edu.pl`;
    await tempEmailFreePage.acceptJoinTeamInvite(email);
  }

}
