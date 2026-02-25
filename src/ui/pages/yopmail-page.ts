import { HomePageLocators } from "../locators/home-page-locators";
import { Page, expect, Locator } from "@playwright/test";
import { LocatorHandling } from "../../utilities/locator-handling";
import { YopMailPageLocators } from "../locators/yopmail-locators";
import { MemberPageLocators } from "../locators/member-locators";

export class YopMailPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }
  public async acceptInvitation(email: string) {
    const url = "https://yopmail.com/";

    const timeout: number = 30000;

    await this.page.goto(url);

    await this.page.waitForURL(url, { timeout: timeout });

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

    await this.page.waitForURL(/.*wm.*/, { timeout: timeout });

    const invitationAcceptanceButton = await LocatorHandling.getLocatorInIframe(
      this.page,
      YopMailPageLocators.iframe,
      YopMailPageLocators.invitationAcceptanceButton,
    );

    const acceptingURL = await invitationAcceptanceButton.getAttribute("href");

    expect(acceptingURL).toContain("member");

    await this.page.goto(acceptingURL!);

    await this.page.waitForURL(acceptingURL!, { timeout: timeout });

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

    const joinTeamButtonElement = await LocatorHandling.getLocator(
      this.page,
      MemberPageLocators.joinTeamButton,
    );

    await joinTeamButtonElement.click();

    await this.page.waitForURL("https://member-virgilhr-qa.bigin.top/home", {
      timeout: timeout,
    });

    expect(this.page.url()).toContain(
      "https://member-virgilhr-qa.bigin.top/home",
    );
  }
}
