import { DataHandling } from "../data-handling/data-handling";
import { MembPortalCustomer } from "../objects/customer";
import { Constants } from "../utilities/constants";
import { CustomerFactory } from "./customer-factory";


export class DataFactory{

static async generateCustomerInfo(portal:string,partnerId?: string, departmentId?: string): Promise<MembPortalCustomer> {
  // Delegate to CustomerUser which handles user data generation logic
  const customer = await CustomerFactory.createCustomer(portal, {
    partnerId: partnerId,
    departmentId: departmentId
  } );
  return customer;

}

}
