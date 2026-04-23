export class CommonPortalLocators {
  public static readonly emailInputTologin = "xpath=//input[@placeholder='Email']";
  public static readonly currentPasswordInput = "xpath=//input[@placeholder='Current password']";
  public static readonly newPassword = "xpath=//input[@placeholder='New password']";
  public static readonly continueButton = "xpath=//button/span[text()='Continue']";
  public static readonly passwordInput = "//input[@type='password']";
  public static readonly signInButton = "//button[.//span[normalize-space()='Sign In']]";
  public static readonly userSettingsButton = "xpath=//button[@id='v-step-user-setting']";
  public static readonly emailInput = "xpath=//input[@placeholder='Enter email']";
  public static readonly firstNameInput = "xpath=//input[@placeholder='Enter first name']";
  public static readonly lastNameInput = "xpath=//input[@placeholder='Enter last name']";
  public static readonly phoneNumberInput = "xpath=//input[@placeholder='Enter phone number']";
  public static readonly jobTitleInput = "xpath=//input[@placeholder='Enter job title']";
  public static readonly sendInviteButton = "xpath=//button[contains(.,'Send invite')]";
  public static readonly roleInput = "xpath=//input[@placeholder='Select a role for the member']";
  public static readonly addMoreButton = "xpath=//button[contains(text(),'Add more')]";
  public static readonly popupClosingButton = "xpath=//span[contains(.,'test')]/ancestor::div[@class='b-dialog__body pt-0']/preceding-sibling::header//button";
}
