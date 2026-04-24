export class CommonAdminPortalLocator {
  public static readonly managementCategory = "xpath=//span[text()='Management']";
  public static readonly partnerManagement = "xpath=//span[text()='Partner Management']";
  public static readonly customerManagement = "xpath=//span[text()='Customer Management' and @class='fg1']";
  public static readonly username = 'xpath=//input[@placeholder="Enter your email"]';
  public static readonly password = 'xpath=//input[@placeholder="Enter your password"]';
  public static readonly loginButton = "//button[text()=' Access ']";
}
