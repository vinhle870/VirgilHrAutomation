export class CommonPartnerLocator {
  public static readonly createNewPartnerButton = "xpath=//button[text()=' New Partner ']";
  public static readonly filterPartnerButton = "xpath=//button[text()=' Filter ']";
  public static readonly detailButton = "//tr[td//p[text()='phoneNumberValue']]//button[normalize-space()='Details']";
  public static readonly sortingButton = "xpath=//button[contains(text(),'Sort by')]";
}
