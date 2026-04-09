export class PeoConsultantAddition {
  public static readonly nameInput =
    "xpath=//span[text()='Name']/parent::label/following-sibling::div//input";
  public static readonly emailInput =
    "xpath=//h2[text()='Add PEO/HR Consultant']/ancestor::div//span[text()='Email']/parent::label/following-sibling::div//input";
  public static readonly firstNameInput =
    "xpath=//span[text()='First Name']/parent::label/following-sibling::div//input";
  public static readonly lastNameInput =
    "xpath=//span[text()='Last Name']/parent::label/following-sibling::div//input";
  public static readonly phoneNumberInput =
    "xpath=//span[contains(text(),'Contact Number')]/parent::label/following-sibling::div//input";
  public static readonly jobTitleInput =
    "xpath=//span[text()='Job title']/parent::label/following-sibling::div//input";
  public static readonly customBranding =
    "xpath=//span[text()='Custom Branding']/parent::label/following-sibling::div//span";
  public static readonly customBenefitsPlan =
    "xpath=//span[text()='Custom Benefits Plans']/parent::label/following-sibling::div//span";
  public static readonly external =
    "xpath=//span[contains(text(),'External')]/parent::label";
  public static readonly internal =
    "xpath=//span[contains(text(),'Internal')]/parent::label";
  public static readonly backURL =
    "xpath=//span[contains(text(),'Back Url')]/parent::label/following-sibling::div//input";
  public static readonly backText =
    "xpath=//span[contains(text(),'Back Text')]/parent::label/following-sibling::div//input";
  public static readonly createButton =
    "xpath=//button[contains( text(), 'Create')]";
}
