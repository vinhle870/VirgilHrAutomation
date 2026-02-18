import { CustomerInfo } from "src/objects/customer";
import { Company } from "src/objects/company";
import { DataGenerate } from "src/utilities";
import { validCountry, validIndustry } from "src/constant/static-data";
import UserInfo from "src/objects/user-info";
import { PersonDataGenerator } from "./person-data-generator";

type PortalType = "member" | "admin";

/**
 * Typed options for member-portal-specific company fields.
 */
interface MemberCompanyOptions {
  source?: string;
  ssoProvider?: string | undefined | null;
  ssoToken?: string | undefined | null;
}

/**
 * Typed options for admin-portal-specific company fields.
 */
interface AdminCompanyOptions {
  useCredit?: boolean;
  statesEmployee?: string[];
  country?: Country;
  totalEmployees?: number;
  isSso?: boolean;
  type?: string | number;
  partnerConsultantId?: string;
  industry?: Industry[] | null;
  productType?: number | string;
  billingcycle?: number;
  trialDays?: number;
}

/**
 * Fluent builder for creating CustomerInfo test data.
 *
 * Usage:
 * ```ts
 * // Member portal (default) - all fields auto-generated
 * const customer = await new CustomerBuilder().build();
 *
 * // Member portal with partner
 * const customer = await new CustomerBuilder()
 *   .forMemberPortal()
 *   .withPartner(partnerId)
 *   .withDepartment(departmentId)
 *   .build();
 *
 * // Admin portal with specific overrides
 * const customer = await new CustomerBuilder()
 *   .forAdminPortal()
 *   .withDepartment(departmentId)
 *   .withCredit(true)
 *   .withCountry(validCountry)
 *   .build();
 * ```
 */
export class CustomerBuilder {
  private portal: PortalType = "member";
  private accountOverrides: Partial<UserInfo> = {};
  private companyNameOverride?: string;
  private companySizeOverride?: string;
  private partnerId: string | null = null;
  private departmentId: string = "688897d5eb52b4af5573def4";
  private planOverride?: string;
  private memberOptions: MemberCompanyOptions = {};
  private adminOptions: AdminCompanyOptions = {};
  private memberOverridesList: Partial<UserInfo>[] = [];

  // ── Portal selection ─────────────────────────────────────────

  forMemberPortal(): this {
    this.portal = "member";
    return this;
  }

  forAdminPortal(): this {
    this.portal = "admin";
    return this;
  }

  // ── Account info ─────────────────────────────────────────────

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

  // ── Company info (shared) ────────────────────────────────────

  withCompanyName(companyName: string): this {
    this.companyNameOverride = companyName;
    return this;
  }

  withCompanySize(companySize: string): this {
    this.companySizeOverride = companySize;
    return this;
  }

  withPartner(partnerId: string): this {
    this.partnerId = partnerId;
    return this;
  }

  withDepartment(departmentId: string): this {
    this.departmentId = departmentId;
    return this;
  }

  withPlan(plan: string): this {
    this.planOverride = plan;
    return this;
  }

  // ── Member-portal-specific ───────────────────────────────────

  withSource(source: string): this {
    this.memberOptions.source = source;
    return this;
  }

  withSso(provider: string, token: string): this {
    this.memberOptions.ssoProvider = provider;
    this.memberOptions.ssoToken = token;
    return this;
  }

  // ── Admin-portal-specific ────────────────────────────────────

  withCredit(useCredit: boolean): this {
    this.adminOptions.useCredit = useCredit;
    return this;
  }

  withCountry(country: Country): this {
    this.adminOptions.country = country;
    return this;
  }

  withIndustry(industry: Industry[]): this {
    this.adminOptions.industry = industry;
    return this;
  }

  withTotalEmployees(totalEmployees: number): this {
    this.adminOptions.totalEmployees = totalEmployees;
    return this;
  }

  withStatesEmployee(statesEmployee: string[]): this {
    this.adminOptions.statesEmployee = statesEmployee;
    return this;
  }

  withIsSso(isSso: boolean): this {
    this.adminOptions.isSso = isSso;
    return this;
  }

