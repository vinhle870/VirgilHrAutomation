export class AdminPlanLocators {
  static readonly firstPlan =
    "//p[contains(text(),'Under 50 Employees')]/../../..";
  static readonly buyNow = "//span[text()='Buy Now']";
  static readonly confirm = "//span[text()='Confirm']";

  static readonly paymentIframe = "//iframe[@name='embedded-checkout']";
  static readonly cardNumber = "//*[@id='cardNumber']";
  static readonly cardExpiry = "//*[@id='cardExpiry']";
  static readonly cardCvc = "//*[@id='cardCvc']";
  static readonly cardHolderName = "//*[@id='billingName']";
  static readonly billingAddress = "//*[@id='billingAddressLine1']";
  static readonly billingCity = "//*[@id='billingLocality']";
  static readonly subscribe = "//*[text()='Subscribe']";
  static readonly readyDiveIn = "//*[text()='I\u2019m ready to dive in']";

  static generatePlanSelector(planName: string): string {
    return `//p[contains(text(),'${planName}')]/../../..`;
  }
}
