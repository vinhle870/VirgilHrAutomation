import { DataHandling } from "../data-handling/data-handling";
import { MembPortalCustomer } from "../objects/customer";
import { Constants } from "../utilities/constants";
import { CustomerFactory } from "./customer-factory";


export class DataFactory{

static async generateCustomerInfo(portal:string,fields?:Partial<Record<string,any>>): Promise<MembPortalCustomer> {
  // Delegate to CustomerUser which handles user data generation logic
  const customer = await CustomerFactory.createCustomer(portal,fields);
  return customer;

}

}
