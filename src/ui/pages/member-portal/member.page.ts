import { BasePage } from "../base-page";
import { MemberOnboardingLocators } from "./locators";
import { CustomerInfo, UserInfo } from "src/objects";
import { SignUpLocators } from "./locators/signup";
import { UiAssert } from "src/assertions";
import { Locator } from "playwright/test";
import { OrganizationLocators } from "./locators/organization";
import { CommonMemberPortalLocators } from "./locators/common";
import { TeamInfoLocator } from "../admin-portal/locators/customer-management/team-imformation";

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
      console.log(`Failed to select HR system: ${hrSystem}. Error: ${(error as Error).message} does not exist in dropdown options.`);
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

  public moveToManageYourTeamModal = async () => {
    await this.page.locator(CommonMemberPortalLocators.myAccountButton).last().click();
    await (await this.getLocator(OrganizationLocators.organizationTab)).click();
    await (await this.getLocator(OrganizationLocators.manageYourTeamTab)).click();
    await (await this.getLocator(OrganizationLocators.inviteMore)).click();
  };

  public fillFormToInviteCustomerMembers = async (invitedMembers: UserInfo[]) => {
    for (let i = 0; i < invitedMembers.length; i++) {
      if (i > 0) await (await this.getLocator(TeamInfoLocator.addMoreButton)).click();
      await (await this.getLocator(TeamInfoLocator.emailInput)).nth(i).fill(invitedMembers[i].email);
      await (await this.getLocator(TeamInfoLocator.firstNameInput)).nth(i).fill(invitedMembers[i].firstName);
      await (await this.getLocator(TeamInfoLocator.lastNameInput)).nth(i).fill(invitedMembers[i].lastName);
      await (await this.getLocator(TeamInfoLocator.phoneInput)).nth(i).fill(invitedMembers[i].phoneNumber);
      await (await this.getLocator(TeamInfoLocator.jobTitleInput)).nth(i).fill(invitedMembers[i].jobTitle);
      const role = invitedMembers[i].invitedRole;
      if (typeof role === "string") await this.dropdown.selectByText(TeamInfoLocator.roleDropdown, role);
    }
    await (await this.getLocator(TeamInfoLocator.sendInviteButton)).click();
  };
}
