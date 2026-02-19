import { CustomerInfo } from "src/objects/customer";
import UserInfo from "src/objects/user-info";
import { CustomerBuilder } from "./customer-builder";
import { PersonDataGenerator } from "./person-data-generator";

/**
 * Legacy factory kept for backward compatibility.
 * Delegates to CustomerBuilder internally.
 *
 * Prefer using CustomerBuilder directly in new code:
 * ```ts
 * const customer = await new CustomerBuilder()
 *   .forMemberPortal()
 *   .withPartner(partnerId)
 *   .build();
 * ```
 */
export class CustomerFactory {
  /**
   * @deprecated Use `new CustomerBuilder().forMemberPortal().build()` or
   * `new CustomerBuilder().forAdminPortal().build()` instead.
   */
  static async createCustomer(
    portal: string,
    overrides?: Partial<Record<string, any>>,
  ): Promise<CustomerInfo> {
    const builder = new CustomerBuilder();

    // Portal
    if (portal === "admin") {
      builder.forAdminPortal();
    } else {
      builder.forMemberPortal();
    }

    // Account overrides
    if (overrides?.email) builder.withEmail(overrides.email);
    if (overrides?.password) builder.withPassword(overrides.password);
    if (overrides?.firstName) builder.withFirstName(overrides.firstName);
    if (overrides?.lastName) builder.withLastName(overrides.lastName);
    if (overrides?.jobTitle) builder.withJobTitle(overrides.jobTitle);
    if (overrides?.phoneNumber) builder.withPhoneNumber(overrides.phoneNumber);

    // Company overrides
    if (overrides?.companyName) builder.withCompanyName(overrides.companyName);
    if (overrides?.companySize) builder.withCompanySize(overrides.companySize);
    if (overrides?.partnerId) builder.withPartner(overrides.partnerId);
    if (overrides?.departmentId) builder.withDepartment(overrides.departmentId);

    // Member-specific
    if (overrides?.source) builder.withSource(overrides.source);
    if (overrides?.ssoProvider && overrides?.ssoToken) {
      builder.withSso(overrides.ssoProvider, overrides.ssoToken);
    }
    const inviteToken = overrides?.inviteToken ?? null;
    const teamId = overrides?.teamId ?? null;

    // Admin-specific
    if (portal === "admin") {
      builder.withAdminOptions({
        ...(overrides?.useCredit !== undefined && {
          useCredit: overrides.useCredit,
        }),
        ...(overrides?.statesEmployee && {
          statesEmployee: overrides.statesEmployee,
        }),
        ...(overrides?.country && { country: overrides.country }),
        ...(overrides?.totalEmployees !== undefined && {
          totalEmployees: overrides.totalEmployees,
        }),
        ...(overrides?.isSso !== undefined && { isSso: overrides.isSso }),
        ...(overrides?.type !== undefined && { type: overrides.type }),
        ...(overrides?.partnerConsultantId && {
          partnerConsultantId: overrides.partnerConsultantId,
        }),
        ...(overrides?.industry && { industry: overrides.industry }),
        ...(overrides?.productType !== undefined && {
          productType: overrides.productType,
        }),
        ...(overrides?.billingcycle !== undefined && {
          billingcycle: overrides.billingcycle,
        }),
        ...(overrides?.trialDays !== undefined && {
          trialDays: overrides.trialDays,
        }),
      });
    }

    return builder.build();
  }

  /**
   * Generate a member (invited user) payload.
   * Uses PersonDataGenerator to avoid duplicating data generation logic.
   */
  static async generateMember(overrides?: Partial<UserInfo>) {
    const person = await PersonDataGenerator.generate(overrides);
    return {
      email: person.email,
      password: person.password,
      firstName: person.firstName,
      lastName: person.lastName,
      jobTitle: person.jobTitle,
      phoneNumber: person.phoneNumber,
    };
  }
}
