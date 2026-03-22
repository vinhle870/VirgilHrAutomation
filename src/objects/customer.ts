import UserInfo from "./user-info";
import { plans } from "src/constant/static-data";
import { Company } from "./company";
import { IBankStranfer } from "src/data-factory";

export class CustomerInfo {
  accountInfo: UserInfo = {} as UserInfo;
  departmentName: string = "BiginHR";
  stateOfCustomer?: string = "Alaska";
  freeTrial?: boolean = false;
  internal?: boolean = false;
  plan: string = plans[0];
  company: Company = {} as Company;
  readonly members: UserInfo[] = [];
  bankStranfer?: IBankStranfer = {} as IBankStranfer;

  addMember(member: UserInfo): void {
    this.members.push(member);
  }
}
