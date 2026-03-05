import { BasePage } from "../base-page";
import { TempEmailFreeLocators } from "./locators";

export class TempEmailFreePage extends BasePage {
  async createEmail(username: string): Promise<string> {
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

    const emailElement = await this.getLocator(
      TempEmailFreeLocators.getEmail(username),
    );

    return (await emailElement.textContent())!;
  }

  async moveToRegisterPage(email: string): Promise<void> {
    const url = "https://tempemailfree.com/";
    const timeout = 30000;

    await this.page.goto(url);
    await this.page.waitForURL(url, { timeout });

    const emailModalElement = await this.getLocator(
      TempEmailFreeLocators.emailModal,
    );
    //Click to show all existing emails
    await emailModalElement.click();
    //Choose an email to get inviting link
    const choosenEmail = await this.getLocator(
      TempEmailFreeLocators.choosenEmail(email),
    );

    await choosenEmail.click();

    const joinTeamModalElement = await this.getLocator(
      TempEmailFreeLocators.joinTeamModal,
    );

    await joinTeamModalElement.click();
  }
}
