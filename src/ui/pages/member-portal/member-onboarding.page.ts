import { expect } from "@playwright/test";
import { BasePage } from "../base-page";
import { MemberOnboardingLocators } from "./locators";

export class MemberOnboardingPage extends BasePage {
  async setPasswordAndJoinTeam(password: string) {
    const continueBtn = await this.getLocator(
      MemberOnboardingLocators.continueWithEmail,
    );
    await continueBtn.click();

    const passwordInput = await this.getLocator(
      MemberOnboardingLocators.setPassword,
    );
    await passwordInput.fill(password);

    const joinTeamBtn = await this.getLocator(
      MemberOnboardingLocators.joinTeam,
    );
    await joinTeamBtn.scrollIntoViewIfNeeded();
    await joinTeamBtn.click();

    if (process.env.ENV?.toLowerCase() === "prod") {
      console.log("env:prod");
      const closeBtn = await this.getLocator(
        MemberOnboardingLocators.closeGuide,
      );
      await closeBtn.click();
    }

    const diveInBtn = await this.getLocator(
      MemberOnboardingLocators.readyDiveIn,
      30000,
    );
    await expect(diveInBtn).toBeVisible({ timeout: 30000 });
    await diveInBtn.click();
  }
}
