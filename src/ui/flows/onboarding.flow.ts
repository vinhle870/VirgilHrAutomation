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
  async acceptInvitation(
    tempEmailFreePage: TempEmailFreePage,
    username: string,
    password = "Password@123",
  ) {
    const [newPage] = await Promise.all([
      this.page.waitForEvent("popup"),
      tempEmailFreePage.acceptJoinTeam(username),
    ]);

    await this.page.waitForLoadState("domcontentloaded");

    this.memberOnboarding = new MemberOnboardingPage(newPage);

    await this.memberOnboarding.setPasswordAndJoinTeam(password);

    await newPage.close();
  }

  public async credential(
    tempEmailFreePage: TempEmailFreePage,
    emailOfPartner: string,
    isClose = false,
    portal = "Partner",
  ) {
    const localPart = emailOfPartner.split("@")[0];

    let credentialEmail;
    let credentialPassword;
    let credentialNewPage;

    if (portal === "Partner") {
      const { email, password, newPage } = await tempEmailFreePage.credential(
        localPart!,
      );
      credentialEmail = email;
      credentialPassword = password;
      credentialNewPage = newPage;
    } else {
      const { email, password, newPage } = await tempEmailFreePage.credential(
        localPart!,
        "Member",
      );
      credentialEmail = email;
      credentialPassword = password;
      credentialNewPage = newPage;
    }

    await credentialNewPage.waitForLoadState("domcontentloaded");

    this.memberOnboarding = new MemberOnboardingPage(credentialNewPage);

    await this.memberOnboarding.loginViaCredentialEmail(
      credentialEmail,
      credentialPassword,
    );

    if (portal === "Member") {
      try {
        await credentialNewPage
          .locator(MemberOnboardingLocators.readyDiveIn)
          .click({ timeout: 3000 });
      } catch (error) {
        console.log("There is no popup 'I am ready to divin'");
      }

      try {
        for (let i = 0; i < 4; i++)
          await credentialNewPage
            .locator(MemberOnboardingLocators.gotItButton)
            .click({ timeout: 3000 });
      } catch (error) {
        console.log("There is no popup 'Got it'");
      }
    }

    if (!isClose) await credentialNewPage.close();
    else return credentialNewPage;
  }

  public async buyPlanInPartnerPortal(
    tempEmailFreePage: TempEmailFreePage,
    purchaseFlow: PurchaseFlow,
    partnerInfo: Partner,
    isClose = false,
  ) {
    if (partnerInfo.partnerInfo?.bankTransfer === true)
      throw new Error("Making payment is done in admin portal");

    if (partnerInfo.partnerInfo?.paymentOption !== "Partner/Consultant Owner")
      throw new Error("Payment option must be Partner/Consultant Owner");

    const newPage = await this.credential(
      tempEmailFreePage,
      partnerInfo.accountInfo?.email!,
      true,
    );

    try {
      await purchaseFlow.buyPlan("", partnerInfo.accountInfo!.email, newPage);
    } catch (error) {
      console.log("Already bought a plan");
    }

    if (!isClose) await newPage.close();
    else return newPage;
  }

  public async createBusiness(
    newPage: Page,
    partnerInfo: Partner,
    owner?: UserInfo,
  ) {
    if (
      partnerInfo.partnerInfo?.paymentOption !== "Member Portal Consumer" &&
      partnerInfo.partnerInfo?.paymentOption !== "Partner/Consultant Owner"
    )
      throw new Error(
        "Payment option must be Member Portal Consumer or Partner/Consultant Owner",
      );

    try {
      await newPage
        .locator(CommonPartnerPortalLocator.closeButton)
        .waitFor({ state: "visible", timeout: 30000 });

      await delay(3000);

      await newPage.locator(CommonPartnerPortalLocator.closeButton).click();
    } catch (error) {
      console.log("There is no closing button");
    }

    try {
      await newPage
        .locator(CommonPartnerPortalLocator.closeTestModal)
        .first()
        .waitFor({ state: "visible", timeout: 30000 });

      await delay(3000);

      await newPage
        .locator(CommonPartnerPortalLocator.closeTestModal)
        .first()
        .click();
    } catch (error) {
      console.log("There is no modal");
    }

    await newPage
      .locator(CommonPartnerPortalLocator.clientButton)
      .waitFor({ state: "visible", timeout: 30000 });
    await newPage.locator(CommonPartnerPortalLocator.clientButton).click();

    await newPage
      .locator(BusinessLocator.businessTab)
      .waitFor({ state: "visible", timeout: 30000 });

    await newPage.locator(BusinessLocator.businessTab).click();

    await newPage
      .locator(BusinessLocator.addBussinessButton)
      .waitFor({ state: "visible", timeout: 30000 });

    await newPage.locator(BusinessLocator.addBussinessButton).click();

    await newPage
      .locator(BusinessLocator.teamNameInput)
      .waitFor({ state: "visible", timeout: 30000 });

    await newPage.locator(BusinessLocator.teamNameInput).fill("Team");

    if (partnerInfo.partnerInfo?.paymentOption === "Member Portal Consumer") {
      if (!owner) throw new Error("Owner infor is missing");

      const emailOfBusiness = newPage.locator(BusinessLocator.emailInput);
      await emailOfBusiness.waitFor({ state: "visible", timeout: 30000 });
      await emailOfBusiness.fill(owner.email);

      const firstName = newPage.locator(BusinessLocator.firstNameInput);
      await firstName.waitFor({ state: "visible", timeout: 30000 });
      await firstName.fill(owner.firstName);

      const lastName = newPage.locator(BusinessLocator.lastNameInput);
      await lastName.waitFor({ state: "visible", timeout: 30000 });
      await lastName.fill(owner.lastName);

      const phoneNumber = newPage.locator(BusinessLocator.phoneNumberInput);
      await phoneNumber.waitFor({ state: "visible", timeout: 30000 });
      await phoneNumber.fill(owner.phoneNumber);

      const jobTitle = newPage.locator(BusinessLocator.jobTitleInput);
      await jobTitle.waitFor({ state: "visible", timeout: 30000 });
      await jobTitle.fill(owner.jobTitle);
    }

    await newPage.locator(BusinessLocator.firstAddButton).click();

    await newPage
      .locator(BusinessLocator.seccondAddButton)
      .first()
      .waitFor({ state: "visible", timeout: 30000 });

    await newPage.locator(BusinessLocator.seccondAddButton).first().click();

    await newPage
      .locator(BusinessLocator.viewButton)
      .waitFor({ state: "visible", timeout: 30000 });

    await newPage.locator(BusinessLocator.viewButton).click();

    await newPage
      .locator(BusinessLocator.ownerText)
      .waitFor({ state: "visible", timeout: 30000 });

    return newPage.locator(BusinessLocator.ownerText);
  }

  async getBenifits(email: string): Promise<any> {
    this.memberOnboarding = new MemberOnboardingPage(this.page);

    const localPart = email.split("@")[0];

    await this.page.goto(`https://${localPart}.member.qa.virgilhr.com/`);

    return await this.memberOnboarding.getBenifits(email);
  }
}
