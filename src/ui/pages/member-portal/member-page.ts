import { expect } from "@playwright/test";
import { BasePage } from "../base-page";
import { CommonMemberPortalLocators } from "./locators";
import { CommonPortalLocators } from "src/ui/Locator/common";
import { SettingUserLocators } from "./locators/setting-user";
import { ManageYourTeamLocators } from "./locators/manage-your-team";
import { UserInfo } from "src/objects";
import { OnboardingFlow } from "src/ui/flows/onboarding.flow";
import { TempEmailFreePage } from "../shared";

export class MemberPortalPage extends BasePage {
  async setPasswordAndJoinTeam(password = "Password@123") {
    try {
      const continueBtn = await this.getLocator(CommonMemberPortalLocators.continueWithEmail);

      await continueBtn.click();
    } catch (error) {
      console.error("There is no continue button");
    }

    const passwordInput = await this.getLocator(CommonMemberPortalLocators.setPassword);
    await passwordInput.fill(password);

    const joinTeamBtn = await this.getLocator(CommonMemberPortalLocators.joinTeam);
    await joinTeamBtn.scrollIntoViewIfNeeded();
    await joinTeamBtn.click();

    if (process.env.ENV?.toLowerCase() === "prod") {
      console.log("env:prod");
      const closeBtn = await this.getLocator(CommonMemberPortalLocators.closeGuide);
      await closeBtn.click();
    }

    try {
      const diveInBtn = await this.getLocator(CommonMemberPortalLocators.readyDiveIn, 30000);
      await expect(diveInBtn).toBeVisible({ timeout: 30000 });
      await diveInBtn.click();
    } catch (error) {
      console.log("There is no 'I am diving'");
    }
  }

  async loginViaCredentialEmail(email: string, password = "Password@123", changedPasswordStatus = false) {
    const emailField = this.page.locator(CommonPortalLocators.emailInput);
    await emailField.waitFor({ state: "visible" });
    await emailField.fill(email!);

    const passField = this.page.locator(CommonPortalLocators.passwordInput);
    await passField.fill(password!);

    await this.page.locator(CommonPortalLocators.signInButton).click();

    if (password !== "Password@123" && !changedPasswordStatus) {
      try {
        await this.changePassword(password);
      } catch (error) {
        console.log("Do not need to change password");
      }
    }
  }

  private async changePassword(password: string, portal = "Partner") {
    await this.page.waitForURL(/.*change-password/, { timeout: 10000 });

    await (await this.getLocator(CommonPortalLocators.currentPasswordInput)).fill(password);

    await (await this.getLocator(CommonPortalLocators.newPassword)).fill("Password@123");

    await (await this.getLocator(CommonPortalLocators.continueButton)).click();

    if (portal === "Member") await (await this.getLocator(CommonMemberPortalLocators.completedSafely)).click({ timeout: 10000 });

    await (await this.getLocator(CommonPortalLocators.continueButton)).click();
  }

  public async moveToOrganizationTab(page = this.page): Promise<void> {
    await page.locator(SettingUserLocators.organizationTab).click();
  }

  public async moveToManageYourteamPage(page = this.page): Promise<void> {
    await page.locator(SettingUserLocators.manageYourTeam).click();
  }

  public async inviteMoreMembers(invitedAccount: UserInfo[], page = this.page, onboardingFlow: OnboardingFlow, tempEmailFreePage: TempEmailFreePage): Promise<void> {
    await this.moveToManageYourteamPage(page);

    this.inviteMembersByEmail(page, invitedAccount, onboardingFlow, tempEmailFreePage);
  }
}
