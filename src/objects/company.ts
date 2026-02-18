import { Country } from "./country";
import { Industry } from "./industry";
import { State } from "./state";

export interface Company {
  // Common Info
  companyName?: string;
  companySize?: string;

  // Info to be signup on Member Portal
  partnerId?: string;
  source?: string;
  departmentId?: string;
  ssoProvider?: string | null;
  ssoToken?: string | null;

  // Info to be added on Admin Portal
  useCredit?: boolean;
  statesEmployee?: string[];
  country?: Country;
  totalEmployees?: number;
  isSso?: boolean;
  type?: string | number;
  partnerConsultantId?: string;
  industry?: Industry[] | null;
  trialDays?: number;
  productType?: number | string;
  state?: State;
  billingcycle?: number;
}
