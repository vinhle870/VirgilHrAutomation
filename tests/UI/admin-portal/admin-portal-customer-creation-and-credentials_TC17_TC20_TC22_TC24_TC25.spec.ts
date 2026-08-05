import { test } from "src/fixtures";
import { DataFactory } from "src/data-factory";
import { getEmailSubjectByDepartment } from "src/constant/department-data";
import { plans } from "src/constant/static-data";

test.describe("E2E -> Admin Portal -> Customer Management", { tag: ["@regression_UI", "@customer_management"] }, () => {
  test(
    "TC17 Verify that the admin can create a new member account in Customer Management by clicking the Create New button.",
    {
      tag: "@TC17",
    },
    async ({ loginPage, onboardingFlow }) => {
      await test.step("1 - Login to Admin portal", async () => {
        await loginPage.login();
      });

      const customerInfo = await DataFactory.customerBuilder().withDepartmentName(process.env.DEPARTMENT_NAME!).withBankStranfer(true).withCompanySize(plans[0]).build();

      await test.step("2 - Click Create new and fill the Add New Customer modal", async () => {
        await onboardingFlow.createCustomerFromCustomerManagementPage(customerInfo);
      });

      await test.step("3 - Verify the new customer is listed in Customer Management", async () => {
        await onboardingFlow.verifyCustomerVisible(customerInfo);
      });
    },
  );

  test(
    "TC20 In the New Customer modal, the admin can enable or disable Bank Transfer.",
    {
      tag: "@TC20",
    },
    async ({ loginPage, onboardingFlow }) => {
      await test.step("1 - Login to Admin portal", async () => {
        await loginPage.login();
      });

      // Bank Transfer ON exposes the Company Size (plan) field and adds a `Confirm & Create` step;
      // Bank Transfer OFF submits in a single click. Both branches are driven by the builder flag.
      const customerWithBankTransfer = await DataFactory.customerBuilder().withDepartmentName(process.env.DEPARTMENT_NAME!).withBankStranfer(true).withCompanySize(plans[0]).build();

      await test.step("2 - Create a customer with Bank Transfer enabled", async () => {
        await onboardingFlow.createCustomerFromCustomerManagementPage(customerWithBankTransfer);
      });

      await test.step("3 - Verify the Bank Transfer customer is created", async () => {
        await onboardingFlow.verifyCustomerVisible(customerWithBankTransfer);
      });

      await test.step("4 - Verify the plan chosen with Bank Transfer ON was assigned", async () => {
        await onboardingFlow.verifySubscriptionPlanOfCustomer(customerWithBankTransfer, plans[0]);
      });

      const customerWithoutBankTransfer = await DataFactory.customerBuilder().withDepartmentName(process.env.DEPARTMENT_NAME!).withBankStranfer(false).build();

      // Step 4 leaves the Details modal open, which would block the left-menu click below.
      await test.step("5 - Dismiss the Details modal left open by the plan check", async () => {
        await onboardingFlow.dismissOpenModals();
      });

      await test.step("6 - Create a customer with Bank Transfer disabled", async () => {
        await onboardingFlow.createCustomerFromCustomerManagementPage(customerWithoutBankTransfer);
      });

      await test.step("7 - Verify the non-Bank-Transfer customer is created", async () => {
        await onboardingFlow.verifyCustomerVisible(customerWithoutBankTransfer);
      });
    },
  );

  test(
    "TC22 When Bank Transfer = OFF, the user selects a plan on the Select Plan screen and must complete the payment through Stripe.",
    {
      tag: "@TC22",
    },
    async ({ loginPage, onboardingFlow, authFlow, purchaseFlow }) => {
      await test.step("1 - Login to Admin portal", async () => {
        await loginPage.login();
      });

      const customerInfo = await DataFactory.customerBuilder().withDepartmentName(process.env.DEPARTMENT_NAME!).withBankStranfer(false).build();

      await test.step("2 - Create a customer with Bank Transfer = OFF", async () => {
        await onboardingFlow.createCustomerFromCustomerManagementPage(customerInfo);
      });

      await test.step("3 - Verify the customer is created successfully", async () => {
        await onboardingFlow.verifyCustomerVisible(customerInfo);
      });

      await test.step("4 - Activate the account and change the password on first login", async () => {
        await authFlow.activateAndChangePassIndividualCustomer(customerInfo.accountInfo.email, "Member", "Password@123");
      });

      await test.step("5 - Verify the Select Plan screen is shown because no plan was pre-assigned", async () => {
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

  test(
    "TC24 When Bank Transfer = OFF, the user receives one email after the account is successfully created: the credential email.",
    {
      tag: "@TC24",
    },
    async ({ loginPage, onboardingFlow, authFlow }) => {
      await test.step("1 - Login to Admin portal", async () => {
        await loginPage.login();
      });

      const customerInfo = await DataFactory.customerBuilder().withDepartmentName(process.env.DEPARTMENT_NAME!).withBankStranfer(false).build();

      await test.step("2 - Create a customer with Bank Transfer = OFF", async () => {
        await onboardingFlow.createCustomerFromCustomerManagementPage(customerInfo);
      });

      await test.step("3 - Verify the customer is created successfully", async () => {
        await onboardingFlow.verifyCustomerVisible(customerInfo);
      });

      // ASSERTION LIMIT: this proves the credential email arrived, not that it was the ONLY email.
      // Asserting the absence of the plan-benefit email needs its subject line, which is still
      // unknown (see TC23) — the codebase defines only JOIN_TEAM, PARTNER_ACC_ACTIVATE and
      // CUSTOMER_ACC_ACTIVATE. Tighten this step once product/QA supplies that subject.
      await test.step("4 - Verify the credential email was received", async () => {
        await authFlow.validateReceivedOneEmailForCreatingCustomer(customerInfo.accountInfo.email, getEmailSubjectByDepartment().CUSTOMER_ACC_ACTIVATE);
      });
    },
  );

  test(
    "TC25 Verify that the user can successfully log in using the credentials provided in the credential email.",
    {
      tag: "@TC25",
    },
    async ({ loginPage, onboardingFlow, authFlow }) => {
      await test.step("1 - Login to Admin portal", async () => {
        await loginPage.login();
      });

      const customerInfo = await DataFactory.customerBuilder().withDepartmentName(process.env.DEPARTMENT_NAME!).withBankStranfer(true).withCompanySize(plans[0]).build();

      await test.step("2 - Create a customer (Bank Transfe = ON) from Customer Management page", async () => {
        await onboardingFlow.createCustomerFromCustomerManagementPage(customerInfo);
      });

      await test.step("3 - Verify the customer is created successfully", async () => {
        await onboardingFlow.verifyCustomerVisible(customerInfo);
      });

      const credential = await test.step("4 - Read the login URL and password from the credential email", async () => {
        return await authFlow.getCredentialsFromEmail(customerInfo.accountInfo.email, getEmailSubjectByDepartment().CUSTOMER_ACC_ACTIVATE);
      });

      await test.step("5 - Log in with the credentials from the email", async () => {
        await loginPage.fillLoginForm(credential.loginUrl, customerInfo.accountInfo.email, credential.password);
      });

      await test.step("6 - Verify the login was accepted", async () => {
        await onboardingFlow.verifyURL("change-password");
      });
    },
  );
});
