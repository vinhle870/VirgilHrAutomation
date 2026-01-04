import { MembPortalCustomer } from "../objects/customer";
import { CustomerFactory } from "./customer-factory";
import { Partner } from "../objects/ipartner";
import { PartnerFactory } from "./partner-factory";

export class DataFactory {
  static async generateCustomerInfo(
    portal: string,
    partnerId?: string,
    departmentId?: string
  ): Promise<MembPortalCustomer> {
    // Delegate to CustomerUser which handles user data generation logic
    const customer = await CustomerFactory.createCustomer(portal, {
      partnerId: partnerId,
      departmentId: departmentId,
    });
    return customer;
  }
  static async generatePartnerInfo(level: number): Promise<Partner> {
    const partner = await PartnerFactory.createPartner(level);

    return partner;
  }
}
