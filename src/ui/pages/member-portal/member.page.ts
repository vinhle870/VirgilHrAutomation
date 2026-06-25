import { BasePage } from "../base-page";
import { MemberOnboardingLocators } from "./locators";
import { CustomerInfo } from "src/objects";
import { SignUpLocators } from "./locators/signup";
import { UiAssert } from "src/assertions";
import { Locator } from "playwright/test";

export class MemberPage extends BasePage {
  public fillInputOfTheFirstModalToSignUp = async (customerInfo: CustomerInfo, hasErrormessage = false) => {
    if (!hasErrormessage) await (await this.getLocator(MemberOnboardingLocators.signUpBtn)).click();

    const firstNameInputEl = await this.getLocator(SignUpLocators.firstNameInput);
    await firstNameInputEl.fill(customerInfo.accountInfo.firstName);

    const lastNameInputEl = await this.getLocator(SignUpLocators.lastNameInput);
    await lastNameInputEl.fill(customerInfo.accountInfo.lastName);

    const emailInputEl = await this.getLocator(SignUpLocators.emailInput);
    await emailInputEl.fill(customerInfo.accountInfo.email);

    const passwordInputEl = await this.getLocator(SignUpLocators.passwordInput);
    await passwordInputEl.fill(customerInfo.accountInfo.password!);
  };

  public fillInputOfTheSeccondModalToSignUp = async (customerInfo: CustomerInfo, hasErrorMessage = false) => {
    if (!hasErrorMessage) await (await this.getLocator(SignUpLocators.createAccountBtn)).click();

    const phoneNumberInputEl = await this.getLocator(SignUpLocators.phoneNumberInput);
    await phoneNumberInputEl.fill(customerInfo.accountInfo.phoneNumber);

    const jobtitleInputEl = await this.getLocator(SignUpLocators.jobTitleInput);
    await jobtitleInputEl.fill(customerInfo.accountInfo.jobTitle);

    const companyInputEl = await this.getLocator(SignUpLocators.companyNameInput);
    await companyInputEl.fill(customerInfo.company.companyName ?? "My company");

    await (await this.getLocator(MemberOnboardingLocators.signUpBtn)).click();
  };

  public fillFormToSignUp = async (customerInfo: CustomerInfo, hrSystem: string) => {
    await this.fillInputOfTheFirstModalToSignUp(customerInfo);

    try {
      await this.dropdown.selectByText(SignUpLocators.hrSystemDropdown, hrSystem);
    } catch (error) {
      throw new Error(`Failed to select HR system: ${hrSystem}. Error: ${(error as Error).message} does not exist in dropdown options.`);
    }

    await this.fillInputOfTheSeccondModalToSignUp(customerInfo);
  };

  public veriryFillingFormIsRequired = async (customerInfo: CustomerInfo) => {
    const signUpBtnEl = await this.getLocator(MemberOnboardingLocators.signUpBtn);
    await signUpBtnEl.click();

    const createAccountBtnEl = await this.getLocator(SignUpLocators.createAccountBtn);
    await createAccountBtnEl.click();

    const errorMessagesOfTheFirstModal = ["First name is missing", "Last name is missing", "Email is missing", "Password is missing"];
    const errorMessageLocatorsOfTheFirstModal: Locator[] = [];

    for (const errorMessage of errorMessagesOfTheFirstModal) errorMessageLocatorsOfTheFirstModal.push(await this.getLocator(SignUpLocators.errorMessage.replace("errormessage", errorMessage)));

    await UiAssert.allVisible(errorMessageLocatorsOfTheFirstModal);

    await this.fillInputOfTheFirstModalToSignUp(customerInfo, true);

    await createAccountBtnEl.click();

    await signUpBtnEl.click();

    const errorMessagesOfTheSeccondModal = ["Phone number is missing", "Job title is missing", "Company name is missing"];
    const errorMessageLocatorsOfTheSeccondtModal: Locator[] = [];

    for (const errorMessage of errorMessagesOfTheSeccondModal) {
      errorMessageLocatorsOfTheSeccondtModal.push(await this.getLocator(SignUpLocators.errorMessage.replace("errormessage", errorMessage)));
    }

    await UiAssert.allVisible(errorMessageLocatorsOfTheSeccondtModal);

    await this.fillInputOfTheSeccondModalToSignUp(customerInfo, true);
  };
}
