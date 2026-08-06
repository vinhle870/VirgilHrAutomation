import { test } from "src/fixtures";
import { DataFactory, PersonDataGenerator } from "src/data-factory";
import { CustomerFactory } from "src/data-factory/customer-factory";
import UserInfo from "src/objects/user-info";
import { plans } from "src/constant/static-data";

test.describe("E2E -> Admin Portal -> Customer Management", { tag: ["@regression_UI", "@customer_management", "@invite_customer_member"] }, () => {
  test(
    "TC57 In the Admin Portal, the admin can invite members to a team from the Details page of any account.",
    {
      tag: "@TC57",
    },
    async ({ loginPage, onboardingFlow, authFlow }) => {
      test.setTimeout(600000);

      await test.step("1 - Login to Admin portal", async () => {
        await loginPage.login();
      });

      // TC56 already invites from an admin-created Owner's Details page and from an invited Admin
      // member's. To make "any account" mean something beyond that, this case uses a third account
      // TYPE: a Business owner created from the Partner Portal, which is Partner-linked by
      // construction and never passes through the `Add New Customer` modal.
      const partnerInfo = await DataFactory.partnerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withPaymentOption("Member Portal Consumer")
        .withProductsType([plans[0]])
        .withBankTransfer(true)
        .withIsPublic(false)
        .build();

      await test.step("2 - Create a Partner with Payment options = Member Portal Consumer", async () => {
        await onboardingFlow.createPartnerAndAddPeoInAdminPortal(partnerInfo);
      });

      await test.step("3 - Verify the Partner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo);
      });

      const businessOwner = await PersonDataGenerator.generate({ emailDomain: "ussteel.xyz" });

      await test.step("4 - Activate the Partner and create a Business with its own owner", async () => {
        await authFlow.activateAndChangePassIndividualCustomer(partnerInfo.accountInfo!.email, "Partner portal", "Password@123");

        await onboardingFlow.createBusinessFromPartnerPortal(partnerInfo, businessOwner);
      });

      await test.step("5 - Verify the Business has its own Owner", async () => {
        await onboardingFlow.verifyOwnerVisible();
      });

      await test.step("6 - Activate the Business owner on the Member Portal", async () => {
        await authFlow.activateAndChangePassIndividualCustomer(businessOwner.email, "Consumer", "Password@123");
      });

      const invitedMembers: UserInfo[] = await CustomerFactory.generateMembers(1, "User");

      // The assertion this case exists for: the admin can invite from THIS account's Details page,
      // even though the account was never created through Customer Management.
      await test.step("7 - As admin, invite a member from the Business owner's Details page", async () => {
        await authFlow.loginToAdminPortal();

        await onboardingFlow.inviteMemberInCusManagement(businessOwner, invitedMembers);
      });

      await test.step("8 - Verify the invited member accepts and joins the team", async () => {
        await authFlow.acceptInviteAndJoinTeamByCustomer(invitedMembers[0].email, "Password@123");

        await onboardingFlow.redirectToHomePage();
      });

      // NOT COVERED: inviting from a `User`-role member's Details page. The CSV says "any account",
      // but whether that is permitted — and which team the invitee would land in — is unspecified.
      // Confirm with product/QA before extending this case.
    },
  );
});
