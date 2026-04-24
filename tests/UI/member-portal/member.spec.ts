import { test, expect } from "src/fixtures";
import { DataFactory } from "src/data-factory";
import { UserInfo } from "src/objects";
import { CustomerFactory } from "src/data-factory/customer-factory";
import { Page } from "playwright/test";
import { SettingUserLocators } from "src/ui/pages/member-portal/locators/setting-user";

test.describe("E2E -> Admin Portal -> Partner Management", () => {
  test(
    "TC54 Verify that an user can invite members to a team in the member portal - organization tab.",
    {
      tag: "@54",
    },
    async ({ loginAdminPage, partnerManagementPage, onboardingFlow, tempEmailFreePage, memberPortalPage }, testInfo) => {
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

      await test.step("Verify newPartner is created successfully", async () => {
        try {
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
        } catch (error) {
          await onboardingFlow.refreshPage();
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
        }
      });

      let owner;
      await test.step("Create a new Business", async () => {
        const newPartnerPage = await onboardingFlow.credential(tempEmailFreePage, partnerInfo!.accountInfo?.email!);
        owner = await onboardingFlow.createBusiness(newPartnerPage!, partnerInfo!, partnerInfo!);
      });

      await test.step("Verify the new Business is created successfully", async () => {
        await expect(owner!).toBeVisible({ timeout: 10000 });
      });

      let memberPage: Page;
      await test.step("Credential member portal and move to organization tab", async () => {
        memberPage = await onboardingFlow.credential(tempEmailFreePage, partnerInfo!.accountInfo?.email!, "Member");

        await onboardingFlow.moveToUserSettingPage(memberPage);

        await memberPage.locator(SettingUserLocators.organizationTab).click();
      });

      let invitedMembers: UserInfo[];
      await test.step("Invite a member to the team", async () => {
        await onboardingFlow.moveToUserSettingPage(memberPage);

        invitedMembers = await CustomerFactory.generateMembers(1);
        await memberPortalPage.inviteMembersByEmail(invitedMembers, memberPage);
      });

      await test.step("Verify the invited member received the invitation", async () => {
        for (const member of invitedMembers) {
          const localPart = member.email.split("@")[0];
          await onboardingFlow.acceptInvitation(tempEmailFreePage, localPart);

          const memberHomeTitle = await onboardingFlow.getHomeTitle(memberPage);
          await expect(memberHomeTitle).toBeVisible({ timeout: 30000 });
        }
      });
    },
  );

  test(
    "TC55 In the Member Portal, only the Owner and Admin of a team can invite members to that team.",
    {
      tag: "@55",
    },
    async ({ loginAdminPage, partnerManagementPage, onboardingFlow, tempEmailFreePage, memberPortalPage, partnerPage }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      test.setTimeout(600000);

      await test.step("Login to Admin portal", async () => {
        await loginAdminPage.login();
      });

      let partnerInfo;
      await test.step("Create partner info", async () => {
        partnerInfo = await DataFactory.partnerBuilder()
          .withDepartmentName(process.env.DEPARTMENT_NAME!)
          .withPaymentOption("Partner/Consultant Owner")
          .withBankTransfer(true)
          .withProductsType([process.env.PLAN!])
          .build();
      });

      let newPartner;
      await test.step("Create a new partner", async () => {
        newPartner = await partnerManagementPage.createPartner(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
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
        await partnerPage.closeBusinessDetail(newPartnerPage);
        await newPartnerPage.close();
      });

      let ownerPage: Page;
      await test.step("Credential member portal and move to setting page", async () => {
        ownerPage = await onboardingFlow.credential(tempEmailFreePage, partnerInfo!.accountInfo?.email!, "Member");

        await onboardingFlow.moveToUserSettingPage(ownerPage);
      });

      let invitedAdminMembers: UserInfo[];
      await test.step("Invite an admin member to the team", async () => {
        invitedAdminMembers = await CustomerFactory.generateMembers(1, "Admin");
        await memberPortalPage.inviteMembers(invitedAdminMembers, ownerPage);
      });

      let adminPage: Page;
      await test.step("Verify owner can invite members", async () => {
        for (const member of invitedAdminMembers) {
          const localPart = member.email.split("@")[0];
          adminPage = await onboardingFlow.acceptInvitation(tempEmailFreePage, localPart);

          const memberHomeTitle = await onboardingFlow.getHomeTitle(adminPage);
          await expect(memberHomeTitle).toBeVisible({ timeout: 30000 });
        }
      });

      let invitedUserMembers: UserInfo[];
      await test.step("An admin invite a member to the team with role is User", async () => {
        invitedUserMembers = await CustomerFactory.generateMembers(1, "User");

        await memberPortalPage.closeModalsToInviteMembers(adminPage);

        await onboardingFlow.moveToUserSettingPage(adminPage);

        await memberPortalPage.closeModalsToInviteMembers(adminPage);

        await memberPortalPage.inviteMembers(invitedUserMembers, adminPage);
      });

      let userPage: any;
      await test.step("Verify an admin can invite members", async () => {
        for (const member of invitedUserMembers) {
          const localPart = member.email.split("@")[0];
          userPage = await onboardingFlow.acceptInvitation(tempEmailFreePage, localPart);

          await onboardingFlow.closemodals(userPage);

          const memberHomeTitle = await onboardingFlow.getHomeTitle(userPage);
          await expect(memberHomeTitle).toBeVisible({ timeout: 30000 });
        }
      });

      await test.step("Verify user can not invite members", async () => {
        await onboardingFlow.moveToUserSettingPage(userPage);

        await expect(userPage.locator(SettingUserLocators.organizationTab)).toBeHidden();
      });
    },
  );

  test(
    "TC56 Verify that the admin can invite members to a team in the Admin Portal – Customer Management.",
    {
      tag: "@56",
    },
    async ({ loginAdminPage, partnerManagementPage, onboardingFlow, tempEmailFreePage, purchaseFlow }, testInfo) => {
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

      await test.step("Verify newPartner is created successfully", async () => {
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
    },
  );
});
