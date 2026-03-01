import { Page } from "@playwright/test";
import { BasePage } from "../base-page";
import { AdminPlanLocators } from "./locators";
import { AdminLoginPage } from "./admin-login.page";

export class AdminPlanPage extends BasePage {
  private loginPage: AdminLoginPage;

  constructor(page: Page) {
    super(page);
    this.loginPage = new AdminLoginPage(page);
  }

  async buyPlan(
    url: string,
    email: string,
    password: string,
    cardinfo: object,
  ): Promise<void> {
    await this.loginPage.loginWithValidAccount(url, email, password);
    await this.page.waitForURL("**/register-success");

    const divFirstPlan = await this.getLocator(AdminPlanLocators.firstPlan);
    await divFirstPlan.click();

    const btnBuyNow = await this.getLocator(AdminPlanLocators.buyNow);
    await btnBuyNow.click();

    const btnConfirm = await this.getLocator(AdminPlanLocators.confirm);
    await btnConfirm.click();

    const iframe = AdminPlanLocators.paymentIframe;

    const txtCardNumb = await this.getLocatorInIframe(iframe, AdminPlanLocators.cardNumber);
    await txtCardNumb.fill("4242 4242 4242 4242");

    const txtCardExp = await this.getLocatorInIframe(iframe, AdminPlanLocators.cardExpiry);
    await txtCardExp.fill("12/34");

    const txtCardCvc = await this.getLocatorInIframe(iframe, AdminPlanLocators.cardCvc);
    await txtCardCvc.fill("123");

    const txtHolder = await this.getLocatorInIframe(iframe, AdminPlanLocators.cardHolderName);
    await txtHolder.fill("Test User");

    const txtAddress = await this.getLocatorInIframe(iframe, AdminPlanLocators.billingAddress);
    await txtAddress.fill("123 Test St");

    const txtCity = await this.getLocatorInIframe(iframe, AdminPlanLocators.billingCity);
    await txtCity.fill("Test City");

    const btnSubscribe = await this.getLocatorInIframe(iframe, AdminPlanLocators.subscribe);
    await btnSubscribe.click();

    const btnDiveIn = await this.getLocator(AdminPlanLocators.readyDiveIn, 60000);
    await btnDiveIn.click();

    const urlRegex = new RegExp(`.*-virgilhr-qa.bigin.top/home$`);
    await this.page.waitForURL(urlRegex);
  }
}
