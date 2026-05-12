import { test as base } from "@playwright/test";
import { AuthFlow, OnboardingFlow, PurchaseFlow } from "../ui/flows";

type FlowFixtures = {
  adminLoggedIn: void;
  authFlow: AuthFlow;
  onboardingFlow: OnboardingFlow;
  purchaseFlow: PurchaseFlow;
};

export const test = base.extend<FlowFixtures>({
  authFlow: async ({ page }, use) => {
    await use(new AuthFlow(page));
  },

  onboardingFlow: async ({ page }, use) => {
    await use(new OnboardingFlow(page));
  },

  purchaseFlow: async ({ page }, use) => {
    await use(new PurchaseFlow(page));
  },
});
