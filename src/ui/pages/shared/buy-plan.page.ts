import { Page } from "@playwright/test";
import { BasePage } from "../base-page";
import { BuyPlanLocators  } from "./locators";


export class BuyPlanPage extends BasePage {

  constructor(page: Page) {
    super(page);

  }

  /**
   * Fills the buy plan form with the provided URL, email, password, and card information.
   * @param url: string
   * @param email: string
   * @param password: string
   * @param cardinfo: object
   */
  async fillBuyPlanForm(
    url: string,
    email: string,
    password: string,
    cardinfo: object,
  ): Promise<void> {
    const logger = (console.debug ?? console.log).bind(console);
    logger(`==================[Plan Purchase] url: ${url}, email: ${email}\n`);
    await this.page.waitForURL("**/register-success");

    const divFirstPlan = await this.getLocator(BuyPlanLocators.firstPlan);
    await divFirstPlan.click();

    const btnBuyNow = await this.getLocator(BuyPlanLocators.buyNow);
    await btnBuyNow.click();

    const btnConfirm = await this.getLocator(BuyPlanLocators.confirm);
    await btnConfirm.click();

    const iframe = BuyPlanLocators.paymentIframe;

    const txtCardNumb = await this.getLocatorInIframe(iframe, BuyPlanLocators.cardNumber);
    await txtCardNumb.fill("4242 4242 4242 4242");

    const txtCardExp = await this.getLocatorInIframe(iframe, BuyPlanLocators.cardExpiry);
    await txtCardExp.fill("12/34");

    const txtCardCvc = await this.getLocatorInIframe(iframe, BuyPlanLocators.cardCvc);
    await txtCardCvc.fill("123");

    const txtHolder = await this.getLocatorInIframe(iframe, BuyPlanLocators.cardHolderName);
    await txtHolder.fill("Test User");

    const txtAddress = await this.getLocatorInIframe(iframe, BuyPlanLocators.billingAddress);
    await txtAddress.fill("123 Test St");

    const txtCity = await this.getLocatorInIframe(iframe, BuyPlanLocators.billingCity);
    await txtCity.fill("Test City");

    const btnSubscribe = await this.getLocatorInIframe(iframe, BuyPlanLocators.subscribe);
    await btnSubscribe.click();

  }
}
