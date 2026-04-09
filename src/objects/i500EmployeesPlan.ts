export interface I500EmployeesPlan {
  consumerId: string;
  teamId: any;
  price: number;
  billingCycle: number;
  productType: number;
  useCredit: boolean;
  timeZone: string | null;
  validDate: string | null;
  restriction: {
    id: string;
    name: string;
    numberOfLicenses: number;
    numberOfChats: number;
    limitOfChat: boolean;
    unitOfTime: number;
    chatbotAllow: boolean;
    legalFAQAllow: boolean;
    lawComparisonAllow: boolean;
    policyAllow: boolean;
    handbook: {
      allowed: boolean;
      requirePayment: boolean;
      expireDate: string;
      allowedDownload: boolean;
      autoUpdate: boolean;
      collaboration: boolean;
      eSignature: boolean;
      accessCreationConfig: number;
    };
    customBranding: {
      allowed: boolean;
      requirePayment: boolean;
      expireDate: string;
    };
    contactExperts: {
      allowed: boolean;
      isLimit: boolean;
      numberOfContactExpertQuery: number;
      remainingContactExpertQuery: number;
      extraContactExpertQuery: number;
      remainingExtraContactExpertQuery: number;
      nextRenewDate: string;
      unitOfTime: number;
    };
    lms: {
      allowed: boolean;
      requirePayment: boolean;
      expireDate: string;
      customCourses: boolean;
      courseList: number;
      requirePaymentExtraConfig?: boolean;
    };
    hrTools: {
      allowed: boolean;
      complianceAudit: boolean;
      salaryBenchmarking: boolean;
      jobDescriptionBuilder: boolean;
      calculators: boolean;
      multistateComparison: boolean;
    };
    productSupport: {
      allowed: boolean;
    };
    products: {
      productType: number;
      planId: string;
      price: number | null;
    }[];
    trialLegalFAQAllow: boolean;
    trialLawComparisonAllow: boolean;
    trialPolicyAllow: boolean;
    trialHandbook: {
      allowed: boolean;
      requirePayment: boolean;
      expireDate: string;
      allowedDownload: boolean;
      autoUpdate: boolean;
      collaboration: boolean;
      eSignature: boolean;
      accessCreationConfig: number;
    };
    trialCustomBranding: {
      allowed: boolean;
      requirePayment: boolean;
      expireDate: string;
    };
    trialLMS: {
      allowed: boolean;
      requirePayment: boolean;
      expireDate: string;
      customCourses: boolean;
      courseList: number;
      requirePaymentExtraConfig?: boolean;
    };
    trialHRTools: {
      allowed: boolean;
      complianceAudit: boolean;
      salaryBenchmarking: boolean;
      jobDescriptionBuilder: boolean;
      calculators: boolean;
      multistateComparison: boolean;
    };
    trialProductSupport: {
      allowed: boolean;
    };
    trialContactExperts: {
      allowed: boolean;
      isLimit: boolean;
      numberOfContactExpertQuery: number;
      remainingContactExpertQuery: number;
      extraContactExpertQuery: number;
      remainingExtraContactExpertQuery: number;
      nextRenewDate: string;
      unitOfTime: number;
    };
    refPlanId: string;
    updatedBy: string;
    freeVersion: number;
    version: number;
    isRoot: boolean;
    numberOfUser: number;
    productId: string;
    isCustom: boolean;
    freeTrialAllowed: boolean;
    partnerSetting: unknown | null;
    partnerId: string | null;
    departmentId: string;
    pricingRuleLMS?: any;
    createdAt: string;
    updatedAt: string;
  };
}
