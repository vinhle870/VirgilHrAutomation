import { Locator, Page } from "@playwright/test";
import { BasePage } from "src/ui/pages/base-page";
import { CommonLocator } from "./locators/common.locator";
import { CustomerInfo, UserInfo } from "src/objects";
import { CommonCustomerLocator } from "./locators/customer-management/common";
import delay from "src/utilities/delay";
import { CreateNewCustomerModalLocator } from "./locators/customer-management/new-customer";
import { CreateNewPartnerModalLocator } from "./locators/partner-management/locator/new-partner";
import { CustomerDetailLocator } from "./locators/customer-management/detail";
import { UpgradePlanLocator } from "./locators/customer-management/upgrade-plan";

export class CustomerManagementPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  public async createCustomer(customer: CustomerInfo): Promise<Locator> {
    const managementCategory = await this.getLocator(CommonLocator.managementCategory);

    await managementCategory.click();

    const customerManagementCategory = await this.getLocator(CommonLocator.customerManagement);

    await customerManagementCategory.click();

    const createButtonElement = await this.getLocator(CommonCustomerLocator.createNewCustomerButton);
    await createButtonElement.click();

    await delay(3000);

    const firstNameElelemt = await this.getLocator(CreateNewCustomerModalLocator.firstName);

    await firstNameElelemt.fill(customer.accountInfo.firstName);

    const lastNameElement = await this.getLocator(CreateNewCustomerModalLocator.lastName);

    await lastNameElement.fill(customer.accountInfo.lastName);

    const emailElement = await this.getLocator(CreateNewCustomerModalLocator.email);

    await emailElement.fill(customer.accountInfo.email);

    const companyNameElement = await this.getLocator(CreateNewCustomerModalLocator.companyName);

    await companyNameElement.fill(customer.accountInfo.firstName + "Company");

    const jobTitleElement = await this.getLocator(CreateNewCustomerModalLocator.jobTitle);

    await jobTitleElement.fill(customer.accountInfo.jobTitle);

    const contactNumberElement = await this.getLocator(CreateNewCustomerModalLocator.contactNumber);

    await contactNumberElement.fill(customer.accountInfo.phoneNumber);

    try {
      await this.dropdown.selectByText(CreateNewCustomerModalLocator.department, customer.departmentName);
    } catch (e) {
      throw new Error("Department name does not exist");
    }

    await delay(3000);

    if (customer.stateOfCustomer) {
      try {
        await this.dropdown.selectByText(CreateNewCustomerModalLocator.statesOfCustomer, customer.stateOfCustomer);
      } catch (e) {
        throw new Error("The state does not exist");
      }

      await delay(3000);
    }

    if (customer.freeTrial === true) await this.selectRadio("Free Trial");

    if (customer.bankStranfer!.bankStranfer === true) {
      await (await this.getLocator(CreateNewPartnerModalLocator.bankTransfer)).click();

      if (customer.company.companySize)
        try {
          await this.dropdown.selectByText(CreateNewCustomerModalLocator.companySize, customer.company.companySize);
        } catch (e) {
          throw new Error("Company size is incorrect");
        }

      if (customer?.bankStranfer?.payYearly === false) await (await this.getLocator(CreateNewCustomerModalLocator.payYear)).click();
    }

    if (customer?.internal === true) (await this.getLocator(CreateNewCustomerModalLocator.internal)).click();

    if (customer.company.consultant === true) (await this.getLocator(CreateNewCustomerModalLocator.consultant)).click();
    else if (customer.company.industry) {
      try {
        for (let i = 0; i < customer.company.industry.length; i++) {
          await this.dropdown.selectByText(CreateNewCustomerModalLocator.industry, customer.company.industry[i].value);
        }
      } catch (e) {
        throw new Error("Industry is incorrect");
      }

      await delay(3000);
    }

