import { test } from "src/fixtures";
import { DataFactory } from "src/data-factory";
import { CustomerFactory } from "src/data-factory/customer-factory";
import UserInfo from "src/objects/user-info";
import { plans } from "src/constant/static-data";

test.describe("E2E -> Admin Portal -> Customer Management", { tag: ["@regression_UI", "@customer_management"] }, () => {
  test(
    "TC56 Verify that the admin can invite members to a team in Admin- portal - Customer management",
    {
      tag: "@TC56_UI",
    },
    async ({ loginPage, onboardingFlow, authFlow }) => {
      await test.step("1 - Login to Admin portal", async () => {
        await loginPage.login();
      });

      const customerInfo = await DataFactory.customerBuilder().withDepartmentName(process.env.DEPARTMENT_NAME!).withBankStranfer(true).withCompanySize(plans[0]).build();

      await test.step("2 - Create customer from Customer management page", async () => {
        await onboardingFlow.createCustomerFromCustomerManagementPage(customerInfo!);
      });

      await test.step("3 - Verify a customer is created successfully", async () => {
        await onboardingFlow.verifyCustomerVisible(customerInfo!);
      });

      await test.step("4 - Activate And Change Password for Individual customer", async () => {
        await authFlow.activateAndChangePassIndividualCustomer(customerInfo!.accountInfo?.email!, "Member", "Password@123");
      });

      let customerAdminAcc = await CustomerFactory.generateMembers(1, "Admin");
      await test.step("5 - Invite multiple members (Role = Admin) in Customer management", async () => {
        await authFlow.loginToAdminPortal();

        await onboardingFlow.inviteMemberInCusManagement(customerInfo!, customerAdminAcc);
      });

      await test.step("6 - Verify invited user (Role = Admin) accept and login member Portal successfully", async () => {
        for (const member of customerAdminAcc) {
          await authFlow.acceptInviteAndJoinTeamByCustomer(member.email, "Password@123");
        }
      });

      let users: UserInfo[] = await CustomerFactory.generateMembers(2, "User");
      await test.step("7 - Invite multiple users (Role = User) in Customer management", async () => {
        await authFlow.loginToAdminPortal();

        await onboardingFlow.inviteMemberInCusManagement(customerAdminAcc[0], users);
      });

      await test.step("8 - Verify invited account (Role = User) accept and login member Portal successfully", async () => {
        for (const member of users) {
          await authFlow.acceptInviteAndJoinTeamByCustomer(member.email, "Password@123");
          await onboardingFlow.redirectToHomePage();
        }
      });
    },
  );

  test(
    "TC71 Verify that the admin can auto-renew or upgrade a team's (Owner account's) plan in Customer Management.",
    {
      tag: "@TC71",
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

      await test.step("2 - Create customer from Customer Management page", async () => {
        await onboardingFlow.createCustomerFromCustomerManagementPage(customerInfo!);
      });

      await test.step("3 - Verify customer is created successfully", async () => {
        await onboardingFlow.verifyCustomerVisible(customerInfo!);
      });

      await test.step("4 - Activate customer account", async () => {
        await authFlow.activateAndChangePassIndividualCustomer(customerInfo!.accountInfo?.email!, "Member", "Password@123");
      });

      await test.step("5 - Login back to Admin portal", async () => {
        await loginPage.login();
      });

      await test.step("6 - Upgrade customer plan", async () => {
        await onboardingFlow.upgradePlanForCustomer(customerInfo!, plans[1]);
      });

      await test.step("7 - Verify the upgraded plan is displayed in Customer Details modal - Subscription section", async () => {
        await onboardingFlow.verifySubscriptionPlanOfCustomer(customerInfo!, plans[1]);
      });
    },
  );
});
