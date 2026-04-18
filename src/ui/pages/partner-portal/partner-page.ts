import { Page } from "playwright/test";
import { BasePage } from "../base-page";
import { MemberOnboardingLocators } from "../member-portal/locators";
import { LoginPartnerPortalLocators } from "./locators/login";

export class PartnerPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  public async login(email: string, password = "Password@123") {
    await this.page.goto("https://partner.qa.virgilhr.com/auth/login");

    await this.page.waitForLoadState("domcontentloaded");

    await this.page.locator(MemberOnboardingLocators.emailInput).fill(email);
    await this.page.locator(MemberOnboardingLocators.passwordInput).fill(password);
    await this.page.locator(MemberOnboardingLocators.signInButton).click();
  }

  public getAccountNotExist() {
    return this.page.locator(LoginPartnerPortalLocators.accountNotExist);
  }
}
