import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "src/ui/pages/base-page";
import { CommonLocator } from "../../locators/common.locator";
import { UserInfo } from "src/objects";
import { CommonPartnerLocator } from "../../locators/management-category/partner-management/common-partner-management-locator";
import { CreateNewPartnerModalLocator } from "../../locators/management-category/partner-management/new-partner-locator";
import delay from "src/utilities/delay";
import { de } from "@faker-js/faker/.";

export class PartnerManagementPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  public async createPartner(
    userInfo: UserInfo,
    overrides?: Partial<Record<string, any>>,
  ): Promise<Locator> {
    const managementCategory = await this.getLocator(
      CommonLocator.managementCategory,
    );

    await managementCategory.click();

    const partnerManagementCategory = await this.getLocator(
      CommonLocator.partnerManagement,
    );

    await partnerManagementCategory.click();

    const createButtonElement = await this.getLocator(
      CommonPartnerLocator.createNewPartnerButton,
    );
    await createButtonElement.click();

    await delay(5000);

    if (overrides?.department) {
      try {
        this.selectDropdownOptionByText(
          CreateNewPartnerModalLocator.department,
          overrides?.department,
        );
      } catch (e) {
        throw new Error("Department name does not exist");
      }
    }

    await delay(5000);

    if (overrides?.level) {
      try {
        this.selectDropdownOptionByText(
          CreateNewPartnerModalLocator.partnerLevel,
          overrides?.level,
        );
      } catch (error) {
        throw new Error("Partner level does not exist");
      }
    }

    const nameElement = await this.getLocator(
      CreateNewPartnerModalLocator.nameOfPartner,
    );

    await nameElement.fill(userInfo.localPrefix!);

    const subDomainElement = await this.getLocator(
      CreateNewPartnerModalLocator.subDomain,
    );
    const standardSubdomain = userInfo.localPrefix!.replace(
      /[^a-zA-Z0-9]/g,
      "",
    );

    await subDomainElement.fill(standardSubdomain);

    const firstNameElement = await this.getLocator(
      CreateNewPartnerModalLocator.firstName,
    );

    await firstNameElement.scrollIntoViewIfNeeded();

    await firstNameElement.fill(userInfo.firstName);

    const lastNameElement = await this.getLocator(
      CreateNewPartnerModalLocator.lastName,
    );

    await lastNameElement.fill(userInfo.lastName);

    const phoneNumberElement = await this.getLocator(
      CreateNewPartnerModalLocator.contactNumber,
    );

    await phoneNumberElement.fill(userInfo.phoneNumber);

    const jobTitleElement = await this.getLocator(
      CreateNewPartnerModalLocator.jobTitle,
    );

    await jobTitleElement.fill(userInfo.jobTitle);

    if (overrides?.paymentOption) {
      const paymentOptionElement = await this.getLocator(
        CreateNewPartnerModalLocator.paymentOption,
      );

      await paymentOptionElement.scrollIntoViewIfNeeded();

      try {
        await this.selectDropdownOptionByText(
          CreateNewPartnerModalLocator.paymentOption,
          overrides?.paymentOption,
        );
      } catch (error) {
        throw new Error("Payment option does not exist");
      }
    }
    const isPublic = await this.getLocator(
      CreateNewPartnerModalLocator.isPublic,
    );

    await isPublic.scrollIntoViewIfNeeded();

    await isPublic.click();

    if (overrides?.productsType) {
      const productsTypeElement = await this.getLocator(
        CreateNewPartnerModalLocator.productsType,
      );
      await productsTypeElement.scrollIntoViewIfNeeded();

      try {
        for (let i = 0; i < overrides?.productsType.length; ++i)
          await this.selectDropdownOptionByText(
            CreateNewPartnerModalLocator.productsType,
            overrides?.productsType[i],
          );
      } catch (error) {
        throw new Error("Product type does not exist");
      }
    }

    const emailElement = await this.getLocator(
      CreateNewPartnerModalLocator.email,
    );

    await emailElement.fill(userInfo.email);

    if (overrides?.bankTranfer === true) {
      const bankTranferElement = await this.getLocator(
        CreateNewPartnerModalLocator.bankTranfer,
      );

      await bankTranferElement.scrollIntoViewIfNeeded();

      await bankTranferElement.click();

      if (overrides?.plan && !overrides?.productsType) {
        try {
          await this.selectDropdownOptionByText(
            CreateNewPartnerModalLocator.plan,
            overrides?.plan,
          );
        } catch (error) {
          throw new Error("Plan does not exist");
        }
      }
      const numberOfLabelsInBillingCycle = await this.getLocator(
        CreateNewPartnerModalLocator.billingCycle,
      );

      const numberOfLabel = await numberOfLabelsInBillingCycle.count();

      if (overrides?.billingCycle && numberOfLabel == 2) {
        try {
          await this.selectRadio(
            overrides?.billingCycle,
            CreateNewPartnerModalLocator.billingCycle,
          );
        } catch (error) {
          throw new Error("Billing cycle does not exist");
        }
      }
    }

    if (overrides?.internal) {
      const internalElement = await this.getLocator(
        CreateNewPartnerModalLocator.internal,
      );

      await internalElement.click();
    }

    const createNewPartnerButtonElement = await this.getLocator(
      CreateNewPartnerModalLocator.createPartnerButton,
    );

    await createNewPartnerButtonElement.click();

    const confirmButtonLocator = CreateNewPartnerModalLocator.confirmButton;

    try {
      const confirmButtonElement = await this.getLocator(confirmButtonLocator);

      await confirmButtonElement.click();
    } catch (error) {
      console.error("There is no confirm button");
    }
    return nameElement;
  }
}
