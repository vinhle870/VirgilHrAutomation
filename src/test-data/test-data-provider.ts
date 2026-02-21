import { AdminPortalService } from "src/api/services/admin-portal.services";
import { ProductInfo } from "src/objects/iproduct";
import { DataGenerate } from "src/utilities";
import { localHR } from "src/constant/static-data";

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

  /**
   * Get a department ID by name.
   * If no name is given, picks a random department (excluding localHR).
   */
  async getDepartmentId(departmentName?: string): Promise<string> {
    await this.ensureDepartmentCache();

    if (departmentName) {
      const dept = this.departmentCache.find(
        (d: any) => d.name.toLowerCase() === departmentName.toLowerCase(),
      );
      if (dept) 
        return dept.id;
      throw new Error(`Department with name "${departmentName}" not found`);
    }

    const ids: string[] = this.departmentCache.body.map(
      (dept: any) => dept.id,
    );
    let id = DataGenerate.selectRandomlyInList(ids);
    return id;
  }

  /**
   * Get the partner portal domain for a given department ID.
   */
  async getDepartmentDomain(departmentId: string): Promise<string> {
    await this.ensureDepartmentCache();

    const matchedDept = this.departmentCache.body.find(
      (dept: any) => dept.id === departmentId,
    );
    return matchedDept?.domain?.partner ?? null;
  }

  // ── Product types ───────────────────────────────────────────

  /**
   * Get unique product types and names for a given department.
   */
  async getProductTypesBasedDepartmentId(departmentId: string): Promise<ProductInfo[]> {
    const productTypesResponse = await this.adminService.getAllDepartmentsPlans();
    if (!productTypesResponse) return [];

    const department = productTypesResponse.find(
      (d: any) => d.departmentId === departmentId,
    );
    if (!department?.plans) return [];

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

  /**
   * Filter product info list based on product name list and return the filtered product info list
   * @param departmentId
   * @param productNameList
   * @returns ProductInfo[] filtered by product name list
   */
  async filterProductInfoListBasedName(departmentId: string, productNameList: string[]): Promise<ProductInfo[]> {
    const productTypeAndNames: ProductInfo[] = await this.getProductTypesBasedDepartmentId(departmentId);

    const nameSet = new Set(productNameList.map(n => n.toLowerCase()));

    const filteredProductInfoList: ProductInfo[] = productTypeAndNames.filter(
      (product) => nameSet.has(product.productName.toLowerCase()),
    );

    return filteredProductInfoList;
  }

  async filterMasterPlanBasedName(departmentId: string, planName: string): Promise<any> {
    const masterPlanIDResponse: object[] = await this.adminService.getDepartmentPaymentProduct(departmentId);

    const planItem = masterPlanIDResponse.find((m: any) => (m.name as string).toLowerCase().includes(planName.toLowerCase()));
    if (!planItem) {
      throw new Error(`Master plan with name "${planName}" not found`);
    }
    return planItem;
  }

  async filterPartnerPaymentProductBasedName(partnerPaymentProductsList: object[], planName: string): Promise<any> {
    const planItem = partnerPaymentProductsList.find((m: any) => (m.name as string).toLowerCase().includes(planName.toLowerCase()));
    if (!planItem) {
      throw new Error(`Partner payment product with name "${planName}" not found`);
    }
    return planItem;
  }

  async filterPartnerPlanBasedName(partnerPlansList: object[], planName: string): Promise<any> {
    const planItem = partnerPlansList.find((m: any) => (m.name as string).toLowerCase().includes(planName.toLowerCase()));
    if (!planItem) {
      throw new Error(`Partner plan with name "${planName}" not found`);
    }
    return planItem;
  }

  /**
   * Filter plan based on plan name
   * @param planList - List of plans
   * @param planName - Plan name
   * @returns Plan object
   */
  async filterPlanBasedName(planList: object[], planName: string): Promise<any> {
    let filteredPlan: any = planList;
    if (Array.isArray(planList)) {
      filteredPlan = planList.find((plan: any) => plan.name === planName);
      if (!filteredPlan) {
        throw new Error(`Plan with name "${planName}" not found`);
      }
    }
    return filteredPlan;
  }



  // ── Internal ────────────────────────────────────────────────

  private async ensureDepartmentCache(): Promise<void> {
    if (!this.departmentCache) {
      this.departmentCache = await this.adminService.getDepartmentsList();
    }
  }
}
