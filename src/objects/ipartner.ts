import UserInfo from "./user-info";

export default interface IPartnerInfo {
  whoPay: number;
  feFilterProductTypes: number[];
  apiEnable: boolean;
  departmentId: string;
  bankTransfer: boolean;
  canCustomUpdatePlan: boolean;
  companyType: number;
  isPublic: boolean;
  level: number;
  name: string;
  partnerType: number;
  paymentEnable: boolean;
  subDomain: string;
  userInfo: UserInfo;
  billingCycle?: number;
}

export interface IPartnerInfoWithDepartmentAndProductTypes {
  productTypes: number[];
  departmentIds: string[];
}

export class Partner {
  private iPartnerInfo: IPartnerInfo | undefined;
  private accountInfo: UserInfo | undefined;

  constructor() {
    this.accountInfo = undefined;
    this.iPartnerInfo = undefined;
  }

  public getIPartnerInfo(): IPartnerInfo | undefined {
    return this.iPartnerInfo;
  }

  public setIPartnerInfo(iPartnerInfo: IPartnerInfo) {
    this.iPartnerInfo = iPartnerInfo;
  }

  public getAccountInfo(): UserInfo | undefined {
    return this.accountInfo;
  }

  public setAccountInfo(accountInfo: UserInfo) {
    this.accountInfo = accountInfo;
  }
}
