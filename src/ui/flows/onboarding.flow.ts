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
  async acceptInvitation(tempEmailFreePage: TempEmailFreePage, username: string): Promise<void> {
    const [virgilPage] = await Promise.all([this.page.waitForEvent("popup"), tempEmailFreePage.acceptJoinTeam(username)]);

    await this.page.waitForLoadState("domcontentloaded");

    this.memberPortalPage = new MemberPortalPage(virgilPage);

    await this.memberPortalPage.setPasswordAndJoinTeam();

    await virgilPage.close();
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

  private async closemodals(virgilPage = this.page) {
    try {
      await virgilPage.locator(CommonMemberPortalLocators.readyDiveIn).click({ timeout: 3000 });
    } catch (error) {
      console.log("There is no popup 'I am ready to divin'");
    }

    try {
      for (let i = 0; i < 4; i++) await virgilPage.locator(CommonMemberPortalLocators.gotItButton).click({ timeout: 3000 });
    } catch (error) {
      console.log("There is no popup 'Got it'");
    }
  }

  public async buyPlanInPartnerPortal(tempEmailFreePage: TempEmailFreePage, purchaseFlow: PurchaseFlow, partnerInfo: Partner): Promise<Page> {
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

  public async createBusiness(PartnerPage: Page, partnerInfo: Partner, owner?: UserInfo) {
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

  public async createNewEmail(tempEmailFreePage: TempEmailFreePage, email: string, pageStatus = false): Promise<Page> {
    const username = email.split("@")[0];

    const page = await tempEmailFreePage.createNewEmail(username, pageStatus);

    return page!;
  }

  public async getHomeTitle(page?: Page) {
    const locator = (page || this.page).getByRole("heading", { level: 2, name: "Home" });
    await locator.waitFor({ state: "visible", timeout: 20000 });
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
}
