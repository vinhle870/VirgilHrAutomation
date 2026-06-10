import { Locator, Page } from "@playwright/test";
import { BasePage } from "src/ui/pages/base-page";
import { CommonAdminPortalLocator } from "./locators/common/common.locator";
import { CommonPartnerLocator } from "./locators/partner-management/locator/common";
import { CreateNewPartnerModalLocator } from "./locators/partner-management/locator/new-partner";
import delay from "src/utilities/delay";
import IPartnerFilter from "src/objects/ipartnerfilter";
import { PartnerFilterLocator } from "./locators/partner-management/locator/filter-partner";
import { CustomerInfo, Partner, UserInfo } from "src/objects";
import { PeoConsultantAdditionLocator } from "./locators/partner-management/locator/peo-consultant-addition";
import { PeoPartner } from "src/objects/ipeopartner";
import { DetailOfPartnerLocator } from "./locators/partner-management/locator/partner-detail.modal";

export class PartnerManagementPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  public async fillUserInfoToCreatePartner(partnerInfo: Partner) {
    this.page.locator(CommonPartnerLocator.createNewPartnerButton).click({ timeout: 5000 });

    await delay(5000);

    await this.dropdown.selectByText(CreateNewPartnerModalLocator.department, partnerInfo.partnerInfo?.departmentName!, this.page, 5000);

    await delay(3000);

    if (partnerInfo.partnerInfo!.partnerLevel && partnerInfo.partnerInfo!.partnerLevel !== "Partner" && partnerInfo.partnerInfo!.partnerLevel !== "PEO/HR Consultant")
      throw new Error("Partner level does not exist");

    if (partnerInfo.partnerInfo!.partnerLevel) await this.dropdown.selectByText(CreateNewPartnerModalLocator.partnerLevel, partnerInfo.partnerInfo!.partnerLevel);

    const nameElement = this.page.locator(CreateNewPartnerModalLocator.nameOfPartner);

    await nameElement.fill(partnerInfo.accountInfo!.firstName);

    const subDomainElement = this.page.locator(CreateNewPartnerModalLocator.subDomain);

    const standardSubdomain = partnerInfo.partnerInfo!.subDomain.replace(/[^a-zA-Z0-9]/g, "");

    await subDomainElement.fill(standardSubdomain);

    const firstNameElement = this.page.locator(CreateNewPartnerModalLocator.firstName);

    await firstNameElement.scrollIntoViewIfNeeded();

    await firstNameElement.fill(partnerInfo.accountInfo!.firstName!);

    const lastNameElement = this.page.locator(CreateNewPartnerModalLocator.lastName);

    await lastNameElement.fill(partnerInfo.accountInfo!.lastName);

    const phoneNumberElement = this.page.locator(CreateNewPartnerModalLocator.contactNumber);

    await phoneNumberElement.fill(partnerInfo.accountInfo!.phoneNumber);

    const jobTitleElement = this.page.locator(CreateNewPartnerModalLocator.jobTitle);

    await jobTitleElement.fill(partnerInfo.accountInfo!.jobTitle);

