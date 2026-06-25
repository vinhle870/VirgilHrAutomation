
import { BasePage } from "../base-page";
import { TempEmailFreeLocators, BeeinboxLocators } from "./locators";
import { expect } from "@playwright/test";
import { Partner } from "src/objects/ipartner";
import { getEmailSubjectByDepartment } from "src/constant/department-data";
import { EmailCredentials, EmailMessage, YopmailHandler } from "src/utilities/email-handling";

export class EmailServicePage extends BasePage {
  private readonly mailboxUrl = process.env.MAILBOX_URL || "";

  public acceptJoinTeamInvite = async (userEmail: string): Promise<void> => {
    await this.registerNewEmail(userEmail);

    const emailSubject = getEmailSubjectByDepartment().JOIN_TEAM;

    await this.openEmailBySubject(emailSubject!);

    const isBeeinbox = this.mailboxUrl.includes("beeinbox");
    const acceptInviteBtn = await this.getLocatorInIframe(isBeeinbox ? TempEmailFreeLocators.credentialIframe : TempEmailFreeLocators.iframeToAcceptIvite, TempEmailFreeLocators.acceptInviteButton);

    await acceptInviteBtn.scrollIntoViewIfNeeded();

    const hrefValue = await acceptInviteBtn.getAttribute("href");

    await this.page.goto(hrefValue!);
  };

  public getCredentialsFromEmail = async (email: string, subject: string): Promise<EmailCredentials> => {
    const isYopmail = this.mailboxUrl.includes("yopmail");
    const isBeeinbox = this.mailboxUrl.includes("beeinbox");

    if (isYopmail) {
      const handler = new YopmailHandler();
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

      const isVerify = subject.includes("Verify your email address");
      if (isVerify) {
        const confirmMatch = emailContent!.content.match(/<a[^>]+href="([^"]+)"[^>]*>\s*Confirm email\s*<\/a>/i);
        if (!confirmMatch) throw new Error("Confirmation URL not found in email content");
        return { password: "", loginUrl: confirmMatch[1] };
      }

      return handler.parseActivateCredentialsFromMailBody(emailContent!.content);
    }
    if (isBeeinbox) return this.extractAccountCredentialFromInBox(email, subject);

