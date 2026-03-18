import { Locator, Page } from "@playwright/test";
import { BasePage } from "src/ui/pages/base-page";
import { CommonLocator } from "../locators/common.locator";
import { UserInfo } from "src/objects";
import { CommonCustomerLocator } from "../locators/management-category/customer-management/commonlocator";
import delay from "src/utilities/delay";
import { CreateNewCustomerModalLocator } from "../locators/management-category/customer-management/new-customer-locator";
import { CreateNewPartnerModalLocator } from "../locators/management-category/partner-management/new-partner-locator";

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

    if (overrides?.stateOfCustomer) {
      try {
        await this.selectDropdownOptionByText(
          CreateNewCustomerModalLocator.statesOfCustomer,
          overrides?.stateOfCustomer,
        );
      } catch (e) {
        throw new Error("The state does not exist");
      }

      await delay(5000);
    }

    if (overrides?.freeTrial === true)
      await this.selectRadio(overrides?.freeTrial);

    if (overrides?.bankTranfer) {
      await (
        await this.getLocator(CreateNewPartnerModalLocator.bankTransfer)
      ).click();

      if (overrides?.bankTranfer?.companySize)
        try {
          await this.selectDropdownOptionByText(
            CreateNewCustomerModalLocator.companySize,
            overrides?.bankTranfer?.companySize,
          );
        } catch (e) {
          throw new Error("Company size is incorrect");
        }

      if (overrides?.bankTranfer?.payYear === false)
        await (
          await this.getLocator(CreateNewCustomerModalLocator.payYear)
        ).click();
    }

    if (overrides?.internal === true)
      (await this.getLocator(CreateNewCustomerModalLocator.internal)).click();

    if (overrides?.consultant === true)
      (await this.getLocator(CreateNewCustomerModalLocator.consultant)).click();

    if (overrides?.industries) {
      try {
        for (let i = 0; i < overrides?.industries.length; i++) {
          this.selectDropdownOptionByText(
            CreateNewCustomerModalLocator.industry,
            overrides?.industries[i],
          );
        }
      } catch (e) {
        throw new Error("Industry is incorrect");
      }

      await delay(3000);
    }

    if (overrides?.totalNumberOfEmployee) {
      if (typeof overrides?.totalNumberOfEmployee !== "number")
        throw new Error("totalNumberOfEmployee must be a digit");

      const numberOfEmployeeEl = await this.getLocator(
        CreateNewCustomerModalLocator.numberOfEmployee,
      );

      numberOfEmployeeEl.fill(overrides?.totalNumberOfEmployee.toString());

      await delay(3000);
    }

    if (overrides?.statesOfCompany) {
      try {
        for (let i = 0; i < overrides?.statesOfCompany.length; i++)
          if (overrides?.statesOfCompany[i]?.state)
            this.selectDropdownOptionByText(
              CreateNewCustomerModalLocator.statesOfCompany,
              overrides?.statesOfCompany[i]?.state,
            );
      } catch (e) {
        throw new Error("State does not exist");
      }
    }

    if (!overrides?.consultant && overrides?.statesOfCompany) {
      await (
        await this.getLocator(
          CreateNewCustomerModalLocator.separateEmployeeButton,
        )
      ).click();

      for (let i = 0; i < overrides?.statesOfCompany.length; i++) {
        let numberOfPerState = 0;

        if (typeof overrides?.statesOfCompany[i]?.number !== "number")
          throw new Error("number must be a digit");

        if (overrides?.statesOfCompany[i]?.number)
          numberOfPerState = overrides?.statesOfCompany[i]?.number;

        if (overrides?.statesOfCompany[i]?.state)
          this.fillNumberOfEmployeesPerState(
            overrides?.statesOfCompany[i]?.state,
            numberOfPerState,
          );
      }
    }

    (await this.getLocator(CreateNewCustomerModalLocator.createButton)).click();

    if (overrides?.bankTranfer && overrides?.bankTranfer?.companySize)
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
