import UserInfo from "./user-info";
import { DataHandling } from "../data-handling/data-handling";
import { Constants } from "../utilities/constants";
import { DataGenerate } from "../utilities/data-generate";
import { plans } from "src/constant/static-data";
import { format } from "date-fns";
import { ICustomer } from "./icustomer";
import { Company } from "./company";

export class CustomerInfo implements ICustomer {
  public accountInfo: UserInfo;
  public plan: string;
  public company: Company;
  public members: UserInfo[];

  constructor() {
    this.accountInfo = {} as UserInfo;
    this.plan = plans[0]; // Default plan
    this.company = {} as Company;
    this.members = [];
  }

  public getAccountInfo(): UserInfo {
    return this.accountInfo;
  }

  public getPlan(): string {
    return this.plan;
  }

  public setPlan(plan: string): void {
    this.plan = plan;
  }

  public setAccountInfo(account: UserInfo): void {
    this.accountInfo = account;
  }

  public setCompany(company: Company): void {
    this.company = company;
  }

  public getCompany = (): Company => {
    return this.company;
  };

  public getMembersList(): UserInfo[] {
    return this.members;
  }

  public addMember(member: UserInfo): void {
    this.members.push(member);
  } 
}
