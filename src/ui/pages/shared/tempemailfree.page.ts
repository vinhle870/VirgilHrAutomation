import delay from "src/utilities/delay";
import { BasePage } from "../base-page";
import { TempEmailFreeLocators } from "./locators";

export class TempEmailFreePage extends BasePage {
  private async createNewEmail(username: string) {
    const logger = (console.debug ?? console.log).bind(console);
    logger(`==================[Yopmail Invitation] email: ${username}\n`);

    await delay(10000);

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

  public async acceptJoinTeam(username: string): Promise<void> {
    await this.createNewEmail(username);

    try {
      const joinTeamModalElement = await this.getLocator(
        TempEmailFreeLocators.joinTeamModal,
      );
      await joinTeamModalElement.click();
    } catch (e) {
      const joinTeamModalElement = await this.getLocator(
        TempEmailFreeLocators.joinTeamModal,
      );
      await joinTeamModalElement.click();
    }

    const acceptInviteButtonElement = await this.getLocatorInIframe(
      TempEmailFreeLocators.iframeToAcceptIvite,
      TempEmailFreeLocators.acceptInviteButton,
    );

    await acceptInviteButtonElement.scrollIntoViewIfNeeded();

    await acceptInviteButtonElement.click();
  }

  public async credential(username: string, portal = "Partner"): Promise<any> {
    await this.createNewEmail(username);

    try {
      await (await this.getLocator(TempEmailFreeLocators.partnerCredential))
        .first()
        .click();
    } catch (e) {
      await (
        await this.getLocator(TempEmailFreeLocators.refreshButton)
      ).click();

      await (await this.getLocator(TempEmailFreeLocators.partnerCredential))
        .first()
        .click();
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
