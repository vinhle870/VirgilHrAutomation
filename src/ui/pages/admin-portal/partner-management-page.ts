import { Locator, Page } from "@playwright/test";
import { BasePage } from "src/ui/pages/base-page";
import { CommonAdminPortalLocator } from "./locators/common/common";
import { CommonPartnerLocator } from "./locators/partner-management/locator/common";
import { CreateNewPartnerModalLocator } from "./locators/partner-management/locator/new-partner";
import delay from "src/utilities/delay";
import { TeamAdditionLocator } from "./locators/partner-management/locator/team-addition";
import { DetailOfPartnerLocator } from "./locators/partner-management/locator/detail";
import { OnboardingFlow } from "src/ui/flows";
import { TempEmailFreePage } from "../shared";
import IPartnerFilter from "src/objects/ipartnerfilter";
import { PartnerFilterLocator } from "./locators/partner-management/locator/filter-partner";
import { PeoPartner } from "src/objects/ipeopartner";
import { PeoConsultantAdditionLocator } from "./locators/partner-management/locator/peo-consultant-addition";
import { Partner, UserInfo } from "src/objects";
import { CommonPortalLocators } from "src/ui/Locator/common";

export class PartnerManagementPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  public async moveToPartnerCategory() {
    const managementCategory = await this.getLocator(CommonAdminPortalLocator.managementCategory);
    await managementCategory.click();
  }

  public async moveToPartnerManagement() {
    const partnerManagementCategory = await this.getLocator(CommonAdminPortalLocator.partnerManagement);

    await partnerManagementCategory.click();
  }

  public async createPartner(partnerInfo: Partner, i = 0): Promise<Page> {
    await this.moveToPartnerCategory();

    if (i === 0) await this.moveToPartnerManagement();

    (await this.getLocator(CommonPartnerLocator.createNewPartnerButton)).click({ timeout: 5000 });

    if (!partnerInfo.partnerInfo || !partnerInfo.partnerInfo.departmentName) {
      throw new Error("Department name does not exist or is empty");
    }

    await this.dropdown.selectByText(CreateNewPartnerModalLocator.department, partnerInfo.partnerInfo.departmentName);

    await delay(3000);

    if (partnerInfo.partnerInfo!.partnerLevel) {
      try {
        await this.dropdown.selectByText(CreateNewPartnerModalLocator.partnerLevel, partnerInfo.partnerInfo!.partnerLevel);
      } catch (error) {
        throw new Error("Partner level does not exist");
      }
    }

    const nameElement = await this.getLocator(CreateNewPartnerModalLocator.nameOfPartner);

    await nameElement.fill(partnerInfo.accountInfo!.firstName);

    const subDomainElement = await this.getLocator(CreateNewPartnerModalLocator.subDomain);

    const standardSubdomain = partnerInfo.partnerInfo!.subDomain.replace(/[^a-zA-Z0-9]/g, "");

    await subDomainElement.fill(standardSubdomain);

    const firstNameElement = await this.getLocator(CreateNewPartnerModalLocator.firstName);

    await firstNameElement.scrollIntoViewIfNeeded();

    await firstNameElement.fill(partnerInfo.accountInfo!.firstName!);

    const lastNameElement = await this.getLocator(CreateNewPartnerModalLocator.lastName);

    await lastNameElement.fill(partnerInfo.accountInfo!.lastName);

    const phoneNumberElement = await this.getLocator(CreateNewPartnerModalLocator.contactNumber);

    await phoneNumberElement.fill(partnerInfo.accountInfo!.phoneNumber);

    const jobTitleElement = await this.getLocator(CreateNewPartnerModalLocator.jobTitle);

    await jobTitleElement.fill(partnerInfo.accountInfo!.jobTitle);

    if (partnerInfo.partnerInfo!.paymentOption) {
      await (await this.getLocator(CreateNewPartnerModalLocator.paymentOption)).scrollIntoViewIfNeeded();

      try {
        await this.dropdown.selectByText(CreateNewPartnerModalLocator.paymentOption, partnerInfo.partnerInfo!.paymentOption);
      } catch (error) {
        throw new Error("Payment option does not exist");
      }
    }

    if (!partnerInfo.partnerInfo?.isPublic) {
      await (await this.getLocator(CreateNewPartnerModalLocator.isPublic)).scrollIntoViewIfNeeded();
      await (await this.getLocator(CreateNewPartnerModalLocator.isPublic)).click();
    }

    if (partnerInfo.partnerInfo!.productsType) {
      await (await this.getLocator(CreateNewPartnerModalLocator.productsType)).scrollIntoViewIfNeeded();

      try {
        for (let i = 0; i < partnerInfo.partnerInfo!.productsType.length; ++i) await this.dropdown.selectByText(CreateNewPartnerModalLocator.productsType, partnerInfo.partnerInfo!.productsType[i]);
      } catch (error) {
        throw new Error("Product type does not exist");
      }
    }

    await (await this.getLocator(CreateNewPartnerModalLocator.email)).fill(partnerInfo.accountInfo!.email);

    if (partnerInfo.partnerInfo!.bankTransfer === true && partnerInfo.partnerInfo!.paymentOption === "Partner/Consultant Owner") {
      await (await this.getLocator(CreateNewPartnerModalLocator.bankTransfer)).scrollIntoViewIfNeeded();
      await (await this.getLocator(CreateNewPartnerModalLocator.bankTransfer)).click();

      if (partnerInfo.partnerInfo!.plan && !partnerInfo.partnerInfo!.productsType) {
        try {
          await this.dropdown.selectByText(CreateNewPartnerModalLocator.plan, partnerInfo.partnerInfo!.plan);
        } catch (error) {
          throw new Error("Plan does not exist");
        }
      }
      const numberOfLabelsInBillingCycle = await (await this.getLocator(CreateNewPartnerModalLocator.billingCycle)).count();

      if (partnerInfo.partnerInfo!.billingCycleRadio && numberOfLabelsInBillingCycle == 2) {
        try {
          await this.selectRadio(partnerInfo.partnerInfo!.billingCycleRadio, CreateNewPartnerModalLocator.billingCycle);
        } catch (error) {
          throw new Error("Billing cycle does not exist");
        }
      }
    }

    if (partnerInfo.partnerInfo!.internal === true) await (await this.getLocator(CreateNewPartnerModalLocator.internal)).click();

    await (await this.getLocator(CreateNewPartnerModalLocator.createPartnerButton)).click();

    if (partnerInfo.partnerInfo.bankTransfer === true && partnerInfo.partnerInfo.paymentOption === "Partner/Consultant Owner")
      await (await this.getLocator(CreateNewPartnerModalLocator.confirmButton)).click();

    return this.page;
  }

  public async addMoreMembers(partner: Partner, invitedMembers: UserInfo[], page = this.page): Promise<void> {
    if (invitedMembers?.length === 0) throw new Error("There is no any member to add");

    const partnerPhoneNumber = partner.accountInfo?.phoneNumber;

    if (!partnerPhoneNumber) {
      throw new Error("Partner phone number is missing");
    }

    const rawDetailLocator = CommonPartnerLocator.detailButton;

    const detailButtonLocator = rawDetailLocator.replace("phoneNumberValue", partnerPhoneNumber!);

    await this.page.locator(detailButtonLocator).last().click();

    await (await this.getLocator(DetailOfPartnerLocator.addMemberButton)).click();

    this.inviteMembersByEmail(invitedMembers, page);
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

  public async addPeoConsultant(partner: Partner, peoPartners: PeoPartner[], onboardingFlow: OnboardingFlow, tempEmailFreePage: TempEmailFreePage): Promise<string> {
    if (partner.partnerInfo!.partnerLevel !== "Partner") throw new Error("Partner must be a partner not PEO");

    const partnerPhoneNumber = partner.accountInfo?.phoneNumber;

    if (!partnerPhoneNumber) {
      throw new Error("Partner phone number is missing");
    }

    const rawDetailLocator = CommonPartnerLocator.detailButton;

    const detailButtonLocator = rawDetailLocator.replace("phoneNumberValue", partnerPhoneNumber!);

    const detailButtonEl = this.page.locator(detailButtonLocator).last();

    await detailButtonEl.click();

    const addPeoConsultantButtonEl = await this.getLocator(DetailOfPartnerLocator.addPeoConsultantButton);

    await addPeoConsultantButtonEl.click();

    const nameEl = await this.getLocator(PeoConsultantAdditionLocator.nameInput);

    const emailInputEl = await this.getLocator(PeoConsultantAdditionLocator.emailInput);

    const firstNameInputEl = await this.getLocator(PeoConsultantAdditionLocator.firstNameInput);

    const lastNameInputEl = await this.getLocator(PeoConsultantAdditionLocator.lastNameInput);

    const phoneNumberInputEl = this.page.locator(PeoConsultantAdditionLocator.phoneNumberInput).last();

    const jobTitleInputEl = await this.getLocator(PeoConsultantAdditionLocator.jobTitleInput);

    const customBrandingEl = await this.getLocator(PeoConsultantAdditionLocator.customBranding);

    const customBenefitsPlanEl = await this.getLocator(PeoConsultantAdditionLocator.customBenefitsPlan);

    const internalEl = await this.getLocator(PeoConsultantAdditionLocator.internal);

    const externalEl = await this.getLocator(PeoConsultantAdditionLocator.external);

    const backURLEl = await this.getLocator(PeoConsultantAdditionLocator.backURL);

    const backTextEl = await this.getLocator(PeoConsultantAdditionLocator.backText);

    const createButtonEl = await this.getLocator(PeoConsultantAdditionLocator.createButton);

    for (let i = 0; i < peoPartners.length; i++) {
      if (i !== 0 && i < peoPartners.length - 1) await addPeoConsultantButtonEl.click();

      await nameEl.fill(peoPartners[i].peoPartnerInfo?.name!);

      await emailInputEl.fill(peoPartners[i].accountInfo?.email!);

      await firstNameInputEl.fill(peoPartners[i].accountInfo?.firstName!);

      await lastNameInputEl.fill(peoPartners[i].accountInfo?.lastName!);

      await phoneNumberInputEl.fill(peoPartners[i].accountInfo?.phoneNumber!);

      await jobTitleInputEl.fill(peoPartners[i].accountInfo?.jobTitle!);

      if (peoPartners[i].peoPartnerInfo?.customBranding === true) {
        await customBrandingEl.click();
      }

      if (peoPartners[i].peoPartnerInfo?.companyType === "Internal") {
        await internalEl.click();
      } else await externalEl.click();

      if (peoPartners[i].peoPartnerInfo?.customBenefitsPlans === true) await customBenefitsPlanEl.click();

      if (peoPartners[i].peoPartnerInfo?.backURL !== "") await backURLEl.click();

      if (peoPartners[i].peoPartnerInfo?.backText !== "") await backTextEl.click();

      await createButtonEl.click();
    }

    await delay(5000);

    for (const member of peoPartners) {
      await onboardingFlow.credential(tempEmailFreePage, member.accountInfo?.email!);
    }

    return "Pass";
  }

  public async getDuplicatedText(): Promise<Locator> {
    const duplicatedEmailText = CreateNewPartnerModalLocator.duplicatedEmailText;

    const duplicatedEmailEl = await this.getLocator(duplicatedEmailText);

    return duplicatedEmailEl;
  }

  public async refreshPage(page = this.page): Promise<void> {
    await page.reload();
  }
}
