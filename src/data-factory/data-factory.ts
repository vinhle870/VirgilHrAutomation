import { MembPortalCustomer } from "../objects/customer";
import { CustomerFactory } from "./customer-factory";
import IPartner from "../objects/partner";

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
  static createUniquePartner(firstName: string, lastName: string): IPartner {
    const uniqueSuffix = Date.now();

    return {
      bankTransfer: false,
      canCustomUpdatePlan: false,
      companyType: 1,
      email: `partner_${uniqueSuffix}@yopmail.com`,
      firstName,
      lastName,
      isPublic: true,
      jobTitle: "Partner",
      level: 0,
      name: `TestPartner_${uniqueSuffix}`,
      partnerType: 1,
      paymentEnable: true,
      phoneNumber: `090${uniqueSuffix.toString().slice(-7)}`,
      subDomain: `partner${uniqueSuffix}`,
    };
  }
}
