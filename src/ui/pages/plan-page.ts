import { Page, expect } from "@playwright/test";
import { PlanPageLocators } from "../locators/plan-page-locators";
import { LocatorHandling } from "../../utilities/locator-handling";
import { LoginPage } from "./login-page";

export class PlanPage {
  page: Page;
  loginPage: LoginPage;
  constructor(page: Page) {
    this.page = page;
    this.loginPage = new LoginPage(page);
  }

  /**
   * Validate Login Button Is Hidden
   */
  async buyPlan(
    url: string,
    email: string,
    password: string,
    cardinfo: object
  ): Promise<void> {
    await this.loginPage.loginWithValidAccount(url, email, password);

    // Scrolls the page to the bottom
    await this.page.waitForURL("**/register-success");

    let div_firstPlan = await LocatorHandling.getLocator(
      this.page,
      PlanPageLocators.div_firstPlan
    );
    await div_firstPlan.click();

    let btn_BuyNow = await LocatorHandling.getLocator(
      this.page,
      PlanPageLocators.btn_BuyNow
    );
    await btn_BuyNow.click();

    let btn_Confirm = await LocatorHandling.getLocator(
      this.page,
      PlanPageLocators.btn_Confirm
    );
    await btn_Confirm.click();

    let txt_CardNumb = await LocatorHandling.getLocatorInIframe(
      this.page,
      PlanPageLocators.iframe_Payment,
      PlanPageLocators.txt_CardNumb
    );
    await txt_CardNumb.fill("4242 4242 4242 4242");

    let txt_CardExp = await LocatorHandling.getLocatorInIframe(
      this.page,
      PlanPageLocators.iframe_Payment,
      PlanPageLocators.txt_CardExp
    );
    await txt_CardExp.fill("12/34");

    let txt_CardCvc = await LocatorHandling.getLocatorInIframe(
      this.page,
      PlanPageLocators.iframe_Payment,
      PlanPageLocators.txt_CardCvc
    );
    await txt_CardCvc.fill("123");

    let txt_CardHolderName = await LocatorHandling.getLocatorInIframe(
      this.page,
      PlanPageLocators.iframe_Payment,
      PlanPageLocators.txt_CardHolderName
    );
    await txt_CardHolderName.fill("Test User");

    let txt_billingAddressLine1 = await LocatorHandling.getLocatorInIframe(
      this.page,
      PlanPageLocators.iframe_Payment,
      PlanPageLocators.txt_billingAddressLine1
    );
    await txt_billingAddressLine1.fill("123 Test St");

    let txt_BillingCity = await LocatorHandling.getLocatorInIframe(
      this.page,
      PlanPageLocators.iframe_Payment,
      PlanPageLocators.txt_BillingCity
    );
    await txt_BillingCity.fill("Test City");

    let btn_Subscribe = await LocatorHandling.getLocatorInIframe(
      this.page,
      PlanPageLocators.iframe_Payment,
      PlanPageLocators.btn_Subscribe
    );
    await btn_Subscribe.click();

    let btn_DiveIn = await LocatorHandling.getLocator(
      this.page,
      PlanPageLocators.btn_ReadyDiveIn,
      60000
    );
    await btn_DiveIn.click();

    //await txt_BillingCity.first().waitFor({ state: 'hidden', timeout: 20000 });
    const urlRegex = new RegExp(`.*member-virgilhr-qa.bigin.top/home$`);

    await this.page.waitForURL(urlRegex);
  }
}
