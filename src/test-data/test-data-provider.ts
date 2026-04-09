import { AdminPortalService } from "src/api/services/admin-portal.services";
import { ProductInfo } from "src/objects/iproduct";
import { CollectionUtils } from "src/utilities/collection-utils";

/**
 * Pre-condition data provider for tests.
 *
 * Fetches and caches reference/configuration data from the API
 * that is needed before building test objects (Builders).
 *
 * Architecture:
 * ```
 * Service layer   →  raw API calls          (AdminPortalService)
 * Provider layer  →  pre-condition data      (TestDataProvider)  ← this class
 * Builder layer   →  pure object construction (CustomerBuilder, PartnerBuilder)
 * ```
 *
 * Usage:
 * ```ts
 * const provider = new TestDataProvider(adminPortalService);
 *
 * const departmentId = await provider.getDepartmentId("BiginHR");
 * const domain       = await provider.getDepartmentDomain(departmentId);
 * const products     = await provider.getProductTypes(departmentId);
 *
 * const partner = await DataFactory.partnerBuilder()
 *   .withDepartment(departmentId)
 *   .withFilterProductTypes(products)
 *   .build();
 * ```
 */
export class TestDataProvider {
  private adminService: AdminPortalService;
  private departmentCache: any = null;

  constructor(adminService: AdminPortalService) {
    this.adminService = adminService;
  }

  // ── Department ──────────────────────────────────────────────

  async getDepartmentId(departmentName?: string): Promise<string> {
    await this.ensureDepartmentCache();

    if (departmentName) {
      const dept = CollectionUtils.findByName(
        this.departmentCache,
        departmentName,
      );
      return (dept as any).id;
    }

    const ids: string[] = this.departmentCache.body.map(
      (dept: any) => dept.id,
    );
    return CollectionUtils.pickOne(ids);
  }

  async getDepartmentDomain(departmentId: string): Promise<string> {
    await this.ensureDepartmentCache();

    const matchedDept = CollectionUtils.findByProperty(
      this.departmentCache.body,
      "id",
      departmentId,
    );
    return (matchedDept as any)?.domain?.partner ?? null;
  }

  // ── Product types ───────────────────────────────────────────

  async getProductTypesBasedDepartmentId(
    departmentId: string,
  ): Promise<ProductInfo[]> {
    const productTypesResponse =
      await this.adminService.getAllDepartmentsPlans();
    if (!productTypesResponse) return [];

    const department = CollectionUtils.findByPropertyOrNull(
      productTypesResponse as any[],
      "departmentId",
      departmentId,
    );
    if (!(department as any)?.plans) return [];

    const seenProductTypes = new Set<number>();
    const products: ProductInfo[] = (department as any).plans.flatMap(
      (plan: any) =>
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

  async filterProductInfoListBasedName(
    departmentId: string,
    productNameList: string[],
  ): Promise<ProductInfo[]> {
    const products = await this.getProductTypesBasedDepartmentId(departmentId);
    return CollectionUtils.filterByNames(
      products.map((p) => ({ ...p, name: p.productName })),
      productNameList,
    ).map(({ name, ...rest }) => rest as unknown as ProductInfo);
  }

  async filterMasterPlanBasedName(
    departmentId: string,
    planName: string,
  ): Promise<any> {
    const masterPlans: any[] =
      await this.adminService.getDepartmentPaymentProduct(departmentId);
    return CollectionUtils.findByName(masterPlans, planName);
  }

  async filterPartnerPaymentProductBasedName(
    partnerPaymentProductsList: any[],
    planName: string,
  ): Promise<any> {
    return CollectionUtils.findByName(partnerPaymentProductsList, planName);
  }

  async filterPartnerPlanBasedName(
    partnerPlansList: any[],
    planName: string,
  ): Promise<any> {
    return CollectionUtils.findByName(partnerPlansList, planName);
  }

  async filterPlanBasedName(planList: any[], planName: string): Promise<any> {
    if (!Array.isArray(planList)) return planList;
    return CollectionUtils.findByProperty(planList, "name", planName);
  }

  // ── Internal ────────────────────────────────────────────────

  private async ensureDepartmentCache(): Promise<void> {
    if (!this.departmentCache) {
      this.departmentCache = await this.adminService.getDepartmentsList();
    }
  }
}
