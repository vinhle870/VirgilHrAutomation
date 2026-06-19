import { Page } from "@playwright/test";
import { LoginPage } from "../pages";
import { EmailServicePage } from "../pages/shared-pages/emailservice.page";
import { WelcomeModal } from "../pages/shared-pages/welome.modal";
import { MemberOnboardingLocators } from "../pages/member-portal/locators";
import { getEmailSubjectByDepartment } from "src/constant/department-data";
import { MaildropHandler } from "src/utilities/maildrop-handling";
/**
 * This flow class contains methods related to the authentication process, such as logging in with valid accounts, accepting invitations, activating accounts, and changing passwords.
 * Flows:
 * Flow #1: Login with valid account
 * Flow #2: Accept invitation to join a team
 * Flow #3: Activate account and set password
 * Flow #4: Change password for an existing account
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

  public loginToAdminPortal = async () => await this.loginPage.fillLoginForm(process.env.ADMIN_PORTAL_BASE_URL!, process.env.ADMIN_USERNAME!, process.env.ADMIN_PASSWORD!);

  public loginToPortals = async (portalUrl: string, email: string, password: string) => await this.loginPage.fillLoginForm(portalUrl, email, password);

  public acceptInviteAndJoinTeamByCustomer = async (customerEmail: string, password: string): Promise<void> => {

    if(process.env.MAILBOX_URL?.includes("maildrop")) {
      const maildropHandler = new MaildropHandler();
      const emailSubject = getEmailSubjectByDepartment().SUBJECT_EMAIL_TO_JOIN_TEAM;
      const emailContent = await maildropHandler.readEmail(customerEmail, emailSubject, { format: 'html' });
      const hrefValue = emailContent.content.match(/href="([^"]+)"/)?.[1];
      console.log(`Extracted hrefValue from email content: ${hrefValue}`);
    }
    {
    await this.emailServicePage.acceptJoinTeamInvite(customerEmail);

    await this.loginPage.currentPage.waitForLoadState("domcontentloaded");

    await this.page.locator(MemberOnboardingLocators.continueWithEmail).click();

    await this.loginPage.setPassword(password);

    await this.loginPage.clickOnJoinTeamLink();

    await new WelcomeModal(this.loginPage.currentPage).closeModalWithOption("readyDiveIn");
    }

  };

  public activateCustomerAccount = async (customerEmail: string, newPassword: string) => {
    const emailTitle = getEmailSubjectByDepartment().SUBJECT_EMAIL_TO_MEMBER_CREDENTIAL!;

    const accountCrendential = await this.emailServicePage.extractAccountCredentialFromInBox(customerEmail, emailTitle);

    const credentialPassword = accountCrendential.password;

    const inviteUrl = accountCrendential.hrefValue;

    await this.loginToPortals(inviteUrl!, customerEmail, credentialPassword!);

    await this.loginPage.changePassword(credentialPassword!, newPassword!);
  };

  public activateIndividualCustomerAccountAndSetPassword = async (email: string, portal: string, newPassword: string) => {
    const envSubject = getEmailSubjectByDepartment();

    const subject = portal === "Member" || portal === "Consumer" ? envSubject.SUBJECT_EMAIL_TO_MEMBER_CREDENTIAL : envSubject.SUBJECT_EMAIL_TO_PARTNER_CREDENTIAL;

    const credential = await this.emailServicePage.extractAccountCredentialFromInBox(email, subject);

    await this.loginPage.fillLoginForm(credential.hrefValue!, email, credential.password!);

    await this.loginPage.setPassword(newPassword);
  };

  public activateAndChangePassIndividualCustomer = async (email: string, portal: string, newPassword: string) => {
    const envSubject = getEmailSubjectByDepartment();

    const subject = portal === "Member" || portal === "Consumer" ? envSubject.SUBJECT_EMAIL_TO_MEMBER_CREDENTIAL : envSubject.SUBJECT_EMAIL_TO_PARTNER_CREDENTIAL;

    let credential: { email: string; password: string | undefined; hrefValue: string | null | undefined } = {
      email: "",
      password: "",
      hrefValue: "",
    };
    if(process.env.MAILBOX_URL?.includes("maildrop")) {
      const mailDropHandler = new MaildropHandler();
      const emailContent = await mailDropHandler.readEmail(email, subject, { format: 'html'});

      const accCredential = mailDropHandler.parseCredentialsFromMailBody(emailContent.content);
      credential = {
        email: email,
        password: accCredential.password,
        hrefValue: accCredential.loginUrl,
      };
    }
    else {
    credential = await this.emailServicePage.extractAccountCredentialFromInBox(email, subject);
    }
    await this.loginPage.fillLoginForm(credential.hrefValue!, email, credential.password!);

    await this.loginPage.changePassword(credential.password!, newPassword);

  };

  public activateSignedUpCustomer = async (email: string) => {
    const subject = "Verify your email address";

    const credential = await this.emailServicePage.extractAccountCredentialFromInBox(email, subject);

    await this.page.goto(credential.hrefValue!);
  };

  public validateReceivedOneEmailForCreatingCustomer = async (email: string) => await this.emailServicePage.validateReceivedOneEmailForCreatingCustomer(email);

  public validateTimeLimitedEmailForCreatingCustomer = async (email: string) => {
    const subject = "Verify your email address";
    await this.emailServicePage.validateTimeLimitedEmailForCreatingCustomer(email, subject);
  };

}
