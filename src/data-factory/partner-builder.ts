import IPartnerInfo, { Partner } from "src/objects/ipartner";
import { ProductInfo } from "src/objects/iproduct";
import UserInfo from "src/objects/user-info";
import { DataGenerate } from "src/utilities";
import { PersonDataGenerator } from "./person-data-generator";

/**
 * Typed options for the partner restriction block.
 */
export interface RestrictionOptions {
  eSignEnable?: boolean;
  productSupport?: boolean;
  resourceRequest?: boolean;
  contactExpert?: boolean;
  ssoEnable?: boolean;
  lmsEnable?: boolean;
  hrToolsEnable?: boolean;
  feFilterProductTypes?: ProductInfo[];
}

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
export class PartnerBuilder {
  private accountOverrides: Partial<UserInfo> = {};
  private partnerOverrides: Partial<IPartnerInfo> = {};
  private restrictionOptions: RestrictionOptions = {};
  private feFilterProductTypesValue: number[] = [];

  // ── Account info (person data) ──────────────────────────────

  withEmail(email: string): this {
    this.accountOverrides.email = email;
    return this;
  }

  withPassword(password: string): this {
    this.accountOverrides.password = password;
    return this;
  }

  withName(firstName: string, lastName: string): this {
    this.accountOverrides.firstName = firstName;
    this.accountOverrides.lastName = lastName;
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

  // ── Partner info ─────────────────────────────────────────────

  withLevel(level: number): this {
    this.partnerOverrides.level = level;
    return this;
  }

  withPartnerName(name: string): this {
    this.partnerOverrides.name = name;
    return this;
  }

  withDepartment(departmentId: string): this {
    this.partnerOverrides.departmentId = departmentId;
    return this;
  }

  withSubDomain(subDomain: string): this {
    this.partnerOverrides.subDomain = subDomain;
    return this;
  }

  withBankTransfer(bankTransfer: boolean): this {
    this.partnerOverrides.bankTransfer = bankTransfer;
    return this;
  }

  withCanCustomUpdatePlan(canCustomUpdatePlan: boolean): this {
    this.partnerOverrides.canCustomUpdatePlan = canCustomUpdatePlan;
    return this;
  }

  withCompanyType(companyType: number): this {
    this.partnerOverrides.companyType = companyType;
    return this;
  }

  withIsPublic(isPublic: boolean): this {
    this.partnerOverrides.isPublic = isPublic;
    return this;
  }

  withPartnerType(partnerType: number): this {
    this.partnerOverrides.partnerType = partnerType;
    return this;
  }

  withPaymentEnable(paymentEnable: boolean): this {
    this.partnerOverrides.paymentEnable = paymentEnable;
    return this;
  }

  withBillingCycle(billingCycle: number): this {
    this.partnerOverrides.billingCycle = billingCycle;
    return this;
  }

  withApiEnable(apiEnable: boolean): this {
    this.partnerOverrides.apiEnable = apiEnable;
    return this;
  }

  withWhoPay(whoPay: number): this {
    this.partnerOverrides.whoPay = whoPay;
    return this;
  }

  withPlanId(planId: string): this {
    this.partnerOverrides.planId = planId;
    return this;
  }

  // ── Restriction ──────────────────────────────────────────────

  /**
   * Set restriction options. Any field left undefined uses the default (true).
   *
   * ```ts
   * builder.withRestriction({ ssoEnable: false })
   * ```
   */
  withRestriction(options: RestrictionOptions): this {
    Object.assign(this.restrictionOptions, options);
    return this;
  }

  /**
   * Set pre-resolved product types for the restriction filter.
   * Accepts ProductInfo[] and extracts the productType numbers internally.
   */
  withFilterProductTypes(productTypes: ProductInfo[]): this {
    this.feFilterProductTypesValue = productTypes.map((p) => p.productType);
    return this;
  }

  /**
   * Set raw product type numbers directly for the restriction filter.
   */
  withFilterProductTypeIds(productTypeIds: number[]): this {
    this.feFilterProductTypesValue = productTypeIds;
    return this;
  }

  // ── Build ────────────────────────────────────────────────────

  async build(): Promise<Partner> {
    const partner = new Partner();
    const o = this.partnerOverrides;

    // Generate person data via shared generator (faker only, no API)
    const accountInfo = await PersonDataGenerator.generate(
      this.accountOverrides,
    );
    partner.accountInfo = accountInfo;

    // Build partner-specific fields
    const seq = DataGenerate.getRandomInt(1, 9999);
    const name = o.name ?? `${accountInfo.firstName}${seq}`;
    const subDomain = o.subDomain ?? name;
    const bankTransfer = o.bankTransfer ?? DataGenerate.generateBoolean();

    // Build user info block for partner payload
    const userInfo: UserInfo = {
      email: accountInfo.email,
      firstName: accountInfo.firstName,
      lastName: accountInfo.lastName,
      jobTitle: accountInfo.jobTitle,
      phoneNumber: accountInfo.phoneNumber,
    };

    // Build restriction from provided values (no API calls)
    const feFilterProductTypes =
      this.restrictionOptions.feFilterProductTypes
        ? this.restrictionOptions.feFilterProductTypes.map((p) => p.productType)
        : this.feFilterProductTypesValue;

    const restriction = {
      eSignEnable: this.restrictionOptions.eSignEnable ?? true,
      productSupport: this.restrictionOptions.productSupport ?? true,
      resourceRequest: this.restrictionOptions.resourceRequest ?? true,
      contactExpert: this.restrictionOptions.contactExpert ?? true,
      ssoEnable: this.restrictionOptions.ssoEnable ?? true,
      lmsEnable: this.restrictionOptions.lmsEnable ?? true,
      hrToolsEnable: this.restrictionOptions.hrToolsEnable ?? true,
      feFilterProductTypes,
    };

    partner.partnerInfo = {
      whoPay: o.whoPay ?? DataGenerate.generateDecimal(),
      restriction,
      apiEnable: o.apiEnable ?? false,
      departmentId: o.departmentId ?? "688897d5eb52b4af5573def4",
      bankTransfer,
      canCustomUpdatePlan:
        o.canCustomUpdatePlan ?? DataGenerate.generateBoolean(),
      companyType:
        o.companyType ?? (DataGenerate.generateBoolean() ? 1 : 0),
      isPublic: o.isPublic ?? DataGenerate.generateBoolean(),
      level: o.level ?? 0,
      name,
      partnerType: o.partnerType ?? DataGenerate.generateDecimal(),
      paymentEnable: o.paymentEnable ?? DataGenerate.generateBoolean(),
      subDomain,
      userInfo,
      ...(bankTransfer && {
        billingCycle: o.billingCycle ?? 1,
      }),
      ...(o.planId && { planId: o.planId }),
    };

    return partner;
  }
}
