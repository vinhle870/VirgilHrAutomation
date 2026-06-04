import { BasePage } from "../base-page";
import { MemberOnboardingLocators } from "./locators";
import { CustomerInfo } from "src/objects";
import { SignUpLocators } from "./locators/signup";

export class MemberPage extends BasePage {
  async fillFormToSignUp(customerInfo: CustomerInfo, hrSystem: string) {
    const signUpBtnEl = await this.getLocator(MemberOnboardingLocators.signUpBtn);
    await signUpBtnEl.click();

    const firstNameInputEl = await this.getLocator(SignUpLocators.firstNameInput);
    await firstNameInputEl.fill(customerInfo.accountInfo.firstName);

    const lastNameInputEl = await this.getLocator(SignUpLocators.lastNameInput);
    await lastNameInputEl.fill(customerInfo.accountInfo.lastName);

    const emailInputEl = await this.getLocator(SignUpLocators.emailInput);
    await emailInputEl.fill(customerInfo.accountInfo.email);

    const passwordInputEl = await this.getLocator(SignUpLocators.passwordInput);
    await passwordInputEl.fill(customerInfo.accountInfo.password!);

    try {
      await this.dropdown.selectByText(SignUpLocators.hrSystemDropdown, hrSystem);
    } catch (error) {
      throw new Error(`Failed to select HR system: ${hrSystem}. Error: ${(error as Error).message} does not exist in dropdown options.`);
    }

    const createAccountBtnEl = await this.getLocator(SignUpLocators.createAccountBtn);
    await createAccountBtnEl.click();

    const phoneNumberInputEl = await this.getLocator(SignUpLocators.phoneNumberInput);
    await phoneNumberInputEl.fill(customerInfo.accountInfo.phoneNumber);

    const jobtitleInputEl = await this.getLocator(SignUpLocators.jobTitleInput);
    await jobtitleInputEl.fill(customerInfo.accountInfo.jobTitle);

    const companyInputEl = await this.getLocator(SignUpLocators.companyNameInput);
    await companyInputEl.fill(customerInfo.company.companyName ?? "My company");

    await signUpBtnEl.click();
  }
}
