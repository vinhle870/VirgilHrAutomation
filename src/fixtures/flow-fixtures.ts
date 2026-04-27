import { test as base } from "@playwright/test";
import { AuthFlow, OnboardingFlow, PurchaseFlow } from "../ui/flows";
import { LoginPage, TempEmailFreePage } from "../ui/pages";

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

  adminLoggedIn: async ({ authFlow }, use) => {
    const { BASE_URL, ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;

    if (!BASE_URL || !ADMIN_USERNAME || !ADMIN_PASSWORD) {
      throw new Error("Missing environment variables");
    }

    await authFlow.loginWithValidAccount(BASE_URL, ADMIN_USERNAME, ADMIN_PASSWORD);
    await use();
  },
});
