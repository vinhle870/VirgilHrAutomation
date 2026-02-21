import { expect } from "@playwright/test";

export default class Comparison {
  // Hàm tiện ích: chờ cho tới khi field xuất hiện
  private static async waitForField<T>(
    getter: () => T | undefined,
    timeout = 5000,
    interval = 200,
  ): Promise<T> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const value = getter();
      if (value !== undefined) return value;
      await new Promise((r) => setTimeout(r, interval));
    }
    throw new Error("Field not loaded in time");
  }

  public static async comparePlan(benifitResponse: any, boughtPlan: any) {
    // Main plan info
    expect(benifitResponse.main.name).toBe(boughtPlan.name);

    // Chatbot
    const chatbot = await this.waitForField(
      () => benifitResponse.lms?.currentPlan?.b2CFeatureRestrictions?.chatbot,
    );
    expect(boughtPlan.body.chatbotAllow).toBe(chatbot.allowed);
    expect(boughtPlan.body.limitOfChat).toBe(chatbot.isLimit);
    expect(boughtPlan.body.unitOfTime).toBe(chatbot.unitOfTime);

    // Legal FAQs
    const legalFAQs =
      benifitResponse.lms?.currentPlan?.b2CFeatureRestrictions?.legalFAQs;
    if (legalFAQs) {
      expect(boughtPlan.body.legalFAQAllow).toBe(legalFAQs.allowed);
    }

    // Law Comparison
    const lawComparison =
      benifitResponse.lms?.currentPlan?.b2CFeatureRestrictions?.lawComparison;
    if (lawComparison) {
      expect(boughtPlan.body.lawComparisonAllow).toBe(lawComparison.allowed);
    }

    // Handbook
    const handbook =
      benifitResponse.lms?.currentPlan?.b2CFeatureRestrictions?.handbook;
    if (handbook) {
      expect(boughtPlan.body.handbook).toEqual(handbook);
    }

    // Custom Branding
    const customBranding =
      benifitResponse.lms?.currentPlan?.b2CFeatureRestrictions?.customBranding;
    if (customBranding) {
      expect(boughtPlan.body.customBranding).toEqual(customBranding);
    }

    // Contact Experts
    const contactExperts =
      benifitResponse.lms?.currentPlan?.b2CFeatureRestrictions?.contactExperts;
    if (contactExperts) {
      expect(boughtPlan.body.contactExperts.allowed).toBe(
        contactExperts.allowed,
      );
      expect(boughtPlan.body.contactExperts.isLimit).toBe(
        contactExperts.isLimit,
      );
      expect(boughtPlan.body.contactExperts.numberOfContactExpertQuery).toBe(
        contactExperts.numberOfContactExpertQuery,
      );
    }

    // LMS
    const lms = benifitResponse.lms?.currentPlan?.b2CFeatureRestrictions?.lms;
    if (lms) {
      expect(boughtPlan.body.lms).toEqual(lms);
    }

    // HR Tools
    const hrTools =
      benifitResponse.lms?.currentPlan?.b2CFeatureRestrictions?.hrTools;
    if (hrTools) {
      expect(boughtPlan.body.hrTools).toEqual(hrTools);
    }

    // Product Support
    const productSupport =
      benifitResponse.lms?.currentPlan?.b2CFeatureRestrictions?.productSupport;
    if (productSupport) {
      expect(boughtPlan.body.productSupport).toEqual(productSupport);
    }

    // eSign
    const eSign =
      benifitResponse.lms?.currentPlan?.b2CFeatureRestrictions?.eSign;
    if (eSign) {
      expect(boughtPlan.body.eSign?.allowed).toBe(eSign.allowed);
    }

    // Task Management
    const taskManagement =
      benifitResponse.lms?.currentPlan?.b2CFeatureRestrictions?.taskManagement;
    if (taskManagement) {
      expect(boughtPlan.body.taskManagement?.allowed).toBe(
        taskManagement.allowed,
      );
    }

    // Reporting
    const reporting =
      benifitResponse.lms?.currentPlan?.b2CFeatureRestrictions?.reporting;
    if (reporting) {
      expect(boughtPlan.body.reporting?.allowed).toBe(reporting.allowed);
    }

    // Resources
    const resources =
      benifitResponse.lms?.currentPlan?.b2CFeatureRestrictions?.resources;
    if (resources) {
      expect(boughtPlan.body.resources?.allowed).toBe(resources.allowed);
    }

    // So sánh thông tin currentPlan trong LMS
    if (benifitResponse.lms?.currentPlan) {
      expect(benifitResponse.lms.currentPlan.name).toBe(boughtPlan.body.name);
      expect(benifitResponse.lms.currentPlan.id).toBe(
        boughtPlan.body.refPlanId,
      );
      expect(benifitResponse.lms.currentPlan.departmentId).toBe(
        boughtPlan.body.departmentId,
      );
    }
  }
}
