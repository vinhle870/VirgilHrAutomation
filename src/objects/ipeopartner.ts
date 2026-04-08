import UserInfo from "./user-info";

export default interface IPeoPartner {
  name: string;
  customBranding?: boolean;
  customBenefitsPlans?: boolean;
  companyType?: string;
  backURL?: string;
  backText?: string;
}

export class PeoPartner {
  public accountInfo: UserInfo | undefined;
  public peoPartnerInfo: IPeoPartner | undefined;
}
