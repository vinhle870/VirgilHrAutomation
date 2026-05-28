import { Page } from "playwright/test";
import { CustomerInfo } from "src/objects";
import { MemberPage } from "../..";
import { Console, log } from "console";

export class OnboardingMemberPotalFlow {
  private page: Page;
  private customerPage: MemberPage;

  constructor(page: Page) {
    this.page = page;
    this.customerPage = new MemberPage(this.page);
  }

  public async signUp(customerInfo: CustomerInfo, hrSystem = "Does not apply") {
    await this.page.goto(process.env.MEMBER_PORTAL_BASEURL!);

    await this.page.waitForLoadState("domcontentloaded");

    await this.customerPage.fillFormToSignUp(customerInfo, hrSystem);

    try {
      await this.page.waitForSelector(`text=${customerInfo.accountInfo.email}`, { timeout: 3000 });
    } catch {
      console.error("Duplicated email");
    }
  }
}
