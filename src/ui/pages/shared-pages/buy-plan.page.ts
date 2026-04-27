import { expect, Page } from "@playwright/test";
import { BasePage } from "../base-page";
import { BuyPlanLocators } from "./locators";
import { CommonPartnerPortalLocator } from "../partner-portal/locators/common";
import delay from "src/utilities/delay";

export class BuyPlanPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  public async selectPlan(url: string, email: string, planName: string): Promise<void> {
    const logger = (console.debug ?? console.log).bind(console);
    logger(`==================[Plan Purchase] url: ${url}, email: ${email}\n`);

    try {
      await this.page.waitForURL("**/register-success", { timeout: 30000 });

      const selectedPlanLocator = BuyPlanLocators.firstPlan.replace("plan_name", planName);
      await (await this.getLocator(selectedPlanLocator)).click();
      await (await this.getLocator(BuyPlanLocators.buyNow)).click();
      await (await this.getLocator(BuyPlanLocators.confirm)).click();
    } catch (error) {
      throw new Error(`[selectPlan] Failed for plan "${planName}" (url: "${url}")\n${error}`);
    }
  }

  public async fillBuyPlanForm(url: string, email: string, planName: string): Promise<void> {
    await this.selectPlan(url, email, planName);
    await this.fillPaymentFormWithValidCard();
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

  public async fillPaymentFormWithValidCard(): Promise<void> {
    const iframe = BuyPlanLocators.paymentIframe;

    try {
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
      //await (await this.getLocator(CommonPartnerPortalLocator.closeButton)).isVisible();
    } catch (error) {
      throw new Error(`[fillPaymentFormWithValidCard] A form field or button was not found or timed out.\n${error}`);
    }

    await delay(10000);
  }
  //---------------Verification Methods-----------------
  public async verifyStripePaymentFormCorrectDisplayed(): Promise<void> {

    const iframe = BuyPlanLocators.paymentIframe;

    const txtCardNumb = await this.getLocatorInIframe(iframe, BuyPlanLocators.cardNumber);
    const txtCardCvc = await this.getLocatorInIframe(iframe, BuyPlanLocators.cardCvc);
    const txtHolder = await this.getLocatorInIframe(iframe, BuyPlanLocators.cardHolderName);
    const txtAddress = await this.getLocatorInIframe(iframe, BuyPlanLocators.billingAddress);
    const txtCity = await this.getLocatorInIframe(iframe, BuyPlanLocators.billingCity);

    await expect(txtCardNumb).toBeVisible();
    await expect(txtCardCvc).toBeVisible();
    await expect(txtHolder).toBeVisible();
    await expect(txtAddress).toBeVisible();
    await expect(txtCity).toBeVisible();

  }

}
