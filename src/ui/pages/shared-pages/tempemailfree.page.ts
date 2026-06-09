import delay from "src/utilities/delay";
import { BasePage } from "../base-page";
import { TempEmailFreeLocators } from "./locators";
import { expect } from "@playwright/test";
import { Partner } from "src/objects/ipartner";
import { getEmailSubjectForDepartment } from "src/constant/department-data";

export class TempEmailFreePage extends BasePage {
  /**
   * Accepts the invitation by clicking the join team button in the email with the specific subject, then clicks the accept invite button in the opened iframe.
   * @param userEmail
   */
  public async acceptJoinTeamInvite(userEmail: string): Promise<void> {
    await this.registerNewEmail(userEmail);

    const emailSubject = getEmailSubjectForDepartment().SUBJECT_EMAIL_TO_JOIN_TEAM;

    await this.openEmailBySubject(emailSubject!);

    const acceptInviteBtn = await this.getLocatorInIframe(TempEmailFreeLocators.iframeToAcceptIvite, TempEmailFreeLocators.acceptInviteButton);

    await acceptInviteBtn.scrollIntoViewIfNeeded();

    const hrefValue = await acceptInviteBtn.getAttribute("href");

    await this.page.goto(hrefValue!);
  }

  public async extractAccountCredentialFromInBox(email: string, subject: string): Promise<{ email: string; password: string | undefined; hrefValue: string | null | undefined }> {
    //Register new email to access the inbox
    await this.registerNewEmail(email);

    //Open the email with the specific subject

    await this.openEmailBySubject(subject);

    let emailContentFrame;

    emailContentFrame = this.page.locator(TempEmailFreeLocators.credentialIframe).last().contentFrame();

    let passwordRaw, password, hrefValue;

    let loginLink = emailContentFrame.getByRole("link", { name: "Login" });

    if (subject.includes("Verify your email address")) loginLink = emailContentFrame.getByRole("link", { name: "Confirm email" });
    else {
      passwordRaw = await emailContentFrame.locator(TempEmailFreeLocators.credentialPassword).first().textContent();
      password = passwordRaw?.replace(/Password\s*:/i, "").trim();
    }

    try {
      await loginLink.scrollIntoViewIfNeeded({ timeout: 5000 });
    } catch (error) {
      emailContentFrame = this.page.locator(TempEmailFreeLocators.credentialIframe).first().contentFrame();

      if (subject.includes("Verify your email address")) loginLink = emailContentFrame.getByRole("link", { name: "Confirm email" });

      loginLink = emailContentFrame.getByRole("link", { name: "Login" });

      await loginLink.scrollIntoViewIfNeeded({ timeout: 5000 });
    }

    //Get href
    hrefValue = await loginLink.getAttribute("href");

    return { email, password, hrefValue };
  }

  public async registerNewEmail(userEmail: string) {
    await delay(5000);

    const emailLocalPart = userEmail.split("@")[0];

    const url = process.env.MAILBOX_URL || "";
    await this.page.goto(url);

    await this.page.waitForURL(url, { timeout: 30000 });

    const newBtn = await this.getLocator(TempEmailFreeLocators.newButton);

    await newBtn.click();

    const usernameInput = await this.getLocator(TempEmailFreeLocators.usernameInput);

    await usernameInput.waitFor({ state: "visible" });

    await usernameInput.fill(emailLocalPart);

    const DomainDropdown = await this.getLocator(TempEmailFreeLocators.selectDomainDropdown);

    await DomainDropdown.click();

    const firstDomain = await this.getLocator(TempEmailFreeLocators.domainOption);

    await firstDomain.click();

    const createEmailBtn = await this.getLocator(TempEmailFreeLocators.createEmailButton);

    await createEmailBtn.click();

    await newBtn.waitFor({ state: "visible" });
  }

  public async openEmailBySubject(subject: string): Promise<void> {
    const emailSubjectLnk = TempEmailFreeLocators.emailSubject.replace("subjectValue", subject);

    //Click on Email Subject
    await (await this.getLocator(emailSubjectLnk)).first().click({ timeout: 5000 });
  }

  public async validateReceivedOneEmail(partnerInfo?: Partner) {
    await this.registerNewEmail(partnerInfo!.accountInfo?.email!);

    const partnerCredentialCategory = this.page.locator(TempEmailFreeLocators.emailSubject.replace("subjectValue", "Partner")).first();

    await expect(partnerCredentialCategory).toBeVisible({ timeout: 30000 });

    const memberCredentialCategory = this.page.locator(TempEmailFreeLocators.emailSubject.replace("subjectValue", "User")).first();

    await expect(memberCredentialCategory).toBeHidden();
  }

  public async validateReceivedTwoEmails(partnerInfo?: Partner) {
    await this.registerNewEmail(partnerInfo!.accountInfo?.email!);

    const partnerEmail = this.page.locator(TempEmailFreeLocators.emailSubject.replace("subjectValue", "Partner")).first();

    await expect(partnerEmail).toBeVisible({ timeout: 30000 });

    const memberEmail = this.page.locator(TempEmailFreeLocators.emailSubject.replace("subjectValue", "User")).first();

    await expect(memberEmail).toBeVisible();
  }
}
