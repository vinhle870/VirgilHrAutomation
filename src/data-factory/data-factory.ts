import { AdminPortalService } from "src/api/services/admin-portal.services";
import { MembPortalCustomer } from "../objects/customer";
import { CustomerFactory } from "./customer-factory";
import { Partner } from "src/objects/ipartner";
import { PartnerFactory } from "./partner-factory";
import { ProductInfo } from "src/objects/IProduct";

export class DataFactory {
  static async generateCustomerInfo(
    portal: string,
    fields?: Partial<Record<string, any>>,
  ): Promise<MembPortalCustomer> {
    // Delegate to CustomerUser which handles user data generation logic
    const customer = await CustomerFactory.createCustomer(portal, fields);
    return customer;
  }

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
}
