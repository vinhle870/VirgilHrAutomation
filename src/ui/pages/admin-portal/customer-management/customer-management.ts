import { Locator, Page } from "@playwright/test";
import { BasePage } from "src/ui/pages/base-page";
import { CommonLocator } from "../locators/common.locator";
import { CustomerInfo, UserInfo } from "src/objects";
import { CommonCustomerLocator } from "../locators/customer-management/common";
import delay from "src/utilities/delay";
import { CreateNewCustomerModalLocator } from "../locators/customer-management/new-customer";
import { CreateNewPartnerModalLocator } from "../locators/partner-management/new-partner";

export class CustomerManagementPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  public async createCustomer(customer: CustomerInfo): Promise<Locator> {
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

    await firstNameElelemt.fill(customer.accountInfo.firstName);

    const lastNameElement = await this.getLocator(
      CreateNewCustomerModalLocator.lastName,
    );

    await lastNameElement.fill(customer.accountInfo.lastName);

    const emailElement = await this.getLocator(
      CreateNewCustomerModalLocator.email,
    );

    await emailElement.fill(customer.accountInfo.email);

    const companyNameElement = await this.getLocator(
      CreateNewCustomerModalLocator.companyName,
    );

    await companyNameElement.fill(customer.accountInfo.firstName + "Company");

    const jobTitleElement = await this.getLocator(
      CreateNewCustomerModalLocator.jobTitle,
    );

    await jobTitleElement.fill(customer.accountInfo.jobTitle);

    const contactNumberElement = await this.getLocator(
      CreateNewCustomerModalLocator.contactNumber,
    );

    await contactNumberElement.fill(customer.accountInfo.phoneNumber);

    try {
      this.selectDropdownOptionByText(
        CreateNewCustomerModalLocator.department,
        customer.departmentName,
      );
    } catch (e) {
      throw new Error("Department name does not exist");
    }

    await delay(3000);

    if (customer.stateOfCustomer) {
      try {
        await this.selectDropdownOptionByText(
          CreateNewCustomerModalLocator.statesOfCustomer,
          customer.stateOfCustomer,
        );
      } catch (e) {
        throw new Error("The state does not exist");
      }

      await delay(3000);
    }

    if (customer.freeTrial === true) await this.selectRadio("Free Trial");

    if (customer.bankStranfer!.bankStranfer === true) {
      await (
        await this.getLocator(CreateNewPartnerModalLocator.bankTransfer)
      ).click();

      if (customer.company.companySize)
        try {
          await this.selectDropdownOptionByText(
            CreateNewCustomerModalLocator.companySize,
            customer.company.companySize,
          );
        } catch (e) {
          throw new Error("Company size is incorrect");
        }

      if (customer?.bankStranfer?.payYearly === false)
        await (
          await this.getLocator(CreateNewCustomerModalLocator.payYear)
        ).click();
    }

    if (customer?.internal === true)
      (await this.getLocator(CreateNewCustomerModalLocator.internal)).click();

    if (customer.company.consultant === true)
      (await this.getLocator(CreateNewCustomerModalLocator.consultant)).click();
    else if (customer.company.industry) {
      try {
        for (let i = 0; i < customer.company.industry.length; i++) {
          await this.selectDropdownOptionByText(
            CreateNewCustomerModalLocator.industry,
            customer.company.industry[i].value,
          );
        }
      } catch (e) {
        throw new Error("Industry is incorrect");
      }

      await delay(3000);
    }

    if (customer.company.totalEmployees) {
      if (typeof customer.company.totalEmployees !== "number")
        throw new Error("totalNumberOfEmployee must be a digit");

      const numberOfEmployeeEl = await this.getLocator(
        CreateNewCustomerModalLocator.numberOfEmployee,
      );

      numberOfEmployeeEl.fill(customer.company.totalEmployees.toString());

      await delay(3000);
    }

    if (customer.company.statesEmployee) {
      try {
        for (let i = 0; i < customer.company.statesEmployee.length; i++)
          await this.selectDropdownOptionByText(
            CreateNewCustomerModalLocator.statesOfCompany,
            customer.company.statesEmployee[i],
            i,
          );
      } catch (e) {
        throw new Error("State does not exist");
      }
    }

    if (
      customer?.company.consultant === false &&
      customer.company.statesEmployeeInfor
    ) {
      await (
        await this.getLocator(
          CreateNewCustomerModalLocator.separateEmployeeButton,
        )
      ).click();

      if (typeof customer.company.totalEmployees !== "number")
        throw new Error("total employee must be a digit");

      for (let i = 0; i < customer.company.statesEmployeeInfor.length; i++) {
        let numberOfPerState = 0;

        if (typeof customer.company.statesEmployeeInfor![i].number !== "number")
          throw new Error("number must be a digit");

        if (customer.company.statesEmployeeInfor![i]?.number)
          numberOfPerState = customer.company.statesEmployeeInfor![i]?.number;

        if (customer.company.statesEmployeeInfor![i]?.state)
          await this.fillNumberOfEmployeesPerState(
            customer.company.statesEmployeeInfor![i]?.state,
            numberOfPerState,
          );
      }
    }

    await (
      await this.getLocator(CreateNewCustomerModalLocator.createButton)
    ).click();

    if (customer.bankStranfer?.bankStranfer === true)
      await (
        await this.getLocator(CreateNewCustomerModalLocator.confirmButton)
      ).click();

    return firstNameElelemt;
  }

  private async fillNumberOfEmployeesPerState(
    state: string,
    numberOfEmployeesPerState: number,
  ) {
    const stateLocator =
      CreateNewCustomerModalLocator.numberOfEmployeesPerState.replace(
        "stateValue",
        state,
      );

    const numberOfEmployee = await this.getLocator(stateLocator);

    await numberOfEmployee.fill(numberOfEmployeesPerState.toString());
  }
}
