import { Page } from "@playwright/test";
import { TempEmailFreePage } from "../pages/shared/tempemailfree.page";
import { MemberOnboardingPage } from "../pages/member-portal/member-onboarding.page";

export class OnboardingFlow {
  private readonly page: Page;
  private readonly tempEmailFreePage: TempEmailFreePage;
  private readonly memberOnboarding: MemberOnboardingPage;

  constructor(page: Page) {
    this.page = page;
    this.tempEmailFreePage = new TempEmailFreePage(page);
    this.memberOnboarding = new MemberOnboardingPage(page);
  }

  /**
   * Accepts an invitation for the user by retrieving the link from YopMail
   * and completing the onboarding steps.
   */
  async acceptInvitation(password = "Password@123") {
    await this.tempEmailFreePage.moveToRegisterPage();

    const invitationUrl =
      /https:\/\/member-[^\/]+\/auth\/register\?email=([^&]+)&teamid=([^&]+)&invitetoken=([^&]+)/;

    await this.page.waitForURL(invitationUrl, { timeout: 30000 });

    await this.memberOnboarding.setPasswordAndJoinTeam(password);
  }
}
