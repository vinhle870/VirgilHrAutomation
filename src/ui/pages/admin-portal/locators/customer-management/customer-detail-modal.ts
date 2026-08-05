export class CustomerDetailModalLocator {
  public static readonly customerDetailButton = "xpath=//button[contains(text(),'Upgrade Plan')]";
  public static readonly viewDetailButton = "xpath=//button[contains(.,'View details')]";
  /** Subscription section (License Infomation -> Billing Info) -> current plan value */
  public static readonly subscriptionPlan = "xpath=//span[text()='Subscription plan']/parent::label/following-sibling::p";
}
