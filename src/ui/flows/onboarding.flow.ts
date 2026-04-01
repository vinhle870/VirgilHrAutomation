import { Page } from "@playwright/test";
import { TempEmailFreePage } from "../pages/shared/tempemailfree.page";
import { MemberOnboardingPage } from "../pages/member-portal/member-onboarding.page";
import { PurchaseFlow } from "./purchase.flow";
import { CommonPartnerPortalLocator } from "../pages/shared/locators/commonPartnerPortal";
import { BusinessLocator } from "../pages/shared/locators/business";

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
    username: string,
    isClose = false,
  ) {
    const { email, password, newPage } =
      await tempEmailFreePage.credential(username);

    await newPage.waitForLoadState("domcontentloaded");

    this.memberOnboarding = new MemberOnboardingPage(newPage);

    await this.memberOnboarding.loginViaCredentialEmail(email, password);

    if (!isClose) await newPage.close();

    return newPage;
  }

  public async buyPlanInPartnerPortal(
    tempEmailFreePage: TempEmailFreePage,
    purchaseFlow: PurchaseFlow,
    email: string,
    isClose = false,
    password = "Password@123",
  ) {
    const localPart = email?.split("@")[0];

    const newPage = await this.credential(tempEmailFreePage, localPart, true);

    await purchaseFlow.buyPlan("", email, password, {}, newPage);

    if (!isClose) await newPage.close();
    else return newPage;
  }

  public async createBusiness(newPage: Page) {
    await newPage
      .locator(CommonPartnerPortalLocator.closeButton)
      .waitFor({ state: "visible", timeout: 30000 });
    await newPage.locator(CommonPartnerPortalLocator.closeButton).click();

    await newPage
      .locator(CommonPartnerPortalLocator.closeTestModal)
      .first()
      .waitFor({ state: "visible", timeout: 30000 });
    await newPage
      .locator(CommonPartnerPortalLocator.closeTestModal)
      .first()
      .click();

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
}