  withType(type: string): this {
    this.adminOptions.type = type;
    return this;
  }

  withPartnerConsultant(partnerConsultantId: string): this {
    this.adminOptions.partnerConsultantId = partnerConsultantId;
    return this;
  }

  withProductType(productType: number | string): this {
    this.adminOptions.productType = productType;
    return this;
  }

  withBillingCycle(billingcycle: number): this {
    this.adminOptions.billingcycle = billingcycle;
    return this;
  }

  withTrialDays(trialDays: number): this {
    this.adminOptions.trialDays = trialDays;
    return this;
  }

  /**
   * Bulk-set admin-specific options at once.
   * Useful when you have a pre-built options object.
   */
  withAdminOptions(options: AdminCompanyOptions): this {
    Object.assign(this.adminOptions, options);
    return this;
  }

  // ── Members ─────────────────────────────────────────────────

  /**
   * Add a member with faker-generated person data.
   * Override specific fields as needed; the rest is auto-generated.
   * Can be chained multiple times to add several members.
   *
   * ```ts
   * const customer = await new CustomerBuilder()
   *   .forMemberPortal()
   *   .withMember()                                    // fully random
   *   .withMember({ email: "specific@yopmail.com" })   // partial override
   *   .withMember({ firstName: "John", lastName: "Doe" })
   *   .build();
   * ```
   */
  withMember(overrides?: Partial<UserInfo>): this {
    this.memberOverridesList.push(overrides ?? {});
    return this;
  }

  /**
   * Add multiple members at once, all with faker-generated data.
   *
   * ```ts
   * const customer = await new CustomerBuilder()
   *   .forMemberPortal()
   *   .withMembers(3)  // adds 3 random members
   *   .build();
   * ```
   */
  withMembers(count: number): this {
    for (let i = 0; i < count; i++) {
      this.memberOverridesList.push({});
    }
    return this;
  }

  // ── Build ────────────────────────────────────────────────────

  async build(): Promise<CustomerInfo> {
    const customer = new CustomerInfo();

    // Generate account info
    const accountInfo = await PersonDataGenerator.generate(
      this.accountOverrides,
    );
    customer.accountInfo = accountInfo;

    // Generate company info
    customer.company = await this.buildCompany();

    // Generate plan info
    if (this.planOverride) {
      customer.plan = this.planOverride;
    }

    // Generate members with faker data
    for (const memberOverrides of this.memberOverridesList) {
      const member = await PersonDataGenerator.generate(memberOverrides);
      customer.addMember(member);
    }

    return customer;
  }

  // ── Internal helpers ─────────────────────────────────────────

  private async buildCompany(): Promise<Company> {
    const companyName =
      this.companyNameOverride ?? (await DataGenerate.generateCompanyName());

    const baseCompany: Company = {
      companyName,
      companySize: this.companySizeOverride ?? "",
      departmentId: this.departmentId,
      ...(this.partnerId && { partnerId: this.partnerId }),
    };

    if (this.portal === "member") {
      return {
        ...baseCompany,
        source: this.memberOptions.source ?? "member",
        ssoProvider: this.memberOptions.ssoProvider ?? null,
        ssoToken: this.memberOptions.ssoToken ?? null,
      };
    }

    if (this.portal === "admin") {
      return {
        ...baseCompany,
        useCredit: this.adminOptions.useCredit ?? false,
        statesEmployee: this.adminOptions.statesEmployee ?? [],
        country: this.adminOptions.country ?? validCountry,
        totalEmployees: this.adminOptions.totalEmployees ?? 0,
        isSso: this.adminOptions.isSso ?? false,
        type: this.adminOptions.type ?? 1,
        partnerConsultantId: this.adminOptions.partnerConsultantId ?? "",
        industry: this.adminOptions.industry ?? [validIndustry],
        productType: this.adminOptions.productType ?? "",
        billingcycle: this.adminOptions.billingcycle,
        trialDays: this.adminOptions.trialDays,
      };
    }

    return baseCompany;
  }
}
