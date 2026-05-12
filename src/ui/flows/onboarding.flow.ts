import { Page } from "@playwright/test";
import { CommonPartnerPortalLocator } from "../pages/partner-portal/locators/common";
import { BusinessLocator } from "../pages/partner-portal/locators/business";
import { Partner, UserInfo } from "src/objects";
import refreshPage from "src/utilities/refresh";
import { CommonAdminPortalLocator } from "../pages/admin-portal/locators/common/common.locator";
import { CommonPartnerLocator } from "../pages/admin-portal/locators/partner-management/locator/common";
import delay from "src/utilities/delay";
import { PeoConsultantAdditionLocator } from "../pages/admin-portal/locators/partner-management/locator/peo-consultant-addition";
import { DetailOfPartnerLocator } from "../pages/admin-portal/locators/partner-management/locator/detail";
import { PeoPartner } from "src/objects/ipeopartner";
import { UiAssert } from "src/assertions";
import { CommonCustomerLocator } from "../pages/admin-portal/locators/customer-management/common";
import { CustomerDetailModalLocator } from "../pages/admin-portal/locators/customer-management/customer-detail-modal";
import { TeamInfoLocator } from "../pages/admin-portal/locators/customer-management/team-imformation";
import { PartnerManagementPage } from "../pages/admin-portal/partner-management-page";
import { PartnerPage } from "../pages/partner-portal/partner-page";

/**
 * This flow class contains methods related to the onboarding process of both partner and member users, such as accepting invitations, credentialing, buying plans, and creating a business.
 *Flows:
 * Flow #1: Create Partner from different portals-> Add Partner member with different role
 * Flow #2: Create Partner from different portals -> Add Business -> Add team members
 * Flow #3: Create Customer Under Partner -> Add Business -> Add team members
 * Flow #4: Sign up Individual Customer from member portal
 */

export class OnboardingFlow {
  private readonly page: Page;
  private readonly partnerManagementPage: PartnerManagementPage;
  private readonly partnerPage: PartnerPage;

  constructor(page: Page) {
    this.page = page;
    this.partnerManagementPage = new PartnerManagementPage(this.page);
    this.partnerPage = new PartnerPage(this.page);
  }

  public async createBusinessFromPartnerPortal(partnerInfo: Partner, owner?: UserInfo) {
    if (partnerInfo.partnerInfo?.paymentOption !== "Member Portal Consumer" && partnerInfo.partnerInfo?.paymentOption !== "Partner/Consultant Owner")
      throw new Error("Payment option must be Member Portal Consumer or Partner/Consultant Owner");

    try {
      await this.page.locator(CommonPartnerPortalLocator.closeButton).click({ timeout: 7000 });
    } catch (error) {
      console.log("There is no closing button");
    }

    try {
      await this.page.locator(CommonPartnerPortalLocator.closeTestModal).first().click({ timeout: 7000 });
    } catch (error) {
      console.log("There is no modal");
    }

    await this.page.locator(CommonPartnerPortalLocator.clientButton).click({ timeout: 10000 });

    await this.page.locator(BusinessLocator.businessTab).click({ timeout: 10000 });

    await this.page.locator(BusinessLocator.addBussinessButton).click({ timeout: 5000 });

    await this.partnerPage.fillFormToCreateBusiness(partnerInfo, owner);

    return this.page.locator(BusinessLocator.ownerText);
  }

  public async verifyPartnerVisible(partnerInfo: Partner) {
    const partnerEmailLocator = this.page!.getByText(partnerInfo!.accountInfo!.email).first();
    try {
      await UiAssert.allVisible([partnerEmailLocator]);
    } catch (error) {
      await refreshPage(this.page);
      await UiAssert.allVisible([partnerEmailLocator]);
    }
  }

  public async accessToPartnerManagementPage() {
    await this.partnerManagementPage.accessToManagementPage();
  }

  public async createPartner(partnerInfo: Partner, i = 0): Promise<void> {
    await this.accessToPartnerManagementPage();

    this.page.locator(CommonPartnerLocator.createNewPartnerButton).click({ timeout: 5000 });

    await this.partnerManagementPage.fillFormToCreatePartner(partnerInfo);
  }

  public async addPeoConsultantInAdminPortal(partner: Partner, peoPartners: PeoPartner[]): Promise<string> {
    await this.partnerManagementPage.clickDetailButton(partner);

    await this.page.locator(DetailOfPartnerLocator.addPeoConsultantButton).click();

    await this.partnerManagementPage.fillFormToAddPeo(peoPartners, this.page.locator(DetailOfPartnerLocator.addPeoConsultantButton));

    await delay(5000);

    return "Pass";
  }

  public async addMoreMembers(partner: Partner, invitedMembers: UserInfo[]): Promise<void> {
    if (invitedMembers?.length === 0) throw new Error("There is no any member to add");

    const partnerPhoneNumber = partner.accountInfo?.phoneNumber;

    if (!partnerPhoneNumber) {
      throw new Error("Partner phone number is missing");
    }

    const rawDetailLocator = CommonPartnerLocator.detailButton;

    const detailButtonLocator = rawDetailLocator.replace("phoneNumberValue", partnerPhoneNumber!);

    await this.page.locator(detailButtonLocator).last().click();

    await this.page.locator(DetailOfPartnerLocator.addMemberButton).click();
  }

  public async inviteMemberInCusManagement(invitingMember: Partner, invitedMembers: UserInfo[]) {
    if (invitedMembers?.length === 0) throw new Error("There is no any member to add");

    const memberPhoneNumber = invitingMember.accountInfo?.phoneNumber;

    if (!memberPhoneNumber) {
      throw new Error("Partner phone number is missing");
    }
    await this.page.locator(CommonAdminPortalLocator.managementCategory).click();

    await this.page.locator(CommonAdminPortalLocator.customerManagement).click();

    await this.partnerManagementPage.clickDetailButton(invitingMember);

    await this.page.locator(CustomerDetailModalLocator.viewDetailButton).click();

    try {
      await this.page.locator(TeamInfoLocator.addTeamButton).last().click();
    } catch (error) {
      await this.page.locator(TeamInfoLocator.addTeamButton).first().click();
    }
  }
}
