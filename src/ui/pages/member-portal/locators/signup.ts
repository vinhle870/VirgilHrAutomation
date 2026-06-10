export class SignUpLocators {
  public static readonly firstNameInput = "xpath=//input[@placeholder='First name']";
  public static readonly lastNameInput = "xpath=//input[@placeholder='Last name']";
  public static readonly emailInput = "xpath=//input[@placeholder='Email']";
  public static readonly passwordInput = "xpath=//input[@placeholder='Password']";
  public static readonly hrSystemDropdown = "xpath=//input[@placeholder='Which HR system do you use']";
  public static readonly createAccountBtn = "xpath=//span[text()='Create Account Now']";
  public static readonly phoneNumberInput = "xpath=//input[@placeholder='Phone number']";
  public static readonly jobTitleInput = "xpath=//input[@placeholder='Job title']";
  public static readonly companyNameInput = "xpath=//input[@placeholder='Company name']";
  public static readonly duplicatedEmailError = "xpath=//span[text()='An account with this email id already exists']";
  public static readonly missedField = "xpath=//span[text()='errormessage']";
}
