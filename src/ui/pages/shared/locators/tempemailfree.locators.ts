export class TempEmailFreeLocators {
  static readonly newButton = "(//div[text()='New'])[2]";
  static readonly usernameInput = "(//input[@placeholder='Enter Username'])[2]";
  static readonly selectDomainDropdown =
    "(//input[@placeholder='Select Domain'])[2]";
  static readonly domainOption = "(//a[text()='polandcampus.edu.pl'])[2]";
  static readonly createEmailButton = "(//input[@value='Create'])[2]";

  public static readonly joinTeamModal =
    "xpath=(//div[contains(text(),'HR Compliance: Join your team')])[1]";

  public static readonly iframeToAcceptIvite = "xpath=//iframe";

  public static readonly acceptInviteButton =
    "xpath=//a[contains(text(),'Accept Invite')]";

  public static readonly refreshButton = "(//div[text()='Refresh'])[2]";
}
