import { Locator, Page } from "@playwright/test";
import { BasePage } from "src/ui/pages/base-page";
import { CommonAdminPortalLocator } from "./locators/common/common.locator";
import { CommonPartnerLocator } from "./locators/partner-management/locator/common";
import { CreateNewPartnerModalLocator } from "./locators/partner-management/locator/new-partner";
import delay from "src/utilities/delay";
import IPartnerFilter from "src/objects/ipartnerfilter";
import { PartnerFilterLocator } from "./locators/partner-management/locator/filter-partner";

export class PartnerManagementPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async filter(partFilterInfo: IPartnerFilter): Promise<string> {
    try {
      const filterButtonEl = await this.getLocator(CommonPartnerLocator.filterPartnerButton);

      await filterButtonEl.click();

      if (partFilterInfo.name) await (await this.getLocator(PartnerFilterLocator.searchedName)).fill(partFilterInfo.name);

      if (partFilterInfo.level) await this.dropdown.selectByText(PartnerFilterLocator.searchedLevel, partFilterInfo.level);

      await delay(5000);

      if (partFilterInfo.department) await this.dropdown.selectByText(PartnerFilterLocator.searchedDepartment, partFilterInfo.department);
      await delay(5000);

      await (await this.getLocator(PartnerFilterLocator.applyButton)).click();
    } catch (error) {
      return "Failed";
    }

    return "Pass";
  }

  public async sorting(typeOfSorting: string): Promise<string> {
    try {
      const managementCategory = await this.getLocator(CommonAdminPortalLocator.managementCategory);

      await managementCategory.click();

      const partnerManagementCategory = await this.getLocator(CommonAdminPortalLocator.partnerManagement);

      await partnerManagementCategory.click();

      await this.dropdown.selectByText(CommonPartnerLocator.sortingButton, typeOfSorting);
    } catch (error) {
      return "Failed";
    }
    return "Pass";
  }

  public async getDuplicatedText(): Promise<Locator> {
    const duplicatedEmailText = CreateNewPartnerModalLocator.duplicatedEmailText;

    const duplicatedEmailEl = await this.getLocator(duplicatedEmailText);

    return duplicatedEmailEl;
  }
}
