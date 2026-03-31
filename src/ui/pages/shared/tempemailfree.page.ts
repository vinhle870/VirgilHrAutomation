import { BasePage } from "../base-page";
import { TempEmailFreeLocators } from "./locators";

export class TempEmailFreePage extends BasePage {
  async createNewEmail(username: string) {
    const logger = (console.debug ?? console.log).bind(console);
    logger(`==================[Yopmail Invitation] email: ${username}\n`);

    const url = "https://tempemailfree.com/";
    const timeout = 30000;

    await this.page.goto(url);
    await this.page.waitForURL(url, { timeout });

    const newButtonElement = await this.getLocator(
      TempEmailFreeLocators.newButton,
    );

    await newButtonElement.click();

    const usernameInputElement = await this.getLocator(
      TempEmailFreeLocators.usernameInput,
    );

    await usernameInputElement.waitFor({ state: "visible" });

    await usernameInputElement.fill(username);

    const selectDomainDropdownElement = await this.getLocator(
      TempEmailFreeLocators.selectDomainDropdown,
    );

    await selectDomainDropdownElement.click();

    const firstDomain = await this.getLocator(
      TempEmailFreeLocators.domainOption,
    );

    await firstDomain.click();

    const createEmailButtonElement = await this.getLocator(
      TempEmailFreeLocators.createEmailButton,
    );

    await createEmailButtonElement.click();

    await newButtonElement.waitFor({ state: "visible" });
  }

  async acceptJoinTeam(username: string): Promise<void> {
    await this.createNewEmail(username);

    let joinTeamModalElement;
    let emptyInbox;

    try {
      joinTeamModalElement = await this.getLocator(
        TempEmailFreeLocators.joinTeamModal,
      );
      await joinTeamModalElement.click();
    } catch (e) {
      emptyInbox = this.page.locator(TempEmailFreeLocators.emptyInbox);

      while (await emptyInbox.isVisible()) {
        const refreshButtonElement = await this.getLocator(
          TempEmailFreeLocators.refreshButton,
        );

        await refreshButtonElement.click();

        joinTeamModalElement = await this.getLocator(
          TempEmailFreeLocators.joinTeamModal,
        );
        await joinTeamModalElement.click();
      }
    }

    const acceptInviteButtonElement = await this.getLocatorInIframe(
      TempEmailFreeLocators.iframeToAcceptIvite,
      TempEmailFreeLocators.acceptInviteButton,
    );

    await acceptInviteButtonElement.scrollIntoViewIfNeeded();

    await acceptInviteButtonElement.click();
  }

  public async credential(username: string): Promise<any> {
    await this.createNewEmail(username);

    let partnerCredentialEl;

    try {
      if (process.env.ENV === "prod") {
        partnerCredentialEl = await this.getLocator(
          TempEmailFreeLocators.partnerCredentialPRO,
        );

        await partnerCredentialEl.first().click();
      } else if (process.env.ENV === "qa") {
        partnerCredentialEl = await this.getLocator(
          TempEmailFreeLocators.partnerCredentialQA,
        );
        await partnerCredentialEl.click();
      }
    } catch (e) {
      const refreshButtonElement = await this.getLocator(
        TempEmailFreeLocators.refreshButton,
      );

      await refreshButtonElement.click();

      if (process.env.ENV === "prod") {
        partnerCredentialEl = await this.getLocator(
          TempEmailFreeLocators.partnerCredentialPRO,
        );

        await partnerCredentialEl.first().click();
      } else if (process.env.ENV === "qa") {
        partnerCredentialEl = await this.getLocator(
          TempEmailFreeLocators.partnerCredentialQA,
        );
        await partnerCredentialEl.click();
      }
    }

    const credentialFrame = this.page
      .frameLocator(TempEmailFreeLocators.credentialIframe)
      .first();

    const usernameRaw = await credentialFrame
      .locator(TempEmailFreeLocators.credentialUsername)
      .first()
      .textContent();

    const email = usernameRaw?.replace(/Username\s*:/i, "").trim();

    const passwordRaw = await credentialFrame
      .locator(TempEmailFreeLocators.credentialPassword)
      .first()
      .textContent();

    const password = passwordRaw?.replace(/Password\s*:/i, "").trim();

    const loginbutton = credentialFrame.getByRole("link", { name: "Login" });

    const [newPage] = await Promise.all([
      this.page.context().waitForEvent("page"),
      loginbutton.click(),
    ]);

    await newPage.waitForLoadState();

    return { email, password, newPage };
  }
}
