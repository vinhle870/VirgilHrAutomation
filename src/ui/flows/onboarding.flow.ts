import { Locator, Page } from "@playwright/test";
import { CommonPartnerPortalLocator } from "../pages/partner-portal/locators/common";
import { BusinessLocator } from "../pages/partner-portal/locators/business";
import { CustomerInfo, Partner, UserInfo } from "src/objects";
import refreshPage from "src/utilities/refresh";
import { CommonAdminPortalLocator } from "../pages/admin-portal/locators/common/common.locator";
import { CommonPartnerLocator } from "../pages/admin-portal/locators/partner-management/locator/common";
import delay from "src/utilities/delay";
import { DetailOfPartnerLocator } from "../pages/admin-portal/locators/partner-management/locator/partner-detail.modal";
import { PeoPartner } from "src/objects/ipeopartner";
import { UiAssert } from "src/assertions";
import { CustomerDetailModalLocator } from "../pages/admin-portal/locators/customer-management/customer-detail-modal";
import { TeamInfoLocator } from "../pages/admin-portal/locators/customer-management/team-imformation";
import { PartnerPage } from "../pages/partner-portal/partner-page";
import { OnboardingAdminPortalFlow } from "../pages/admin-portal/flows/onboarding.flow";
import { OnboardingPartnerPotalFlow } from "../pages/partner-portal/flows/onboarding.flow";
import { OnboardingMemberPotalFlow } from "../pages/member-portal/flows/onboarding.flow";

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
  private readonly onboardingAdminPortalFlow: OnboardingAdminPortalFlow;
  private readonly onboardingPartnerPotalFlow: OnboardingPartnerPotalFlow;
  private readonly onboardingMemberPotalFlow: OnboardingMemberPotalFlow;

  constructor(page: Page) {
    this.page = page;
    this.onboardingAdminPortalFlow = new OnboardingAdminPortalFlow(this.page);
    this.onboardingPartnerPotalFlow = new OnboardingPartnerPotalFlow(this.page);
    this.onboardingMemberPotalFlow = new OnboardingMemberPotalFlow(this.page);
  }

  public async createBusinessFromPartnerPortal(partnerInfo: Partner, owner?: UserInfo) {
    if (partnerInfo.partnerInfo?.paymentOption !== "Member Portal Consumer" && partnerInfo.partnerInfo?.paymentOption !== "Partner/Consultant Owner")
      throw new Error("Payment option must be Member Portal Consumer or Partner/Consultant Owner");

    await this.onboardingPartnerPotalFlow.eraseModal();

    await this.onboardingPartnerPotalFlow.fillFormToCreateBusiness(partnerInfo, owner);

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

  public async verifyURL(containedURL: string) {
    const currentUrl = this.page.url();
    UiAssert.urlMatches(currentUrl, containedURL);
  }

  public async createPartnerAndAddPeo(partnerInfo: Partner, peoPartners?: PeoPartner[], isAddPeo = false) {
    const addedPeo = await this.onboardingAdminPortalFlow.createPartnerAndAddPeo(partnerInfo, peoPartners, isAddPeo);

    if (addedPeo === "Pass") return "Pass";
  }

  public async addMoreMembersInPartnerManagementPage(partner: Partner, invitedMembers: UserInfo[]): Promise<void> {
    if (invitedMembers?.length === 0) throw new Error("There is no any member to add");

    await this.onboardingAdminPortalFlow.addCustomerMembersInPartManaPage(partner);
  }

  public async inviteMemberInCusManagement(invitingMember: Partner, invitedMembers: UserInfo[]) {
    if (invitedMembers?.length === 0) throw new Error("There is no any member to add");

    await this.onboardingAdminPortalFlow.inviteCustomerMembersInCusManaPage(invitingMember, invitedMembers);
  }

  public async getDuplicatedText(): Promise<Locator> {
    return await this.onboardingAdminPortalFlow.getDuplicatedText();
  }

  public async signUpIndividualCustomerFromMemberPortal(customerInfo: CustomerInfo) {
    await this.onboardingMemberPotalFlow.signUp(customerInfo);
  }

  public async getOwnerRoleInUserPage(partnerInfo: Partner): Promise<Locator> {
    return await this.onboardingPartnerPotalFlow.getOwnerRoleInUserPage(partnerInfo);
  }
}
