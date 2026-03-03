export class YopMailLocators {
  static readonly searchInput = "//input[@id='login']";
  static readonly searchButton =
    "//button[@title='Check Inbox @yopmail.com']";
  static readonly acceptInvite = "//a[text()='Accept Invite']";
  static readonly mailIframe = "//iframe[@id='ifmail']";
  static readonly captchaIframe = "//iframe[title='reCAPTCHA']";
  static readonly captchaAnchor = "#recaptcha-anchor";
}
