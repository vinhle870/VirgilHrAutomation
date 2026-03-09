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

    return username + "@" + (await firstDomain.textContent());
  }

  async moveToRegisterPage(): Promise<void> {
    const url = "https://tempemailfree.com/";
    const timeout = 30000;

    await this.page.goto(url);
    await this.page.waitForURL(url, { timeout });

    const joinTeamModalElement = await this.getLocator(
      TempEmailFreeLocators.joinTeamModal,
    );

    await joinTeamModalElement.click();
  }
}
