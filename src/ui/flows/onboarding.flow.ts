import { Page } from "@playwright/test";
import { CommonPartnerPortalLocator } from "../pages/partner-portal/locators/common";
import { BusinessLocator } from "../pages/partner-portal/locators/business";
import { Partner, UserInfo } from "src/objects";
import refreshPage from "src/utilities/refresh";
import { CommonAdminPortalLocator } from "../pages/admin-portal/locators/common/common.locator";
import { CommonPartnerLocator } from "../pages/admin-portal/locators/partner-management/locator/common";
import delay from "src/utilities/delay";
import { CreateNewPartnerModalLocator } from "../pages/admin-portal/locators/partner-management/locator/new-partner";
import { PeoConsultantAdditionLocator } from "../pages/admin-portal/locators/partner-management/locator/peo-consultant-addition";
import { DetailOfPartnerLocator } from "../pages/admin-portal/locators/partner-management/locator/detail";
import { PeoPartner } from "src/objects/ipeopartner";
import { TempEmailFreePage } from "../pages";
import { UiAssert } from "src/assertions";

/**
 * This flow class contains methods related to the onboarding process of both partner and member users, such as accepting invitations, credentialing, buying plans, and creating a business.
 *Flows:
 * Flow #1: Create Partner from different portals-> Add Partner member with different role
 * Flow #2: Create Partner from different portals -> Add Business -> Add team members
 * Flow #3: Create Customer Under Partner -> Add Business -> Add team members
 * Flow #4: Sign up Individual Customer from member portal
 */

export class OnboardingFlow {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  public async createBusinessFromPartnerPortal(partnerInfo: Partner, owner?: UserInfo) {
    if (partnerInfo.partnerInfo?.paymentOption !== "Member Portal Consumer" && partnerInfo.partnerInfo?.paymentOption !== "Partner/Consultant Owner")
      throw new Error("Payment option must be Member Portal Consumer or Partner/Consultant Owner");

    try {
      await this.page.locator(CommonPartnerPortalLocator.closeButton).click({ timeout: 7000 });
    } catch (error) {
      console.log("There is no closing button");
    }

    try {
      await this.page.locator(CommonPartnerPortalLocator.closeTestModal).first().click({ timeout: 7000 });
    } catch (error) {
      console.log("There is no modal");
    }

    await this.page.locator(CommonPartnerPortalLocator.clientButton).click({ timeout: 10000 });

    await this.page.locator(BusinessLocator.businessTab).click({ timeout: 10000 });

    await this.page.locator(BusinessLocator.addBussinessButton).click({ timeout: 5000 });

    await this.page.locator(BusinessLocator.teamNameInput).fill("Team", { timeout: 5000 });

    if (partnerInfo.partnerInfo?.paymentOption === "Member Portal Consumer") {
      if (!owner) throw new Error("Owner infor is missing");

      await this.page.locator(BusinessLocator.emailInput).fill(owner.email);

      const firstName = this.page.locator(BusinessLocator.firstNameInput);
      await firstName.fill(owner.firstName);

      await this.page.locator(BusinessLocator.lastNameInput).fill(owner.lastName);

      await this.page.locator(BusinessLocator.phoneNumberInput).fill(owner.phoneNumber);

      await this.page.locator(BusinessLocator.jobTitleInput).fill(owner.jobTitle);
    }

    await this.page.locator(BusinessLocator.firstAddButton).click({ timeout: 20000 });

    await this.page.locator(BusinessLocator.seccondAddButton).first().click({ timeout: 20000 });

    await this.page.locator(BusinessLocator.viewButton).click({ timeout: 20000 });

    await this.page.locator(BusinessLocator.ownerText).waitFor({ state: "visible", timeout: 5000 });

    return this.page.locator(BusinessLocator.ownerText);
  }

  public async verifyPartnerVisible(partnerInfo: Partner) {
    const partnerEmailLocator = this.page!.getByText(partnerInfo!.accountInfo!.email);
    try {
      await UiAssert.allVisible([partnerEmailLocator]);
    } catch (error) {
      await refreshPage(this.page);
      await UiAssert.allVisible([partnerEmailLocator]);
    }
  }

