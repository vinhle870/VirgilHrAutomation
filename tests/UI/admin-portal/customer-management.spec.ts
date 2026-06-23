import { test } from "src/fixtures";
import { DataFactory } from "src/data-factory";
import { CustomerFactory } from "src/data-factory/customer-factory";
import UserInfo from "src/objects/user-info";
import { plans } from "src/constant/static-data";

test.describe("E2E -> Admin Portal -> Customer Management", { tag: "@regression_UI" }, () => {
  test(
    "TC56 Verify that the admin can invite members to a team in Admin- portal - Customer management",
    {
      tag: "@TC56_UI",
    },
    async ({ loginPage, onboardingFlow, authFlow }) => {
      await test.step("Login to Admin portal", async () => {
        await loginPage.login();
      });

      const customerInfo = await DataFactory.customerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withDepartment(process.env.DEPARTMENT!)
        .withBankStranfer(true)
        .withCompanySize(plans[0])
        .build();

      await test.step("1.Create customer from Customer management page", async () => {
        await onboardingFlow.createCustomerFromCustomerManagementPage(customerInfo!);
      });

      await test.step("2. Verify a customer is created successfully", async () => {
        await onboardingFlow.verifyCustomerVisible(customerInfo!);
      });

      await test.step("3. Activate And Change Password for Individual customer", async () => {
        await authFlow.activateAndChangePassIndividualCustomer(customerInfo!.accountInfo?.email!, "Member", "Password@123");
      });

      let customerAdminAcc = await CustomerFactory.generateMembers(2, "Admin");
      await test.step("4. Invite multiple members (Role = Admin) in Customer management", async () => {
         await authFlow.loginToAdminPortal();

        await onboardingFlow.inviteMemberInCusManagement(customerInfo!, customerAdminAcc);
      });

      await test.step("5. Verify invited user (Role = Admin) accept and login member Portal successfully", async () => {
        for (const member of customerAdminAcc) {
          await authFlow.acceptInviteAndJoinTeamByCustomer(member.email, "Password@123");
        }
      });

      let users: UserInfo[] = await CustomerFactory.generateMembers(2, "User");;
      await test.step("6. Invite multiple users (Role = User) in Customer management", async () => {
        await authFlow.loginToAdminPortal();

        await onboardingFlow.inviteMemberInCusManagement(customerAdminAcc[0], users);
      });

      await test.step("7. Verify invited account (Role = User) accept and login member Portal successfully", async () => {
        for (const member of users) {
          await authFlow.acceptInviteAndJoinTeamByCustomer(member.email, "Password@123");
          await onboardingFlow.redirectToHomePage();
        }
      });
    },
  );
});
