import UserInfo from "./user-info";

export default interface IPartnerInfo {
  restriction: {
    eSignEnable?: boolean;
    productSupport?: boolean;
    resourceRequest?: boolean;
    contactExpert?: boolean;
    ssoEnable?: boolean;
    lmsEnable?: boolean;
    hrToolsEnable?: boolean;
    feFilterProductTypes: number[];
  };
  whoPay: number;
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
  billingCycle?: number;
  planId?: string;
  paymentOption?: string;
  productsType?: string[];
  plan?: string;
  internal?: boolean;
  departmentName?: string;
  partnerLevel?: string;
  billingCycleRadio?: string;
}

export interface IPartnerInfoWithDepartmentAndProductTypes {
  productTypes: number[];
  departmentIds: string[];
}

export class Partner {
  accountInfo: UserInfo | undefined;
  partnerInfo: IPartnerInfo | undefined;
}
