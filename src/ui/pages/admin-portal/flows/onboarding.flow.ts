import { Page } from "playwright/test";
import { PartnerManagementPage } from "../partner-management-page";
import { Partner, UserInfo } from "src/objects";
import { PeoPartner } from "src/objects/ipeopartner";
import { CustomerManagementPage } from "../customer-management-page";

export class OnboardingAdminPortalFlow {
  private readonly page: Page;
  private readonly partnerManagementPage: PartnerManagementPage;
  private readonly customerManagementPage: CustomerManagementPage;

  constructor(page: Page) {
    this.page = page;
    this.partnerManagementPage = new PartnerManagementPage(this.page);
    this.customerManagementPage = new CustomerManagementPage(this.page);
  }

  public async accessToPartnerManagementPage(category = "Partner", i = 0) {
    await this.partnerManagementPage.accessToManagementPage(category, i);
  }

  public async createPartner(partnerInfo: Partner, i = 0): Promise<void> {
    await this.accessToPartnerManagementPage("Partner", i);

    await this.partnerManagementPage.fillFormToCreatePartner(partnerInfo);
  }

  public async clickDetailButton(partner: Partner) {
    await this.partnerManagementPage.clickDetailButton(partner);
  }

  public async fillFormToAddPeo(partner: Partner, peoPartners: PeoPartner[]) {
    await this.partnerManagementPage.clickDetailButton(partner);

    await this.partnerManagementPage.fillFormToAddPeo(peoPartners);
  }

  public async addMoreMembers(partner: Partner) {
    await this.partnerManagementPage.addMoreMembers(partner);
  }

  public async inviteMembers(invitingMember: Partner, invitedMembers: UserInfo[]) {
    await this.partnerManagementPage.accessToManagementPage("Customer");

    await this.partnerManagementPage.clickDetailButton(invitingMember);

    await this.customerManagementPage.inviteMembers(invitedMembers);
  }
}
