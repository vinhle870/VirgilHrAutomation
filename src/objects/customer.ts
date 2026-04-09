import UserInfo from "./user-info";
import { plans } from "src/constant/static-data";
import { Company } from "./company";

export class CustomerInfo {
  accountInfo: UserInfo = {} as UserInfo;
  plan: string = plans[0];
  company: Company = {} as Company;
  readonly members: UserInfo[] = [];

  addMember(member: UserInfo): void {
    this.members.push(member);
  }
}