    throw new Error(`Unsupported mailbox: ${this.mailboxUrl}`);
  };

  public extractAccountCredentialFromInBox = async (email: string, subject: string): Promise<EmailCredentials> => {
    await this.registerNewEmail(email);

    await this.openEmailBySubject(subject);

    let emailContentFrame = this.page.locator(TempEmailFreeLocators.credentialIframe).last().contentFrame();

    let passwordRaw, password, hrefValue;

    if (subject.includes("Join your team")) {
      const acceptInviteBtn = emailContentFrame.getByRole("link", { name: "Accept Invite" });
      hrefValue = await acceptInviteBtn.getAttribute("href");
      if (!hrefValue) throw new Error(`Accept Invite URL not found in email (subject: "${subject}")`);
      return { password: "", loginUrl: hrefValue };
    }

    const envSubject = getEmailSubjectByDepartment();
    const isActivate = subject === envSubject.CUSTOMER_ACC_ACTIVATE || subject === envSubject.PARTNER_ACC_ACTIVATE;
    const isVerify = subject.includes("Verify your email address");

    if (isActivate) {
      const passwordEl = emailContentFrame.locator(TempEmailFreeLocators.credentialPassword).first();
      await passwordEl.waitFor({ state: "visible", timeout: 10000 });
      passwordRaw = await passwordEl.textContent();
      password = passwordRaw?.replace(/Password\s*:/i, "").trim();
    }

    let loginLink = isVerify
      ? emailContentFrame.getByRole("link", { name: "Confirm email" })
      : emailContentFrame.getByRole("link", { name: "Login" });

    try {
      await loginLink.scrollIntoViewIfNeeded({ timeout: 5000 });
    } catch {
      emailContentFrame = this.page.locator(TempEmailFreeLocators.credentialIframe).first().contentFrame();
      loginLink = isVerify ? emailContentFrame.getByRole("link", { name: "Confirm email" }) : emailContentFrame.getByRole("link", { name: "Login" });
      await loginLink.scrollIntoViewIfNeeded({ timeout: 5000 });
    }

    hrefValue = await loginLink.getAttribute("href");
    if (!hrefValue) throw new Error(`Login URL not found in email (subject: "${subject}")`);

    return { password: password ?? "", loginUrl: hrefValue };
  };

  public registerNewEmail = async (userEmail: string) => {
    const emailLocalPart = userEmail.split("@")[0];

    await this.page.waitForTimeout(15000);
    await this.page.goto(this.mailboxUrl);
    await this.page.waitForURL(this.mailboxUrl, { timeout: 30000 });

    const newBtn = await this.getLocator(TempEmailFreeLocators.newButton);

    await newBtn.click();

    const isBeeinbox = this.mailboxUrl.includes("beeinbox");

    await (await this.getLocator(BeeinboxLocators.usernameInput)).fill(emailLocalPart);

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
          await el.first().dispatchEvent("click");
        } catch {
          await el.last().scrollIntoViewIfNeeded();
          await el.last().dispatchEvent("click");
        }
        return;
      } catch {
        await (await this.getLocator(TempEmailFreeLocators.refreshButton)).click();
        await this.page.waitForTimeout(3000);
      }
    }
  };

  public validateReceivedOneEmailForCreatingCustomer = async (email: string) => {
    const subject = "Verify your email address";
    if (this.mailboxUrl.includes("yopmail")) {
      const handler = new YopmailHandler();
      await expect.poll(async () => {
        try { await handler.readEmail(email, subject); return true; } catch { return false; }
      }, { timeout: 60000, intervals: [10000, 20000, 30000] }).toBe(true);
      return;
    }
    await this.registerNewEmail(email);
    const emailSubjectLnk = await this.getLocator(TempEmailFreeLocators.emailSubject.replace("subjectValue", subject));
    await expect(emailSubjectLnk.first()).toBeVisible({ timeout: 30000 });
  };

  public validateReceivedOneEmail = async (partnerInfo?: Partner) => {
    const email = partnerInfo!.accountInfo?.email!;
    if (this.mailboxUrl.includes("yopmail")) {
      const handler = new YopmailHandler();
      const { PARTNER_ACC_ACTIVATE } = getEmailSubjectByDepartment();
      await expect.poll(async () => {
        try { await handler.readEmail(email, PARTNER_ACC_ACTIVATE); return true; } catch { return false; }
      }, { timeout: 60000, intervals: [10000, 20000, 30000] }).toBe(true);
      await expect.poll(async () => {
        try { const { inbox } = await require("easy-yopmail").getInbox(email.toLowerCase()); return !inbox?.some((e: any) => e.subject?.includes("User")); } catch { return false; }
      }, { timeout: 30000, intervals: [10000, 20000] }).toBe(true);
      return;
    }
    await this.registerNewEmail(email);
    const partnerCredentialCategory = this.page.locator(TempEmailFreeLocators.emailSubject.replace("subjectValue", "Partner")).first();
    await expect(partnerCredentialCategory).toBeVisible({ timeout: 30000 });
    const memberCredentialCategory = this.page.locator(TempEmailFreeLocators.emailSubject.replace("subjectValue", "User")).first();
    await expect(memberCredentialCategory).toBeHidden();
  };

  public validateReceivedTwoEmails = async (partnerInfo?: Partner) => {
    const email = partnerInfo!.accountInfo?.email!;
    if (this.mailboxUrl.includes("yopmail")) {
      const handler = new YopmailHandler();
      const { PARTNER_ACC_ACTIVATE, CUSTOMER_ACC_ACTIVATE } = getEmailSubjectByDepartment();
      await expect.poll(async () => {
        try { await handler.readEmail(email, PARTNER_ACC_ACTIVATE); return true; } catch { return false; }
      }, { timeout: 60000, intervals: [10000, 20000, 30000] }).toBe(true);
      await expect.poll(async () => {
        try { await handler.readEmail(email, CUSTOMER_ACC_ACTIVATE); return true; } catch { return false; }
      }, { timeout: 60000, intervals: [10000, 20000, 30000] }).toBe(true);
      return;
    }
    await this.registerNewEmail(email);
    const partnerEmail = this.page.locator(TempEmailFreeLocators.emailSubject.replace("subjectValue", "Partner")).first();
    await expect(partnerEmail).toBeVisible({ timeout: 30000 });
    const memberEmail = this.page.locator(TempEmailFreeLocators.emailSubject.replace("subjectValue", "User")).first();
    await expect(memberEmail).toBeVisible({ timeout: 30000 });
  };

  public validateTimeLimitedEmailForCreatingCustomer = async (email: string, subject: string) => {
    if (this.mailboxUrl.includes("yopmail")) {
      const handler = new YopmailHandler();
      await expect.poll(async () => {
        try {
          const msg = await handler.readEmail(email, subject, { format: "html" });
          return msg.content.includes("hours");
        } catch { return false; }
      }, { timeout: 60000, intervals: [10000, 20000, 30000] }).toBe(true);
      return;
    }
    await this.registerNewEmail(email);
    await this.openEmailBySubject(subject);
    const emailContentFrame = this.page.locator(TempEmailFreeLocators.credentialIframe).last().contentFrame();
    const timeLimitText = emailContentFrame.locator("strong:has-text('hours')");
    await expect(timeLimitText).toBeVisible();
  };
}
