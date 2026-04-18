import { expect, Locator } from "@playwright/test";
import { BasePage } from "../base-page";
import { MemberOnboardingLocators } from "./locators";

export class MemberOnboardingPage extends BasePage {
  async setPasswordAndJoinTeam(password = "Password@123") {
    try {
      const continueBtn = await this.getLocator(MemberOnboardingLocators.continueWithEmail);

      await continueBtn.click();
    } catch (error) {
      console.error("There is no continue button");
    }

    const passwordInput = await this.getLocator(MemberOnboardingLocators.setPassword);
    await passwordInput.fill(password);

    const joinTeamBtn = await this.getLocator(MemberOnboardingLocators.joinTeam);
    await joinTeamBtn.scrollIntoViewIfNeeded();
    await joinTeamBtn.click();

    if (process.env.ENV?.toLowerCase() === "prod") {
      console.log("env:prod");
      const closeBtn = await this.getLocator(MemberOnboardingLocators.closeGuide);
      await closeBtn.click();
    }

    try {
      const diveInBtn = await this.getLocator(MemberOnboardingLocators.readyDiveIn, 30000);
      await expect(diveInBtn).toBeVisible({ timeout: 30000 });
      await diveInBtn.click();
    } catch (error) {
      console.log("There is no 'I am diving'");
    }
  }

  async loginViaCredentialEmail(email: string, password = "Password@123") {
    const emailField = this.page.locator(MemberOnboardingLocators.emailInput);
    await emailField.waitFor({ state: "visible" });
    await emailField.fill(email!);

    const passField = this.page.locator(MemberOnboardingLocators.passwordInput);
    await passField.fill(password!);

    const signInBtn = this.page.locator(MemberOnboardingLocators.signInButton);

    await signInBtn.click();

    if (password !== "Password@123")
      try {
        await this.page.waitForURL(/.*change-password/, { timeout: 10000 });

        await (await this.getLocator(MemberOnboardingLocators.currentPasswordInput)).fill(password);

        await (await this.getLocator(MemberOnboardingLocators.newPassword)).fill("Password@123");

        await (await this.getLocator(MemberOnboardingLocators.continueButton)).click();

        await (await this.getLocator(MemberOnboardingLocators.completedSafely)).isVisible();

        await (await this.getLocator(MemberOnboardingLocators.continueButton)).click();
      } catch (error) {
        console.log("Do not need to change password");
      }
  }
}
