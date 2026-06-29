import { Partner } from "src/objects/ipartner";
import { ProductInfo } from "src/objects/iproduct";
import UserInfo from "src/objects/user-info";
import { DataGenerate } from "src/utilities";
import { PersonDataGenerator } from "./person-data-generator";
import IPeoPartner, { PeoPartner } from "src/objects/ipeopartner";

/**
 * Typed options for the partner restriction block.
 */

/**
 * Pure fluent builder for creating Partner test data.
 * No API calls -- all data must be provided or is auto-generated with faker.
 *
 * Usage:
 * ```ts
 * // Simple partner (all defaults, random faker data)
 * const partner = await new PartnerBuilder().build();
 *
 * // Partner with pre-resolved department and product types
 * const partner = await new PartnerBuilder()
 *   .withLevel(0)
 *   .withDepartment(departmentId)
 *   .withFilterProductTypes(productTypes)
 *   .withIsPublic(true)
 *   .withWhoPay(0)
 *   .build();
 * ```
 */
export class PeoPartnerBuilder {
  private accountOverrides: Partial<UserInfo> = {};
  private peoPartnerOverrides: Partial<IPeoPartner> = {};

  withEmail(email: string): this {
    this.accountOverrides.email = email;
    return this;
  }

  withName(name: string): this {
    this.peoPartnerOverrides.name = name;
    return this;
  }

  withFirstName(firstName: string): this {
    this.accountOverrides.firstName = firstName;
    return this;
  }

  withLastName(lastName: string): this {
    this.accountOverrides.lastName = lastName;
    return this;
  }

  withJobTitle(jobTitle: string): this {
    this.accountOverrides.jobTitle = jobTitle;
    return this;
  }

  withPhoneNumber(phoneNumber: string): this {
    this.accountOverrides.phoneNumber = phoneNumber;
    return this;
  }

  withCustomBranding(customBranding: boolean): this {
    this.peoPartnerOverrides.customBranding = customBranding;
    return this;
  }

  withPartnerName(name: string): this {
    this.peoPartnerOverrides.name = name;
    return this;
  }

  withCustomBenefitsPlans(customBenefitsPlans: boolean): this {
    this.peoPartnerOverrides.customBenefitsPlans = customBenefitsPlans;
    return this;
  }

  withCompanyType(conpanyType: string): this {
    this.peoPartnerOverrides.companyType = conpanyType;
    return this;
  }

  withBackURL(backURL: string): this {
    this.peoPartnerOverrides.backURL = backURL;
    return this;
  }

  withBackText(backText: string): this {
    this.peoPartnerOverrides.backText = backText;
    return this;
  }

  async build(): Promise<PeoPartner> {
    const peoPartner = new PeoPartner();
    const o = this.peoPartnerOverrides;

    const accountInfo = await PersonDataGenerator.generate({ emailDomain: "superbee.my", ...this.accountOverrides });
    peoPartner.accountInfo = accountInfo;

    const seq = DataGenerate.getRandomInt(1, 9999);
    const name = o.name ?? `${accountInfo.firstName}${seq}`;

    peoPartner.peoPartnerInfo = {
      name,
      customBranding: o.customBranding ?? DataGenerate.generateBoolean(),
      companyType: o.companyType ?? DataGenerate.generateCompanyType(),
      backText: o.backText ?? "",
      backURL: o.backURL ?? "",
    };

    return peoPartner;
  }
}
