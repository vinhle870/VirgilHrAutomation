import { Page } from "@playwright/test";
import { LoginPage } from "../pages";
import { TempEmailFreePage } from "../pages/shared-pages/tempemailfree.page";
import { WelcomeModal } from "../pages/shared-pages/welome.modal";
import { MemberOnboardingLocators } from "../pages/member-portal/locators";
/**
 * This flow class contains methods related to the authentication process, such as logging in with valid accounts, accepting invitations, activating accounts, and changing passwords.
 * Flows:
 * Flow #1: Login with valid account
 * Flow #2: Accept invitation to join a team
 * Flow #3: Activate account and set password
 * Flow #4: Change password for an existing account
 */
export class AuthFlow {
  private tempEmailFreePage: TempEmailFreePage;
  private loginPage: LoginPage;
  private page: Page;

  constructor(page: Page) {
    this.page = page;
    this.loginPage = new LoginPage(this.page);
    this.tempEmailFreePage = new TempEmailFreePage(this.page);
  }

  /**
   *  Logs in with a valid account by filling the login form with the provided URL, username, and password, then submitting the form.
   * @param url
   * @param username
   * @param password
   */
  async loginToAdminPortal() {
    await this.loginPage.fillLoginForm(process.env.ADMIN_PORTAL_BASE_URL!, process.env.ADMIN_USERNAME!, process.env.ADMIN_PASSWORD!);
  }

  async loginToPortals(portalUrl: string, email: string, password: string) {
    await this.loginPage.fillLoginForm(portalUrl, email, password);
  }

  /**
   * Accepts an invitation for the user by retrieving the link from Email
   * and completing the onboarding steps.
   * Flows: Accept via invite link -> Set password -> Click on Join Team link -> Close modal
   */
  async acceptInviteAndJoinTeamByCustomer(customerEmail: string, password: string): Promise<void> {
    await this.tempEmailFreePage.acceptJoinTeamInvite(customerEmail);

    await this.loginPage.currentPage.waitForLoadState("domcontentloaded");

    await this.page.locator(MemberOnboardingLocators.continueWithEmail).click();

    await this.loginPage.setPassword(password);

    await this.loginPage.clickOnJoinTeamLink();

    await new WelcomeModal(this.loginPage.currentPage).closeModalWithOption("readyDiveIn");
  }

  /**
   *  Activates the customer account by extracting credentials from the email, logging in, and optionally changing the password.
   * @param customerEmail
   * @param isChangePassword
   * @param newPassword
   */
  public async activateCustomerAccount(customerEmail: string, newPassword: string) {
    const emailTitle = "HR Compliance: Your User Portal Credentials";

    const accountCrendential = await this.tempEmailFreePage.extractAccountCredentialFromInBox(customerEmail, emailTitle);

    const credentialPassword = accountCrendential.password;

    const inviteUrl = accountCrendential.hrefValue;

    await this.loginToPortals(inviteUrl!, customerEmail, credentialPassword!);

    await this.loginPage.changePassword(credentialPassword!, newPassword!);
  }

  public async activateIndividualCustomerAccountAndSetPassword(email: string, portal: string, newPassword: string) {
    const subject = portal === "Member" || portal === "Consumer" ? process.env.SUBJECT_TO_MEMBER_CREDENTIAL! : process.env.SUBJECT_TO_PARTNER_CREDENTIAL!;

    const credential = await this.tempEmailFreePage.extractAccountCredentialFromInBox(email, subject);

    await this.loginPage.fillLoginForm(credential.hrefValue!, email, credential.password!);

    await this.loginPage.setPassword(newPassword);
  }

  public async activateIndividualCustomerAccountAndChangePassword(email: string, portal: string, newPassword: string) {
    const subject = portal === "Member" || portal === "Consumer" ? process.env.SUBJECT_TO_MEMBER_CREDENTIAL! : process.env.SUBJECT_TO_PARTNER_CREDENTIAL!;

    const credential = await this.tempEmailFreePage.extractAccountCredentialFromInBox(email, subject);

    await this.loginPage.fillLoginForm(credential.hrefValue!, email, credential.password!);

    await this.loginPage.changePassword(credential.password!, newPassword);
  }

  public async activateSignedUpCustomer(email: string) {
    const subject = "Verify your email address";

    const credential = await this.tempEmailFreePage.extractAccountCredentialFromInBox(email, subject);

    await this.page.goto(credential.hrefValue!);
  }
}
