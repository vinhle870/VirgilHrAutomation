import { test } from "src/fixtures";
import { DataFactory } from "src/data-factory";
import { CustomerFactory } from "src/data-factory/customer-factory";
import UserInfo from "src/objects/user-info";
import { plans } from "src/constant/department.data.uat";

test.describe("E2E -> Admin Portal -> Customer Management", () => {
  test(
    "TC56 Verify that the admin can invite members to a team in Admin- portal - Customer management",
    {
      tag: "@TC56",
    },
    async ({ loginPage, onboardingFlow, authFlow }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      await test.step("Login to Admin portal", async () => {
        await loginPage.login();
      });

      console.log("plans.virgilhr[0]:", plans.virgilhr[0]);

      let customerInfo;
      await test.step("Create customer info", async () => {
        customerInfo = await DataFactory.customerBuilder()

          .withDepartmentName(process.env.DEPARTMENT_NAME!)
          .withDepartment(process.env.DEPARTMENT!)
          .withBankStranfer(true)
          .withCompanySize(plans.virgilhr[0])
          .build();
      });

      await test.step("Create customer from Customer management page", async () => {
        await onboardingFlow.createCustomerFromCustomerManagementPage(customerInfo!);
      });

      await test.step("Activate customer", async () => {
        await authFlow.activateIndividualCustomerAccountAndChangePassword(customerInfo!.accountInfo?.email!, "Member", "Password@123");
      });

      let admins: UserInfo[];
      await test.step("Invite members in Customer management", async () => {
        await loginPage.login();

        admins = await CustomerFactory.generateMembers(2, "Admin");

        await onboardingFlow.inviteMemberInCusManagement(customerInfo!, admins);
      });

      await test.step("Verify invite admin successfully", async () => {
        for (const member of admins) {
          await authFlow.acceptInviteAndJoinTeamByCustomer(member.email, "Password@123");
        }
      });

      let users: UserInfo[];
      await test.step("Invite user in Customer management", async () => {
        await loginPage.login();

        users = await CustomerFactory.generateMembers(2, "User");

        await onboardingFlow.inviteMemberInCusManagement(admins[0], users);
      });

      await test.step("Verify invite user successfully", async () => {
        for (const member of users) {
          await authFlow.acceptInviteAndJoinTeamByCustomer(member.email, "Password@123");
          await onboardingFlow.redirectToHomePage();
        }
      });
    },
  );
});
