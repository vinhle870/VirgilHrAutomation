import { test, expect } from "src/fixtures";
import { DataFactory } from "src/data-factory";

test.describe("E2E -> Admin Portal -> Partner Management", () => {
  test(
    "TC01",
    {
      tag: "@Verify that the user can create a new account by clicking the Sign Up button.",
    },
    async ({ onboardingFlow, authFlow }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

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
    async ({ onboardingFlow, authFlow }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

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
    async ({ onboardingFlow, authFlow }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();

      await test.step("Fill form to sign up", async () => {
        await onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo!);
      });

      await test.step("Confirm email", async () => {
        await authFlow.activateSignedUpCustomer(customerInfo!.accountInfo.email!);
      });

      const duplicateCustomerInfo = await DataFactory.customerBuilder().withEmail(customerInfo!.accountInfo.email!).withPassword("Password@123").build();

      await test.step("Fill form to sign up", async () => {
        await onboardingFlow.signUpIndividualCustomerFromMemberPortal(duplicateCustomerInfo);
      });
    },
  );
});
