import { test, expect } from "src/fixtures";
import { DataFactory, PersonDataGenerator } from "src/data-factory";
import { CustomerFactory } from "src/data-factory/customer-factory";
import { UiAssert } from "src/assertions";

test.describe("E2E -> Admin Portal -> Customer Management", () => {
  test(
    "TC56 Verify that the admin can invite members to a team in Admin- portal - Customer management",
    {
      tag: "@TC56",
    },
    async ({ loginPage, onboardingFlow, authFlow, homeExceptAdminPage, customerManagementPage }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      await test.step("Login to Admin portal", async () => {
        await loginPage.login();
      });

      let customerInfo;
      await test.step("Create customer info", async () => {
        customerInfo = await DataFactory.customerBuilder().withDepartmentName(process.env.DEPARTMENT_NAME!).withDepartment(process.env.DEPARTMENT!).withContentAvailability("US").build();
      });

      await test.step("Create customer from Customer management page", async () => {
        await onboardingFlow.createCustomerFromCustomerManagementPage(customerInfo!);
      });

      await test.step("Activate customer", async () => {
        await authFlow.activateIndividualCustomerAccountAndChangePassword(customerInfo!.accountInfo?.email!, "Member", "Password@123");
      });

      let ownerAccount;
      await test.step("Create owner info", async () => {
        ownerAccount = await PersonDataGenerator.generate();
      });

      let invitedMembers: any;
      await test.step("Invite members in Customer management", async () => {
        invitedMembers = await CustomerFactory.generateMembers(1, "User");

        await onboardingFlow.inviteMemberInCusManagement(customerInfo!, invitedMembers);
      });

      await test.step("Verify invite members successfully", async () => {
        for (const member of invitedMembers) {
          await authFlow.acceptInviteAndJoinTeamByCustomer(member.email, "Password@123");

          await UiAssert.allVisible([await homeExceptAdminPage.getHomeTitle()]);
        }
      });
    },
  );
});
