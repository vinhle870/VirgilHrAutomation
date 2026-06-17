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

  public eraseModal = async () => await this.partnerPage.eraseModal();

  public fillFormToCreateBusiness = async (partberInfo: Partner, owner?: UserInfo) => await this.partnerPage.fillFormToCreateBusiness(partberInfo, owner);

  public validateOwnerRoleInUserPage = async (partnerInfo: Partner) => await this.partnerPage.validateOwnerRoleInUserPage(partnerInfo.accountInfo!.email!);

  public validatePlanVisible = async () => await this.partnerPage.validatePlanVisible();

  public validateAccountNotExist = async () => await this.partnerPage.validateAccountNotExist();
}
