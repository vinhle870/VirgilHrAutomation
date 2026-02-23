import { format } from "date-fns";
import { DataGenerate } from "src/utilities";
import UserInfo from "src/objects/user-info";
import { I500EmployeesPlan } from "src/objects/I500EmployeesPlan";

/**
 * Shared utility that generates person/account data with sensible defaults.
 * Used by CustomerBuilder, PartnerBuilder, and any future builders
 * to avoid duplicating name/email/phone generation logic.
 *
 * Pass `Partial<UserInfo>` to override specific fields;
 * any field left undefined will be auto-generated with realistic fake data.
 */
export class PlatinumPlan {
  static generatePlatinumPlan(
    customerId: string,
    emailOfUpdatingPerson: string,
    overrides?: Partial<Record<string, any>>,
  ): I500EmployeesPlan {
    const platinumPlan: I500EmployeesPlan = {
      consumerId: customerId,
      teamId: overrides?.restriction?.teamId ?? null,
      price: overrides?.restriction?.price ?? 0,
      billingCycle: overrides?.restriction?.billingCycle ?? 1,
      productType: overrides?.restriction?.productType ?? 6,
      useCredit: overrides?.restriction?.useCredit ?? false,
      timeZone: overrides?.restriction?.timeZone ?? null,
      validDate: overrides?.restriction?.validDate ?? null,
      restriction: {
        id: "690c736a1a6dee7e3aae2932",
        name: "500+ Employees & HR Consultants2",
        numberOfLicenses: overrides?.restriction?.numberOfLicenses ?? 0,
        numberOfChats: overrides?.restriction?.numberOfChats ?? 10,
        limitOfChat: overrides?.restriction?.limitOfChat ?? false,
        unitOfTime: overrides?.restriction?.unitOfTime ?? 0,
        chatbotAllow: overrides?.restriction?.chatbotAllow ?? true,
        legalFAQAllow: overrides?.restriction?.legalFAQAllow ?? true,
        lawComparisonAllow: overrides?.restriction?.lawComparisonAllow ?? true,
        policyAllow: overrides?.restriction?.policyAllow ?? true,
        handbook: {
          allowed: overrides?.restriction?.handbook?.allowed ?? true,
          requirePayment:
            overrides?.restriction?.handbook?.requirePayment ?? false,
          expireDate:
            overrides?.restriction?.handbook?.expireDate ??
            "2023-02-09T03:59:09.471Z",
          allowedDownload:
            overrides?.restriction?.handbook?.allowedDownload ?? true,
          autoUpdate: overrides?.restriction?.handbook?.autoUpdate ?? true,
          collaboration:
            overrides?.restriction?.handbook?.collaboration ?? true,
          eSignature: overrides?.restriction?.handbook?.eSignature ?? true,
          accessCreationConfig:
            overrides?.restriction?.handbook?.accessCreationConfig ?? 0,
        },
        customBranding: {
          allowed: overrides?.restriction?.customBranding?.allowed ?? false,
          requirePayment:
            overrides?.restriction?.customBranding?.requirePayment ?? false,
          expireDate:
            overrides?.restriction?.customBranding?.expireDate ??
            "0001-01-01T00:00:00Z",
        },
        contactExperts: {
          allowed: overrides?.restriction?.contactExperts?.allowed ?? true,
          isLimit: overrides?.restriction?.contactExperts?.isLimit ?? false,
          numberOfContactExpertQuery:
            overrides?.restriction?.contactExperts
              ?.numberOfContactExpertQuery ?? 0,
          remainingContactExpertQuery:
            overrides?.restriction?.contactExperts
              ?.remainingContactExpertQuery ?? 0,
          extraContactExpertQuery:
            overrides?.restriction?.contactExperts?.extraContactExpertQuery ??
            0,
          remainingExtraContactExpertQuery:
            overrides?.restriction?.contactExperts
              ?.remainingExtraContactExpertQuery ?? 0,
          nextRenewDate:
            overrides?.restriction?.contactExperts?.nextRenewDate ??
            "0001-01-01T00:00:00Z",
          unitOfTime: overrides?.restriction?.contactExperts?.unitOfTime ?? 0,
        },
        lms: {
          allowed: overrides?.restriction?.lms?.allowed ?? true,
          requirePayment: overrides?.restriction?.lms?.requirePayment ?? false,
          expireDate:
            overrides?.restriction?.lms?.expireDate ?? "0001-01-01T00:00:00Z",
          customCourses: overrides?.restriction?.lms?.customCourses ?? false,
          courseList: overrides?.restriction?.lms?.courseList ?? 0,
          requirePaymentExtraConfig:
            overrides?.restriction?.lms?.requirePaymentExtraConfig ?? false,
        },
        hrTools: {
          allowed: overrides?.restriction?.hrTools?.allowed ?? true,
          complianceAudit:
            overrides?.restriction?.hrTools?.complianceAudit ?? true,
          salaryBenchmarking:
            overrides?.restriction?.hrTools?.salaryBenchmarking ?? true,
          jobDescriptionBuilder:
            overrides?.restriction?.hrTools?.jobDescriptionBuilder ?? true,
          calculators: overrides?.restriction?.hrTools?.calculators ?? true,
          multistateComparison:
            overrides?.restriction?.hrTools?.multistateComparison ?? true,
        },
        productSupport: {
          allowed: overrides?.restriction?.productSupport?.allowed ?? true,
        },
        products: [
          {
            productType: 6,
            planId: "690c736a1a6dee7e3aae2932",
            price: null,
          },
        ],
        trialLegalFAQAllow: overrides?.restriction?.trialLegalFAQAllow ?? true,
        trialLawComparisonAllow:
          overrides?.restriction?.trialLawComparisonAllow ?? true,
        trialPolicyAllow: overrides?.restriction?.trialPolicyAllow ?? true,
        trialHandbook: {
          allowed: overrides?.restriction?.trialHandbook?.allowed ?? true,
          requirePayment:
            overrides?.restriction?.trialHandbook?.requirePayment ?? false,
          expireDate:
            overrides?.restriction?.trialHandbook?.expireDate ??
            "2023-02-09T03:59:09.471Z",
          allowedDownload:
            overrides?.restriction?.trialHandbook?.allowedDownload ?? true,
          autoUpdate: overrides?.restriction?.trialHandbook?.autoUpdate ?? true,
          collaboration:
            overrides?.restriction?.trialHandbook?.collaboration ?? true,
          eSignature: overrides?.restriction?.trialHandbook?.eSignature ?? true,
          accessCreationConfig:
            overrides?.restriction?.trialHandbook?.accessCreationConfig ?? 0,
        },
        trialCustomBranding: {
          allowed: overrides?.restriction?.trialCustomBranding?.allowed ?? true,
          requirePayment:
            overrides?.restriction?.trialCustomBranding?.requirePayment ?? true,
          expireDate:
            overrides?.restriction?.trialCustomBranding?.expireDate ??
            "0001-01-01T00:00:00Z",
        },
        trialLMS: {
          allowed: overrides?.restriction?.trialLMS?.allowed ?? true,
          requirePayment:
            overrides?.restriction?.trialLMS?.requirePayment ?? true,
          expireDate:
            overrides?.restriction?.trialLMS?.expireDate ??
            "0001-01-01T00:00:00Z",
          customCourses:
            overrides?.restriction?.trialLMS?.customCourses ?? false,
          courseList: overrides?.restriction?.trialLMS?.courseList ?? 0,
          requirePaymentExtraConfig:
            overrides?.restriction?.trialLMS?.requirePaymentExtraConfig ??
            false,
        },
        trialHRTools: {
          allowed: overrides?.restriction?.trialHRTools?.allowed ?? true,
          complianceAudit:
            overrides?.restriction?.trialHRTools?.complianceAudit ?? true,
          salaryBenchmarking:
            overrides?.restriction?.trialHRTools?.salaryBenchmarking ?? true,
          jobDescriptionBuilder:
            overrides?.restriction?.trialHRTools?.jobDescriptionBuilder ?? true,
          calculators:
            overrides?.restriction?.trialHRTools?.calculators ?? true,
          multistateComparison:
            overrides?.restriction?.trialHRTools?.multistateComparison ?? true,
        },
        trialProductSupport: {
          allowed: overrides?.restriction?.trialProductSupport?.allowed ?? true,
        },
        trialContactExperts: {
          allowed: overrides?.restriction?.trialContactExperts?.allowed ?? true,
          isLimit: overrides?.restriction?.trialContactExperts?.isLimit ?? true,
          numberOfContactExpertQuery:
            overrides?.restriction?.trialContactExperts
              ?.numberOfContactExpertQuery ?? 4,
          remainingContactExpertQuery:
            overrides?.restriction?.trialContactExperts
              ?.remainingContactExpertQuery ?? 4,
          extraContactExpertQuery:
            overrides?.restriction?.trialContactExperts
              ?.extraContactExpertQuery ?? 0,
          remainingExtraContactExpertQuery:
            overrides?.restriction?.trialContactExperts
              ?.remainingExtraContactExpertQuery ?? 0,
          nextRenewDate:
            overrides?.restriction?.trialContactExperts?.nextRenewDate ??
            "0001-01-01T00:00:00Z",
          unitOfTime:
            overrides?.restriction?.trialContactExperts?.unitOfTime ?? 0,
        },
        refPlanId: "690c736a1a6dee7e3aae2932",
        updatedBy: emailOfUpdatingPerson,
        freeVersion: overrides?.restriction?.freeVersion ?? 0,
        version: overrides?.restriction?.version ?? 34,
        isRoot: overrides?.restriction?.isRoot ?? false,
        numberOfUser: overrides?.restriction?.numberOfUser ?? 0,
        productId: overrides?.restriction?.productId ?? "prod_NLfIuzyP4FlJEo",
        isCustom: overrides?.restriction?.isCustom ?? true,
        freeTrialAllowed: overrides?.restriction?.freeTrialAllowed ?? true,
        partnerSetting: overrides?.restriction?.partnerSetting ?? null,
        partnerId: overrides?.restriction?.partnerId ?? null,
        departmentId:
          overrides?.restriction?.departmentId ?? "688897d5eb52b4af5573def4",
        pricingRuleLMS: overrides?.restriction?.pricingRuleLMS ?? null,
        createdAt:
          overrides?.restriction?.createdAt ?? "2025-11-06T10:07:38.51Z",
        updatedAt: overrides?.restriction?.updatedAt ?? "2025-11-06T",
      },
    };

    if (platinumPlan.useCredit) {
      platinumPlan.restriction.trialLMS.requirePaymentExtraConfig = false;
      platinumPlan.restriction.pricingRuleLMS = null;
    }

    if (platinumPlan.restriction.contactExperts.isLimit) {
      platinumPlan.restriction.contactExperts.numberOfContactExpertQuery =
        overrides?.restriction?.contactExperts?.numberOfContactExpertQuery ?? 5;
    }

    if (platinumPlan.restriction.lms.requirePayment) {
      platinumPlan.restriction.lms.requirePaymentExtraConfig = false;
      platinumPlan.restriction.lms.customCourses = true;
      platinumPlan.restriction.lms.courseList = 1;
    }

    return platinumPlan;
  }
}
