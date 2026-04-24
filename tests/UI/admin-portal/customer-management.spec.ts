import { test, expect } from "src/fixtures";
import { DataFactory, PersonDataGenerator } from "src/data-factory";
import { UserInfo } from "src/objects";
import { CustomerFactory } from "src/data-factory/customer-factory";
import IPartnerFilter from "src/objects/ipartnerfilter";
import { PartnerFilterLocator } from "src/ui/pages/admin-portal/locators/partner-management/locator/filter-partner";
import { CreateNewPartnerModalLocator } from "src/ui/pages/admin-portal/locators/partner-management/locator/new-partner";
import { BuyPlanLocators, TempEmailFreeLocators } from "src/ui/pages/shared/locators";
import { Page } from "playwright/test";

test.describe("E2E -> Admin Portal -> Partner Management", () => {
  test(
    "TC56 Verify that the admin can invite members to a team in Admin- portal - Customer management",
    {
      tag: "@TC56",
    },
    async ({ loginAdminPage, partnerManagementPage, onboardingFlow, tempEmailFreePage, customerManagementPage }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      await test.step("Login to Admin portal", async () => {
        await loginAdminPage.login();
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

      let newPartner;
      await test.step("Create a new partner", async () => {
        newPartner = await partnerManagementPage.createPartner(partnerInfo!);
      });

      await test.step("Verify the new partner is created successfully", async () => {
        try {
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
        } catch (error) {
          await onboardingFlow.refreshPage();
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
        }
      });

      let owner;
      let newPartnerPage: Page;
      await test.step("Create a new Business", async () => {
        newPartnerPage = await onboardingFlow.credential(tempEmailFreePage, partnerInfo!.accountInfo?.email!);
        owner = await onboardingFlow.createBusiness(newPartnerPage!, partnerInfo!, partnerInfo!);
      });

      await test.step("Verify the new Business is created successfully", async () => {
        await expect(owner!).toBeVisible({ timeout: 10000 });
        await newPartnerPage.close();
      });

      await test.step("Credential customer belonged to the new partner", async () => {
        const memberPage = await onboardingFlow.credential(tempEmailFreePage, partnerInfo!.accountInfo?.email!, "Member");

        const memberHomeTitle = await onboardingFlow.getHomeTitle(memberPage);
        await expect(memberHomeTitle).toBeVisible({ timeout: 30000 });

        await memberPage.close();
      });

      let invitedMembers: any;
      await test.step("Invite members in Customer management", async () => {
        invitedMembers = await CustomerFactory.generateMembers(1, "User");

        await loginAdminPage.login();

        await customerManagementPage.inviteMember(partnerInfo!, invitedMembers);
      });

      await test.step("Verify invite members successfully", async () => {
        for (const member of invitedMembers) {
          const localPart = member.email.split("@")[0];
          const userPage = await onboardingFlow.acceptInvitation(tempEmailFreePage, localPart);

          const memberHomeTitle = await onboardingFlow.getHomeTitle(userPage);
          await expect(memberHomeTitle).toBeVisible({ timeout: 30000 });
        }
      });
    },
  );
});
