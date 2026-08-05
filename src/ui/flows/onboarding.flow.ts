import { BusinessLocator } from "../pages/partner-portal/locators/business";
import { CustomerInfo, Partner, UserInfo } from "src/objects";
import { PeoPartner } from "src/objects/ipeopartner";
import { UiAssert } from "src/assertions";
import { OnboardingAdminPortalFlow } from "../pages/admin-portal/flows/adminportal.onboarding.flow";
import { OnboardingPartnerPotalFlow } from "../pages/partner-portal/flows/partnerportal.onboarding.flow";
import { OnboardingMemberPortalFlow } from "../pages/member-portal/flows/memberportal.onboarding.flow";
import { EmailServicePage } from "../pages";
import { HomePage } from "../pages/shared-pages/home.page";
import { SignUpLocators } from "../pages/member-portal/locators/signup";
import { Page } from "playwright/test";

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
  private readonly onboardingMemberPotalFlow: OnboardingMemberPortalFlow;
  private readonly emailServicePage: EmailServicePage;
  private readonly homeExceptAdminPage: HomePage;

  constructor(page: Page) {
    this.page = page;
    this.onboardingAdminPortalFlow = new OnboardingAdminPortalFlow(this.page);
    this.onboardingPartnerPotalFlow = new OnboardingPartnerPotalFlow(this.page);
    this.onboardingMemberPotalFlow = new OnboardingMemberPortalFlow(this.page);
    this.emailServicePage = new EmailServicePage(this.page);
    this.homeExceptAdminPage = new HomePage(this.page);
  }

  public createBusinessFromPartnerPortal = async (partnerInfo: Partner, owner?: UserInfo) => {
    if (partnerInfo.partnerInfo?.paymentOption !== "Member Portal Consumer" && partnerInfo.partnerInfo?.paymentOption !== "Partner/Consultant Owner")
      throw new Error("Payment option must be Member Portal Consumer or Partner/Consultant Owner");

    await this.onboardingPartnerPotalFlow.eraseModal();

    await this.onboardingPartnerPotalFlow.fillFormToCreateBusiness(partnerInfo, owner);
  };

  public verifyOwnerVisible = async () => await UiAssert.allVisible([this.page.locator(BusinessLocator.ownerText)]);

  public verifyPartnerVisible = async (partnerInfo: Partner) => {
    const partnerEmailLocator = this.page!.getByText(partnerInfo!.accountInfo!.email).first();

    await UiAssert.allVisible([partnerEmailLocator]);
  };

  public verifyCustomerVisible = async (customerInfo: CustomerInfo) => {
    let customerEmailLocator;
    try {
      customerEmailLocator = this.page!.getByText(customerInfo!.accountInfo!.email).first();

      await UiAssert.allVisible([customerEmailLocator], { timeout: 60000 });
    } catch (error) {
      await this.page.reload();
      customerEmailLocator = this.page!.getByText(customerInfo!.accountInfo!.email).first();
      await UiAssert.allVisible([customerEmailLocator], { timeout: 60000 });
    }
  };

  public verifyURL = async (containedURL: string) => await this.page.waitForURL(`**${containedURL}**`, { timeout: 30000 });

  public createPartnerAndAddPeoInAdminPortal = async (partnerInfo: Partner, peoPartners?: PeoPartner, isAddPeo = false) =>
    await this.onboardingAdminPortalFlow.createPartnerAndAddPeo(partnerInfo, peoPartners, isAddPeo);

  public addMoreMembersInPartnerManagementPage = async (partner: Partner, invitedMembers: UserInfo[]) => await this.onboardingAdminPortalFlow.addCustomerMembersInPartManaPage(partner, invitedMembers);

  public inviteMemberInCusManagement = async (invitingMember: Partner | UserInfo | CustomerInfo, invitedMembers: UserInfo[]) =>
    await this.onboardingAdminPortalFlow.inviteCustomerMembersInCusManaPage(invitingMember, invitedMembers);

  public inviteMemberInOrganizationTabMemberPortal = async (invitedMembers: UserInfo[]) => await this.onboardingMemberPotalFlow.inviteMemberInOrganizationTabMemberPortal(invitedMembers);

  public verifyCannotInviteMembersInMemberPortal = async () => await this.onboardingMemberPotalFlow.verifyCannotInviteMembersInMemberPortal();

  public signUpIndividualCustomerFromMemberPortal = async (customerInfo: CustomerInfo, hrSystem?: string, url?: string) => await this.onboardingMemberPotalFlow.signUp(customerInfo, hrSystem, url);

  public verifyOwnerRoleInUserPage = async (partnerInfo: Partner) => await this.onboardingPartnerPotalFlow.validateOwnerRoleInUserPage(partnerInfo);

  public createCustomerFromCustomerManagementPage = async (customerInfo: CustomerInfo) => await this.onboardingAdminPortalFlow.createCustomerFromCustomerManagementPage(customerInfo);

  public upgradePlanForCustomer = async (customerInfo: CustomerInfo, planToUpgrade: string) => await this.onboardingAdminPortalFlow.upgradePlanForCustomer(customerInfo, planToUpgrade);

  /**
   * Reopen the customer's Details modal and verify the Subscription section shows the expected plan.
   */
  public verifySubscriptionPlanOfCustomer = async (customerInfo: CustomerInfo, expectedPlan: string) => {
    try {
      await this.assertSubscriptionPlanOfCustomer(customerInfo, expectedPlan);
    } catch (error) {
      await this.assertSubscriptionPlanOfCustomer(customerInfo, expectedPlan);
    }
  };

  private assertSubscriptionPlanOfCustomer = async (customerInfo: CustomerInfo, expectedPlan: string) => {
    //Reload first: it dismisses the modal the upgrade leaves open and refreshes the plan shown in the Details modal
    await this.page.reload();

    await this.onboardingAdminPortalFlow.openCustomerDetails(customerInfo);

    const subscriptionPlanLocator = await this.onboardingAdminPortalFlow.getSubscriptionPlanOfCustomer();

    await UiAssert.textContains(subscriptionPlanLocator, expectedPlan, { timeout: 60000 });
  };

  /**
   * Reload the current page to dismiss any modal a previous step left open.
   *
   * Needed before left-menu navigation (`Management` -> `Customer/Partner Management`): an open
   * modal's `b-modal__wrapper` overlays the page and intercepts the pointer events meant for the
   * menu item, so the click times out with "subtree intercepts pointer events".
   */
  public dismissOpenModals = async () => await this.page.reload();

  /**
   * Asserts the `Upgrade Plan` action is NOT offered for the given account in Customer Management.
   * Used for accounts that must not be upgradable: non-Owner team members, and Owners linked to a
   * Partner/Consultant (their plan is managed through the Partner instead).
   */
  public verifyUpgradePlanNotAvailable = async (user: Partner | UserInfo | CustomerInfo) => {
    await this.onboardingAdminPortalFlow.openDetailsInCustomerManagement(user);

    await UiAssert.noneVisible([this.onboardingAdminPortalFlow.getUpgradePlanButton()]);
  };

  /** Asserts the `Upgrade Plan` action IS offered — the positive control for `verifyUpgradePlanNotAvailable`. */
  public verifyUpgradePlanAvailable = async (user: Partner | UserInfo | CustomerInfo) => {
    await this.onboardingAdminPortalFlow.openDetailsInCustomerManagement(user);

    await UiAssert.allVisible([this.onboardingAdminPortalFlow.getUpgradePlanButton()]);
  };

  public validateReceivedOneEmail = async (partnerInfo: Partner) => this.emailServicePage.validateReceivedOneEmail(partnerInfo);

  public validateReceivedTwoEmails = async (partnerInfo: Partner) => this.emailServicePage.validateReceivedTwoEmails(partnerInfo);

  public validatePlanVisible = async () => await this.onboardingPartnerPotalFlow.validatePlanVisible();

  public validateAccountNotExist = async () => await this.onboardingPartnerPotalFlow.validateAccountNotExist();

  public redirectToHomePage = async () => {
    const homeTitle = await this.homeExceptAdminPage.getHomeTitle();
    await homeTitle.waitFor({ state: "visible", timeout: 0 });
  };

  public verifyDuplicatedEmailWhenSignUpCustomer = async (customerInfo: CustomerInfo) => {
    await this.onboardingMemberPotalFlow.fillDuplicatedEmailToSignUp(customerInfo);
    const duplicatedEmailErrorLocator = this.page.locator(SignUpLocators.errorMessage.replace("errormessage", "An account with this email id already exists"));

    await UiAssert.allVisible([duplicatedEmailErrorLocator]);
  };

  public verifyDuplicatedEmailWhenCreatingPartner = async (partnerInfo: Partner) => {
    await this.onboardingAdminPortalFlow.getDuplicatedText(partnerInfo);

    await UiAssert.textContains(this.page.locator("body"), "Email is existed");
  };

  public verifyFillingFormIsRequired = async (customerInfo: CustomerInfo) => await this.onboardingMemberPotalFlow.veriryFillingFormIsRequired(customerInfo);
}
