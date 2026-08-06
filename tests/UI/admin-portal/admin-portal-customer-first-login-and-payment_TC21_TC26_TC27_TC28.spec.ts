import { test } from "src/fixtures";
import { DataFactory } from "src/data-factory";
import { getEmailSubjectByDepartment } from "src/constant/department-data";
import { plans } from "src/constant/static-data";

test.describe("E2E -> Admin Portal -> Customer Management", { tag: ["@regression_UI", "@customer_management"] }, () => {
  test(
    "TC21 When Bank Transfer = ON, the user is assigned a plan and does not need to make a payment through Stripe.",
    {
      tag: "@TC21",
    },
    async ({ loginPage, onboardingFlow, authFlow }) => {
      await test.step("1 - Login to Admin portal", async () => {
        await loginPage.login();
      });

      const customerInfo = await DataFactory.customerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withBankStranfer(true)
        .withCompanySize(plans[0])
        .build();

      await test.step("2 - Create a customer with Bank Transfer = ON", async () => {
        await onboardingFlow.createCustomerFromCustomerManagementPage(customerInfo);
      });

      await test.step("3 - Verify the customer is created successfully", async () => {
        await onboardingFlow.verifyCustomerVisible(customerInfo);
      });

      // The plan is assigned by the admin at creation time — asserted here, while still on the
      // Admin Portal, so the user-side check below needs no second admin login.
      await test.step("4 - Verify a plan was assigned without any payment being taken", async () => {
        await onboardingFlow.verifySubscriptionPlanOfCustomer(customerInfo, plans[0]);
      });

      await test.step("5 - Activate the account and change the password on first login", async () => {
        await authFlow.activateAndChangePassIndividualCustomer(customerInfo.accountInfo.email, "Member", "Password@123");
      });

      // Reaching Home is the proof that no payment was demanded: with Bank Transfer OFF the same
      // journey stops on the Select Plan screen and then Stripe (see TC22 / TC28).
      await test.step("6 - Verify the user reaches the Homepage without a Select Plan or Stripe step", async () => {
        await onboardingFlow.redirectToHomePage();
      });
    },
  );

  test(
    "TC26 For accounts that use a system-generated password for the first login, the system will require the user to change it to a personal password.",
    {
      tag: "@TC26",
    },
    async ({ loginPage, onboardingFlow, authFlow }) => {
      await test.step("1 - Login to Admin portal", async () => {
        await loginPage.login();
      });

      const customerInfo = await DataFactory.customerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withBankStranfer(true)
        .withCompanySize(plans[0])
        .build();

      await test.step("2 - Create a customer from Customer Management page", async () => {
        await onboardingFlow.createCustomerFromCustomerManagementPage(customerInfo);
      });

      await test.step("3 - Verify the customer is created successfully", async () => {
        await onboardingFlow.verifyCustomerVisible(customerInfo);
      });

      // The credential email itself is covered by TC23/TC24 — here it is only the source of the
      // system-generated password, so read it through the existing helper instead of walking the mailbox.
      const credential = await test.step("4 - Retrieve the system-generated credentials", async () => {
        return await authFlow.getCredentialsFromEmail(customerInfo.accountInfo.email, getEmailSubjectByDepartment().CUSTOMER_ACC_ACTIVATE);
      });

      await test.step("5 - Log in for the first time with the system-generated password", async () => {
        await loginPage.fillLoginForm(credential.loginUrl, customerInfo.accountInfo.email, credential.password);
      });

      // The assertion this case exists for: the change is compulsory, not merely offered.
      await test.step("6 - Verify the system requires the password to be changed", async () => {
        await onboardingFlow.verifyURL("change-password");
      });

      await test.step("7 - Change to a personal password", async () => {
        await loginPage.changePassword(credential.password, "Password@123");
      });

      await test.step("8 - Verify the session proceeds after the password change", async () => {
        await onboardingFlow.redirectToHomePage();
      });
    },
  );

  test(
    "TC27 When Bank Transfer = ON, after changing the password, the user is redirected directly to the Homepage with the pre-assigned plan.",
    {
      tag: "@TC27",
    },
    async ({ loginPage, onboardingFlow, authFlow }) => {
      await test.step("1 - Login to Admin portal", async () => {
        await loginPage.login();
      });

      const customerInfo = await DataFactory.customerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withBankStranfer(true)
        .withCompanySize(plans[0])
        .build();

      await test.step("2 - Create a customer with Bank Transfer = ON", async () => {
        await onboardingFlow.createCustomerFromCustomerManagementPage(customerInfo);
      });

      await test.step("3 - Verify the customer is created successfully", async () => {
        await onboardingFlow.verifyCustomerVisible(customerInfo);
      });

      // Asserted here, while the browser is still on the Admin Portal: reading it after the
      // Member Portal steps would need a second admin login for no extra coverage.
      await test.step("4 - Verify the plan was pre-assigned by the admin", async () => {
        await onboardingFlow.verifySubscriptionPlanOfCustomer(customerInfo, plans[0]);
      });

      await test.step("5 - Activate the account and change the password on first login", async () => {
        await authFlow.activateAndChangePassIndividualCustomer(customerInfo.accountInfo.email, "Member", "Password@123");
      });

      await test.step("6 - Verify the user lands on the Homepage without a Select Plan or Stripe step", async () => {
        await onboardingFlow.redirectToHomePage();
      });
    },
  );

  test(
    "TC28 When Bank Transfer = OFF, after changing the password, the user is redirected to the Select Plan screen to choose and purchase a plan.",
    {
      tag: "@TC28",
    },
    async ({ loginPage, onboardingFlow, authFlow, purchaseFlow }) => {
      await test.step("1 - Login to Admin portal", async () => {
        await loginPage.login();
      });

      const customerInfo = await DataFactory.customerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withBankStranfer(false)
        .build();

      await test.step("2 - Create a customer with Bank Transfer = OFF", async () => {
        await onboardingFlow.createCustomerFromCustomerManagementPage(customerInfo);
      });

      await test.step("3 - Verify the customer is created successfully", async () => {
        await onboardingFlow.verifyCustomerVisible(customerInfo);
      });

      await test.step("4 - Activate the account and change the password on first login", async () => {
        await authFlow.activateAndChangePassIndividualCustomer(customerInfo.accountInfo.email, "Member", "Password@123");
      });

      await test.step("5 - Verify the user is redirected to the Select Plan screen", async () => {
        await onboardingFlow.validatePlanVisible();
      });

      await test.step("6 - Select a plan and complete the payment through Stripe", async () => {
        await purchaseFlow.selectPlanBeforePurchase("", customerInfo.accountInfo.email, plans[0]);

        await purchaseFlow.submitSubscriptionPayment();
      });

      await test.step("7 - Verify the user reaches the Homepage after a successful payment", async () => {
        await onboardingFlow.redirectToHomePage();
      });
    },
  );
});
