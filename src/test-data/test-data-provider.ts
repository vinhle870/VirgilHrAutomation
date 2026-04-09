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
      const dept = this.departmentCache.body.find(
        (d: any) => d.name.toLowerCase() === departmentName.toLowerCase(),
      );
      if (dept) return dept.id;
      throw new Error(`Department with name "${departmentName}" not found`);
    }

    const ids: string[] = this.departmentCache.body.map(
      (dept: any) => dept.id,
    );
    let id = DataGenerate.generateDepartmentID(ids);
    while (id === localHR) {
      id = DataGenerate.generateDepartmentID(ids);
    }
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
  async getProductTypes(departmentId: string): Promise<ProductInfo[]> {
    const productTypesResponse = await this.adminService.getProductTypes();
    if (!productTypesResponse?.body) return [];

    const department = productTypesResponse.body.find(
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

  // ── Internal ────────────────────────────────────────────────

  private async ensureDepartmentCache(): Promise<void> {
    if (!this.departmentCache) {
      this.departmentCache = await this.adminService.getDepartmentInfo();
    }
  }
}
