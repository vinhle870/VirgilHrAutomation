import { Page } from "@playwright/test";
import { BasePage } from "../base-page";
import { BuyPlanLocators } from "./locators";
import { CommonPartnerPortalLocator } from "./locators/commonPartnerPortal";
import delay from "src/utilities/delay";

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
  public async handbleParrtnerPageToBuyPlan(url: string, email: string) {
    const logger = (console.debug ?? console.log).bind(console);
    logger(`==================[Plan Purchase] url: ${url}, email: ${email}\n`);

    await this.page.waitForURL("**/register-success", { timeout: 30000 });

    await (await this.getLocator(BuyPlanLocators.firstPlan)).click();

    await (await this.getLocator(BuyPlanLocators.buyNow)).click();

    await (await this.getLocator(BuyPlanLocators.confirm)).click();
  }

  public async fillBuyPlanForm(url: string, email: string): Promise<void> {
    await this.handbleParrtnerPageToBuyPlan(url, email);

    await this.fillBuyPlanFormWithInvalidCard();
  }

  public async getBuyPlanPageElements() {
    const iframe = BuyPlanLocators.paymentIframe;

    const txtCardNumb = await this.getLocatorInIframe(iframe, BuyPlanLocators.cardNumber);
    const txtCardCvc = await this.getLocatorInIframe(iframe, BuyPlanLocators.cardCvc);
    const txtHolder = await this.getLocatorInIframe(iframe, BuyPlanLocators.cardHolderName);
    const txtAddress = await this.getLocatorInIframe(iframe, BuyPlanLocators.billingAddress);
    const txtCity = await this.getLocatorInIframe(iframe, BuyPlanLocators.billingCity);

    return { txtCardNumb, txtCardCvc, txtHolder, txtAddress, txtCity };
  }

  public async fillBuyPlanFormWithInvalidCard(): Promise<void> {
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

    let btnSubscribe;
    try {
      btnSubscribe = await this.getLocatorInIframe(iframe, BuyPlanLocators.subscribe);
      await btnSubscribe.click();

      await (await this.getLocator(CommonPartnerPortalLocator.closeButton)).isVisible();
    } catch (error) {
      btnSubscribe = await this.getLocatorInIframe(iframe, BuyPlanLocators.subscribe);
      await btnSubscribe.click();
    }

    await delay(10000);
  }
}
