import { test, expect } from "src/fixtures";
import { DataFactory, PersonDataGenerator } from "src/data-factory";
import { CustomerFactory } from "src/data-factory/customer-factory";
import { UiAssert } from "src/assertions";

test.describe("E2E -> Admin Portal -> Partner Management", () => {
  test(
    "TC56 Verify that the admin can invite members to a team in Admin- portal - Customer management",
    {
      tag: "@TC56",
    },
    async ({ loginPage, onboardingFlow, tempEmailFreePage, authFlow, homeExceptAdminPage }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      await test.step("Login to Admin portal", async () => {
        await loginPage.login();
      });

      let partnerInfo;
      await test.step("Create partner info", async () => {
        partnerInfo = await DataFactory.partnerBuilder()
          .withDepartmentName(process.env.DEPARTMENT_NAME!)
          .withPaymentOption("Partner/Consultant Owner")
          .withProductsType([process.env.PLAN!])
          .withBankTransfer(true)
          .build();
      });

      await test.step("Verify the partner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo!);
      });
      await test.step("Activate partner", async () => {
        await authFlow.activateIndividualCustomerAccountAndSetPassword(partnerInfo!.accountInfo?.email!, "Partner portal");
      });

      let ownerAccount;
      await test.step("Create owner info", async () => {
        ownerAccount = await PersonDataGenerator.generate();
      });

      let owner;
      await test.step("Create a new Business", async () => {
        await onboardingFlow.createBusinessFromPartnerPortal(ownerAccount!);
      });

      await test.step("Verify the new Business is created successfully", async () => {
        await expect(owner!).toBeVisible({ timeout: 10000 });
      });

      await test.step("Activate customer belonged to the new partner", async () => {
        await authFlow.activateIndividualCustomerAccountAndSetPassword(partnerInfo!.accountInfo?.email!, "Member");

        const memberHomeTitle = await homeExceptAdminPage.getHomeTitle();
        await expect(memberHomeTitle).toBeVisible({ timeout: 30000 });
      });

      let invitedMembers: any;
      await test.step("Invite members in Customer management", async () => {
        invitedMembers = await CustomerFactory.generateMembers(1, "User");

        await onboardingFlow.inviteMember(partnerInfo!, invitedMembers);
      });

      await test.step("Verify invite members successfully", async () => {
        for (const member of invitedMembers) {
          await authFlow.acceptInviteAndJoinTeamByCustomer(member.email);

          await UiAssert.allVisible([await homeExceptAdminPage.getHomeTitle()]);
        }
      });
    },
  );
});
