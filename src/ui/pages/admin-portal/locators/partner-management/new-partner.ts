export class CreateNewPartnerModalLocator {
  public static readonly department =
    "xpath=(//span[text()='Department']/parent::label/following-sibling::div/div/div/input)[2]";

  public static readonly partnerLevel =
    "xpath=//span[text()='Partner Level']/parent::label/following-sibling::div/div/div/input";

  public static readonly nameOfPartner =
    "xpath=//span[text()='Name']/parent::label/following-sibling::div/div/input";

  public static readonly subDomain =
    "xpath=//span[text()='Subdomain']/parent::label/following-sibling::div/div/input";

  public static readonly paymentOption =
    "xpath=//span[text()='Payment options']/parent::label/following-sibling::div/div/div/input";

  public static readonly isPublic =
    "xpath=//span[contains(text(),'Is Public')]/parent::label/following-sibling::div/span";

  public static readonly productsType =
    "xpath=//span[contains(text(),'Products Type')]/parent::label/following-sibling::div/div[@data-test-name='input']/div/input";

  public static readonly email =
    "xpath=//span[text()='Email']/parent::label/following-sibling::div/div/input";

  public static readonly firstName =
    "xpath=//span[text()='First Name']/parent::label/following-sibling::div/div/input";

  public static readonly lastName =
    "xpath=//span[text()='Last Name']/parent::label/following-sibling::div/div/input";

  public static readonly jobTitle =
    "xpath=//span[text()='Job title']/parent::label/following-sibling::div/div/input";

  public static readonly contactNumber =
    "xpath=//span[text()='Contact Number']/parent::label/following-sibling::div/div/div[@class='pos-relative flex-grow-1']/input";

  public static readonly bankTransfer =
    "xpath=//span[text()='Bank Transfer']/parent::label/following-sibling::div/input/following-sibling::span";

  public static readonly plan =
    "xpath=(//span[contains(text(),'Plan')])[2]/parent::label/following-sibling::div/div/div/input";

  public static readonly billingCycle =
    "xpath=//span[normalize-space(.)='Billing Cycle']/parent::label/following-sibling::div/label/span[@class='b-radio__label']";

  public static readonly internal =
    "xpath=//span[contains(text(),'Internal')]/preceding-sibling::span";

  public static readonly createPartnerButton =
    "xpath=//button[contains(text(),'Create')]";

  public static readonly confirmButton =
    "//button[text()=' Confirm & Create ']";

  public static readonly duplicatedEmailText =
    " //p[contains(text(),'Email is existed')]";

   
}
