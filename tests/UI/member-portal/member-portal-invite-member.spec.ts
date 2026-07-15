import { test } from "src/fixtures";
import { DataFactory } from "src/data-factory";
import { CustomerFactory } from "src/data-factory/customer-factory";
import UserInfo from "src/objects/user-info";
import { getEmailSubjectByDepartment, getPlansForDepartment } from "src/constant/department-data";
import { Partner } from "src/objects";
import { plans } from "src/constant/static-data";

test.describe("E2E -> Member portal", { tag: ["@regression_UI", "@member_portal", "@invite_customer_member"] }, () => {

  test(
    "TC54: Verify that a user can invite members to a team in the Member Portal – Organization tab.",
    {
      tag: ["@TC54"],
    },
    async ({ onboardingFlow, authFlow, purchaseFlow }) => {
      const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();

      await test.step("1 - Individual customer sign up to member portal", async () => {
        await onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo!);
      });

      await test.step("2 - Activate Account via the Confirmation link sent to email", async () => {
        await authFlow.activateSignedUpCustomer(customerInfo!.accountInfo.email!);
      });

      await test.step("3 - Process the Plan payment via tripe", async () => {
        await purchaseFlow.selectPlanBeforePurchase("", customerInfo!.accountInfo.email!, plans[0]);
        await purchaseFlow.submitSubscriptionPayment();
      });

      await test.step("4 - Redirect to home page after successful payment", async () => {
        await onboardingFlow.redirectToHomePage();
      });

      const members: UserInfo[] = await CustomerFactory.generateMembers(1, "User");
      await test.step("5 - Invite members via Organization tab", async () => {
        await onboardingFlow.inviteMemberInOrganizationTabMemberPortal(members);
      });

      await test.step("6 - Verify invited members accept and join team successfully", async () => {
        for (const member of members) {
          await authFlow.acceptInviteAndJoinTeamByCustomer(member.email, "Password@123");
          await onboardingFlow.redirectToHomePage();
        }
      });
    },
  );

  test(
    "TC55: Verify that in the Member Portal, only the Owner and Admin of a team can invite members to that team.",
    {
      tag: "@TC55",
    },
    async ({ onboardingFlow, authFlow, purchaseFlow }) => {
      const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();

      await test.step("1 - Individual customer sign up to member portal", async () => {
        await onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo!);
      });

      await test.step("2 - Activate Account via the Confirmation link sent to email", async () => {
        await authFlow.activateSignedUpCustomer(customerInfo!.accountInfo.email!);
      });

      await test.step("3 - Select plan and submit payment", async () => {
        await purchaseFlow.selectPlanBeforePurchase("", customerInfo!.accountInfo.email!, plans[0]);
        await purchaseFlow.submitSubscriptionPayment();
      });

      await test.step("4 - Redirect to home page after successful payment", async () => {
        await onboardingFlow.redirectToHomePage();
      });

      const usersWithAdminRole: UserInfo[] = await CustomerFactory.generateMembers(1, "Admin");
      await test.step("5 - The owner invites a User with role of admin", async () => {
        await onboardingFlow.inviteMemberInOrganizationTabMemberPortal(usersWithAdminRole);
      });

      await test.step("6 - The admin user accepts invite and joins team", async () => {
        await authFlow.acceptInviteAndJoinTeamByCustomer(usersWithAdminRole[0].email, "Password@123");
      });

      const memberWithUserRole: UserInfo[] = await CustomerFactory.generateMembers(1, "User");
      await test.step("7 - The admin user invites a member with the role of user", async () => {
        await onboardingFlow.inviteMemberInOrganizationTabMemberPortal(memberWithUserRole);
      });

      await test.step("8 - The member user accepts invite and joins team", async () => {
        await authFlow.acceptInviteAndJoinTeamByCustomer(memberWithUserRole[0].email, "Password@123");
      });

      await test.step("9 - Verify User role cannot invite members", async () => {
        await onboardingFlow.verifyCannotInviteMembersInMemberPortal();
      });
    },
  );
});
