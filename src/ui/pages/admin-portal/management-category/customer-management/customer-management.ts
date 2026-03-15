import { Locator, Page } from "@playwright/test";
import { BasePage } from "src/ui/pages/base-page";
import { CommonLocator } from "../../locators/common.locator";
import { UserInfo } from "src/objects";
import { CommonPartnerLocator } from "../../locators/management-category/partner-management/common-partner-management-locator";
import { CommonCustomerLocator } from "../../locators/management-category/customer-management/common-member-management-locator";

export class CustomerManagementPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  public async createCustomer(
    userInfo: UserInfo,
    overrides?: Partial<Record<string, any>>,
  ): Promise<void> {
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
  }
}
