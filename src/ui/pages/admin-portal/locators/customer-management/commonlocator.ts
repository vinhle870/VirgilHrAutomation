export class CommonCustomerLocator {
  public static readonly createNewCustomerButton =
    "xpath=//button[contains(text(),'Create new')]";
  public static readonly filterCustomerButton =
    "xpath=//button[contains(text(),'Filter')]";
  public static readonly sortButton =
    "xpath=//button[contains(text(),'Sort by')]";
  public static readonly searchingInput =
    "xpath=//input[@placeholder='Search name, email, company name']";
  public static readonly searchingbutton =
    "xpath=//input[@placeholder='Search name, email, company name']/ancestor::form//button";
  public static readonly exportExcelFileButton =
    "xpath=//button[contains(text(),'Export CSV file')]";
}
