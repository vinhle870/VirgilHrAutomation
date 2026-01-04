import UserInfo from "./user-info";
import { plans } from "src/constant/static-data";
import { ICompany } from "./icompany";
import { Company } from "./company";

export class MembPortalCustomer implements ICompany {
  public accountInfo: UserInfo;
  public plan: string;
  public company: Company;

  constructor() {
    this.accountInfo = {} as UserInfo;
    this.plan = plans[0]; // Default plan
    this.company = {} as Company;
  }

  public getAccountInfo(): UserInfo {
    return this.accountInfo;
  } //copy

  public getPlan(): string {
    return this.plan;
  }

  public setPlan(plan: string): void {
    this.plan = plan;
  }

  public setAccountInfo(account: UserInfo): void {
    this.accountInfo = account;
  } //copy

  public setCompany(company: Company): void {
    this.company = company;
  }

  public getCompany = (): Company => {
    return this.company;
  };
}
