import { test } from "src/fixtures";
import { DataFactory } from "src/data-factory";
import { getPlansForDepartment } from "src/constant/department-data";

test.describe("E2E -> Member portal", () => {
  test(
    "TC01",
    {
      tag: "@Verify that the user can create a new account by clicking the Sign Up button.",
    },
    async ({ onboardingFlow, authFlow }) => {
      const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();

      await test.step("Fill form to sign up", async () => {
        await onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo!);
      });

      await test.step("Confirm email", async () => {
        await authFlow.activateSignedUpCustomer(customerInfo!.accountInfo.email!);
      });

      await test.step("Verify the signed up customer login successfully", async () => {
        await onboardingFlow.verifyURL("register-success");
      });
    },
  );

  test(
    "TC02",
    {
      tag: "@Verify that the user can fill in all required information on the Sign Up screen.",
    },
    async ({ onboardingFlow, authFlow }) => {
      const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();

      await test.step("Fill form to sign up", async () => {
        await onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo!);
      });

      await test.step("Confirm email", async () => {
        await authFlow.activateSignedUpCustomer(customerInfo!.accountInfo.email!);
      });

      await test.step("Verify the signed up customer login successfully", async () => {
        await onboardingFlow.verifyURL("register-success");
      });
    },
  );

  test(
    "TC03",
    {
      tag: "@Verify that the email address is unique.",
    },
    async ({ onboardingFlow, authFlow }) => {
      const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();

      await test.step("Fill form to sign up", async () => {
        await onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo!);
      });

      await test.step("Confirm email", async () => {
        await authFlow.activateSignedUpCustomer(customerInfo!.accountInfo.email!);
      });

      const duplicateCustomerInfo = await DataFactory.customerBuilder().withEmail(customerInfo!.accountInfo.email!).withPassword("Password@123").build();

      await test.step("Verify duplicated email", async () => {
        await onboardingFlow.verifyDuplicatedEmailWhenSignUpCustomer(duplicateCustomerInfo);
      });
    },
  );

  test(
    "TC04",
    {
      tag: "@Verify that all fields on the Sign Up screen are required (except for the HR System field).",
    },
    async ({ onboardingFlow, authFlow }) => {
      const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();

      await test.step("Verify inputs are required", async () => {
        await onboardingFlow.verifyFillingFormIsRequired(customerInfo!);
      });

      await test.step("Activate account", async () => {
        await authFlow.activateSignedUpCustomer(customerInfo!.accountInfo.email!);
      });

      await test.step("Verify the signed up customer login successfully", async () => {
        await onboardingFlow.verifyURL("register-success");
      });
    },
  );

  test(
    "TC05",
    {
      tag: "@Verify that after filling in all information and signing up, the user receives a confirmation email.",
    },
    async ({ onboardingFlow, authFlow }) => {
      const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();

      await test.step("Fill form to sign up", async () => {
        await onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo!);
      });

      await test.step("Verify recieve one confirmation email", async () => {
        await authFlow.validateReceivedOneEmailForCreatingCustomer(customerInfo!.accountInfo.email!);
      });
    },
  );

  test(
    "TC06",
    {
      tag: "@Verify that the confirmation email is only valid for 24 hours.",
    },
    async ({ onboardingFlow, authFlow }) => {
      const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();

      await test.step("Fill form to sign up", async () => {
        await onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo!);
      });

      await test.step("Verify email is only valid for 24 hours", async () => {
        await authFlow.validateTimeLimitedEmailForCreatingCustomer(customerInfo.accountInfo.email);
      });
    },
  );

  test(
    "TC07",
    {
      tag: "@Verify that after confirming the email, the user is redirected to the Select Plan screen.",
    },
    async ({ onboardingFlow, authFlow }) => {
      const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();

      await test.step("Fill form to sign up", async () => {
        await onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo!);
      });

      await test.step("Confirm email", async () => {
        await authFlow.activateSignedUpCustomer(customerInfo!.accountInfo.email!);
      });

      await test.step("Verify user is redirected to Select Plan screen", async () => {
        await onboardingFlow.verifyURL("register-success");
      });
    },
  );

  test(
    "TC08",
    {
      tag: "@On the Select Plan screen, the user can choose any available plan from the list.",
    },
    async ({ onboardingFlow, authFlow, purchaseFlow }) => {
      const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();
      const plans = getPlansForDepartment();

      await test.step("Fill form to sign up", async () => {
        await onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo!);
      });

      await test.step("Confirm email", async () => {
        await authFlow.activateSignedUpCustomer(customerInfo!.accountInfo.email!);
      });

      await test.step("Select a plan from the list", async () => {
        await purchaseFlow.selectPlanBeforePurchase("", customerInfo!.accountInfo.email!, plans[0]);
      });

      await test.step("Buy the selected plan", async () => {
        await purchaseFlow.submitSubscriptionPayment();
      });

      await test.step("Verify redirect to home page", async () => {
        await onboardingFlow.redirectToHomePage();
      });
    },
  );

  test(
    "TC09",
    {
      tag: "@After selecting a plan, the user can choose to pay annually or monthly, and apply a discount code.",
    },
    async ({ onboardingFlow, authFlow, purchaseFlow }) => {
      const plans = getPlansForDepartment();

      for (let i = 0; i <= 1; i++) {
        const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();

        await test.step(`Fill form to sign up`, async () => {
          await onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo!);
        });

        await test.step(`Confirm email`, async () => {
          await authFlow.activateSignedUpCustomer(customerInfo!.accountInfo.email!);
        });

        await test.step(`Select a plan from the list and buy plan - ${i === 0 ? "monthly" : "annually"}`, async () => {
          await purchaseFlow.selectPlanBeforePurchase("", customerInfo!.accountInfo.email!, plans[5], i === 0);

          await purchaseFlow.submitSubscriptionPayment();
        });

        await test.step(`Verify buy plan successfully - ${i === 0 ? "monthly" : "annually"}`, async () => {
          await onboardingFlow.redirectToHomePage();
        });
      }
    },
  );

  test(
    "TC10",
    {
      tag: "@After confirming the payment, the user is redirected to Stripe for checkout.",
    },
    async ({ onboardingFlow, authFlow, purchaseFlow }) => {
      const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();
      const plans = getPlansForDepartment();

      await test.step("Fill form to sign up", async () => {
        await onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo!);
      });

      await test.step("Confirm email", async () => {
        await authFlow.activateSignedUpCustomer(customerInfo!.accountInfo.email!);
      });

      await test.step("Select a plan and confirm payment", async () => {
        await purchaseFlow.selectPlanBeforePurchase("", customerInfo!.accountInfo.email!, plans[5]);
      });

      await test.step("Verify redirect to Stripe checkout", async () => {
        await purchaseFlow.verifyStripePaymentFormCorrectDisplay();
      });
    },
  );
});
