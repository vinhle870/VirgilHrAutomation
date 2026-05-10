export class UpgradePlanModalLocator {
  public static readonly upgradelButton =
    "xpath=//button[contains(text(),'Upgrade to')]";
  public static readonly plan = "xpath=//p[contains(text(),'planValue')]";
  public static readonly bankStranfer =
    "xpath=//span[contains(text(),'Bank Transfer')]/parent::label/following-sibling::div//span";
  public static readonly upgradeNowButton =
    "xpath=//button[contains(text(),'Upgrade Now')]";
  public static readonly requestPaymentButton =
    "xpath= //button[contains(text(),'Request Payment')]";
}
