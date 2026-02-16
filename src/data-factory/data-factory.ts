import { AdminPortalService } from "src/api/services/admin-portal.services";
import { MembPortalCustomer } from "../objects/customer";
import { CustomerFactory } from "./customer-factory";
import { Partner } from "src/objects/ipartner";
import { PartnerFactory } from "./partner-factory";
import { ProductInfo } from "src/objects/IProduct";

export class DataFactory {

  /**
   * Generate customer info for the given portal
   * @param portal        
*     @param fields           
   * @returns 
   */
  static async generateCustomerInfo(
    portal: string,
    fields?: Partial<Record<string, any>>,
  ): Promise<MembPortalCustomer> {
    // Delegate to CustomerUser which handles user data generation logic
    const customer = await CustomerFactory.createCustomer(portal, fields);
    return customer;
  }

  /**      
   * Generate partner info for the given level
   * @param level         
   * @param adminService 
   * @param overrides 
   * @returns 
   */
  static async generatePartnerInfo(
    level: number,
    adminService: AdminPortalService,
    overrides?: Partial<Record<string, any>>,
  ): Promise<Partner> {
    const partner = await PartnerFactory.createPartner(
      level,
      adminService,
      overrides,
    );

    return partner;
  }


  /**
   * Generate department ID for the given admin portal service
   * @param adminPortalService 
   * @returns 
   */
  static async generateDepartmentID(
    adminPortalService: AdminPortalService,
  ): Promise<string> {
    const departmentID: string =
      await PartnerFactory.generatePartnerInfor(adminPortalService);

    return departmentID;
  }

  /**
   * Generate partner domain
   * @returns 
   */
  public static generatePartnerDomain(): string {
    return PartnerFactory.getPartnerDomain();
  }

  public static async generateProductTypesAndNames(
    adminPortalService: AdminPortalService,
  ): Promise<ProductInfo[]> {
    return await PartnerFactory.getProductTypesAndNames(adminPortalService);
  }
}
