export class PlanPageLocators {
  // select the direct parent element of the paragraph containing the label text
  static div_firstPlan: string =
    "//p[contains(text(),'Under 50 Employees')]/../../..";

  static btn_BuyNow: string = "//span[text()='Buy Now']";

  static btn_Confirm: string = "//span[text()='Confirm']";

  static iframe_Payment: string = "//iframe[@name='embedded-checkout']";

  static txt_CardNumb: string = "//*[@id='cardNumber']";

  static txt_CardExp: string = "//*[@id='cardExpiry']";

  static txt_CardCvc: string = "//*[@id='cardCvc']";

  static txt_CardHolderName: string = "//*[@id='billingName']";

  static txt_billingAddressLine1: string = "//*[@id='billingAddressLine1']";

  static txt_BillingCity: string = "//*[@id='billingLocality']";

  static btn_Subscribe: string = "//*[text()='Subscribe']";

  static btn_ReadyDiveIn: string = "//*[text()='I’m ready to dive in']";
}