  public async createPartner(partnerInfo: Partner, i = 0): Promise<void> {
    const managementCategory = await this.page.locator(CommonAdminPortalLocator.managementCategory);
    await managementCategory.click();

    if (i === 0) {
      const partnerManagementCategory = this.page.locator(CommonAdminPortalLocator.partnerManagement);

      try {
        await partnerManagementCategory.first().click({ timeout: 5000 });
      } catch (error) {
        await partnerManagementCategory.last().click({ timeout: 5000 });
      }
    }

    this.page.locator(CommonPartnerLocator.createNewPartnerButton).click({ timeout: 5000 });

    if (!partnerInfo.partnerInfo || !partnerInfo.partnerInfo.departmentName) {
      throw new Error("Department name does not exist or is empty");
    }

    await delay(5000);

    await this.dropdown.selectByText(CreateNewPartnerModalLocator.department, partnerInfo.partnerInfo.departmentName, this.page, 5000);

    await delay(3000);

    if (partnerInfo.partnerInfo!.partnerLevel) {
      try {
        await this.dropdown.selectByText(CreateNewPartnerModalLocator.partnerLevel, partnerInfo.partnerInfo!.partnerLevel);
      } catch (error) {
        throw new Error("Partner level does not exist");
      }
    }

    const nameElement = this.page.locator(CreateNewPartnerModalLocator.nameOfPartner);

    await nameElement.fill(partnerInfo.accountInfo!.firstName);

    const subDomainElement = this.page.locator(CreateNewPartnerModalLocator.subDomain);

    const standardSubdomain = partnerInfo.partnerInfo!.subDomain.replace(/[^a-zA-Z0-9]/g, "");

    await subDomainElement.fill(standardSubdomain);

    const firstNameElement = this.page.locator(CreateNewPartnerModalLocator.firstName);

    await firstNameElement.scrollIntoViewIfNeeded();

    await firstNameElement.fill(partnerInfo.accountInfo!.firstName!);

    const lastNameElement = await this.page.locator(CreateNewPartnerModalLocator.lastName);

    await lastNameElement.fill(partnerInfo.accountInfo!.lastName);

    const phoneNumberElement = this.page.locator(CreateNewPartnerModalLocator.contactNumber);

    await phoneNumberElement.fill(partnerInfo.accountInfo!.phoneNumber);

    const jobTitleElement = this.page.locator(CreateNewPartnerModalLocator.jobTitle);

    await jobTitleElement.fill(partnerInfo.accountInfo!.jobTitle);

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

    await this.page.locator(CreateNewPartnerModalLocator.email).fill(partnerInfo.accountInfo!.email);

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
      const numberOfLabelsInBillingCycle = await (await this.getLocator(CreateNewPartnerModalLocator.billingCycle)).count();

      if (partnerInfo.partnerInfo!.billingCycleRadio && numberOfLabelsInBillingCycle == 2) {
        try {
          await this.selectRadio(partnerInfo.partnerInfo!.billingCycleRadio, CreateNewPartnerModalLocator.billingCycle);
        } catch (error) {
          throw new Error("Billing cycle does not exist");
        }
      }
    }

    if (partnerInfo.partnerInfo!.internal === true) await this.page.locator(CreateNewPartnerModalLocator.internal).click();

    await this.page.locator(CreateNewPartnerModalLocator.createPartnerButton).click();

    if (partnerInfo.partnerInfo.bankTransfer === true && partnerInfo.partnerInfo.paymentOption === "Partner/Consultant Owner")
      await this.page.locator(CreateNewPartnerModalLocator.confirmButton).click();
  }

  public async addPeoConsultant(partner: Partner, peoPartners: PeoPartner[], tempEmailFreePage: TempEmailFreePage): Promise<string> {
    const partnerPhoneNumber = partner.accountInfo?.phoneNumber;

    if (!partnerPhoneNumber) {
      throw new Error("Partner phone number is missing");
    }

    const rawDetailLocator = CommonPartnerLocator.detailButton;

    const detailButtonLocator = rawDetailLocator.replace("phoneNumberValue", partnerPhoneNumber!);

    const detailButtonEl = this.page.locator(detailButtonLocator).last();

    await detailButtonEl.click();

    const addPeoConsultantButtonEl = this.page.locator(DetailOfPartnerLocator.addPeoConsultantButton);

    await addPeoConsultantButtonEl.click();

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

    return "Pass";
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

    await this.page.locator(DetailOfPartnerLocator.addMemberButton).click();

    this.inviteMembersByEmail(invitedMembers, page);
  }
}
