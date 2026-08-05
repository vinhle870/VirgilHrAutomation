import { test } from "src/fixtures";
import { DataFactory, PersonDataGenerator } from "src/data-factory";
import { CustomerFactory } from "src/data-factory/customer-factory";
import UserInfo from "src/objects/user-info";
import { plans } from "src/constant/static-data";

test.describe("E2E -> Admin Portal -> Customer Management", { tag: ["@regression_UI", "@customer_management"] }, () => {
  test(
    "TC72 Verify that only the Owner of a team can have their plan auto-renewed or upgraded.",
    {
      tag: "@TC72",
    },
    async ({ loginPage, onboardingFlow, authFlow }) => {
      await test.step("1 - Login to Admin portal", async () => {
        await loginPage.login();
      });

      const ownerInfo = await DataFactory.customerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withBankStranfer(true)
        .withCompanySize(plans[0])
        .build();

      await test.step("2 - Create an Owner account from Customer Management page", async () => {
        await onboardingFlow.createCustomerFromCustomerManagementPage(ownerInfo);
      });

      await test.step("3 - Verify the Owner account is created successfully", async () => {
        await onboardingFlow.verifyCustomerVisible(ownerInfo);
      });

      await test.step("4 - Activate the Owner account", async () => {
        await authFlow.activateAndChangePassIndividualCustomer(ownerInfo.accountInfo.email, "Member", "Password@123");
      });

      const invitedMembers: UserInfo[] = await CustomerFactory.generateMembers(1, "Admin");

      await test.step("5 - Invite a member with role Admin to the Owner's team", async () => {
        await authFlow.loginToAdminPortal();

        await onboardingFlow.inviteMemberInCusManagement(ownerInfo, invitedMembers);
      });

      await test.step("6 - The invited member accepts and joins the team", async () => {
        await authFlow.acceptInviteAndJoinTeamByCustomer(invitedMembers[0].email, "Password@123");
      });

      await test.step("7 - Verify the Owner account offers the Upgrade Plan action", async () => {
        await authFlow.loginToAdminPortal();

        await onboardingFlow.verifyUpgradePlanAvailable(ownerInfo);
      });

      await test.step("8 - Verify the non-Owner member does NOT offer the Upgrade Plan action", async () => {
        await onboardingFlow.verifyUpgradePlanNotAvailable(invitedMembers[0]);
      });
    },
  );

  test(
    "TC80 Verify that using the Upgrade Plan function allows toggling the Bank Transfer option.",
    {
      tag: "@TC80",
    },
    async ({ loginPage, onboardingFlow, authFlow }) => {
      await test.step("1 - Login to Admin portal", async () => {
        await loginPage.login();
      });

      // Bank Transfer ON at upgrade time -> the modal's `Upgrade Now` path, applied immediately.
      const customerUpgradedWithBankTransfer = await DataFactory.customerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withBankStranfer(true)
        .withCompanySize(plans[0])
        .withBankStranferToUpgradePlan(true)
        .build();

      await test.step("2 - Create a customer on the starting plan", async () => {
        await onboardingFlow.createCustomerFromCustomerManagementPage(customerUpgradedWithBankTransfer);
      });

      await test.step("3 - Verify the customer is created successfully", async () => {
        await onboardingFlow.verifyCustomerVisible(customerUpgradedWithBankTransfer);
      });

      await test.step("4 - Activate the customer account", async () => {
        await authFlow.activateAndChangePassIndividualCustomer(customerUpgradedWithBankTransfer.accountInfo.email, "Member", "Password@123");
      });

      await test.step("5 - Upgrade the plan with Bank Transfer toggled ON", async () => {
        await loginPage.login();

        await onboardingFlow.upgradePlanForCustomer(customerUpgradedWithBankTransfer, plans[1]);
      });

      await test.step("6 - Verify the upgrade applied immediately", async () => {
        await onboardingFlow.verifySubscriptionPlanOfCustomer(customerUpgradedWithBankTransfer, plans[1]);
      });

      // Bank Transfer OFF at upgrade time -> the modal's `Request Payment` path, so the plan
      // must stay on the starting tier until the customer pays.
      const customerUpgradedWithoutBankTransfer = await DataFactory.customerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withBankStranfer(true)
        .withCompanySize(plans[0])
        .withBankStranferToUpgradePlan(false)
        .build();

      // Step 6 leaves the Details modal open, which would block the left-menu click below.
      await test.step("7 - Dismiss the Details modal left open by the plan check", async () => {
        await onboardingFlow.dismissOpenModals();
      });

      await test.step("8 - Create a second customer on the starting plan", async () => {
        await onboardingFlow.createCustomerFromCustomerManagementPage(customerUpgradedWithoutBankTransfer);
      });

      await test.step("9 - Verify the second customer is created successfully", async () => {
        await onboardingFlow.verifyCustomerVisible(customerUpgradedWithoutBankTransfer);
      });

      await test.step("10 - Upgrade the plan with Bank Transfer left OFF", async () => {
        await onboardingFlow.upgradePlanForCustomer(customerUpgradedWithoutBankTransfer, plans[1]);
      });

      await test.step("11 - Verify the plan is unchanged because payment was only requested", async () => {
        await onboardingFlow.verifySubscriptionPlanOfCustomer(customerUpgradedWithoutBankTransfer, plans[0]);
      });
    },
  );

  test(
    "TC84 Verify that the Auto-Renew, Upgrade, and Renewal functions are only applicable to accounts that are not linked to any Partner/Consultant.",
    {
      tag: "@TC84",
    },
    async ({ loginPage, onboardingFlow, authFlow }) => {
      test.setTimeout(600000);

      await test.step("1 - Login to Admin portal", async () => {
        await loginPage.login();
      });

      const standaloneCustomer = await DataFactory.customerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withBankStranfer(true)
        .withCompanySize(plans[0])
        .build();

      await test.step("2 - Create a standalone customer, not linked to any Partner", async () => {
        await onboardingFlow.createCustomerFromCustomerManagementPage(standaloneCustomer);
      });

      await test.step("3 - Verify the standalone customer is created successfully", async () => {
        await onboardingFlow.verifyCustomerVisible(standaloneCustomer);
      });

      // A Business owner created from the Partner Portal is Partner-linked by construction —
      // the `Add New Customer` modal has no partner field, so this is the UI route to that state.
      const partnerInfo = await DataFactory.partnerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withPaymentOption("Member Portal Consumer")
        .withProductsType([plans[0]])
        .withBankTransfer(true)
        .withIsPublic(false)
        .build();

      // Creating the customer above leaves its modal open, which would block the left-menu click.
      await test.step("4 - Dismiss the modal left open by customer creation", async () => {
        await onboardingFlow.dismissOpenModals();
      });

      await test.step("5 - Create a Partner with Payment options = Member Portal Consumer", async () => {
        await onboardingFlow.createPartnerAndAddPeoInAdminPortal(partnerInfo);
      });

      await test.step("6 - Verify the Partner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo);
      });

      const businessOwner = await PersonDataGenerator.generate({ emailDomain: "ussteel.xyz" });

      await test.step("7 - Activate the Partner and create a Business owned by its own owner", async () => {
        await authFlow.activateAndChangePassIndividualCustomer(partnerInfo.accountInfo!.email, "Partner portal", "Password@123");

        await onboardingFlow.createBusinessFromPartnerPortal(partnerInfo, businessOwner);
      });

      await test.step("8 - Verify the Business has its own Owner", async () => {
        await onboardingFlow.verifyOwnerVisible();
      });

      await test.step("9 - Verify the standalone account offers the Upgrade Plan action", async () => {
        await loginPage.login();

        await onboardingFlow.verifyUpgradePlanAvailable(standaloneCustomer);
      });

      await test.step("10 - Verify the Partner-linked account does NOT offer the Upgrade Plan action", async () => {
        await onboardingFlow.verifyUpgradePlanNotAvailable(businessOwner);
      });
    },
  );
});