    if (customer.company.totalEmployees) {
      if (typeof customer.company.totalEmployees !== "number") throw new Error("totalNumberOfEmployee must be a digit");

      const numberOfEmployeeEl = await this.getLocator(CreateNewCustomerModalLocator.numberOfEmployee);

      numberOfEmployeeEl.fill(customer.company.totalEmployees.toString());

      await delay(3000);
    }

    if (customer.company.statesEmployee) {
      try {
        for (let i = 0; i < customer.company.statesEmployee.length; i++)
          await this.dropdown.selectByTextForNthDropdown(CreateNewCustomerModalLocator.statesOfCompany, customer.company.statesEmployee[i], i);
      } catch (e) {
        throw new Error("State does not exist");
      }
    }

    if (customer?.company.consultant === false && customer.company.statesEmployeeInfor) {
      await (await this.getLocator(CreateNewCustomerModalLocator.separateEmployeeButton)).click();

      if (typeof customer.company.totalEmployees !== "number") throw new Error("total employee must be a digit");

      for (let i = 0; i < customer.company.statesEmployeeInfor.length; i++) {
        let numberOfPerState = 0;

        if (typeof customer.company.statesEmployeeInfor![i].number !== "number") throw new Error("number must be a digit");

        if (customer.company.statesEmployeeInfor![i]?.number) numberOfPerState = customer.company.statesEmployeeInfor![i]?.number;

        if (customer.company.statesEmployeeInfor![i]?.state) await this.fillNumberOfEmployeesPerState(customer.company.statesEmployeeInfor![i]?.state, numberOfPerState);
      }
    }

    await (await this.getLocator(CreateNewCustomerModalLocator.createButton)).click();

    if (customer.bankStranfer?.bankStranfer === true) await (await this.getLocator(CreateNewCustomerModalLocator.confirmButton)).click();

    return firstNameElelemt;
  }

  private async fillNumberOfEmployeesPerState(state: string, numberOfEmployeesPerState: number) {
    const stateLocator = CreateNewCustomerModalLocator.numberOfEmployeesPerState.replace("stateValue", state);

    const numberOfEmployee = await this.getLocator(stateLocator);

    await numberOfEmployee.fill(numberOfEmployeesPerState.toString());
  }

  public async upgradePlan(customer: CustomerInfo, planToUpgrade: string) {
    if (customer.company.companySize?.includes("500+")) throw new Error("The current plan is maximun so it is impossible to upgrade");

    const phoneNumber = customer.accountInfo.phoneNumber;

    if (!phoneNumber) throw new Error("The phone number does not exist");

    const managementCategory = await this.getLocator(CommonLocator.managementCategory);

    await managementCategory.click();

    const customerManagementCategory = await this.getLocator(CommonLocator.customerManagement);

    await customerManagementCategory.click();

    const rawPhoneNumber = CommonCustomerLocator.detailButton;

    const detailButtonLocator = rawPhoneNumber.replace("phoneNumberValue", phoneNumber);

    //Click detail button
    const detailButtonEl = this.page.locator(detailButtonLocator);

    await detailButtonEl.nth(2).click();
    //click upgrade plan
    await (await this.getLocator(CustomerDetailLocator.customerDetailButton)).click();
    //Choose the plan to upgrade
    const rawPlan = UpgradePlanLocator.plan;

    const planToUpgradeLocator = rawPlan.replace("planValue", planToUpgrade);

    const planToUpgradeEl = await this.getLocator(planToUpgradeLocator);

    if (!(await planToUpgradeEl.isVisible())) throw new Error("The upgraded plan does not exist");

    await planToUpgradeEl.click();
    //Upgrade
    await (await this.getLocator(UpgradePlanLocator.upgradelButton)).click();

    if (customer.bankStranferToUpgradePlan) {
      const bankStranferButtonEl = this.page.locator(UpgradePlanLocator.bankStranfer);

      await bankStranferButtonEl.click();

      await (await this.getLocator(UpgradePlanLocator.upgradeNowButton)).click();
    } else await (await this.getLocator(UpgradePlanLocator.requestPaymentButton)).click();
  }
}
