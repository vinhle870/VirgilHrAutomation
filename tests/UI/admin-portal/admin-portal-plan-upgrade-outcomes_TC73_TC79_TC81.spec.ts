import { test } from "src/fixtures";
import { DataFactory } from "src/data-factory";
import { plans } from "src/constant/static-data";

/**
 * Outcome-focused companions to TC72/TC80/TC84 in `admin-portal-plan-upgrade-eligibility_*.spec.ts`,
 * which cover *eligibility* and the Bank Transfer *toggle*. These three assert what the upgrade
 * actually does: the plan changes (TC73), a higher tier can be reached (TC79), and the user is
 * never asked to pay when Bank Transfer is ON (TC81).
 */
test.describe("E2E -> Admin Portal -> Customer Management", { tag: ["@regression_UI", "@customer_management"] }, () => {
  test(
    "TC73 Verify that after performing an auto-renew or upgrade, the team's plan is successfully renewed or upgraded.",
    {
      tag: "@TC73",
    },
    async ({ loginPage, onboardingFlow, authFlow }) => {
      await test.step("1 - Login to Admin portal", async () => {
        await loginPage.login();
      });

      const customerInfo = await DataFactory.customerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withBankStranfer(true)
        .withCompanySize(plans[0])
        .withBankStranferToUpgradePlan(true)
        .build();

      await test.step("2 - Create a customer on the starting plan", async () => {
        await onboardingFlow.createCustomerFromCustomerManagementPage(customerInfo);
      });

      await test.step("3 - Verify the customer is created successfully", async () => {
        await onboardingFlow.verifyCustomerVisible(customerInfo);
      });

      await test.step("4 - Verify the starting plan before any upgrade", async () => {
        await onboardingFlow.verifySubscriptionPlanOfCustomer(customerInfo, plans[0]);
      });

      await test.step("5 - Activate the customer account", async () => {
        await authFlow.activateAndChangePassIndividualCustomer(customerInfo.accountInfo.email, "Member", "Password@123");
      });

      await test.step("6 - Upgrade the team's plan", async () => {
        await loginPage.login();

        await onboardingFlow.upgradePlanForCustomer(customerInfo, plans[1]);
      });

      await test.step("7 - Verify the plan was successfully upgraded", async () => {
        await onboardingFlow.verifySubscriptionPlanOfCustomer(customerInfo, plans[1]);
      });

      // Distinguishes this case from TC80's ON branch: the upgrade must not break the user's access.
      await test.step("8 - Verify the customer can still reach the Homepage on the upgraded plan", async () => {
        await authFlow.loginToPortals(process.env.MEMBER_PORTAL_BASEURL!, customerInfo.accountInfo.email, "Password@123");

        await onboardingFlow.redirectToHomePage();
      });
    },
  );

  test(
    "TC79 Verify that the Upgrade Plan function allows the admin to upgrade an account to a higher plan than its current one.",
    {
      tag: "@TC79",
    },
    async ({ loginPage, onboardingFlow, authFlow }) => {
      await test.step("1 - Login to Admin portal", async () => {
        await loginPage.login();
      });

      const customerInfo = await DataFactory.customerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withBankStranfer(true)
        .withCompanySize(plans[0])
        .withBankStranferToUpgradePlan(true)
        .build();

      await test.step("2 - Create a customer on the lowest plan", async () => {
        await onboardingFlow.createCustomerFromCustomerManagementPage(customerInfo);
      });

      await test.step("3 - Verify the customer is created successfully", async () => {
        await onboardingFlow.verifyCustomerVisible(customerInfo);
      });

      await test.step("4 - Activate the customer account", async () => {
        await authFlow.activateAndChangePassIndividualCustomer(customerInfo.accountInfo.email, "Member", "Password@123");
      });

      // plans[3] rather than plans[1]: it is several tiers up, so this proves the modal offers the
      // whole higher range, not just the next step. `plans[1]` and `plans[2]` are the same string on
      // UAT, which is a data defect in `department.data.uat.ts` worth fixing separately.
      await test.step("5 - Upgrade several tiers up, to a higher plan", async () => {
        await loginPage.login();

        await onboardingFlow.upgradePlanForCustomer(customerInfo, plans[3]);
      });

      await test.step("6 - Verify the account now holds the higher plan", async () => {
        await onboardingFlow.verifySubscriptionPlanOfCustomer(customerInfo, plans[3]);
      });

      // NOT ASSERTED: whether a plan LOWER than the current one is offered in the modal. `upgradePlan`
      // throws "The upgraded plan does not exist" when a target is missing, which implies lower tiers
      // are absent — but that is inference, not documented behaviour. Confirm with product/QA, then
      // add a downgrade-not-offered assertion here.
    },
  );

  test(
    "TC81 When Bank Transfer = ON, the user does not need to make a payment through Stripe, and the plan upgrade is applied immediately.",
    {
      tag: "@TC81",
    },
    async ({ loginPage, onboardingFlow, authFlow }) => {
      await test.step("1 - Login to Admin portal", async () => {
        await loginPage.login();
      });

      const customerInfo = await DataFactory.customerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withBankStranfer(true)
        .withCompanySize(plans[0])
        .withBankStranferToUpgradePlan(true)
        .build();

      await test.step("2 - Create a customer on the starting plan", async () => {
        await onboardingFlow.createCustomerFromCustomerManagementPage(customerInfo);
      });

      await test.step("3 - Verify the customer is created successfully", async () => {
        await onboardingFlow.verifyCustomerVisible(customerInfo);
      });

      await test.step("4 - Activate the customer account", async () => {
        await authFlow.activateAndChangePassIndividualCustomer(customerInfo.accountInfo.email, "Member", "Password@123");
      });

      await test.step("5 - Upgrade the plan with Bank Transfer toggled ON", async () => {
        await loginPage.login();

        await onboardingFlow.upgradePlanForCustomer(customerInfo, plans[1]);
      });

      // "Immediately" — asserted with no intervening payment step of any kind.
      await test.step("6 - Verify the upgrade is applied immediately", async () => {
        await onboardingFlow.verifySubscriptionPlanOfCustomer(customerInfo, plans[1]);
      });

      // The user-side half: log in and land on Home. With Bank Transfer OFF the upgrade instead
      // issues a payment request (TC80 step 11 / TC82), so reaching Home proves nothing was owed.
      await test.step("7 - Verify the user reaches the Homepage with no Stripe payment demanded", async () => {
        await authFlow.loginToPortals(process.env.MEMBER_PORTAL_BASEURL!, customerInfo.accountInfo.email, "Password@123");

        await onboardingFlow.redirectToHomePage();
      });

      // NOT ASSERTED: the absence of a payment-request email. That needs the payment-request email
      // subject, which is not defined anywhere in this repo (see TC82).
    },
  );
});
