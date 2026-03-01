import { expect } from "@playwright/test";
import { BasePage } from "../base-page";
import { YopMailLocators } from "./locators";

export class YopMailPage extends BasePage {
  async getInvitationLink(email: string): Promise<string> {
    const logger = (console.debug ?? console.log).bind(console);
    logger(`==================[Yopmail Invitation] email: ${email}\n`);

    const url = "https://yopmail.com/";
    const timeout = 30000;

    await this.page.goto(url);
    await this.page.waitForURL(url, { timeout });

    const searchInput = await this.getLocator(YopMailLocators.searchInput);
    await searchInput.fill(email);

    const searchButton = await this.getLocator(YopMailLocators.searchButton);
    await searchButton.click();

    await this.page.waitForURL(/.*wm.*/, { timeout });

    await this.handleCaptchaIfPresent();

    const acceptButton = await this.getLocatorInIframe(
      YopMailLocators.mailIframe,
      YopMailLocators.acceptInvite,
    );

    const invitationUrl = await acceptButton.getAttribute("href");
    expect(invitationUrl).toContain("member");

    return invitationUrl!;
  }

  private async handleCaptchaIfPresent() {
    const recaptchaIframe = this.page.locator(YopMailLocators.captchaIframe);

    try {
      await recaptchaIframe.waitFor({ state: "visible", timeout: 3000 });

      const captchaAnchor = await this.getLocatorInIframe(
        YopMailLocators.captchaIframe,
        YopMailLocators.captchaAnchor,
      );
      await captchaAnchor.click();
    } catch {
      console.log("No reCAPTCHA iframe found, continue test...");
    }
  }
}
