import { Page } from "@playwright/test";
import { BasePage } from "../base-page";
import { WelcomeModalLocators } from "./locators";

export class WelcomeModal extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Closes the welcome modal with the provided option.
   */
  async closeModalWithOption(option: string) {
    const logger = (console.debug ?? console.log).bind(console);
    logger(`==================[Close Welcome Modal] with option: ${option}\n`);

    if (option === "readyDiveIn") {
      const btnReadyDiveIn = await this.getLocator(WelcomeModalLocators.readyDiveIn, 60000);
      if(await btnReadyDiveIn.isVisible()) {
        await btnReadyDiveIn.click();
      }

    }

    const urlRegex = new RegExp(`.*/home$`);
    await this.page.waitForURL(urlRegex);
  }

  public closeSetupLaterModal = async () => {
    try {
      await (await this.getLocator(WelcomeModalLocators.setUpLater)).click({ timeout: 5000 });
    } catch (error) {}
  };
}
