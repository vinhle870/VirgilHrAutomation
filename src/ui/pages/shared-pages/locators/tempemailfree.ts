export class TempEmailFreeLocators {
  static readonly newButton = "(//div[text()='New'])[2]";
  static readonly usernameInput = "(//input[@placeholder='Enter Username'])[2]";
  static readonly selectDomainDropdown = "(//input[@placeholder='Select Domain'])[2]";
  static readonly domainOption = "(//a[text()='polandcampus.edu.pl'])[2]";
  static readonly createEmailButton = "(//input[@value='Create'])[2]";

  public static readonly iframeToAcceptIvite = "xpath=//iframe";

  public static readonly acceptInviteButton = "xpath=//a[contains(text(),'Accept Invite')]";

  public static readonly refreshButton = "(//div[text()='Refresh'])[2]";

  public static emailSubject = "xpath=//div[contains(text(),'subjectValue')]";

  public static readonly credentialIframe = "iframe.min-h-tm-half";

  public static readonly credentialUsername = "p:has-text('Username')";
  public static readonly credentialPassword = "p:has-text('Password')";
  public static readonly emptyInbox = "xpath=//div[text()='Empty Inbox']";
}
