import { expect, Page } from "@playwright/test";
import { LoginPage } from "../pages";
import { EmailServicePage } from "../pages/shared-pages/emailservice.page";
import { WelcomeModal } from "../pages/shared-pages/welome.modal";
import { MemberOnboardingLocators } from "../pages/member-portal/locators";
import { getEmailSubjectByDepartment } from "src/constant/department-data";
import { EmailCredentials, EmailMessage, YopmailHandler } from "src/utilities/email-handling";

/**
 * This flow class contains methods related to the authentication process,
 * such as logging in with valid accounts, accepting invitations, activating
 * accounts, and changing passwords.
 *
 * Flows:
 *   Flow #1: Login with valid account
 *   Flow #2: Accept invitation to join a team
 *   Flow #3: Activate account and set password
 *   Flow #4: Change password for an existing account
 */
export class AuthFlow {
  private emailServicePage: EmailServicePage;
  private loginPage: LoginPage;
  private page: Page;

  constructor(page: Page) {
    this.page = page;
    this.loginPage = new LoginPage(this.page);
    this.emailServicePage = new EmailServicePage(this.page);
  }

  // ─── Private helpers ─────────────────────────────────────────────────────────

  public getCredentialsFromEmail = async (email: string, subject: string): Promise<EmailCredentials> => {
    const mailboxUrl = process.env.MAILBOX_URL ?? "";

    const pollEmail = async (handler: YopmailHandler): Promise<EmailMessage> => {
      let emailContent: EmailMessage | null = null;
      await expect
        .poll(
          async () => {
            try {
              emailContent = await handler.readEmail(email, subject, { format: "html" });
              return true;
            } catch {
              return false;
            }
          },
          { message: `Email "${subject}" not received in ${email}`, timeout: 120000, intervals: [10000, 20000, 30000, 30000] },
        )
        .toBe(true);
      return emailContent!;
    };

    const parseContent = (handler: YopmailHandler, content: string): EmailCredentials => {
      const envSubject = getEmailSubjectByDepartment();
      return subject === envSubject.CUSTOMER_ACC_ACTIVATE || subject === envSubject.PARTNER_ACC_ACTIVATE
        ? handler.parseActivateCredentialsFromMailBody(content)
        : handler.parseInviteInfoFromMailBody(content);
    };

    if (mailboxUrl.includes("yopmail")) {
      const handler = new YopmailHandler();
      const emailContent = await pollEmail(handler);
      return parseContent(handler, emailContent.content);
    }
    if (mailboxUrl.includes("beeinbox")) return this.emailServicePage.extractAccountCredentialFromInBox(email, subject);

    throw new Error(`Unsupported mailbox: ${mailboxUrl}`);
  };

  // ─── Login ───────────────────────────────────────────────────────────────────

  /** Logs in to the admin portal using credentials from environment variables. */
  public loginToAdminPortal = async () => await this.loginPage.fillLoginForm(process.env.ADMIN_PORTAL_BASE_URL!, process.env.ADMIN_USERNAME!, process.env.ADMIN_PASSWORD!);

  /** Logs in to a given portal URL with the provided email and password. */
  public loginToPortals = async (portalUrl: string, email: string, password: string) => await this.loginPage.fillLoginForm(portalUrl, email, password);

  // ─── Invitation ──────────────────────────────────────────────────────────────

  /**
   * Accepts a team invitation from the customer's inbox and completes the
   * onboarding flow by setting a password and joining the team.
   */
  public acceptInviteAndJoinTeamByCustomer = async (customerEmail: string, password: string): Promise<void> => {
    const emailSubject = getEmailSubjectByDepartment().JOIN_TEAM;
    const credential = await this.getCredentialsFromEmail(customerEmail, emailSubject);
    await this.loginPage.currentPage.goto(credential.loginUrl);
    await this.page.locator(MemberOnboardingLocators.continueWithEmail).click();
    await this.loginPage.setPassword(password);
    await this.loginPage.clickOnJoinTeamLink();
    await new WelcomeModal(this.loginPage.currentPage).closeModalWithOption("readyDiveIn");
  };

  // ─── Account Activation ──────────────────────────────────────────────────────

  /** Retrieves credentials from the customer's inbox and activates the account by setting a new password. */
  public activateCustomerAccount = async (customerEmail: string, newPassword: string) => {
    const emailTitle = getEmailSubjectByDepartment().CUSTOMER_ACC_ACTIVATE!;
    const credential = await this.getCredentialsFromEmail(customerEmail, emailTitle);

    await this.loginPage.fillLoginForm(credential.loginUrl, customerEmail, credential.password);
    await this.loginPage.changePassword(credential.password, newPassword);
  };

  /**
   * Activates an individual customer account (Member, Consumer, or Partner)
   * and sets a new password via the login link from their inbox.
   */
  public activateIndividualCustomerAccountAndSetPassword = async (email: string, portal: string, newPassword: string) => {
    const envSubject = getEmailSubjectByDepartment();
    const subject = portal === "Member" || portal === "Consumer" ? envSubject.CUSTOMER_ACC_ACTIVATE : envSubject.PARTNER_ACC_ACTIVATE;

    const credential = await this.getCredentialsFromEmail(email, subject);

    await this.loginPage.fillLoginForm(credential.loginUrl, email, credential.password);
    await this.loginPage.setPassword(newPassword);
  };

  // ─── Password Change ─────────────────────────────────────────────────────────

  /** Activates an individual customer account and changes the temporary password to a new one. */
  public activateAndChangePassIndividualCustomer = async (email: string, portal: string, newPassword: string) => {
    const envSubject = getEmailSubjectByDepartment();
    const subject = portal === "Member" || portal === "Consumer" ? envSubject.CUSTOMER_ACC_ACTIVATE : envSubject.PARTNER_ACC_ACTIVATE;

    const credential = await this.getCredentialsFromEmail(email, subject);

    await this.loginPage.fillLoginForm(credential.loginUrl, email, credential.password);
    await this.loginPage.changePassword(credential.password, newPassword);
  };

  // ─── Email Verification ──────────────────────────────────────────────────────

  /** Confirms a signed-up customer's email address by clicking the verification link from their inbox. */
  public activateSignedUpCustomer = async (email: string) => {
    const subject = "Verify your email address";

    const credential = await this.getCredentialsFromEmail(email, subject);
    await this.page.goto(credential.loginUrl);
  };

  public activateSignedUpCustomerUnderAPartner = async (email: string) => {
    const subject = "Verify Your Email";

    const credential = await this.getCredentialsFromEmail(email, subject);
    await this.page.goto(credential.loginUrl);
  };

  /** Asserts that exactly one verification email was received in the customer's inbox when creating a customer account. */
  public validateReceivedOneEmailForCreatingCustomer = async (email: string) => await this.emailServicePage.validateReceivedOneEmailForCreatingCustomer(email);

  /** Asserts that the verification email for a new customer contains a time-limited expiry notice (e.g. "X hours"). */
  public validateTimeLimitedEmailForCreatingCustomer = async (email: string) => {
    const subject = "Verify your email address";
    await this.emailServicePage.validateTimeLimitedEmailForCreatingCustomer(email, subject);
  };
}
