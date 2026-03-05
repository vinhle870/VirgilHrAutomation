export class TempEmailFreeLocators {
  static readonly newButton = "tempemailfree";
  static readonly usernameInput = "(//input[@placeholder='Enter Username'])[2]";
  static readonly selectDomainDropdown =
    "(//input[@placeholder='Select Domain'])[2]";
  static readonly domainOption = "(//a[text()='polandcampus.edu.pl'])[2]";
  static readonly createEmailButton = "(//input[@value='Create'])[2]";

  public static getEmail(username: string): string {
    const locator = `(//div[contains(text(),'${username}')])[2]`;

    return locator;
  }

  public static readonly joinTeamModal =
    "//div[text()='HR Compliance: Join your team']";

  public static readonly emailModal = "//*[@id='email_id']";

  public static choosenEmail(email: string): string {
    const locator = `div[@id='email_id']/parent::div/following-sibling::div[1]/div/a[text()=${email}]`;

    return locator;
  }
}
