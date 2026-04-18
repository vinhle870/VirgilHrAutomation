import { Locator, Page } from "@playwright/test";
import { TempEmailFreePage } from "../pages/shared/tempemailfree.page";
import { MemberOnboardingPage } from "../pages/member-portal/member-onboarding.page";
import { PurchaseFlow } from "./purchase.flow";
import { CommonPartnerPortalLocator } from "../pages/shared/locators/commonPartnerPortal";
import { BusinessLocator } from "../pages/shared/locators/business";
import { Partner, UserInfo } from "src/objects";
import { MemberOnboardingLocators } from "../pages/member-portal/locators";
import { CommonPortalLocators } from "../Locator/common";

export class OnboardingFlow {
  private readonly page: Page;
  private memberOnboarding: MemberOnboardingPage;
  private credentialPassword: string;

  constructor(page: Page) {
    this.page = page;
    this.memberOnboarding = new MemberOnboardingPage(page);
    this.credentialPassword = "";
  }

  /**
   * Accepts an invitation for the user by retrieving the link from YopMail
   * and completing the onboarding steps.
   */
  async acceptInvitation(tempEmailFreePage: TempEmailFreePage, username: string): Promise<void> {
    const [virgilPage] = await Promise.all([this.page.waitForEvent("popup"), tempEmailFreePage.acceptJoinTeam(username)]);

    await this.page.waitForLoadState("domcontentloaded");

    this.memberOnboarding = new MemberOnboardingPage(virgilPage);

    await this.memberOnboarding.setPasswordAndJoinTeam();

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

    this.memberOnboarding = new MemberOnboardingPage(virgilPage);

    await this.memberOnboarding.loginViaCredentialEmail(credentialEmail, this.credentialPassword, changedPasswordStatus);

    if (portal === "Member" || portal === "Consumer") this.activeMemberPortal(portal, virgilPage);

    return virgilPage;
  }

  private async activeMemberPortal(portal: string, virgilPage: Page) {
    try {
      await virgilPage.locator(MemberOnboardingLocators.readyDiveIn).click({ timeout: 3000 });
    } catch (error) {
      console.log("There is no popup 'I am ready to divin'");
    }

    try {
      for (let i = 0; i < 4; i++) await virgilPage.locator(MemberOnboardingLocators.gotItButton).click({ timeout: 3000 });
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
      await PartnerPage.locator(CommonPartnerPortalLocator.closeButton).click({ timeout: 10000 });
    } catch (error) {
      console.log("There is no closing button");
    }

    try {
      await PartnerPage.locator(CommonPartnerPortalLocator.closeTestModal).first().click({ timeout: 10000 });
    } catch (error) {
      console.log("There is no modal");
    }

    await PartnerPage.locator(CommonPartnerPortalLocator.clientButton).click({ timeout: 10000 });

    await PartnerPage.locator(BusinessLocator.businessTab).click({ timeout: 10000 });

    await PartnerPage.locator(BusinessLocator.addBussinessButton).click({ timeout: 5000 });

    await PartnerPage.locator(BusinessLocator.teamNameInput).fill("Team", { timeout: 5000 });

    if (partnerInfo.partnerInfo?.paymentOption === "Member Portal Consumer") {
      if (!owner) throw new Error("Owner infor is missing");

      const emailOfBusiness = PartnerPage.locator(BusinessLocator.emailInput);
      await emailOfBusiness.fill(owner.email);

      const firstName = PartnerPage.locator(BusinessLocator.firstNameInput);
      await firstName.fill(owner.firstName);

      const lastName = PartnerPage.locator(BusinessLocator.lastNameInput);
      await lastName.fill(owner.lastName);

      const phoneNumber = PartnerPage.locator(BusinessLocator.phoneNumberInput);
      await phoneNumber.fill(owner.phoneNumber);

      const jobTitle = PartnerPage.locator(BusinessLocator.jobTitleInput);
      await jobTitle.fill(owner.jobTitle);
    }

    await PartnerPage.locator(BusinessLocator.firstAddButton).click();

    await PartnerPage.locator(BusinessLocator.seccondAddButton).first().waitFor({ state: "visible", timeout: 20000 });

    await PartnerPage.locator(BusinessLocator.seccondAddButton).first().click();

    await PartnerPage.locator(BusinessLocator.viewButton).waitFor({ state: "visible", timeout: 20000 });

    await PartnerPage.locator(BusinessLocator.viewButton).click();

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

    if (portal === "Member") await page.locator(MemberOnboardingLocators.completedSafely).click({ timeout: 10000 });

    await page.locator(CommonPortalLocators.continueButton).click();
  }
}
