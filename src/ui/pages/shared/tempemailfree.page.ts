import delay from "src/utilities/delay";
import { BasePage } from "../base-page";
import { TempEmailFreeLocators } from "./locators";
import { el } from "@faker-js/faker/.";
import { Locator } from "playwright/test";

export class TempEmailFreePage extends BasePage {
  public async createNewEmail(username: string, pageStatus = false) {
    const logger = (console.debug ?? console.log).bind(console);
    logger(`==================[Yopmail Invitation] email: ${username}\n`);

    await delay(5000);

    const url = "https://tempemailfree.com/";

    await this.page.goto(url);
    await this.page.waitForURL(url, { timeout: 30000 });

    const newButtonElement = await this.getLocator(TempEmailFreeLocators.newButton);

    await newButtonElement.click();

    const usernameInputElement = await this.getLocator(TempEmailFreeLocators.usernameInput);

    await usernameInputElement.waitFor({ state: "visible" });

    await usernameInputElement.fill(username);

    const selectDomainDropdownElement = await this.getLocator(TempEmailFreeLocators.selectDomainDropdown);

    await selectDomainDropdownElement.click();

    const firstDomain = await this.getLocator(TempEmailFreeLocators.domainOption);

    await firstDomain.click();

    const createEmailButtonElement = await this.getLocator(TempEmailFreeLocators.createEmailButton);

    await createEmailButtonElement.click();

    await newButtonElement.waitFor({ state: "visible" });

    if (pageStatus) return this.page;
  }

  public async getInvitationEmailLocator(page = this.page): Promise<Locator> {
    TempEmailFreeLocators.portalCredential = TempEmailFreeLocators.portalCredential.replace("portalValue", "Partner");

    return page.locator(TempEmailFreeLocators.portalCredential);
  }

  public async acceptJoinTeam(username: string): Promise<void> {
    await this.createNewEmail(username);

    if (TempEmailFreeLocators.portalCredential.includes("Partner")) TempEmailFreeLocators.portalCredential = TempEmailFreeLocators.portalCredential.replace("Partner", "Join your team");
    else if (TempEmailFreeLocators.portalCredential.includes("User")) TempEmailFreeLocators.portalCredential = TempEmailFreeLocators.portalCredential.replace("User", "Join your team");
    else if (TempEmailFreeLocators.portalCredential.includes("Consumer")) TempEmailFreeLocators.portalCredential = TempEmailFreeLocators.portalCredential.replace("Consumer", "Join your team");
    else TempEmailFreeLocators.portalCredential = TempEmailFreeLocators.portalCredential.replace("portalValue", "Join your team");

    try {
      await (await this.getLocator(TempEmailFreeLocators.portalCredential)).first().click();
    } catch (error) {
      await (await this.getLocator(TempEmailFreeLocators.refreshButton)).click();

      await (await this.getLocator(TempEmailFreeLocators.portalCredential)).first().click();
    }

    const acceptInviteButtonElement = await this.getLocatorInIframe(TempEmailFreeLocators.iframeToAcceptIvite, TempEmailFreeLocators.acceptInviteButton);

    await acceptInviteButtonElement.scrollIntoViewIfNeeded();

    await acceptInviteButtonElement.click();
  }

  public async credential(username: string, portal = "Partner"): Promise<any> {
    await this.createNewEmail(username);

    if (portal !== "Partner" && portal !== "Member" && portal !== "Consumer") throw new Error("Wrong portal");

    if (portal === "Partner") TempEmailFreeLocators.portalCredential = TempEmailFreeLocators.portalCredential.replace("portalValue", "Partner");
    else if (portal === "Member") {
      if (TempEmailFreeLocators.portalCredential.includes("Partner")) TempEmailFreeLocators.portalCredential = TempEmailFreeLocators.portalCredential.replace("Partner", "User");
      else TempEmailFreeLocators.portalCredential = TempEmailFreeLocators.portalCredential.replace("portalValue", "User");
    } else if (portal === "Consumer") {
      if (TempEmailFreeLocators.portalCredential.includes("Partner")) TempEmailFreeLocators.portalCredential = TempEmailFreeLocators.portalCredential.replace("Partner", "Consumer");
      else TempEmailFreeLocators.portalCredential = TempEmailFreeLocators.portalCredential.replace("portalValue", "Consumer");
    }

    await (await this.getLocator(TempEmailFreeLocators.portalCredential)).first().click();

    let credentialFrame;

    credentialFrame = this.page.frameLocator(TempEmailFreeLocators.credentialIframe).last();

    const usernameRaw = await credentialFrame.locator(TempEmailFreeLocators.credentialUsername).first().textContent();

    const email = usernameRaw?.replace(/Username\s*:/i, "").trim();

    const passwordRaw = await credentialFrame.locator(TempEmailFreeLocators.credentialPassword).first().textContent();
    const password = passwordRaw?.replace(/Password\s*:/i, "").trim();

    let loginbutton = credentialFrame.getByRole("link", { name: "Login" });

    try {
      await loginbutton.click({ timeout: 5000 });
    } catch (error) {
      credentialFrame = this.page.frameLocator(TempEmailFreeLocators.credentialIframe).first();

      loginbutton = credentialFrame.getByRole("link", { name: "Login" });

      await loginbutton.click({ timeout: 30000 });
    }

    const credentialedPage = await this.page.context().waitForEvent("page");

    await credentialedPage.waitForLoadState();

    return { email, password, credentialedPage };
  }
}
