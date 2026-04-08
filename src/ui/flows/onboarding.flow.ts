import { Page } from "@playwright/test";
import { TempEmailFreePage } from "../pages/shared/tempemailfree.page";
import { MemberOnboardingPage } from "../pages/member-portal/member-onboarding.page";

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

  async credential(tempEmailFreePage: TempEmailFreePage, username: string) {
    const { email, password, newPage } =
      await tempEmailFreePage.credential(username);

    await newPage.waitForLoadState("domcontentloaded");

    this.memberOnboarding = new MemberOnboardingPage(newPage);

    await this.memberOnboarding.loginViaCredentialEmail(email, password);

    await newPage.close();
  }
}
