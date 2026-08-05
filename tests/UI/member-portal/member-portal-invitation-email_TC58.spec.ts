import { test } from "src/fixtures";
import { DataFactory } from "src/data-factory";
import { CustomerFactory } from "src/data-factory/customer-factory";
import { getEmailSubjectByDepartment } from "src/constant/department-data";
import UserInfo from "src/objects/user-info";
import { plans } from "src/constant/static-data";

test.describe("E2E -> Member portal", { tag: ["@regression_UI", "@member_portal", "@invite_customer_member"] }, () => {
  test(
    "TC58 Verify that after being invited, the account receives an invitation email.",
    {
      tag: "@TC58",
    },
    async ({ onboardingFlow, authFlow, purchaseFlow }) => {
      const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();

      await test.step("1 - Individual customer signs up to the Member portal", async () => {
        await onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo);
      });

      await test.step("2 - Activate the account via the confirmation link", async () => {
        await authFlow.activateSignedUpCustomer(customerInfo.accountInfo.email);
      });

      await test.step("3 - Select a plan and complete the payment so a team exists", async () => {
        await purchaseFlow.selectPlanBeforePurchase("", customerInfo.accountInfo.email, plans[0]);

        await purchaseFlow.submitSubscriptionPayment();
      });

      await test.step("4 - Verify the Owner reaches the home page", async () => {
        await onboardingFlow.redirectToHomePage();
      });

      const invitedMembers: UserInfo[] = await CustomerFactory.generateMembers(1, "User");

      await test.step("5 - Invite a member from the Organization tab", async () => {
        await onboardingFlow.inviteMemberInOrganizationTabMemberPortal(invitedMembers);
      });

      // This is the assertion TC58 exists for. Other invitation tests (TC54/TC55/TC56) consume the
      // email implicitly inside acceptInviteAndJoinTeamByCustomer, so a missing email surfaces there
      // as a confusing accept-link failure rather than as "no invitation was sent".
      await test.step("6 - Verify the invited account received the invitation email", async () => {
        await authFlow.validateReceivedOneEmailForCreatingCustomer(invitedMembers[0].email, getEmailSubjectByDepartment().JOIN_TEAM);
      });
    },
  );
});
