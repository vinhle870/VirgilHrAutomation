import { CustomerBuilder } from "./customer-builder";
import { PartnerBuilder } from "./partner-builder";

/**
 * Entry point for creating typed test data builders.
 *
 * For pre-condition data (department IDs, product types, domains),
 * use TestDataProvider from `src/test-data`.
 *
 * Usage:
 * ```ts
 * const customer = await DataFactory.customerBuilder()
 *   .forMemberPortal()
 *   .withPartner(partnerId)
 *   .build();
 *
 * const partner = await DataFactory.partnerBuilder()
 *   .withDepartment(departmentId)
 *   .withFilterProductTypes(products)
 *   .build();
 * ```
 */
export class DataFactory {
  static customerBuilder(): CustomerBuilder {
    return new CustomerBuilder();
  }

  static partnerBuilder(): PartnerBuilder {
    return new PartnerBuilder();
  }
}
