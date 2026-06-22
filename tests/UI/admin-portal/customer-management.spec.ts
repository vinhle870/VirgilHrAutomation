import { test } from "src/fixtures";
import { DataFactory } from "src/data-factory";
import { CustomerFactory } from "src/data-factory/customer-factory";
import UserInfo from "src/objects/user-info";
import { plans } from "src/constant/static-data";

test.describe("E2E -> Admin Portal -> Customer Management", { tag: "@regression_UI" }, () => {
  test(
    "TC56 Verify that the admin can invite members to a team in Admin- portal - Customer management",
    {
      tag: "@TC56",
    },
    async ({ loginPage, onboardingFlow, authFlow }) => {
      await test.step("Login to Admin portal", async () => {
        await loginPage.login();
      });

      const customerInfo = await DataFactory.customerBuilder().withDepartmentName(process.env.DEPARTMENT_NAME!).withBankStranfer(true).withCompanySize(plans[0]).build();

      await test.step("Create customer from Customer management page", async () => {
        await onboardingFlow.createCustomerFromCustomerManagementPage(customerInfo!);
      });

      await test.step("Verify a customer is created successfully", async () => {
        await onboardingFlow.verifyCustomerVisible(customerInfo!);
      });

      await test.step("Activate customer", async () => {
        await authFlow.activateAndChangePassIndividualCustomer(customerInfo!.accountInfo?.email!, "Member", "Password@123");
      });

      let admins: UserInfo[] = await CustomerFactory.generateMembers(2, "Admin");
      await test.step("Invite members (Role = Admin) in Customer management", async () => {
        await authFlow.loginToAdminPortal();

        await onboardingFlow.inviteMemberInCusManagement(customerInfo!, admins);
      });

      await test.step("Verify invited user (Role = Admin) accept and login member Portal successfully", async () => {
        for (const member of admins) {
          await authFlow.acceptInviteAndJoinTeamByCustomer(member.email, "Password@123");
        }
      });

      const users: UserInfo[] = await CustomerFactory.generateMembers(2, "User");
      await test.step("Invite user (Role = User) in Customer management", async () => {
        await authFlow.loginToAdminPortal();

        await onboardingFlow.inviteMemberInCusManagement(admins[0], users);
      });

      await test.step("Verify invited account (Role = User) accept and login member Portal successfully", async () => {
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
      test.setTimeout(120000);

      await test.step("Login to Admin portal", async () => {
        await loginPage.login();
      });

      const customerInfo = await DataFactory.customerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withBankStranfer(true)
        .withCompanySize(plans[0])
        .withBankStranferToUpgradePlan(true)
        .build();

      await test.step("Create customer from Customer Management page", async () => {
        await onboardingFlow.createCustomerFromCustomerManagementPage(customerInfo!);
      });

      await test.step("Verify customer is created successfully", async () => {
        await onboardingFlow.verifyCustomerVisible(customerInfo!);
      });

      await test.step("Activate customer account", async () => {
        await authFlow.activateAndChangePassIndividualCustomer(customerInfo!.accountInfo?.email!, "Member", "Password@123");
      });

      await test.step("Login back to Admin portal", async () => {
        await loginPage.login();
      });

      await test.step("Upgrade customer plan", async () => {
        await onboardingFlow.upgradePlanForCustomer(customerInfo!, plans[6]);
      });
    },
  );
});
