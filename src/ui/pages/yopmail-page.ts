import { HomePageLocators } from "../locators/home-page-locators";
import { Page, expect } from "@playwright/test";
import { LocatorHandling } from "../../utilities/locator-handling";
import { YopMailPageLocators } from "../locators/yopmail-locators";
import { MemberPageLocators } from "../locators/member-locators";

export class YopMailPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  public async acceptInvitation(email: string) {
    const logger = (console.debug ?? console.log).bind(console);
    logger(`==================[Yopmail Invitation] email: ${email}\n`);

    const url = "https://yopmail.com/";
    const timeout = 30000;

    await this.page.goto(url);
    await this.page.waitForURL(url, { timeout });

    const searchingInputElement = await LocatorHandling.getLocator(
      this.page,
      YopMailPageLocators.searchingInput,
    );
    await searchingInputElement.fill(email);

    const searchingButtonElement = await LocatorHandling.getLocator(
      this.page,
      YopMailPageLocators.searchingButton,
    );
    await searchingButtonElement.click();

    await this.page.waitForURL(/.*wm.*/, { timeout });

    const recaptchaIframe = this.page.locator(
      YopMailPageLocators.iframeOfCapcha,
    );

    try {
      await recaptchaIframe.waitFor({ state: "visible", timeout: 3000 });

      const anchorCapchaElement = await LocatorHandling.getLocatorInIframe(
        this.page,
        YopMailPageLocators.iframeOfCapcha,
        YopMailPageLocators.anchorCapcha,
      );
      await anchorCapchaElement.click();
    } catch (e) {
      console.log("No reCAPTCHA iframe found, continue test...");
    }

    const invitationAcceptanceButton = await LocatorHandling.getLocatorInIframe(
      this.page,
      YopMailPageLocators.iframe,
      YopMailPageLocators.invitationAcceptanceButton,
    );

    const acceptingURL = await invitationAcceptanceButton.getAttribute("href");
    expect(acceptingURL).toContain("member");

    await this.page.goto(acceptingURL!);
    await this.page.waitForURL(acceptingURL!, { timeout });

    const continueWithEmailButton = await LocatorHandling.getLocator(
      this.page,
      MemberPageLocators.continueWithEmail,
    );
    await continueWithEmailButton.click();

    const setPasswordInputElement = await LocatorHandling.getLocator(
      this.page,
      MemberPageLocators.setPasswordInput,
    );
    await setPasswordInputElement.fill("Password@123");

    // Join team
    const joinTeamButtonElement = await LocatorHandling.getLocator(
      this.page,
      MemberPageLocators.joinTeamButton,
    );
    await joinTeamButtonElement.click();

    await this.page.waitForURL("https://member-virgilhr-qa.bigin.top/home", {
      timeout,
    });

    const divingButton = await LocatorHandling.getLocator(
      this.page,
      MemberPageLocators.divingButton,
    );

    expect(divingButton).toBeVisible({ timeout: timeout });

    await divingButton.click();
  }
}
