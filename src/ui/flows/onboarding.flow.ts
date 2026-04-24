import { Page } from "@playwright/test";
import { TempEmailFreePage } from "../pages/shared/tempemailfree.page";
import { MemberPortalPage } from "../pages/member-portal/member-page";
import { PurchaseFlow } from "./purchase.flow";
import { CommonPartnerPortalLocator } from "../pages/partner-portal/locators/common";
import { BusinessLocator } from "../pages/partner-portal/locators/business";
import { Partner, UserInfo } from "src/objects";
import { CommonMemberPortalLocators } from "../pages/member-portal/locators";
import { CommonPortalLocators } from "../Locator/common";
import { TeamAdditionLocator } from "../pages/admin-portal/locators/partner-management/locator/team-addition";
import delay from "src/utilities/delay";

export class OnboardingFlow {
  private readonly page: Page;
  private memberPortalPage: MemberPortalPage;
  private credentialPassword: string;

  constructor(page: Page) {
    this.page = page;
    this.memberPortalPage = new MemberPortalPage(page);
    this.credentialPassword = "";
  }

  public getMemberPortalPage(): MemberPortalPage {
    return this.memberPortalPage;
  }

  /**
   * Accepts an invitation for the user by retrieving the link from YopMail
   * and completing the onboarding steps.
   */
  async acceptInvitation(tempEmailFreePage: TempEmailFreePage, username: string, page = this.page): Promise<Page> {
    const popupPromise = page.waitForEvent("popup", { timeout: 60000000 });

    await tempEmailFreePage.acceptJoinTeam(username);

    let memberPage: Page = await popupPromise;

    await page.waitForLoadState("domcontentloaded");

    this.memberPortalPage = new MemberPortalPage(memberPage);

    await this.memberPortalPage.setPasswordAndJoinTeam(memberPage);

    return memberPage;
  }

  public async credential(tempEmailFreePage: TempEmailFreePage, emailOfPartner: string, portal = "Partner", changedPasswordStatus = false): Promise<Page> {
    const localPart = emailOfPartner.split("@")[0];

    let elements;

    if (portal === "Partner") elements = await tempEmailFreePage.credential(localPart!);
    else if (portal === "Member") elements = await tempEmailFreePage.credential(localPart!, "Member");
    else if (portal === "Consumer") elements = await tempEmailFreePage.credential(localPart!, "Consumer");

    const credentialEmail = elements.email;
    this.credentialPassword = elements.password;
    const virgilPage = elements.credentialedPage;

    this.memberPortalPage = new MemberPortalPage(virgilPage);

    await this.memberPortalPage.loginViaCredentialEmail(credentialEmail, this.credentialPassword, changedPasswordStatus);

    if (portal === "Member" || portal === "Consumer") this.closemodals(virgilPage);

    return virgilPage;
  }

  public async closemodals(page = this.page, timeout = 5000): Promise<void> {
    try {
      await page.locator(CommonMemberPortalLocators.readyDiveIn).click({ timeout });
    } catch (error) {
      console.log("There is no popup 'I am ready to divin'");
    }

    try {
      for (let i = 0; i < 4; i++) await page.locator(CommonMemberPortalLocators.gotItButton).click({ timeout });
    } catch (error) {
      console.log("There is no popup 'Got it'");
    }
  }

  public async buyPlanInPartnerPortal(tempEmailFreePage: TempEmailFreePage, purchaseFlow: PurchaseFlow, partnerInfo: Partner): Promise<Page | null> {
    if (partnerInfo.partnerInfo?.bankTransfer === true) throw new Error("Making payment is done in admin portal");

    if (partnerInfo.partnerInfo?.paymentOption !== "Partner/Consultant Owner") throw new Error("Payment option must be Partner/Consultant Owner");

    const partnerPage = await this.credential(tempEmailFreePage, partnerInfo.accountInfo?.email!);

    try {
      await purchaseFlow.buyPlan("", partnerInfo.accountInfo!.email, partnerPage);
    } catch (error) {
      console.log("Already bought a plan");
    }

    return partnerPage;
  }

  public async createBusiness(partnerPage = this.page, partnerInfo: Partner, owner?: UserInfo) {
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

    try {
      await partnerPage.locator(BusinessLocator.viewButton).click({ timeout: 5000 });
    } catch (error) {
      await partnerPage.reload();
      await partnerPage.locator(BusinessLocator.businessTab).click();
      await partnerPage.locator(BusinessLocator.viewButton).click();
    }

    await partnerPage.locator(BusinessLocator.ownerText).waitFor({ state: "visible", timeout: 5000 });

    return partnerPage.locator(BusinessLocator.ownerText);
  }

  public async createNewEmail(tempEmailFreePage: TempEmailFreePage, email: string, pageStatus = false): Promise<Page> {
    const username = email.split("@")[0];

    const page = await tempEmailFreePage.createNewEmail(username, pageStatus);

    return page!;
  }

  public async getHomeTitle(page = this.page, timeout = 600000000) {
    const locator = page.getByRole("heading", { level: 2, name: "Home" });
    await locator.waitFor({ state: "visible", timeout });
    return locator;
  }

  public async getChangePasswordElement(page: Page): Promise<any> {
    await page.waitForURL(/.*change-password/);

    const currentPasswordInputElement = page.locator(CommonPortalLocators.currentPasswordInput);
    const newPasswordElement = page.locator(CommonPortalLocators.newPassword);
    const url = page.url();

    return {
      currentPasswordInputElement,
      newPasswordElement,
      url,
    };
  }

  public async changePassword(page: Page, portal = "Partner") {
    await page.locator(CommonPortalLocators.currentPasswordInput).fill(this.credentialPassword);

    await page.locator(CommonPortalLocators.newPassword).fill("Password@123");

    await page.locator(CommonPortalLocators.continueButton).click();

    if (portal === "Member") await page.locator(CommonMemberPortalLocators.completedSafely).click({ timeout: 10000 });

    await page.locator(CommonPortalLocators.continueButton).click();
  }

  public async moveToUserSettingPage(page = this.page): Promise<void> {
    await page.locator(CommonPortalLocators.userSettingsButton).click();
  }

  public async refreshPage(page = this.page) {
    await page.reload();
  }
}
