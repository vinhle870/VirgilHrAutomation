import { Page } from "@playwright/test";
import { YopMailPage } from "../pages/shared/yopmail.page";
import { MemberOnboardingPage } from "../pages/member-portal/member-onboarding.page";

export class ShareFlow {
  private readonly yopMailPage: YopMailPage;
  private readonly memberOnboarding: MemberOnboardingPage;
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.yopMailPage = new YopMailPage(page);
    this.memberOnboarding = new MemberOnboardingPage(page);
  }

  async acceptInvitation(email: string, password = "Password@123") {
    const invitationUrl = await this.yopMailPage.getInvitationLink(email);

    await this.page.goto(invitationUrl);
    await this.page.waitForURL(invitationUrl, { timeout: 30000 });

    await this.memberOnboarding.setPasswordAndJoinTeam(password);
  }
}
