import { Locator, Page } from "@playwright/test";
import { BasePage } from "src/ui/pages/base-page";
import { CommonLocator } from "./locators/common.locator";
import { CommonPartnerLocator } from "./locators/partner-management/common";
import { CreateNewPartnerModalLocator } from "./locators/partner-management/new-partner";
import delay from "src/utilities/delay";
import { TeamAddition } from "./locators/partner-management/team-addition";
import { DetailOfPartnerLocator } from "./locators/partner-management/detail";
import { OnboardingFlow } from "src/ui/flows";
import { TempEmailFreePage } from "../shared-pages";
import IPartnerFilter from "src/objects/ipartnerfilter";
import { PartnerFilter } from "./locators/partner-management/filter-partner";
import { PeoPartner } from "src/objects/ipeopartner";
import { PeoConsultantAddition } from "./locators/partner-management/peo-consultant-addition";
import { Partner, UserInfo } from "src/objects";

export class PartnerManagementPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  public async createPartner(partnerInfo: Partner, i = 0): Promise<Page> {
    const managementCategory = await this.getLocator(CommonLocator.managementCategory);

    await managementCategory.click();

    if (i === 0) {
      const partnerManagementCategory = await this.getLocator(CommonLocator.partnerManagement);

      await partnerManagementCategory.click();
    }

    (await this.getLocator(CommonPartnerLocator.createNewPartnerButton)).click({ timeout: 5000 });

    if (!partnerInfo.partnerInfo || !partnerInfo.partnerInfo.departmentName) {
      throw new Error("Department name does not exist or is empty");
    }

    try {
      await this.dropdown.selectByText(CreateNewPartnerModalLocator.department, partnerInfo.partnerInfo.departmentName);
    } catch (error) {
      (await this.getLocator(CreateNewPartnerModalLocator.department)).click();
      await this.dropdown.selectByText(CreateNewPartnerModalLocator.department, partnerInfo.partnerInfo.departmentName);
    }

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

  public async addMoreMembers(partner: Partner, invitedMembers: UserInfo[], onboardingFlow: OnboardingFlow, tempEmailFreePage: TempEmailFreePage) {
    if (invitedMembers?.length === 0) throw new Error("There is no any member to add");

    const partnerPhoneNumber = partner.accountInfo?.phoneNumber;

    if (!partnerPhoneNumber) {
      throw new Error("Partner phone number is missing");
    }

    const rawDetailLocator = CommonPartnerLocator.detailButton;

    const detailButtonLocator = rawDetailLocator.replace("phoneNumberValue", partnerPhoneNumber!);

    const detailButtonEl = this.page.locator(detailButtonLocator).last();

    await detailButtonEl.click();

    const addMembersButtonEl = this.getLocator(DetailOfPartnerLocator.addMemberButton);

    (await addMembersButtonEl).click();

    let emailEl = await this.getLocator(TeamAddition.emailInput);
    let firstNameElement = await this.getLocator(TeamAddition.firstNameInput);
    let lastNameElement = await this.getLocator(TeamAddition.lastNameInput);
    let phoneNumberElement = await this.getLocator(TeamAddition.phoneNumberInput);
    let jobTitleElement = await this.getLocator(TeamAddition.jobTitleInput);

    if (invitedMembers?.length === 1) {
      await emailEl.fill(invitedMembers[0].email);

      await firstNameElement.fill(invitedMembers[0].firstName!);

      await lastNameElement.fill(invitedMembers[0].lastName!);

      await phoneNumberElement.fill(invitedMembers[0].phoneNumber!);

      await jobTitleElement.fill(invitedMembers[0].jobTitle!);

      await this.dropdown.selectByText(TeamAddition.roleInput, invitedMembers[0].invitedRole!);
    } else if (invitedMembers?.length > 1) {
      const addMoreButton = TeamAddition.addMoreButton;
      const addMoreButtonEl = await this.getLocator(addMoreButton);

      for (let i = 0; i < invitedMembers?.length; i++) {
        if (i < invitedMembers?.length - 1) await addMoreButtonEl.click();

        await emailEl.nth(i).fill(invitedMembers[i].email!);

        await firstNameElement.nth(i).fill(invitedMembers[i].firstName!);

        await lastNameElement.nth(i).fill(invitedMembers[i].lastName!);

        await phoneNumberElement.nth(i).fill(invitedMembers[i].phoneNumber!);

        await jobTitleElement.nth(i).fill(invitedMembers[i].jobTitle!);

        await this.dropdown.selectByText(TeamAddition.roleInput, invitedMembers[i].invitedRole!);
      }
    }
    await (await this.getLocator(TeamAddition.sendInviteButton)).click();

    for (const member of invitedMembers) {
      const localPart = member.email.split("@")[0];
      await onboardingFlow.acceptInvitation(tempEmailFreePage, localPart);
    }
  }
  async filter(partFilterInfo: IPartnerFilter): Promise<string> {
    try {
      const filterButtonEl = await this.getLocator(CommonPartnerLocator.filterPartnerButton);

      await filterButtonEl.click();

      if (partFilterInfo.name) await (await this.getLocator(PartnerFilter.searchedName)).fill(partFilterInfo.name);

      if (partFilterInfo.level) await this.dropdown.selectByText(PartnerFilter.searchedLevel, partFilterInfo.level);

      await delay(5000);

      if (partFilterInfo.department) await this.dropdown.selectByText(PartnerFilter.searchedDepartment, partFilterInfo.department);
      await delay(5000);

      await (await this.getLocator(PartnerFilter.applyButton)).click();
    } catch (error) {
      return "Failed";
    }

    return "Pass";
  }

  public async sorting(typeOfSorting: string): Promise<string> {
    try {
      const managementCategory = await this.getLocator(CommonLocator.managementCategory);

      await managementCategory.click();

      const partnerManagementCategory = await this.getLocator(CommonLocator.partnerManagement);

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

    const nameEl = await this.getLocator(PeoConsultantAddition.nameInput);

    const emailInputEl = await this.getLocator(PeoConsultantAddition.emailInput);

    const firstNameInputEl = await this.getLocator(PeoConsultantAddition.firstNameInput);

    const lastNameInputEl = await this.getLocator(PeoConsultantAddition.lastNameInput);

    const phoneNumberInputEl = this.page.locator(PeoConsultantAddition.phoneNumberInput).last();

    const jobTitleInputEl = await this.getLocator(PeoConsultantAddition.jobTitleInput);

    const customBrandingEl = await this.getLocator(PeoConsultantAddition.customBranding);

    const customBenefitsPlanEl = await this.getLocator(PeoConsultantAddition.customBenefitsPlan);

    const internalEl = await this.getLocator(PeoConsultantAddition.internal);

    const externalEl = await this.getLocator(PeoConsultantAddition.external);

    const backURLEl = await this.getLocator(PeoConsultantAddition.backURL);

    const backTextEl = await this.getLocator(PeoConsultantAddition.backText);

    const createButtonEl = await this.getLocator(PeoConsultantAddition.createButton);

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
      await onboardingFlow.activateAccountAndSetPassword(tempEmailFreePage, member.accountInfo?.email!);
    }

    return "Pass";
  }

  public async getDuplicatedText(): Promise<Locator> {
    const duplicatedEmailText = CreateNewPartnerModalLocator.duplicatedEmailText;

    const duplicatedEmailEl = await this.getLocator(duplicatedEmailText);

    return duplicatedEmailEl;
  }
}
