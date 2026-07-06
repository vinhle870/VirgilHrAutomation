import { expect, Page } from "playwright/test";
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

    const targetUrl = url ?? process.env.MEMBER_PORTAL_BASEURL! + "auth/login";

    await expect(async () => {
      await this.page.goto(targetUrl,{ waitUntil: "load" });

      expect(this.page.url()).toBe(targetUrl);
    }).toPass();

    await this.customerPage.fillFormToSignUp(customerInfo, hrSystem);

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
