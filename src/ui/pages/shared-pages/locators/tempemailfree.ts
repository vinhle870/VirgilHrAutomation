export class TempEmailFreeLocators {
  static readonly newButton: string = "(//div[text()='New'])[2]";
  static readonly usernameInput: string = "(//input[@placeholder='Enter Username'])[2]";
  static readonly selectDomainDropdown: string = "(//input[@placeholder='Select Domain'])[2]";
  static readonly domainOption: string = "(//a[text()='polandcampus.edu.pl'])[2]";
  static readonly createEmailButton: string = "(//input[@value='Create'])[2]";

  public static readonly iframeToAcceptIvite: string = "xpath=//iframe";

  public static readonly acceptInviteButton: string = "xpath=//a[contains(text(),'Accept Invite')]";

  public static readonly refreshButton: string = "(//div[text()='Refresh'])[2]";

  public static emailSubject: string = "xpath=//div[contains(@class,'w-1/2')][contains(text(),'subjectValue')]";

  public static readonly credentialIframe: string = "iframe.min-h-tm-half";

  public static readonly credentialUsername: string = "p:has-text('Username')";
  public static readonly credentialPassword: string = "p:has-text('Password')";
  public static readonly emptyInbox: string = "xpath=//div[text()='Empty Inbox']";
}
