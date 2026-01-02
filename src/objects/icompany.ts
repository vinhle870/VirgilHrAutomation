import UserInfo from "./user-info";

export interface ICompany {
  getAccountInfo: () => UserInfo;

  getPlan: () => string;

  setPlan: (plan: string) => void;

  setAccountInfo: (account: UserInfo) => void;
}
