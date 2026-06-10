import { Locator, Page } from "@playwright/test";
import { BusinessLocator } from "../pages/partner-portal/locators/business";
import { CustomerInfo, Partner, UserInfo } from "src/objects";
import refreshPage from "src/utilities/refresh";
import { PeoPartner } from "src/objects/ipeopartner";
import { UiAssert } from "src/assertions";
import { OnboardingAdminPortalFlow } from "../pages/admin-portal/flows/adminportal.onboarding.flow";
import { OnboardingPartnerPotalFlow } from "../pages/partner-portal/flows/partnerportal.onboarding.flow";
import { OnboardingMemberPotalFlow } from "../pages/member-portal/flows/memberportal.onboarding.flow";
import { TempEmailFreePage } from "../pages";
import { HomePage } from "../pages/shared-pages/home.page";
import delay from "src/utilities/delay";
import { SignUpLocators } from "../pages/member-portal/locators/signup";

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
  private readonly tempEmailFreePage: TempEmailFreePage;
  private readonly homeExceptAdminPage: HomePage;

  constructor(page: Page) {
    this.page = page;
    this.onboardingAdminPortalFlow = new OnboardingAdminPortalFlow(this.page);
    this.onboardingPartnerPotalFlow = new OnboardingPartnerPotalFlow(this.page);
    this.onboardingMemberPotalFlow = new OnboardingMemberPotalFlow(this.page);
    this.tempEmailFreePage = new TempEmailFreePage(this.page);
    this.homeExceptAdminPage = new HomePage(this.page);
  }

  public async createBusinessFromPartnerPortal(partnerInfo: Partner, owner?: UserInfo) {
    if (partnerInfo.partnerInfo?.paymentOption !== "Member Portal Consumer" && partnerInfo.partnerInfo?.paymentOption !== "Partner/Consultant Owner")
      throw new Error("Payment option must be Member Portal Consumer or Partner/Consultant Owner");

    await this.onboardingPartnerPotalFlow.eraseModal();

    await this.onboardingPartnerPotalFlow.fillFormToCreateBusiness(partnerInfo, owner);
  }

  public async verifyOwnerVisible() {
    await UiAssert.allVisible([this.page.locator(BusinessLocator.ownerText)]);
  }

  public async verifyPartnerVisible(partnerInfo: Partner) {
    const partnerEmailLocator = this.page!.getByText(partnerInfo!.accountInfo!.email).first();

    const options = { timeout: 10000 };

    try {
      await UiAssert.allVisible([partnerEmailLocator], options);
    } catch (error) {
      await refreshPage(this.page);
      await UiAssert.allVisible([partnerEmailLocator], options);
    }
  }

  public async verifyCustomerVisible(customerInfo: CustomerInfo) {
    const customerEmailLocator = this.page!.getByText(customerInfo!.accountInfo!.email).first();
    try {
      await UiAssert.allVisible([customerEmailLocator]);
    } catch (error) {
      await refreshPage(this.page);
      await UiAssert.allVisible([customerEmailLocator]);
    }
  }

  public async verifyURL(containedURL: string) {
    await delay(15000);
    const currentUrl = this.page.url();
    UiAssert.urlMatches(currentUrl, containedURL);
  }

  public createPartnerAndAddPeoInAdminPortal = async (partnerInfo: Partner, peoPartners?: PeoPartner, isAddPeo = false) =>
    await this.onboardingAdminPortalFlow.createPartnerAndAddPeo(partnerInfo, peoPartners, isAddPeo);

  public addMoreMembersInPartnerManagementPage = async (partner: Partner, invitedMembers: UserInfo[]) => await this.onboardingAdminPortalFlow.addCustomerMembersInPartManaPage(partner, invitedMembers);

  public inviteMemberInCusManagement = async (invitingMember: Partner | UserInfo | CustomerInfo, invitedMembers: UserInfo[]) =>
    await this.onboardingAdminPortalFlow.inviteCustomerMembersInCusManaPage(invitingMember, invitedMembers);

  public signUpIndividualCustomerFromMemberPortal = async (customerInfo: CustomerInfo) => await this.onboardingMemberPotalFlow.signUp(customerInfo);

  public verifyOwnerRoleInUserPage = async (partnerInfo: Partner) => await this.onboardingPartnerPotalFlow.validateOwnerRoleInUserPage(partnerInfo);

  public createCustomerFromCustomerManagementPage = async (customerInfo: CustomerInfo): Promise<void> => await this.onboardingAdminPortalFlow.createCustomerFromCustomerManagementPage(customerInfo);

  public validateReceivedOneEmail = async (partnerInfo: Partner) => this.tempEmailFreePage.validateReceivedOneEmail(partnerInfo);

  public validateReceivedTwoEmails = async (partnerInfo: Partner) => this.tempEmailFreePage.validateReceivedTwoEmails(partnerInfo);

  public validatePlanVisible = async () => await this.onboardingPartnerPotalFlow.validatePlanVisible();

  public validateAccountNotExist = async () => await this.onboardingPartnerPotalFlow.validateAccountNotExist();

  public redirectToHomePage = async () => {
    const homeTitle = await this.homeExceptAdminPage.getHomeTitle();

    await UiAssert.allVisible([homeTitle], { timeout: 30000 });
  };

  public async verifyDuplicatedEmail(customerInfo: CustomerInfo) {
    await this.onboardingMemberPotalFlow.fillDuplicatedEmailToSignUp(customerInfo);
    const duplicatedEmailErrorLocator = this.page.locator(SignUpLocators.duplicatedEmailError);

    await UiAssert.allVisible([duplicatedEmailErrorLocator]);
  }

  public async verifyDuplicatedEmailWhenCreatingPartner(partnerInfo: Partner) {
    await this.onboardingAdminPortalFlow.getDuplicatedText(partnerInfo);

    await UiAssert.textContains(this.page.locator("body"), "Email is existed");
  }
}
