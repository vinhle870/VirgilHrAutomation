import { test } from "src/fixtures";
import { DataFactory } from "src/data-factory";
import { getPlansForDepartment } from "src/constant/department-data";

test.describe("E2E -> Member portal", { tag: ["@regression_UI", "@member_portal"] }, () => {
  test(
    "TC06: Verify that the confirmation email is only valid for 24 hours.",
    {
      tag: "@TC06",
    },
    async ({ onboardingFlow, authFlow }) => {
      const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();

      await test.step("1 - Fill form to sign up", async () => {
        await onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo!);
      });

      await test.step("2 - Verify email is only valid for 24 hours", async () => {
        await authFlow.validateTimeLimitedEmailForCreatingCustomer(customerInfo.accountInfo.email);
      });
    },
  );

  test(
    "TC07: Verify that after confirming the email, the user is redirected to the Select Plan screen.",
    {
      tag: "@TC07",
    },
    async ({ onboardingFlow, authFlow }) => {
      const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();

      await test.step("1 - Fill form to sign up", async () => {
        await onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo!);
      });

      await test.step("2 - Confirm email", async () => {
        await authFlow.activateSignedUpCustomer(customerInfo!.accountInfo.email!);
      });

      await test.step("3 - Verify user is redirected to Select Plan screen", async () => {
        await onboardingFlow.verifyURL("register-success");
      });
    },
  );

  test(
    "TC08: Verify that on the Select Plan screen, the user can choose any available plan from the list.",
    {
      tag: "@TC08",
    },
    async ({ onboardingFlow, authFlow, purchaseFlow }) => {
      const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();
      const plans = getPlansForDepartment();

      await test.step("1 - Fill form to sign up", async () => {
        await onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo!);
      });

      await test.step("2 - Confirm email", async () => {
        await authFlow.activateSignedUpCustomer(customerInfo!.accountInfo.email!);
      });

      await test.step("3 - Select a plan from the list", async () => {
        await purchaseFlow.selectPlanBeforePurchase("", customerInfo!.accountInfo.email!, plans[0]);
      });

      await test.step("4 - Buy the selected plan", async () => {
        await purchaseFlow.submitSubscriptionPayment();
      });

      await test.step("5 - Verify redirect to home page", async () => {
        await onboardingFlow.redirectToHomePage();
      });
    },
  );

  test(
    "TC09: Verify that after selecting a plan, the user can choose to pay annually or monthly, and apply a discount code. ",
    {
      tag: "@TC09",
    },
    async ({ onboardingFlow, authFlow, purchaseFlow }) => {
      const plans = getPlansForDepartment();

      for (let i = 0; i <= 1; i++) {
        const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();

        await test.step(`1 - Fill form to sign up`, async () => {
          await onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo!);
        });

        await test.step(`2 - Confirm email`, async () => {
          await authFlow.activateSignedUpCustomer(customerInfo!.accountInfo.email!);
        });

        await test.step(`3 - Select a plan from the list and buy plan - ${i === 0 ? "monthly" : "annually"}`, async () => {
          await purchaseFlow.selectPlanBeforePurchase("", customerInfo!.accountInfo.email!, plans[0], i === 0);
          await purchaseFlow.submitSubscriptionPayment();
        });

        await test.step(`4 - Verify buy plan successfully - ${i === 0 ? "monthly" : "annually"}`, async () => {
          await onboardingFlow.redirectToHomePage();
        });
      }
    },
  );

  test(
    "TC10: Verify that after confirming the payment, the user is redirected to Stripe for checkout.",
    {
      tag: "@TC10",
    },
    async ({ onboardingFlow, authFlow, purchaseFlow }) => {
      const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();
      const plans = getPlansForDepartment();

      await test.step("1 - Fill form to sign up", async () => {
        await onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo!);
      });

      await test.step("2 - Confirm email", async () => {
        await authFlow.activateSignedUpCustomer(customerInfo!.accountInfo.email!);
      });

      await test.step("3 - Select a plan and confirm payment", async () => {
        await purchaseFlow.selectPlanBeforePurchase("", customerInfo!.accountInfo.email!, plans[0]);
      });

      await test.step("4 - Verify redirect to Stripe checkout", async () => {
        await purchaseFlow.verifyStripePaymentFormCorrectDisplay();
      });
    },
  );
});
