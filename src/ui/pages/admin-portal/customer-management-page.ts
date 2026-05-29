import { Locator, Page } from "@playwright/test";
import { BasePage } from "src/ui/pages/base-page";
import { CommonAdminPortalLocator } from "./locators/common/common.locator";
import { CustomerInfo, Partner, UserInfo } from "src/objects";
import { CommonCustomerLocator } from "./locators/customer-management/common";
import delay from "src/utilities/delay";
import { CreateNewCustomerModalLocator } from "./locators/customer-management/new-customer-modal";
import { CreateNewPartnerModalLocator } from "./locators/partner-management/locator/new-partner";
import { CustomerDetailModalLocator } from "./locators/customer-management/customer-detail-modal";
import { UpgradePlanModalLocator } from "./locators/customer-management/upgrade-plan-modal";
import { TeamInfoLocator } from "./locators/customer-management/team-imformation";

export class CustomerManagementPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  public async fillFormToCreateCustomer(customer: CustomerInfo): Promise<Locator> {
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

    await this.dropdown.selectByText(CreateNewCustomerModalLocator.department, customer.departmentName);

    await delay(3000);

    if (customer.freeTrial === true) await this.selectRadio("Free Trial");

    if (customer.bankStranfer!.bankStranfer === true) {
      await (await this.getLocator(CreateNewPartnerModalLocator.bankTransfer)).click();

      if (customer.company.companySize) await this.dropdown.selectByText(CreateNewCustomerModalLocator.companySize, customer.company.companySize);

      if (customer?.bankStranfer?.payYearly === false) await (await this.getLocator(CreateNewCustomerModalLocator.payYear)).click();
    }

    if (customer?.internal === true) (await this.getLocator(CreateNewCustomerModalLocator.internal)).click();

    if (customer.company.consultant === true) (await this.getLocator(CreateNewCustomerModalLocator.consultant)).click();
    else if (customer.company.industry) {
      for (let i = 0; i < customer.company.industry.length; i++) await this.dropdown.selectByText(CreateNewCustomerModalLocator.industry, customer.company.industry[i].value);

      await delay(3000);
    }

    if (customer.company.totalEmployees) {
      if (typeof customer.company.totalEmployees !== "number") throw new Error("totalNumberOfEmployee must be a digit");

      const numberOfEmployeeEl = await this.getLocator(CreateNewCustomerModalLocator.numberOfEmployee);

      numberOfEmployeeEl.fill(customer.company.totalEmployees.toString());

      await delay(3000);
    }

    if (customer.company.statesEmployee)
      for (let i = 0; i < customer.company.statesEmployee.length; i++)
        await this.dropdown.selectByTextForNthDropdown(CreateNewCustomerModalLocator.statesOfCompany, customer.company.statesEmployee[i], i);

    if (customer?.company.consultant === false && customer.company.statesEmployeeInfor) {
      await (await this.getLocator(CreateNewCustomerModalLocator.separateEmployeeButton)).click();

      for (let i = 0; i < customer.company.statesEmployeeInfor.length; i++) {
        let numberOfPerState = 0;

        if (customer.company.statesEmployeeInfor![i]?.number) numberOfPerState = customer.company.statesEmployeeInfor![i]?.number;

        if (customer.company.statesEmployeeInfor![i]?.state) await this.fillNumberOfEmployeesPerState(customer.company.statesEmployeeInfor![i]?.state, numberOfPerState);
      }
    }

    if (customer.contentAvailability === "US") await (await this.getLocator(CreateNewCustomerModalLocator.contentAvailability.replace("country", "United States"))).first().click();
    else if (customer.contentAvailability === "Canada") await (await this.getLocator(CreateNewCustomerModalLocator.contentAvailability.replace("country", "Canada"))).first().click();

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

    const managementCategory = await this.getLocator(CommonAdminPortalLocator.managementCategory);

    await managementCategory.click();

    const customerManagementCategory = await this.getLocator(CommonAdminPortalLocator.customerManagement);

    await customerManagementCategory.click();

    const rawPhoneNumber = CommonCustomerLocator.detailButton;

    const detailButtonLocator = rawPhoneNumber.replace("phoneNumberValue", phoneNumber);

    //Click detail button
    const detailButtonEl = this.page.locator(detailButtonLocator);

    await detailButtonEl.nth(2).click();
    //click upgrade plan
    await (await this.getLocator(CustomerDetailModalLocator.customerDetailButton)).click();
    //Choose the plan to upgrade
    const rawPlan = UpgradePlanModalLocator.plan;

    const planToUpgradeLocator = rawPlan.replace("planValue", planToUpgrade);

    const planToUpgradeEl = await this.getLocator(planToUpgradeLocator);

    if (!(await planToUpgradeEl.isVisible())) throw new Error("The upgraded plan does not exist");

    await planToUpgradeEl.click();
    //Upgrade
    await (await this.getLocator(UpgradePlanModalLocator.upgradelButton)).click();

    if (customer.bankStranferToUpgradePlan) {
      const bankStranferButtonEl = this.page.locator(UpgradePlanModalLocator.bankStranfer);

      await bankStranferButtonEl.click();

      await (await this.getLocator(UpgradePlanModalLocator.upgradeNowButton)).click();
    } else await (await this.getLocator(UpgradePlanModalLocator.requestPaymentButton)).click();
  }

  public async inviteCustomerMembers(invitedMembers: UserInfo[]) {
    await this.page.locator(CustomerDetailModalLocator.viewDetailButton).click();

    try {
      await this.page.locator(TeamInfoLocator.addTeamButton).last().click({ timeout: 1000 });
    } catch (error) {
      await this.page.locator(TeamInfoLocator.addTeamButton).first().click();
    }
  }
}
