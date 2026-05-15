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

  public async accessToPartnerManagementPage(category = "Partner") {
    await this.partnerManagementPage.accessToManagementPage(category);
  }

  public async createPartnerAndAddPeo(partnerInfo: Partner, peoPartners?: PeoPartner[], isAddPeo = false): Promise<string> {
    if (!isAddPeo) {
      await this.accessToPartnerManagementPage("Partner");
      await this.partnerManagementPage.fillCreatePartnerForm(partnerInfo);
    }

    if (isAddPeo && peoPartners?.length! >= 1) {
      await this.fillFormToAddPeo(partnerInfo!, peoPartners!);

      return "Pass";
    }

    return "";
  }

  public async clickDetailButton(partner: Partner) {
    await this.partnerManagementPage.clickDetailButton(partner);
  }

  private async fillFormToAddPeo(partner: Partner, peoPartners: PeoPartner[]) {
    await this.partnerManagementPage.clickDetailButton(partner);

    await this.partnerManagementPage.fillFormToAddPeo(peoPartners);
  }

  public async addCustomerMembersInPartManaPage(partner: Partner) {
    await this.partnerManagementPage.addCustomerMembersInPartManaPage(partner);
  }

  public async inviteCustomerMembersInCusManaPage(invitingMember: Partner, invitedMembers: UserInfo[]) {
    await this.partnerManagementPage.accessToManagementPage("Customer");

    await this.partnerManagementPage.clickDetailButton(invitingMember);

    await this.customerManagementPage.inviteCustomerMembers(invitedMembers);
  }
}
