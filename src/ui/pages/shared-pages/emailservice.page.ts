import delay from "src/utilities/delay";
import { BasePage } from "../base-page";
import { TempEmailFreeLocators, BeeinboxLocators } from "./locators";
import { expect } from "@playwright/test";
import { Partner } from "src/objects/ipartner";
import { getEmailSubjectByDepartment } from "src/constant/department-data";
import { EmailCredentials } from "src/utilities/email-handling";

export class EmailServicePage extends BasePage {
  private readonly mailboxUrl = process.env.MAILBOX_URL || "";

  public acceptJoinTeamInvite = async (userEmail: string): Promise<void> => {


    await this.registerNewEmail(userEmail);

    const emailSubject = getEmailSubjectByDepartment().SUBJECT_EMAIL_TO_JOIN_TEAM;

    await this.openEmailBySubject(emailSubject!);

    const isBeeinbox = this.mailboxUrl.includes("beeinbox");
    const acceptInviteBtn = await this.getLocatorInIframe(
      isBeeinbox ? TempEmailFreeLocators.credentialIframe : TempEmailFreeLocators.iframeToAcceptIvite,
      TempEmailFreeLocators.acceptInviteButton
    );

    await acceptInviteBtn.scrollIntoViewIfNeeded();

    const hrefValue = await acceptInviteBtn.getAttribute("href");

    await this.page.goto(hrefValue!);
  };

  public extractAccountCredentialFromInBox = async (email: string, subject: string): Promise<EmailCredentials> => {
    await this.registerNewEmail(email);

    await this.openEmailBySubject(subject);

    let emailContentFrame = this.page.locator(TempEmailFreeLocators.credentialIframe).last().contentFrame();

    let passwordRaw, password, hrefValue;

    let loginLink = emailContentFrame.getByRole("link", { name: "Login" });

    const isVerify = subject.includes("Verify your email address");

    if (isVerify) loginLink = emailContentFrame.getByRole("link", { name: "Confirm email" });
    else {
      passwordRaw = await emailContentFrame.locator(TempEmailFreeLocators.credentialPassword).first().textContent();
      password = passwordRaw?.replace(/Password\s*:/i, "").trim();
    }

    try {
      await loginLink.scrollIntoViewIfNeeded({ timeout: 5000 });
    } catch {
      emailContentFrame = this.page.locator(TempEmailFreeLocators.credentialIframe).first().contentFrame();
      loginLink = isVerify
        ? emailContentFrame.getByRole("link", { name: "Confirm email" })
        : emailContentFrame.getByRole("link", { name: "Login" });
      await loginLink.scrollIntoViewIfNeeded({ timeout: 5000 });
    }

    hrefValue = await loginLink.getAttribute("href");
    if (!hrefValue) throw new Error(`Login URL not found in email (subject: "${subject}")`);

    return { password: password ?? "", loginUrl: hrefValue };
  };

  public registerNewEmail = async (userEmail: string) => {
    await delay(5000);
    const emailLocalPart = userEmail.split("@")[0];

    await this.page.goto(this.mailboxUrl);
    await this.page.waitForURL(this.mailboxUrl, { timeout: 30000 });

    const newBtn = await this.getLocator(TempEmailFreeLocators.newButton);

    await newBtn.click();

    const isBeeinbox = this.mailboxUrl.includes("beeinbox");
    let usernameInput = await this.getLocator(isBeeinbox ? BeeinboxLocators.usernameInput : TempEmailFreeLocators.usernameInput);

    await usernameInput.waitFor({ state: "visible" });

    await usernameInput.fill(emailLocalPart);

    if (!isBeeinbox) {
      const DomainDropdown = await this.getLocator(TempEmailFreeLocators.selectDomainDropdown);

      await DomainDropdown.click();

      const firstDomain = await this.getLocator(TempEmailFreeLocators.domainOption);

      await firstDomain.click();
    }

    const createEmailBtn = await this.getLocator(TempEmailFreeLocators.createEmailButton);

    await createEmailBtn.click();

    await newBtn.waitFor({ state: "visible" });
  };

  public openEmailBySubject = async (subject: string) => {
    const emailLocator = TempEmailFreeLocators.emailSubject.replace("subjectValue", subject);
    for (let i = 0; i < 10; i++) {
      try {
        const el = await this.getLocator(emailLocator);
        try {
          await el.first().scrollIntoViewIfNeeded();
          await el.first().click({ timeout: 5000, force: true });
        } catch {
          await el.last().scrollIntoViewIfNeeded();
          await el.last().click({ timeout: 5000, force: true });
        }
        return;
      } catch {
        await (await this.getLocator(TempEmailFreeLocators.refreshButton)).click();
        await delay(3000);
      }
    }
  };

  public validateReceivedOneEmailForCreatingCustomer = async (email: string) => {
    await this.registerNewEmail(email);

    const subject = "Verify your email address";
    const emailSubjectLnk = await this.getLocator(TempEmailFreeLocators.emailSubject.replace("subjectValue", subject));

    await expect(emailSubjectLnk.first()).toBeVisible();
  };

  public validateReceivedOneEmail = async (partnerInfo?: Partner) => {
    await this.registerNewEmail(partnerInfo!.accountInfo?.email!);

    const partnerCredentialCategory = this.page.locator(TempEmailFreeLocators.emailSubject.replace("subjectValue", "Partner")).first();

    await expect(partnerCredentialCategory).toBeVisible({ timeout: 30000 });

    const memberCredentialCategory = this.page.locator(TempEmailFreeLocators.emailSubject.replace("subjectValue", "User")).first();

    await expect(memberCredentialCategory).toBeHidden();
  };

  public validateReceivedTwoEmails = async (partnerInfo?: Partner) => {
    await this.registerNewEmail(partnerInfo!.accountInfo?.email!);

    const partnerEmail = this.page.locator(TempEmailFreeLocators.emailSubject.replace("subjectValue", "Partner")).first();

    await expect(partnerEmail).toBeVisible({ timeout: 30000 });

    const memberEmail = this.page.locator(TempEmailFreeLocators.emailSubject.replace("subjectValue", "User")).first();

    await expect(memberEmail).toBeVisible();
  };

  public validateTimeLimitedEmailForCreatingCustomer = async (email: string, subject: string) => {
    await this.registerNewEmail(email);

    await this.openEmailBySubject(subject);

    const emailContentFrame = this.page.locator(TempEmailFreeLocators.credentialIframe).last().contentFrame();

    const timeLimitText = emailContentFrame.locator("strong:has-text('hours')");

    await expect(timeLimitText).toBeVisible();
  };
}
