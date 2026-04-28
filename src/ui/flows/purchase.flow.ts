import { Page } from "@playwright/test";
import { BuyPlanPage } from "../pages/shared-pages/buy-plan.page";
import { WelcomeModal } from "../pages/shared-pages/welome.modal";
import { TempEmailFreePage } from "../pages/shared-pages/tempemailfree.page";
import { Partner } from "src/objects";
/**
 * This flow class contains methods related to the purchase process, such as buying plans as a customer or partner user, submitting payments, and verifying the correct display of the payment form.
 * Flows:
 * Flow #1: Buy a plan as a customer user
 * Flow #2: Buy a plan as a partner user
 * Flow #3: Submit payment for a subscription
 * Flow #4: Verify correct display of Stripe payment form
 */
export class PurchaseFlow {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Completes the full plan purchase flow: fills payment form and
    * closes the welcome modal if it appears.
   */
  async buyPlanByCustomer(url: string, email: string, planName: string) {

      await new BuyPlanPage(this.page).fillBuyPlanForm(url, email,planName);

      await new WelcomeModal(this.page).closeModalWithOption("readyDiveIn");

  }

  /**
   * Buys a plan as a partner user.
   * @param url
   * @param email
   * @param planName
   * @param partnerPage
   */
  async selectPlanBeforePurchase(url: string, email: string | undefined, planNameOrPage: string | Page): Promise<void> {
    if (typeof planNameOrPage === "string") {
      await new BuyPlanPage(this.page).selectPlan(url, email ?? "", planNameOrPage);
    } else {
      await new BuyPlanPage(planNameOrPage).selectPlan(url, email ?? "", "");
    }
  }

  /*
  async getTripeElements(page: Page) {
    return await new BuyPlanPage(page).getBuyPlanPageElements();
  }
*/
    async submitSubscriptionPayment() {
    await new BuyPlanPage(this.page).fillPaymentFormWithValidCard();
  }

  async verifyStripePaymentFormCorrectDisplay() {
    await new BuyPlanPage(this.page).verifyStripePaymentFormCorrectDisplayed();
  }


  public async buyPlanInPartnerPortal(partnerInfo: Partner){
    //const partnerPage = await this.activateAccountAndSetPassword(tempEmailFreePage, partnerInfo.accountInfo!.email);
    const planName = partnerInfo.partnerInfo!.productsType?.[0] ?? "";
    await this.selectPlanBeforePurchase("", partnerInfo.accountInfo!.email, planName);
    await this.submitSubscriptionPayment();

  }
}
