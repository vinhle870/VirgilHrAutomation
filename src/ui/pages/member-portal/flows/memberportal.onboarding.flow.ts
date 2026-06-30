import { Page } from "playwright/test";
import { CustomerInfo } from "src/objects";
import { MemberPage } from "../..";

export class OnboardingMemberPortalFlow {
  private page: Page;
  private customerPage: MemberPage;

  constructor(page: Page) {
    this.page = page;
    this.customerPage = new MemberPage(this.page);
  }

  public signUp = async (customerInfo: CustomerInfo, hrSystem = "Does not apply", url?: string) => {
    await this.page.goto(url ?? process.env.MEMBER_PORTAL_BASEURL! + "auth/login");

    await this.page.waitForLoadState("domcontentloaded");

    await this.customerPage.fillFormToSignUp(customerInfo, hrSystem);

    try {
      await this.page.waitForSelector(`text=${customerInfo.accountInfo.email}`, { timeout: 3000 });
    } catch {
      console.error("Duplicated email");
    }
  };

  public fillDuplicatedEmailToSignUp = async (customerInfo: CustomerInfo) => {
    await this.page.goto(process.env.MEMBER_PORTAL_BASEURL!);

    await this.page.waitForLoadState("domcontentloaded");

    await this.customerPage.fillInputOfTheFirstModalToSignUp(customerInfo);
  };

  public veriryFillingFormIsRequired = async (customerInfo: CustomerInfo) => {
    await this.page.goto(process.env.MEMBER_PORTAL_BASEURL!);

    await this.page.waitForLoadState("domcontentloaded");

    await this.customerPage.veriryFillingFormIsRequired(customerInfo);
  };
}
