import { Locator, Page } from "playwright/test";
import { PartnerManagementPage } from "../partner-management-page";
import { CustomerInfo, Partner, UserInfo } from "src/objects";
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

  public createPartnerAndAddPeo = async (partnerInfo: Partner, peoPartners?: PeoPartner, isAddPeo = false): Promise<void> => {
    await this.partnerManagementPage.accessToManagementPage("Partner");

    if (!isAddPeo)
      await this.partnerManagementPage.fillCreatePartnerForm(partnerInfo);
    else
      await this.fillFormToAddPeo(partnerInfo!, peoPartners!);


  };

  public clickDetailButton = async (partner: Partner) => await this.partnerManagementPage.clickDetailButton(partner);

  private fillFormToAddPeo = async (partner: Partner, peoPartners: PeoPartner) => {
    await this.partnerManagementPage.clickDetailButton(partner);

    await this.partnerManagementPage.fillFormToAddPeo(peoPartners);

  };

  public addCustomerMembersInPartManaPage = async (partner: Partner, invitedMembers: UserInfo[]) => await this.partnerManagementPage.addCustomerMembersInPartManaPage(partner, invitedMembers);

  public inviteCustomerMembersInCusManaPage = async (invitingMember: Partner | UserInfo | CustomerInfo, invitedMembers: UserInfo[]) => {
    await this.partnerManagementPage.accessToManagementPage("Customer");

    await this.partnerManagementPage.clickDetailButton(invitingMember);

    await this.customerManagementPage.inviteCustomerMembers(invitedMembers);
  };

  public createCustomerFromCustomerManagementPage = async (customerInfo: CustomerInfo): Promise<void> => {
    await this.partnerManagementPage.accessToManagementPage("Member");

    await this.customerManagementPage.fillFormToCreateCustomer(customerInfo);
  };

  public getDuplicatedText = async (partnerInfo: Partner) => await this.partnerManagementPage.getDuplicatedText(partnerInfo);

  public upgradePlanForCustomer = async (customerInfo: CustomerInfo, planToUpgrade: string): Promise<void> => {
    await this.customerManagementPage.upgradePlan(customerInfo, planToUpgrade);
  };
}
