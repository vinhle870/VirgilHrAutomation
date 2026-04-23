import { test, expect } from "src/fixtures";
import { DataFactory, PersonDataGenerator } from "src/data-factory";
import { UserInfo } from "src/objects";
import { CustomerFactory } from "src/data-factory/customer-factory";
import IPartnerFilter from "src/objects/ipartnerfilter";
import { PartnerFilterLocator } from "src/ui/pages/admin-portal/locators/partner-management/locator/filter-partner";
import { CreateNewPartnerModalLocator } from "src/ui/pages/admin-portal/locators/partner-management/locator/new-partner";
import { BuyPlanLocators, TempEmailFreeLocators } from "src/ui/pages/shared/locators";
import { Page } from "playwright/test";
import { BuyPlanPage } from "src/ui/pages";
import { SettingUserLocators } from "src/ui/pages/member-portal/locators/setting-user";

test.describe("E2E -> Admin Portal -> Partner Management", () => {
  test(
    "TC54",
    {
      tag: "@Verify that an user can invite members to a team in the member portal - organization tab.",
    },
    async ({ loginAdminPage, partnerManagementPage, onboardingFlow, tempEmailFreePage, memberPortalPage }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      // await test.step("Login to Admin portal", async () => {
      //   await loginAdminPage.login();
      // });

      let partnerInfo;
      await test.step("Create partner info", async () => {
        partnerInfo = await DataFactory.partnerBuilder()
          .withDepartmentName(process.env.DEPARTMENT_NAME!)
          .withPaymentOption("Partner/Consultant Owner")
          .withProductsType([process.env.PLAN!])
          .withBankTransfer(true)
          .withEmail("QATest_Judd829@polandcampus.edu.pl")
          .build();
      });

      // let newPartner;
      // await test.step("Create a new partner", async () => {
      //   newPartner = await partnerManagementPage.createPartner(partnerInfo!);
      // });

      // await test.step("Verify newPartner is created successfully", async () => {
      //   await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
      // });

      // let owner;
      // await test.step("Create a new Business", async () => {
      //   const newPartnerPage = await onboardingFlow.credential(tempEmailFreePage, partnerInfo!.accountInfo?.email!);
      //   owner = await onboardingFlow.createBusiness(newPartnerPage!, partnerInfo!, partnerInfo!);
      // });

      // await test.step("Verify the new Business is created successfully", async () => {
      //   await expect(owner!).toBeVisible({ timeout: 10000 });
      // });

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
        await memberPortalPage.inviteMembersByEmail(memberPage, invitedMembers, onboardingFlow, tempEmailFreePage);
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
    "TC49",
    {
      tag: "@Verify that after a successful login, the partner user proceeds to make a payment through Stripe when Payment Options = Partner/Consultant Owner and Bank Transfer = OFF.",
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
          .withBankTransfer(false)
          .withProductsType([process.env.PLAN!])
          .withEmail("QATest_Lucio989@polandcampus.edu.pl")
          .build();
      });

      let newPartner;
      await test.step("Create a new partner", async () => {
        newPartner = await partnerManagementPage.createPartner(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
      });

      let partnerPage;
      await test.step("Buy the plan through Stripe", async () => {
        partnerPage = await onboardingFlow.credential(tempEmailFreePage, partnerInfo!.accountInfo!.email!, "Partner", true);

        await purchaseFlow.handbleParrtnerPageToBuyPlan("", partnerInfo!.account?.email, partnerPage!);
      });

      await test.step("Verify the user can see the Stripe payment form", async () => {
        const stripeElement = await purchaseFlow.getTripeElements(partnerPage!);

        const cardNumberElement = stripeElement.txtCardNumb;
        const cardCvcElement = stripeElement.txtCardCvc;
        const cardHolderElement = stripeElement.txtHolder;
        const cardAddressElement = stripeElement.txtAddress;
        const cardCityElement = stripeElement.txtCity;

        await expect(cardNumberElement).toBeVisible({ timeout: 30000 });
        await expect(cardCvcElement).toBeVisible();
        await expect(cardHolderElement).toBeVisible();
        await expect(cardAddressElement).toBeVisible();
        await expect(cardCityElement).toBeVisible();

        await new BuyPlanPage(partnerPage!).fillBuyPlanFormWithInvalidCard();

        const homeTitle = await onboardingFlow.getHomeTitle(partnerPage!);

        await expect(homeTitle).toBeVisible({ timeout: 30000 });
      });
    },
  );

  test(
    "TC50",
    {
      tag: "@After a successful payment, the partner user is redirected to the Partner Homepage.",
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
          .withBankTransfer(false)
          .build();
      });

      let newPartner;
      await test.step("Create a new partner", async () => {
        newPartner = await partnerManagementPage.createPartner(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
      });

      let partnerPage: any;
      await test.step("Buy plan through Stripe", async () => {
        partnerPage = await onboardingFlow.buyPlanInPartnerPortal(tempEmailFreePage, purchaseFlow, partnerInfo!);
      });

      await test.step("Verify the partner user is redirected to the Partner Homepage after a successful payment", async () => {
        const homeTitle = await onboardingFlow.getHomeTitle(partnerPage);

        await expect(homeTitle).toBeVisible({ timeout: 30000 });
      });
    },
  );

  test(
    "TC51",
    {
      tag: "@Verify that for other payment configurations, the partner user is not required to make any payment through Stripe.",
    },
    async ({ loginAdminPage, partnerManagementPage, onboardingFlow, tempEmailFreePage, purchaseFlow }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      await test.step("Login to Admin portal", async () => {
        await loginAdminPage.login();
      });

      let partnerInfo;
      await test.step("Create partner info with other payment configurations", async () => {
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
        await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
      });

      await test.step("Verify the partner user is not required to make any payment through Stripe.", async () => {
        const partnerPage = await onboardingFlow.credential(tempEmailFreePage, partnerInfo!.accountInfo?.email!);
        const homeTitle = await onboardingFlow.getHomeTitle(partnerPage);

        await expect(homeTitle).toBeVisible({ timeout: 30000 });
      });
    },
  );

  test(
    "TC52",
    {
      tag: "@Verify that when Payment Options = Partner/Consultant Owner, the partner account is both the Owner of the Partner Team and the Owner of all Businesses under it.",
    },
    async ({ loginAdminPage, partnerManagementPage, onboardingFlow, tempEmailFreePage, partnerPage }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      await test.step("Login to Admin portal", async () => {
        await loginAdminPage.login();
      });

      let partnerInfo;
      await test.step("Create partner info with other payment configurations", async () => {
        partnerInfo = await DataFactory.partnerBuilder()
          .withDepartmentName(process.env.DEPARTMENT_NAME!)
          .withPaymentOption("Partner/Consultant Owner")
          .withProductsType([process.env.PLAN!])
          .withBankTransfer(true)
          .withEmail("QATest_Nick205@polandcampus.edu.pl")
          .build();
      });

      let newPartner;
      await test.step("Create a new partner", async () => {
        newPartner = await partnerManagementPage.createPartner(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
      });

      let owner;
      let newPartnerPage: Page;
      await test.step("Create business", async () => {
        newPartnerPage = await onboardingFlow.credential(tempEmailFreePage, partnerInfo!.accountInfo?.email!);
        owner = await onboardingFlow.createBusiness(newPartnerPage!, partnerInfo!, partnerInfo!);
      });

      await test.step("Verify the partner account is the Owner of all Businesses under it", async () => {
        await expect(owner!).toBeVisible();

        await partnerPage.closeBusinessDetail(newPartnerPage);
      });

      await test.step("Move to team page", async () => {
        await partnerPage.moveToPage("/users", newPartnerPage);
      });

      await test.step("Verify the partner account is the Owner of the Partner Team", async () => {
        const ownerRole = partnerPage.getOwnerRoleInClientPage(partnerInfo!.accountInfo!.email!, newPartnerPage);
        await expect(ownerRole).toBeVisible();
      });
    },
  );

  test(
    "TC53",
    {
      tag: "@ Verify that when Payment Options = Member Portal Consumer, the partner account is the Owner of the Partner Team, while each Business has its own Owner.",
    },
    async ({ loginAdminPage, partnerManagementPage, onboardingFlow, tempEmailFreePage, partnerPage }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      // await test.step("Login to Admin portal", async () => {
      //   await loginAdminPage.login();
      // });

      let partnerInfo;
      await test.step("Create partner info", async () => {
        partnerInfo = await DataFactory.partnerBuilder()
          .withDepartmentName(process.env.DEPARTMENT_NAME!)
          .withPaymentOption("Member Portal Consumer")
          .withProductsType([process.env.PLAN!])
          .withEmail("QATest_Anderson360@polandcampus.edu.pl")
          .build();
      });

      // let newPartner;
      // await test.step("Create a new partner", async () => {
      //   newPartner = await partnerManagementPage.createPartner(partnerInfo!);
      // });

      // await test.step("Verify newPartner is created successfully", async () => {
      //   await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
      // });

      let newPartnerPage: Page;
      await test.step("Credential the partner", async () => {
        newPartnerPage = await onboardingFlow.credential(tempEmailFreePage, partnerInfo!.accountInfo?.email!);
      });

      let owner;
      await test.step("Create a new business", async () => {
        const ownerAccount = await PersonDataGenerator.generate();

        owner = await onboardingFlow.createBusiness(newPartnerPage!, partnerInfo!, ownerAccount);
      });

      await test.step("Verify each Business has its own Owner.", async () => {
        await expect(owner!).toBeVisible();

        await partnerPage.closeBusinessDetail(newPartnerPage);
      });

      await test.step("Move to team page", async () => {
        await partnerPage.moveToPage("/users", newPartnerPage);
      });

      await test.step("Verify the partner account is the Owner of the Partner Team", async () => {
        const ownerRole = partnerPage.getOwnerRoleInClientPage(partnerInfo!.accountInfo!.email!, newPartnerPage);
        await expect(ownerRole).toBeVisible();
      });
    },
  );
});
