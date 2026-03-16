import { Locator, Page } from "@playwright/test";
import { BasePage } from "src/ui/pages/base-page";
import { CommonLocator } from "../../locators/common.locator";
import { UserInfo } from "src/objects";
import { CommonPartnerLocator } from "../../locators/management-category/partner-management/common-partner-management-locator";
import { CommonCustomerLocator } from "../../locators/management-category/customer-management/common-member-management-locator";
import delay from "src/utilities/delay";
import { CreateNewCustomerModalLocator } from "../../locators/management-category/customer-management/new-customer-locator";
import { LocatorHandling } from "src/utilities";
import { CreateNewPartnerModalLocator } from "../../locators/management-category/partner-management/new-partner-locator";

export class CustomerManagementPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  public async createCustomer(
    userInfo: UserInfo,
    overrides?: Partial<Record<string, any>>,
  ): Promise<Locator> {
    const managementCategory = await this.getLocator(
      CommonLocator.managementCategory,
    );

    await managementCategory.click();

    const customerManagementCategory = await this.getLocator(
      CommonLocator.customerManagement,
    );

    await customerManagementCategory.click();

    const createButtonElement = await this.getLocator(
      CommonCustomerLocator.createNewCustomerButton,
    );
    await createButtonElement.click();

    await delay(5000);

    const firstNameElelemt = await this.getLocator(
      CreateNewCustomerModalLocator.firstName,
    );

    await firstNameElelemt.fill(userInfo.firstName);

    const lastNameElement = await this.getLocator(
      CreateNewCustomerModalLocator.lastName,
    );

    await lastNameElement.fill(userInfo.lastName);

    const emailElement = await this.getLocator(
      CreateNewCustomerModalLocator.email,
    );

    await emailElement.fill(userInfo.email);

    const companyNameElement = await this.getLocator(
      CreateNewCustomerModalLocator.companyName,
    );

    await companyNameElement.fill(userInfo.firstName + "Company");

    const jobTitleElement = await this.getLocator(
      CreateNewCustomerModalLocator.jobTitle,
    );

    await jobTitleElement.fill(userInfo.jobTitle);

    const contactNumberElement = await this.getLocator(
      CreateNewCustomerModalLocator.contactNumber,
    );

    await contactNumberElement.fill(userInfo.phoneNumber);

    try {
      this.selectDropdownOptionByText(
        CreateNewCustomerModalLocator.department,
        overrides?.department,
      );
    } catch (e) {
      throw new Error("Department name does not exist");
    }

    await delay(5000);

    if (overrides?.freeTrial) await this.selectRadio(overrides?.freeTrial);

    if (overrides?.bankTranfer === true) {
      (await this.getLocator(CreateNewPartnerModalLocator.bankTranfer)).click();

      try {
        this.selectDropdownOptionByText(
          CreateNewCustomerModalLocator.companySize,
          overrides?.companySize,
        );
      } catch (e) {
        throw new Error("Company size name does not exist");
      }

      if (overrides?.payYear === false)
        (await this.getLocator(CreateNewCustomerModalLocator.payYear)).click();

      try {
        for (let i = 0; i < overrides?.statesOfcustomer.length; i++)
          this.selectDropdownOptionByText(
            CreateNewCustomerModalLocator.statesOfcustomer,
            overrides?.statesOfcustomer[i],
          );
      } catch (e) {
        throw new Error("State does not exist");
      }
    }

    if (overrides?.internal)
      (await this.getLocator(CreateNewCustomerModalLocator.internal)).click();

    if (overrides?.consultant)
      (await this.getLocator(CreateNewCustomerModalLocator.consultant)).click();

    try {
      for (let i = 0; i < overrides?.industries.length; i++)
        this.selectDropdownOptionByText(
          CreateNewCustomerModalLocator.industry,
          overrides?.industries[i],
        );
    } catch (e) {
      throw new Error("Industry is incorrect");
    }

    try {
      (
        await this.getLocator(
          CreateNewCustomerModalLocator.numberOfEmployeesPerState,
        )
      ).fill(overrides?.numberOfEmployeesPerState);
    } catch (e) {
      throw new Error(
        "numberOfEmployeesPerState must be a digit or does not have any value",
      );
    }

    try {
      for (let i = 0; i < overrides?.statesOfCompany.length; i++)
        this.selectDropdownOptionByText(
          CreateNewCustomerModalLocator.statesOfCompany,
          overrides?.statesOfCompany[i],
        );
    } catch (e) {
      throw new Error("State does not exist");
    }

    if (!overrides?.consultant)
      try {
        for (let i = 0; i < overrides?.statesOfCompany.length; i++)
          this.fillNumberOfEmployeesPerState(
            overrides?.statesOfCompany[i],
            overrides?.numberOfEmployeesOfOneState,
          );
      } catch (e) {
        throw new Error(
          "NumberOfEmployeesOfOneState must be a digit or does not have any value or greater than total number of employees",
        );
      }

    (await this.getLocator(CreateNewCustomerModalLocator.createButton)).click();

    return firstNameElelemt;
  }

  private async fillNumberOfEmployeesPerState(
    state: string,
    numberOfEmployeesPerState: number,
  ) {
    const choosenState =
      CreateNewCustomerModalLocator.numberOfEmployeesPerState;

    choosenState.replace("Alabama", state);

    const numberOfEmployee = await this.getLocator(
      CreateNewCustomerModalLocator.numberOfEmployeesPerState,
    );

    await numberOfEmployee.fill(numberOfEmployeesPerState.toString());
  }
}
