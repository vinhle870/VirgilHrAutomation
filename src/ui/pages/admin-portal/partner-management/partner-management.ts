import { Locator, Page } from "@playwright/test";
import { BasePage } from "src/ui/pages/base-page";
import { CommonLocator } from "../locators/common.locator";
import { CommonPartnerLocator } from "../locators/partner-management/common";
import { CreateNewPartnerModalLocator } from "../locators/partner-management/new-partner";
import { Partner, UserInfo } from "src/objects";
import delay from "src/utilities/delay";
import { TeamAddition } from "../locators/partner-management/team-addition";
import { DetailOfPartnerLocator } from "../locators/partner-management/detail";

export class PartnerManagementPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  public async createPartner(partnerInfo: Partner): Promise<Locator> {
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

    if (!partnerInfo.partnerInfo || !partnerInfo.partnerInfo.departmentName) {
      throw new Error("Department name does not exist or is empty");
    }

    this.selectDropdownOptionByText(
      CreateNewPartnerModalLocator.department,
      partnerInfo.partnerInfo.departmentName,
    );

    await delay(5000);

    if (partnerInfo.partnerInfo!.partnerLevel) {
      try {
        this.selectDropdownOptionByText(
          CreateNewPartnerModalLocator.partnerLevel,
          partnerInfo.partnerInfo!.partnerLevel,
        );
      } catch (error) {
        throw new Error("Partner level does not exist");
      }
    }

    const nameElement = await this.getLocator(
      CreateNewPartnerModalLocator.nameOfPartner,
    );

    await nameElement.fill(partnerInfo.accountInfo!.firstName);

    const subDomainElement = await this.getLocator(
      CreateNewPartnerModalLocator.subDomain,
    );

    const standardSubdomain = partnerInfo.partnerInfo!.subDomain.replace(
      /[^a-zA-Z0-9]/g,
      "",
    );

    await subDomainElement.fill(standardSubdomain);

    const firstNameElement = await this.getLocator(
      CreateNewPartnerModalLocator.firstName,
    );

    await firstNameElement.scrollIntoViewIfNeeded();

    await firstNameElement.fill(partnerInfo.accountInfo!.firstName!);

    const lastNameElement = await this.getLocator(
      CreateNewPartnerModalLocator.lastName,
    );

    await lastNameElement.fill(partnerInfo.accountInfo!.lastName);

    const phoneNumberElement = await this.getLocator(
      CreateNewPartnerModalLocator.contactNumber,
    );

    await phoneNumberElement.fill(partnerInfo.accountInfo!.phoneNumber);

    const jobTitleElement = await this.getLocator(
      CreateNewPartnerModalLocator.jobTitle,
    );

    await jobTitleElement.fill(partnerInfo.accountInfo!.jobTitle);

    if (partnerInfo.partnerInfo!.paymentOption) {
      const paymentOptionElement = await this.getLocator(
        CreateNewPartnerModalLocator.paymentOption,
      );

      await paymentOptionElement.scrollIntoViewIfNeeded();

      try {
        await this.selectDropdownOptionByText(
          CreateNewPartnerModalLocator.paymentOption,
          partnerInfo.partnerInfo!.paymentOption,
        );
      } catch (error) {
        throw new Error("Payment option does not exist");
      }
    }

    if (!partnerInfo.partnerInfo?.isPublic) {
      const isPublic = await this.getLocator(
        CreateNewPartnerModalLocator.isPublic,
      );

      await isPublic.scrollIntoViewIfNeeded();

      await isPublic.click();
    }

    if (partnerInfo.partnerInfo!.productsType) {
      const productsTypeElement = await this.getLocator(
        CreateNewPartnerModalLocator.productsType,
      );
      await productsTypeElement.scrollIntoViewIfNeeded();

      try {
        for (let i = 0; i < partnerInfo.partnerInfo!.productsType.length; ++i)
          await this.selectDropdownOptionByText(
            CreateNewPartnerModalLocator.productsType,
            partnerInfo.partnerInfo!.productsType[i],
          );
      } catch (error) {
        throw new Error("Product type does not exist");
      }
    }

