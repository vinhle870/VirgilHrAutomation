import { expect } from "@playwright/test";
import { BasePage } from "../base-page";
import { CommonMemberPortalLocators } from "./locators";
import { CommonPortalLocators } from "src/ui/Locator/common";
import { SettingUserLocators } from "./locators/setting-user";
import { UserInfo } from "src/objects";
import { MemberAdditionLocator } from "../admin-portal/locators/customer-management/member-addition";
import { time } from "console";

export class MemberPortalPage extends BasePage {
  async setPasswordAndJoinTeam(page = this.page, password = "Password@123") {
    try {
      await page.locator(CommonMemberPortalLocators.continueWithEmail).click();
    } catch (error) {
      console.error("There is no continue button");
    }

    await page.locator(CommonMemberPortalLocators.setPassword).fill(password);

    await page.locator(CommonMemberPortalLocators.joinTeam).scrollIntoViewIfNeeded();
    await page.locator(CommonMemberPortalLocators.joinTeam).click();

    try {
      await page.locator(CommonMemberPortalLocators.readyDiveIn).click({ timeout: 30000 });
    } catch (error) {
      console.log("There is no 'I am diving'");
    }
  }

  async loginViaCredentialEmail(email: string, password = "Password@123", changedPasswordStatus = false) {
    const emailField = this.page.locator(CommonPortalLocators.emailInputTologin);
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

  public async inviteMembers(invitedAccounts: UserInfo[], page = this.page): Promise<void> {
    await page.locator(SettingUserLocators.organizationTab).click();

    await this.moveToManageYourteamPage(page);

    await page.locator(MemberAdditionLocator.inviteMoreButton).click();

    this.inviteMembersByEmail(invitedAccounts, page);
  }

  public async closeModalsToInviteMembers(page = this.page, timeout = 5000): Promise<void> {
    try {
      await page.locator(CommonMemberPortalLocators.setUpLater).click({ timeout });
    } catch (error) {
      console.log("There is no set up Modal");
    }

    try {
      await page.locator(CommonMemberPortalLocators.readyDiveIn).click({ timeout });
    } catch (error) {
      console.log("There is no ready to dive in button");
    }

    try {
      await page.locator(CommonMemberPortalLocators.gotItButton).click({ timeout });
    } catch (error) {
      console.log("There is no got it button");
    }

    try {
      await page.locator(CommonPortalLocators.popupClosingButton).click({ timeout });
    } catch (error) {
      console.log("There is no popup closing button");
    }
  }
}
