export class LoginFormLocators {
  static readonly username = "//input[@placeholder='Email']";
  static readonly password = "//input[@placeholder='Password']";
  static readonly signIn = "//*[@type='submit']";
  public static readonly accountNotExist = "xpath=//span[text()='This account does not exist']";
}