    const emailElement = await this.getLocator(
      CreateNewPartnerModalLocator.email,
    );

    await emailElement.fill(partnerInfo.accountInfo!.email);

    if (partnerInfo.partnerInfo!.bankTransfer === true) {
      const bankTranferElement = await this.getLocator(
        CreateNewPartnerModalLocator.bankTransfer,
      );

      await bankTranferElement.scrollIntoViewIfNeeded();

      await bankTranferElement.click();

      if (
        partnerInfo.partnerInfo!.plan &&
        !partnerInfo.partnerInfo!.productsType
      ) {
        try {
          await this.selectDropdownOptionByText(
            CreateNewPartnerModalLocator.plan,
            partnerInfo.partnerInfo!.plan,
          );
        } catch (error) {
          throw new Error("Plan does not exist");
        }
      }
      const numberOfLabelsInBillingCycle = await this.getLocator(
        CreateNewPartnerModalLocator.billingCycle,
      );

      const numberOfLabel = await numberOfLabelsInBillingCycle.count();

      if (partnerInfo.partnerInfo!.billingCycleRadio && numberOfLabel == 2) {
        try {
          await this.selectRadio(
            partnerInfo.partnerInfo!.billingCycleRadio,
            CreateNewPartnerModalLocator.billingCycle,
          );
        } catch (error) {
          throw new Error("Billing cycle does not exist");
        }
      }
    }

    if (partnerInfo.partnerInfo!.internal === true) {
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

    if (partnerInfo.partnerInfo.bankTransfer === true) {
      let confirmButtonElement;

      confirmButtonElement = await this.getLocator(confirmButtonLocator);
      await confirmButtonElement.click();
    }

    return nameElement;
  }

  public async addMoreMembers(partner: Partner, invitedMembers: UserInfo[]) {
    if (invitedMembers?.length === 0)
      throw new Error("There is no any member to add");

    const managementCategory = await this.getLocator(
      CommonLocator.managementCategory,
    );

    await managementCategory.click();

    const partnerManagementCategory = await this.getLocator(
      CommonLocator.partnerManagement,
    );

    await partnerManagementCategory.click();

    const partnerPhoneNumber = partner.accountInfo?.phoneNumber;

    if (!partnerPhoneNumber) {
      throw new Error("Partner phone number is missing");
    }

    const rawDetailLocator = CommonPartnerLocator.detailButton;

    const detailButtonLocator = rawDetailLocator.replace(
      "phoneNumberValue",
      partnerPhoneNumber!,
    );

    const btn = this.page.locator(detailButtonLocator).last();

    await btn.click();

    const addMembersButtonEl = this.getLocator(
      DetailOfPartnerLocator.addMemberButton,
    );

    (await addMembersButtonEl).click();

    let emailEl = await this.getLocator(TeamAddition.emailInput);
    let firstNameElement = await this.getLocator(TeamAddition.firstNameInput);
    let lastNameElement = await this.getLocator(TeamAddition.lastNameInput);
    let phoneNumberElement = await this.getLocator(
      TeamAddition.phoneNumberInput,
    );
    let jobTitleElement = await this.getLocator(TeamAddition.jobTitleInput);

    if (invitedMembers?.length === 1) {
      await emailEl.fill(invitedMembers[0].email);

      await firstNameElement.fill(invitedMembers[0].firstName!);

      await lastNameElement.fill(invitedMembers[0].lastName!);

      await phoneNumberElement.fill(invitedMembers[0].phoneNumber!);

      await jobTitleElement.fill(invitedMembers[0].jobTitle!);

      await this.selectDropdownOptionByText(
        TeamAddition.roleInput,
        invitedMembers[0].invitedRole!,
      );
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

        await this.selectDropdownOptionByText(
          TeamAddition.roleInput,
          invitedMembers[i].invitedRole!,
        );
      }
    }
    await (await this.getLocator(TeamAddition.sendInviteButton)).click();
  }
}
