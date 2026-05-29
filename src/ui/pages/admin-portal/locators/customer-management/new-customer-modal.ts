export class CreateNewCustomerModalLocator {
  public static readonly firstName = "xpath=//span[text()='First Name']/parent::label/following-sibling::div/div/input";
  public static readonly lastName = "xpath=//span[text()='Last Name']/parent::label/following-sibling::div/div/input";
  public static readonly email = "xpath=//span[text()='Email']/parent::label/following-sibling::div/div/input";
  public static readonly companyName = "xpath=//span[text()='Company Name']/parent::label/following-sibling::div/div/input";
  public static readonly jobTitle = "xpath=//span[text()='Job Title']/parent::label/following-sibling::div/div/input";
  public static readonly contactNumber = "xpath=//span[text()='Contact Number']/parent::label/following-sibling::div//input[@maxlength='25']";
  public static readonly department = "xpath=//span[text()='Department']/parent::label/following-sibling::div//input";
  public static readonly officialSubscription = "xpath=//span[text()='Subscription Type']/parent::label/following-sibling::div//span[contains(text(), 'Official Subscription ')]";
  public static readonly freeTrial = "xpath=//span[text()='Subscription Type']/parent::label/following-sibling::div//span[contains(text(), 'Free Trial')]";
  public static readonly bankTranfer = "xpath=//span[text()='Bank Transfer']/parent::label/following-sibling::div//span]";
  public static readonly companySize = "xpath=//span[text()='Company Size']/parent::label/following-sibling::div//input";
  public static readonly payYear = "xpath=//span[text()='Pay Yearly']/parent::label/following-sibling::div//span";
  public static readonly external = "xpath=//span[text()='User Type']/parent::label/following-sibling::div//span[contains(text(),'External')]";
  public static readonly internal = "xpath=//span[text()='User Type']/parent::label/following-sibling::div//span[contains(text(),'Internal')]";
  public static readonly business = "xpath=//span[text()='Business Type']/parent::label/following-sibling::div//span[contains(text(),'Business')]";
  public static readonly consultant = "xpath=//span[text()='Business Type']/parent::label/following-sibling::div//span[contains(text(),'Consultant')]";
  public static readonly industry = "xpath=//span[text()='Industry']/parent::label/following-sibling::div//input";
  public static readonly numberOfEmployee = "xpath=//span[text()='Total Number of Employees']/parent::label/following-sibling::div//input";
  public static readonly statesOfCompany = "xpath=//span[text()='State(s)']/parent::label/following-sibling::div//input";
  public static readonly numberOfEmployeesPerState = "xpath=//p[text()='stateValue']/parent::div/following-sibling::div//input";
  public static readonly separateEmployeeButton = "xpath=//p[contains(text(),'+ Specify Number of Employees Per State')]";
  public static readonly createButton = "xpath=//h2[text()='Add New Customer']/parent::div/parent::div/following-sibling::div//button[contains(text(),'Add New Customer')]";
  public static readonly confirmButton = "xpath=//button[contains(text(),'Confirm & Create')]";
  public static readonly contentAvailability = "xpath=//p[contains(text(),'country')]";
}
