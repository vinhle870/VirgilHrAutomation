import { Page } from "@playwright/test";
import { TempEmailFreePage } from "../pages/shared/tempemailfree.page";
import { MemberOnboardingPage } from "../pages/member-portal/member-onboarding.page";
import { PurchaseFlow } from "./purchase.flow";
import { CommonPartnerPortalLocator } from "../pages/shared/locators/commonPartnerPortal";
import { BusinessLocator } from "../pages/shared/locators/business";
import { Partner, UserInfo } from "src/objects";
import delay from "src/utilities/delay";
import { MemberOnboardingLocators } from "../pages/member-portal/locators";

export class OnboardingFlow {
  private readonly page: Page;
  private memberOnboarding: MemberOnboardingPage;

  constructor(page: Page) {
    this.page = page;
    this.memberOnboarding = new MemberOnboardingPage(page);
  }

  /**
   * Accepts an invitation for the user by retrieving the link from YopMail
   * and completing the onboarding steps.
   */
  async acceptInvitation(tempEmailFreePage: TempEmailFreePage, username: string) {
    const [virgilPage] = await Promise.all([this.page.waitForEvent("popup"), tempEmailFreePage.acceptJoinTeam(username)]);

    await this.page.waitForLoadState("domcontentloaded");

    this.memberOnboarding = new MemberOnboardingPage(virgilPage);

    await this.memberOnboarding.setPasswordAndJoinTeam();

    await virgilPage.close();
  }

  public async credential(tempEmailFreePage: TempEmailFreePage, emailOfPartner: string, isClose = false, portal = "Partner") {
    const localPart = emailOfPartner.split("@")[0];

    let credentialEmail;
    let credentialPassword;
    let virgilPage;

    if (portal === "Partner") {
      const { email, password, tempEmailPage } = await tempEmailFreePage.credential(localPart!);
      credentialEmail = email;
      credentialPassword = password;
      virgilPage = tempEmailPage;
    } else {
      const { email, password, tempEmailPage } = await tempEmailFreePage.credential(localPart!, "Member");
      credentialEmail = email;
      credentialPassword = password;
      virgilPage = tempEmailPage;
    }

    await virgilPage.waitForLoadState("domcontentloaded");

    this.memberOnboarding = new MemberOnboardingPage(virgilPage);

    await this.memberOnboarding.loginViaCredentialEmail(credentialEmail, credentialPassword);

    if (portal === "Member") {
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

    if (!isClose) await virgilPage.close();
    else return virgilPage;
  }

  public async buyPlanInPartnerPortal(tempEmailFreePage: TempEmailFreePage, purchaseFlow: PurchaseFlow, partnerInfo: Partner, isClose = false) {
    if (partnerInfo.partnerInfo?.bankTransfer === true) throw new Error("Making payment is done in admin portal");

    if (partnerInfo.partnerInfo?.paymentOption !== "Partner/Consultant Owner") throw new Error("Payment option must be Partner/Consultant Owner");

    const tempEmailPage = await this.credential(tempEmailFreePage, partnerInfo.accountInfo?.email!, true);

    try {
      await purchaseFlow.buyPlan("", partnerInfo.accountInfo!.email, tempEmailPage);
    } catch (error) {
      console.log("Already bought a plan");
    }

    if (!isClose) await tempEmailPage.close();
    else return tempEmailPage;
  }

  public async createBusiness(PartnerPage: Page, partnerInfo: Partner, owner?: UserInfo) {
    if (partnerInfo.partnerInfo?.paymentOption !== "Member Portal Consumer" && partnerInfo.partnerInfo?.paymentOption !== "Partner/Consultant Owner")
      throw new Error("Payment option must be Member Portal Consumer or Partner/Consultant Owner");

    try {
      await PartnerPage.locator(CommonPartnerPortalLocator.closeButton).waitFor({ state: "visible", timeout: 30000 });

      await delay(3000);

      await PartnerPage.locator(CommonPartnerPortalLocator.closeButton).click();
    } catch (error) {
      console.log("There is no closing button");
    }

    try {
      await PartnerPage.locator(CommonPartnerPortalLocator.closeTestModal).first().waitFor({ state: "visible", timeout: 30000 });

      await delay(3000);

      await PartnerPage.locator(CommonPartnerPortalLocator.closeTestModal).first().click();
    } catch (error) {
      console.log("There is no modal");
    }

    await PartnerPage.locator(CommonPartnerPortalLocator.clientButton).waitFor({ state: "visible", timeout: 30000 });
    await PartnerPage.locator(CommonPartnerPortalLocator.clientButton).click();

    await PartnerPage.locator(BusinessLocator.businessTab).waitFor({ state: "visible", timeout: 30000 });

    await PartnerPage.locator(BusinessLocator.businessTab).click();

    await PartnerPage.locator(BusinessLocator.addBussinessButton).waitFor({ state: "visible", timeout: 30000 });

    await PartnerPage.locator(BusinessLocator.addBussinessButton).click();

    await PartnerPage.locator(BusinessLocator.teamNameInput).waitFor({ state: "visible", timeout: 30000 });

    await PartnerPage.locator(BusinessLocator.teamNameInput).fill("Team");

    if (partnerInfo.partnerInfo?.paymentOption === "Member Portal Consumer") {
      if (!owner) throw new Error("Owner infor is missing");

      const emailOfBusiness = PartnerPage.locator(BusinessLocator.emailInput);
      await emailOfBusiness.waitFor({ state: "visible", timeout: 30000 });
      await emailOfBusiness.fill(owner.email);

      const firstName = PartnerPage.locator(BusinessLocator.firstNameInput);
      await firstName.waitFor({ state: "visible", timeout: 30000 });
      await firstName.fill(owner.firstName);

      const lastName = PartnerPage.locator(BusinessLocator.lastNameInput);
      await lastName.waitFor({ state: "visible", timeout: 30000 });
      await lastName.fill(owner.lastName);

      const phoneNumber = PartnerPage.locator(BusinessLocator.phoneNumberInput);
      await phoneNumber.waitFor({ state: "visible", timeout: 30000 });
      await phoneNumber.fill(owner.phoneNumber);

      const jobTitle = PartnerPage.locator(BusinessLocator.jobTitleInput);
      await jobTitle.waitFor({ state: "visible", timeout: 30000 });
      await jobTitle.fill(owner.jobTitle);
    }

    await PartnerPage.locator(BusinessLocator.firstAddButton).click();

    await PartnerPage.locator(BusinessLocator.seccondAddButton).first().waitFor({ state: "visible", timeout: 30000 });

    await PartnerPage.locator(BusinessLocator.seccondAddButton).first().click();

    await PartnerPage.locator(BusinessLocator.viewButton).waitFor({ state: "visible", timeout: 30000 });

    await PartnerPage.locator(BusinessLocator.viewButton).click();

    await PartnerPage.locator(BusinessLocator.ownerText).waitFor({ state: "visible", timeout: 30000 });

    return PartnerPage.locator(BusinessLocator.ownerText);
  }

  async getBenifits(email: string): Promise<any> {
    this.memberOnboarding = new MemberOnboardingPage(this.page);

    const localPart = email.split("@")[0];

    await this.page.goto(`https://${localPart}.member.qa.virgilhr.com/`);

    return await this.memberOnboarding.getBenifits(email);
  }

  public async createNewEmail(tempEmailFreePage: TempEmailFreePage, email: string, pageStatus = false): Promise<Page> {
    const username = email.split("@")[0];

    const page = await tempEmailFreePage.createNewEmail(username, pageStatus);

    return page!;
  }
}
