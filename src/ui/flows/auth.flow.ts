import { expect, Page } from "@playwright/test";
import { LoginPage } from "../pages";
import { EmailServicePage } from "../pages/shared-pages/emailservice.page";
import { WelcomeModal } from "../pages/shared-pages/welome.modal";
import { MemberOnboardingLocators } from "../pages/member-portal/locators";
import { getEmailSubjectByDepartment } from "src/constant/department-data";
import { EmailCredentials, EmailMessage, MaildropHandler } from "src/utilities/maildrop-handling";

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

  /** Reads credentials from whichever inbox backend is active (maildrop API or UI-based inbox). */
  private getCredentials = async (email: string, subject: string): Promise<EmailCredentials> => {
    if (process.env.MAILBOX_URL?.includes("maildrop")) {
      const mailDropHandler = new MaildropHandler();
      let emailContent: EmailMessage | null = null;

      await expect.poll(
        async () => {
          try {
            emailContent = await mailDropHandler.readEmail(email, subject, { format: "html" });
            return true;
          } catch {
            return false;
          }
        },
        {
          message: `Email "${subject}" not received in ${email}`,
          timeout: 30000,
          intervals: [3000, 5000, 5000],
        },
      ).toBe(true);

      return mailDropHandler.parseCredentialsFromMailBody(emailContent!.content);
    }
    return this.emailServicePage.extractAccountCredentialFromInBox(email, subject);
  };

  // ─── Login ───────────────────────────────────────────────────────────────────

  /** Logs in to the admin portal using credentials from environment variables. */
  public loginToAdminPortal = async () =>
    await this.loginPage.fillLoginForm(
      process.env.ADMIN_PORTAL_BASE_URL!,
      process.env.ADMIN_USERNAME!,
      process.env.ADMIN_PASSWORD!,
    );

  /** Logs in to a given portal URL with the provided email and password. */
  public loginToPortals = async (portalUrl: string, email: string, password: string) =>
    await this.loginPage.fillLoginForm(portalUrl, email, password);

  // ─── Invitation ──────────────────────────────────────────────────────────────

  /**
   * Accepts a team invitation from the customer's inbox and completes the
   * onboarding flow by setting a password and joining the team.
   */
  public acceptInviteAndJoinTeamByCustomer = async (customerEmail: string, password: string): Promise<void> => {
    if (process.env.MAILBOX_URL?.includes("maildrop")) {
      const mailDropHandler = new MaildropHandler();
      const emailSubject = getEmailSubjectByDepartment().SUBJECT_EMAIL_TO_JOIN_TEAM;
      const emailContent = await mailDropHandler.readEmail(customerEmail, emailSubject, { format: "html" });
      const hrefMatch = emailContent.content.match(/href="([^"]+)"/);
      if (!hrefMatch) throw new Error("Invite link not found in email content");
      await this.page.goto(hrefMatch[1]);
    } else {
      await this.emailServicePage.acceptJoinTeamInvite(customerEmail);
    }

    await this.loginPage.currentPage.waitForLoadState("domcontentloaded");
    await this.page.locator(MemberOnboardingLocators.continueWithEmail).click();
    await this.loginPage.setPassword(password);
    await this.loginPage.clickOnJoinTeamLink();
    await new WelcomeModal(this.loginPage.currentPage).closeModalWithOption("readyDiveIn");
  };

  // ─── Account Activation ──────────────────────────────────────────────────────

  /** Retrieves credentials from the customer's inbox and activates the account by setting a new password. */
  public activateCustomerAccount = async (customerEmail: string, newPassword: string) => {
    const emailTitle = getEmailSubjectByDepartment().SUBJECT_EMAIL_TO_MEMBER_CREDENTIAL!;
    const credential = await this.getCredentials(customerEmail, emailTitle);

    await this.loginPage.fillLoginForm(credential.loginUrl, customerEmail, credential.password);
    await this.loginPage.changePassword(credential.password, newPassword);
  };

  /**
   * Activates an individual customer account (Member, Consumer, or Partner)
   * and sets a new password via the login link from their inbox.
   */
  public activateIndividualCustomerAccountAndSetPassword = async (email: string, portal: string, newPassword: string) => {
    const envSubject = getEmailSubjectByDepartment();
    const subject = portal === "Member" || portal === "Consumer"
      ? envSubject.SUBJECT_EMAIL_TO_MEMBER_CREDENTIAL
      : envSubject.SUBJECT_EMAIL_TO_PARTNER_CREDENTIAL;

    const credential = await this.getCredentials(email, subject);

    await this.loginPage.fillLoginForm(credential.loginUrl, email, credential.password);
    await this.loginPage.setPassword(newPassword);
  };

  /** Reads credential email and returns the base portal URL (strips the path). */
  public getPortalBaseUrl = async (email: string, portal: string): Promise<string> => {
    const envSubject = getEmailSubjectByDepartment();
    const subject = portal === "Member" || portal === "Consumer"
      ? envSubject.SUBJECT_EMAIL_TO_MEMBER_CREDENTIAL
      : envSubject.SUBJECT_EMAIL_TO_PARTNER_CREDENTIAL;

    const credential = await this.getCredentials(email, subject);
    const url = new URL(credential.loginUrl);
    return `${url.protocol}//${url.host}`;
  };

  // ─── Password Change ─────────────────────────────────────────────────────────

  /** Activates an individual customer account and changes the temporary password to a new one. */
  public activateAndChangePassIndividualCustomer = async (email: string, portal: string, newPassword: string) => {
    const envSubject = getEmailSubjectByDepartment();
    const subject = portal === "Member" || portal === "Consumer"
      ? envSubject.SUBJECT_EMAIL_TO_MEMBER_CREDENTIAL
      : envSubject.SUBJECT_EMAIL_TO_PARTNER_CREDENTIAL;

    const credential = await this.getCredentials(email, subject);

    await this.loginPage.fillLoginForm(credential.loginUrl, email, credential.password);
    await this.loginPage.changePassword(credential.password, newPassword);
  };

  // ─── Email Verification ──────────────────────────────────────────────────────

  /** Confirms a signed-up customer's email address by clicking the verification link from their inbox. */
  public activateSignedUpCustomer = async (email: string) => {
    const subject = "Verify your email address";

    if (process.env.MAILBOX_URL?.includes("maildrop")) {
      const mailDropHandler = new MaildropHandler();
      const emailContent = await mailDropHandler.readEmail(email, subject, { format: "html" });
      const confirmMatch = emailContent.content.match(/<a[^>]+href="([^"]+)"[^>]*>\s*Confirm email\s*<\/a>/i);
      if (!confirmMatch) throw new Error("Confirmation URL not found in email content");
      await this.page.goto(confirmMatch[1]);
      return;
    }

    const credential = await this.emailServicePage.extractAccountCredentialFromInBox(email, subject);
    await this.page.goto(credential.loginUrl);
  };

  /** Asserts that exactly one verification email was received in the customer's inbox when creating a customer account. */
  public validateReceivedOneEmailForCreatingCustomer = async (email: string) =>
    await this.emailServicePage.validateReceivedOneEmailForCreatingCustomer(email);

  /** Asserts that the verification email for a new customer contains a time-limited expiry notice (e.g. "X hours"). */
  public validateTimeLimitedEmailForCreatingCustomer = async (email: string) => {
    const subject = "Verify your email address";
    await this.emailServicePage.validateTimeLimitedEmailForCreatingCustomer(email, subject);
  };
}
