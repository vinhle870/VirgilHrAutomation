import { test } from "src/fixtures";
import { DataFactory } from "src/data-factory";

test.describe("E2E -> Member portal", { tag: ["@regression_UI", "@member_portal"] }, () => {
  test(
    "TC01: Verify that the user can create a new account by clicking the Sign Up button.",
    {
      tag: "@TC01",
    },
    async ({ onboardingFlow, authFlow }) => {
      const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();

      await test.step("1 - Fill form to sign up", async () => {
        await onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo!);
      });

      await test.step("2 - Confirm email", async () => {
        await authFlow.activateSignedUpCustomer(customerInfo!.accountInfo.email!);
      });

      await test.step("3 - Verify the signed up customer login successfully", async () => {
        await onboardingFlow.verifyURL("register-success");
      });
    },
  );

  test(
    "TC02: Verify that the user can fill in all required information on the Sign Up screen.",
    {
      tag: "@TC02",
    },
    async ({ onboardingFlow, authFlow }) => {
      const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();

      await test.step("1 - Fill form to sign up", async () => {
        await onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo!);
      });

      await test.step("2 - Confirm email", async () => {
        await authFlow.activateSignedUpCustomer(customerInfo!.accountInfo.email!);
      });

      await test.step("3 - Verify the signed up customer login successfully", async () => {
        await onboardingFlow.verifyURL("register-success");
      });
    },
  );

  test(
    "TC03: Verify that the email address is unique. If a user tries to sign up with an email address that is already registered, the system should display an error message indicating that the email is already in use.",
    {
      tag: "@TC03",
    },
    async ({ onboardingFlow, authFlow }) => {
      const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();

      await test.step("1 - Fill form to sign up", async () => {
        await onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo!);
      });

      await test.step("2 - Confirm email", async () => {
        await authFlow.activateSignedUpCustomer(customerInfo!.accountInfo.email!);
      });

      const duplicateCustomerInfo = await DataFactory.customerBuilder().withEmail(customerInfo!.accountInfo.email!).withPassword("Password@123").build();

      await test.step("3 - Verify duplicated email", async () => {
        await onboardingFlow.verifyDuplicatedEmailWhenSignUpCustomer(duplicateCustomerInfo);
      });
    },
  );

  test(
    "TC04: Verify that all fields on the Sign Up screen are required (except for the HR System field).",
    {
      tag: "@TC04",
    },
    async ({ onboardingFlow, authFlow }) => {
      const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();

      await test.step("1 - Verify inputs are required", async () => {
        await onboardingFlow.verifyFillingFormIsRequired(customerInfo!);
      });

      await test.step("2 - Activate account", async () => {
        await authFlow.activateSignedUpCustomer(customerInfo!.accountInfo.email!);
      });

      await test.step("3 - Verify the signed up customer login successfully", async () => {
        await onboardingFlow.verifyURL("register-success");
      });
    },
  );

  test(
    "TC05: Verify that after filling in all information and signing up, the user receives a confirmation email.",
    {
      tag: "@TC05",
    },
    async ({ onboardingFlow, authFlow }) => {
      const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();

      await test.step("1 - Fill form to sign up", async () => {
        await onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo!);
      });

      await test.step("2 - Verify recieve one confirmation email", async () => {
        await authFlow.validateReceivedOneEmailForCreatingCustomer(customerInfo!.accountInfo.email!);
      });
    },
  );
});
