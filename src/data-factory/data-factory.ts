import { DataHandling } from "../data-handling/data-handling";
import { Customer } from "../objects/customer";
import { Constants } from "../utilities/constants";
import { CustomerFactory } from "./customer-factory";


export class DataFactory{

static async generateCustomerInfo(partnerId?: string, departmentId?: string): Promise<Customer> {
  // Delegate to CustomerUser which handles user data generation logic
  const customer = await CustomerFactory.createCustomer( {
    partnerId: partnerId,
    departmentId: departmentId
  } );
  return customer;

}

}
