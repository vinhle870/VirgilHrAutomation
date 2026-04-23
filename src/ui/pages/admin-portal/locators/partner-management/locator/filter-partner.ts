export class PartnerFilterLocator {
  public static readonly searchedName = "xpath=//input[@placeholder='Search name']";
  public static readonly searchedLevel = "xpath=//input[@placeholder='All level']";
  public static readonly searchedDepartment = "xpath=//input[@placeholder='Department']";
  public static readonly applyButton = "xpath=//button[contains(text(),'Apply')]";
  public static readonly oldestToLatest = "//span[@class='d-flex items-center' and span[1][normalize-space()='Oldest'] and span[2][normalize-space()='Latest']]";
  public static readonly latestToOldest = "//span[@class='d-flex items-center' and span[1][normalize-space()='Latest'] and span[2][normalize-space()='Oldest']]";
  public static readonly ascendingToDescending = "//span[@class='d-flex items-center' and span[1][normalize-space()='Ascending'] and span[2][normalize-space()='Descending']]";
  public static readonly descendingToAscending = "//span[@class='d-flex items-center' and span[1][normalize-space()='Descending'] and span[2][normalize-space()='Ascending']]";
}
