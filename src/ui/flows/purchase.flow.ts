import { Page } from "@playwright/test";
import { BuyPlanPage } from "../pages/shared/buy-plan.page";
import { WelcomeModal } from "../pages/shared/welome.modal";

export class PurchaseFlow {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Completes the full plan purchase flow: fills payment form and
   * dismisses the welcome modal. Works for both Partner and Member portals.
   */
  async buyPlan(url: string, email: string, stripePage?: Page) {
    if (!stripePage) {
      await new BuyPlanPage(this.page).fillBuyPlanForm(url, email);

      await new WelcomeModal(this.page).closeModalWithOption("readyDiveIn");
    } else {
      await new BuyPlanPage(stripePage).fillBuyPlanForm(url, email);
    }
  }

  async handbleParrtnerPageToBuyPlan(url: string, email: string, partnerPage: Page) {
    await new BuyPlanPage(partnerPage).handblePartnerPageToBuyPlan(url, email);
  }

  async getTripeElements(partnerPage: Page) {
    return await new BuyPlanPage(partnerPage).getBuyPlanPageElements();
  }
}
