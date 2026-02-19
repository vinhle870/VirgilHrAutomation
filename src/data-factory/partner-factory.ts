import { DataGenerate } from "src/utilities";
import { Partner } from "src/objects/ipartner";
import { AdminPortalService } from "src/api/services/admin-portal.services";
import { ProductInfo } from "src/objects/iproduct";
import { localHR } from "src/constant/static-data";
import { PartnerBuilder } from "./partner-builder";

/**
 * Service utility for partner-related operations.
 * Contains API-dependent methods (department lookup, product types)
 * and a legacy createPartner() wrapper for backward compatibility.
 *
 * New code should use PartnerBuilder directly with pre-resolved data.
 */
export class PartnerFactory {
  private static departmentInfor: any;

  /**
   * @deprecated Use PartnerBuilder directly with pre-resolved data:
   * ```ts
   * const deptId = await PartnerFactory.generatePartnerID(adminService);
   * const products = await PartnerFactory.getUniqueProductTypesAndNames(adminService, deptId);
   * const partner = await new PartnerBuilder()
   *   .withLevel(0)
   *   .withDepartment(deptId)
   *   .withFilterProductTypes(products)
   *   .build();
   * ```
   */
  static async createPartner(
    levelOfPartner: number,
    adminService: AdminPortalService,
    overrides?: Partial<Record<string, any>>,
  ): Promise<Partner> {
    // Step 1: Resolve dependencies from API
    const departmentId =
      overrides?.departmentId ??
      (await PartnerFactory.generatePartnerID(adminService));

    const productTypes = await PartnerFactory.getUniqueProductTypesAndNames(
      adminService,
      departmentId,
    );

    // Step 2: Build with pure builder (no API calls inside)
    const builder = new PartnerBuilder();

    builder.withLevel(levelOfPartner);
    builder.withDepartment(departmentId);
    builder.withFilterProductTypes(
      overrides?.restriction?.feFilterProductTypes
        ? [] // will be overridden by withRestriction below
        : DataGenerate.generateProductType(productTypes),
    );

    // Account overrides
    if (overrides?.firstName) builder.withFirstName(overrides.firstName);
    if (overrides?.lastName) builder.withLastName(overrides.lastName);
    if (overrides?.email) builder.withEmail(overrides.email);
    if (overrides?.jobTitle) builder.withJobTitle(overrides.jobTitle);
    if (overrides?.phoneNumber) builder.withPhoneNumber(overrides.phoneNumber);

    // Partner-specific overrides
    if (overrides?.name) builder.withPartnerName(overrides.name);
    if (overrides?.subDomain) builder.withSubDomain(overrides.subDomain);
    if (overrides?.bankTransfer !== undefined)
      builder.withBankTransfer(overrides.bankTransfer);
    if (overrides?.canCustomUpdatePlan !== undefined)
      builder.withCanCustomUpdatePlan(overrides.canCustomUpdatePlan);
    if (overrides?.companyType !== undefined)
      builder.withCompanyType(overrides.companyType);
    if (overrides?.isPublic !== undefined)
      builder.withIsPublic(overrides.isPublic);
    if (overrides?.partnerType !== undefined)
      builder.withPartnerType(overrides.partnerType);
    if (overrides?.paymentEnable !== undefined)
      builder.withPaymentEnable(overrides.paymentEnable);
    if (overrides?.whoPay !== undefined) builder.withWhoPay(overrides.whoPay);

    // Restriction overrides (product type IDs passed as raw numbers)
    if (overrides?.restriction) {
      const restrictionOverride = { ...overrides.restriction };
      if (restrictionOverride.feFilterProductTypes) {
        builder.withFilterProductTypeIds(
          restrictionOverride.feFilterProductTypes,
        );
        delete restrictionOverride.feFilterProductTypes;
      }
      if (Object.keys(restrictionOverride).length > 0) {
        builder.withRestriction(restrictionOverride);
      }
    }

    return builder.build();
  }

  // ── Service / Utility methods (API-dependent) ────────────────

  public static async generatePartnerID(
    adminService: AdminPortalService,
    departmentName?: string,
  ): Promise<string> {
    PartnerFactory.departmentInfor = await adminService.getDepartmentsList();

    if (departmentName) {
      const dept = PartnerFactory.departmentInfor.body.find(
        (d: any) => d.name.toLowerCase() === departmentName.toLowerCase(),
      );

      if (dept) {
        return dept.id;
      } else {
        throw new Error(`Department with name "${departmentName}" not found`);
      }
    }

    const ids = PartnerFactory.departmentInfor.body.map(
      (dept: any) => dept.id,
    );
    let id = DataGenerate.generateDepartmentID(ids);

    while (id == localHR) {
      id = await PartnerFactory.generatePartnerID(adminService);
    }
    return id;
  }

  public static async getDepartmentDomain(
    departmenID: string,
  ): Promise<string> {
    const matchedDept = PartnerFactory.departmentInfor.body.find(
      (dept: any) => dept.id === departmenID,
    );

    return matchedDept?.domain?.partner ?? null;
  }

  public static async getUniqueProductTypesAndNames(
    adminService: AdminPortalService,
    departmentId: string,
  ): Promise<ProductInfo[]> {
    const productTypesResponse = await adminService.getAllDepartmentsPlans();
    if (!productTypesResponse?.body) {
      return [];
    }

    const department = productTypesResponse.body.find(
      (d: any) => d.departmentId === departmentId,
    );

    if (!department?.plans) {
      return [];
    }

    const seenProductTypes = new Set<number>();

    const products: ProductInfo[] = department.plans.flatMap((plan: any) =>
      plan.products
        .filter((p: any) => {
          if (seenProductTypes.has(p.productType)) return false;

          seenProductTypes.add(p.productType);
          return true;
        })
        .map((p: any) => ({
          productType: p.productType,
          productName: plan.name,
          planId: plan.id,
        })),
    );

    return products;
  }
}
