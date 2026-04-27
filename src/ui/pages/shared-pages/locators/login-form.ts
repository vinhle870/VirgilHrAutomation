export class LoginFormLocators {
  static readonly username = "//*[text()='Email']/following::input[1]";
  static readonly password = "//*[text()='Password']/following::input[1]";
  static readonly signIn = "//*[@type='submit']";
  static readonly validationMsg = "xpath=//span[text()='This account does not exist']";

  static readonly continueWithEmail = "xpath=//span[text()='Continue with email']";

  static readonly setPasswordTxt = "//input[@placeholder='Set your password']";
  static readonly joinTeamLnk = "//span[text()='Join Your Team']";

  //Change Password Form
  static readonly currentPasswordInput = "xpath=//input[@placeholder='Current password']";
  static readonly newPasswordTxt = "xpath=//input[@placeholder='New password']";
  static readonly continueBtn = "xpath=//button/span[text()='Continue']";

}
