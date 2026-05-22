import { Page } from "playwright/test";
import { PartnerPage } from "../partner-page";
import { Partner, UserInfo } from "src/objects";

export class OnboardingPartnerPotalFlow {
  private page: Page;
  private partnerPage: PartnerPage;

  constructor(page: Page) {
    this.page = page;
    this.partnerPage = new PartnerPage(this.page);
  }

  public async eraseModal() {
    await this.partnerPage.eraseModal();
  }

  public async fillFormToCreateBusiness(partberInfo: Partner, owner?: UserInfo) {
    await this.partnerPage.fillFormToCreateBusiness(partberInfo, owner);
  }
}
