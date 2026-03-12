import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "src/ui/pages/base-page";
import { CommonLocator } from "../../locators/common.locator";
import { UserInfo } from "src/objects";
import { CommonPartnerLocator } from "../../locators/management-category/partner-management/common-partner-management-locator";
import { CreateNewPartnerModalLocator } from "../../locators/management-category/partner-management/new-partner-locator";

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

    if (overrides?.department) {
      const departmentInputElement = await this.getLocator(
        CreateNewPartnerModalLocator.department,
      );

      await departmentInputElement.click();

      const departmentName =
        CreateNewPartnerModalLocator.getDepartmentNameLocator(
          overrides?.department,
        );

      try {
        const departmentNameElement = await this.getLocator(departmentName);

        await departmentNameElement.click();
      } catch (e) {
        throw new Error("department name does not exist");
      }
    }

    if (overrides?.level) {
      const levelInputElement = await this.getLocator(
        CreateNewPartnerModalLocator.partnerLevel,
      );

      await levelInputElement.click();

      const partnerLevelLocator =
        CreateNewPartnerModalLocator.getPartnerLevelLocator(overrides?.level);

      try {
        const partnerLevelElement = await this.getLocator(partnerLevelLocator);

        await partnerLevelElement.click();
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

      await paymentOptionElement.click();

      const choosenPaymentOption =
        CreateNewPartnerModalLocator.getPaymentOptionLocator(
          overrides?.paymentOption,
        );

      try {
        const choosenPaymentOptionElement =
          await this.getLocator(choosenPaymentOption);

        await choosenPaymentOptionElement.click();
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

      await productsTypeElement.click();

      const choosenProductTypeLocator =
        CreateNewPartnerModalLocator.getProductTypeLocator(
          overrides?.productsType,
        );
      try {
        const choosenProductTypeElement = await this.getLocator(
          choosenProductTypeLocator,
        );

        await choosenProductTypeElement.scrollIntoViewIfNeeded();

        await choosenProductTypeElement.click();
      } catch (error) {
        throw new Error("Product type does not exist");
      }
    }

    const emailElement = await this.getLocator(
      CreateNewPartnerModalLocator.email,
    );

    await emailElement.fill(userInfo.email);

    if (overrides?.bankTranfer == true) {
      const bankTranferElement = await this.getLocator(
        CreateNewPartnerModalLocator.bankTranfer,
      );

      await bankTranferElement.scrollIntoViewIfNeeded();

      await bankTranferElement.click();

      const planLocator = CreateNewPartnerModalLocator.plan;

      try {
        if (overrides?.plan) {
          const planElement = await this.getLocator(planLocator);

          await planElement.click();

          const choosenPlanLocator =
            CreateNewPartnerModalLocator.getPlanLocator(overrides?.plan);

          const choosenPlanElement = await this.getLocator(choosenPlanLocator);

          await choosenPlanElement.click();
        }

        const numberOfLabelsInBillingCycle = await this.getLocator(
          CreateNewPartnerModalLocator.contactNumber,
        );

        const numberOfLabel = await numberOfLabelsInBillingCycle.count();

        if (overrides?.billingcycle && numberOfLabel == 2) {
          const billingCyleLocator =
            CreateNewPartnerModalLocator.getBillingCyleLocator(
              overrides?.billingcycle,
            );

          try {
            const billingCyleElement =
              await this.getLocator(billingCyleLocator);

            await billingCyleElement.click();
          } catch (error) {
            throw new Error("Billing cycle does not exist");
          }
        }
      } catch (error) {
        throw new Error("Plan does not exist");
      }
    }

    if (overrides?.external) {
      const externalElement = await this.getLocator(
        CreateNewPartnerModalLocator.external,
      );

      await externalElement.click();
    } else if (overrides?.internal) {
      const internalElement = await this.getLocator(
        CreateNewPartnerModalLocator.internal,
      );

      await internalElement.click();
    }

    const createNewPartnerButtonElement = await this.getLocator(
      CreateNewPartnerModalLocator.createPartnerButton,
    );

    await createNewPartnerButtonElement.click();

    return nameElement;
  }
}
