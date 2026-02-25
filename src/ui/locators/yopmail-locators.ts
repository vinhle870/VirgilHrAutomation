import { Locator } from "@playwright/test";

export class YopMailPageLocators {
  // select the direct parent element of the paragraph containing the label text
  static searchingInput: string = "//input[@id='login']";

  static searchingButton: string =
    "//button[@title='Check Inbox @yopmail.com']";

  static invitationAcceptanceButton: string = "//a[text()='Accept Invite']";

  static iframe: string = "//iframe[@id='ifmail']";

  static iframeOfCapcha = "//iframe[title='reCAPTCHA']";

  static anchorCapcha = "#recaptcha-anchor";
}