    await this.page.locator(CreateNewPartnerModalLocator.email).fill(partnerInfo.accountInfo!.email);
  }

  public async getDuplicatedText(partnerInfo: Partner): Promise<void> {
    await this.fillUserInfoToCreatePartner(partnerInfo);

    await this.page.locator(CreateNewPartnerModalLocator.createPartnerButton).click();
  }

  public async fillCreatePartnerForm(partnerInfo: Partner) {
    await this.fillUserInfoToCreatePartner(partnerInfo);

    if (partnerInfo.partnerInfo!.paymentOption) {
      await this.page.locator(CreateNewPartnerModalLocator.paymentOption).scrollIntoViewIfNeeded();

      try {
        await this.dropdown.selectByText(CreateNewPartnerModalLocator.paymentOption, partnerInfo.partnerInfo!.paymentOption);
      } catch (error) {
        throw new Error("Payment option does not exist");
      }
    }

    if (!partnerInfo.partnerInfo?.isPublic) {
      await this.page.locator(CreateNewPartnerModalLocator.isPublic).scrollIntoViewIfNeeded();
      await this.page.locator(CreateNewPartnerModalLocator.isPublic).click();
    }

    if (partnerInfo.partnerInfo!.productsType) {
      await this.page.locator(CreateNewPartnerModalLocator.productsType).scrollIntoViewIfNeeded();

      try {
        for (let i = 0; i < partnerInfo.partnerInfo!.productsType.length; ++i) await this.dropdown.selectByText(CreateNewPartnerModalLocator.productsType, partnerInfo.partnerInfo!.productsType[i]);
      } catch (error) {
        throw new Error("Product type does not exist");
      }
    }

    if (partnerInfo.partnerInfo!.bankTransfer === true && partnerInfo.partnerInfo!.paymentOption === "Partner/Consultant Owner") {
      await this.page.locator(CreateNewPartnerModalLocator.bankTransfer).scrollIntoViewIfNeeded();
      await this.page.locator(CreateNewPartnerModalLocator.bankTransfer).click();

      if (partnerInfo.partnerInfo!.plan && !partnerInfo.partnerInfo!.productsType) {
        try {
          await this.dropdown.selectByText(CreateNewPartnerModalLocator.plan, partnerInfo.partnerInfo!.plan);
        } catch (error) {
          throw new Error("Plan does not exist");
        }
      }
      const numberOfLabelsInBillingCycle = await this.page.locator(CreateNewPartnerModalLocator.billingCycle).count();

      if (partnerInfo.partnerInfo!.billingCycleRadio && numberOfLabelsInBillingCycle == 2)
        try {
          await this.selectRadio(partnerInfo.partnerInfo!.billingCycleRadio, CreateNewPartnerModalLocator.billingCycle);
        } catch (error) {
          throw new Error("Billing cycle does not exist");
        }
    }

    if (partnerInfo.partnerInfo?.internal === true) await this.page.locator(CreateNewPartnerModalLocator.internal).click();

    await this.page.locator(CreateNewPartnerModalLocator.createPartnerButton).click();

    if (partnerInfo.partnerInfo?.bankTransfer === true && partnerInfo.partnerInfo.paymentOption === "Partner/Consultant Owner")
      await this.page.locator(CreateNewPartnerModalLocator.confirmButton).click();
  }

  public async fillFormToAddPeo(peoPartners: PeoPartner) {
    const addPeoConsultantButtonEl = await this.getLocator(DetailOfPartnerLocator.addPeoConsultant_btn);

    await this.page.locator(DetailOfPartnerLocator.addPeoConsultant_btn).click();

    const nameEl = this.page.locator(PeoConsultantAdditionLocator.nameInput);

    const emailInputEl = this.page.locator(PeoConsultantAdditionLocator.emailInput);

    const firstNameInputEl = this.page.locator(PeoConsultantAdditionLocator.firstNameInput);

    const lastNameInputEl = this.page.locator(PeoConsultantAdditionLocator.lastNameInput);

    const phoneNumberInputEl = this.page.locator(PeoConsultantAdditionLocator.phoneNumberInput).last();

    const jobTitleInputEl = this.page.locator(PeoConsultantAdditionLocator.jobTitleInput);

    const customBrandingEl = this.page.locator(PeoConsultantAdditionLocator.customBranding);

    const customBenefitsPlanEl = this.page.locator(PeoConsultantAdditionLocator.customBenefitsPlan);

    const internalEl = this.page.locator(PeoConsultantAdditionLocator.internal);

    const externalEl = this.page.locator(PeoConsultantAdditionLocator.external);

    const backURLEl = this.page.locator(PeoConsultantAdditionLocator.backURL);

    const backTextEl = this.page.locator(PeoConsultantAdditionLocator.backText);

    const createButtonEl = this.page.locator(PeoConsultantAdditionLocator.createButton);

    await nameEl.fill(peoPartners.peoPartnerInfo?.name!);

    await emailInputEl.fill(peoPartners.accountInfo?.email!);

    await firstNameInputEl.fill(peoPartners.accountInfo?.firstName!);

    await lastNameInputEl.fill(peoPartners.accountInfo?.lastName!);

    await phoneNumberInputEl.fill(peoPartners.accountInfo?.phoneNumber!);

    await jobTitleInputEl.fill(peoPartners.accountInfo?.jobTitle!);

    if (peoPartners.peoPartnerInfo?.customBranding === true) await customBrandingEl.click();

    if (peoPartners.peoPartnerInfo?.companyType === "Internal") await internalEl.click();
    else await externalEl.click();

    if (peoPartners.peoPartnerInfo?.customBenefitsPlans === true) await customBenefitsPlanEl.click();

    if (peoPartners.peoPartnerInfo?.backURL !== "") await backURLEl.click();

    if (peoPartners.peoPartnerInfo?.backText !== "") await backTextEl.click();

    await createButtonEl.click();
  }

  public async clickDetailButton(user: Partner | UserInfo | CustomerInfo) {
    let userPhoneNumber;

    if (user instanceof Partner || user instanceof CustomerInfo) userPhoneNumber = user.accountInfo?.phoneNumber;
    else userPhoneNumber = user.phoneNumber;

    const rawDetailLocator = CommonPartnerLocator.detailButton;

    const detailButtonLocator = rawDetailLocator.replace("phoneNumberValue", userPhoneNumber!);

    await this.page.locator(detailButtonLocator).last().scrollIntoViewIfNeeded();

    await this.page.locator(detailButtonLocator).last().click({ timeout: 10000 });
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

  public moveToManagementCategory = async () => await this.page.locator(CommonAdminPortalLocator.managementCategory).click();

  public async accessToManagementPage(category = "Partner") {
    await this.moveToManagementCategory();

    if (category === "Partner") {
      const partnerManagementCategory = this.page.locator(CommonAdminPortalLocator.partnerManagement);

      try {
        await partnerManagementCategory.first().click({ timeout: 5000 });
      } catch (error) {
        await partnerManagementCategory.last().click({ timeout: 5000 });
      }
    } else if (category === "Member" || category === "Customer") {
      const customerManagementCategory = this.page.locator(CommonAdminPortalLocator.customerManagement);

      try {
        await customerManagementCategory.first().click({ timeout: 5000 });
      } catch (error) {
        await customerManagementCategory.last().click({ timeout: 5000 });
      }
    }
  }

  public async addCustomerMembersInPartManaPage(partner: Partner, invitedMembers: UserInfo[]) {
    await this.clickDetailButton(partner);

    await this.page.locator(DetailOfPartnerLocator.addMemberButton).click();
  }
}
