import { test, expect } from "src/fixtures";
import { UiAssert } from "src/assertions";
import { DataFactory, PersonDataGenerator } from "src/data-factory";
import { Page } from "@playwright/test";
import { plans } from "src/constant/static-data";
import { Partner } from "src/objects";

test.describe("E2E -> Admin Portal -> Partner Management", () => {
  test(
    "TC48",
    {
      tag: "@Verify that after the first login, the system requires the partner user to change the system-generated password to a personal password.",
    },
    async ({ loginPage, onboardingFlow, homeExceptAdminPage, authFlow }, testInfo) => {
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

      let newPartner;
      await test.step("Create a new partner", async () => {
        await onboardingFlow.createPartner(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
      });

      await test.step("Verify the partner user must change the system-generated password to a personal password", async () => {
        await authFlow.activateIndividualCustomerAccountAndSetPassword(partnerInfo!.accountInfo?.email!, "Partner portal");

        const hometitle = await homeExceptAdminPage.getHomeTitle();

        await expect(hometitle).toBeVisible({ timeout: 10000 });
      });
    },
  );

  test(
    "TC49",
    {
      tag: "@Verify that after a successful login, the partner user proceeds to make a payment through Stripe when Payment Options = Partner/Consultant Owner and Bank Transfer = OFF.",
    },
    async ({ loginPage: loginAdminPage, partnerManagementPage, onboardingFlow, homeExceptAdminPage, purchaseFlow, authFlow }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      await test.step("Login to Admin portal", async () => {
        await loginAdminPage.login();
      });

      let partnerData: Partner;
      await test.step("Create partner info", async () => {
        partnerData = await DataFactory.partnerBuilder()
          .withDepartmentName(process.env.DEPARTMENT_NAME!)
          .withPaymentOption("Partner/Consultant Owner")
          .withBankTransfer(false)
          .withProductsType(Array.from(plans[0]))
          .build();
      });

      await test.step("Create a new partner", async () => {
        await onboardingFlow.createPartner(partnerData!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await expect(partnerManagementPage.currentPage.getByText(partnerData!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
      });

      await test.step("Buy the plan through Stripe", async () => {
        await authFlow.activateIndividualCustomerAccountAndSetPassword(partnerData!.accountInfo!.email!, "Partner portal");

        await purchaseFlow.selectPlanBeforePurchase("", partnerData.accountInfo!.email!, partnerData.partnerInfo!.productsType![0]);
      });

      await test.step("Verify the user can see the Stripe payment form displayed correctly", async () => {
        await purchaseFlow.verifyStripePaymentFormCorrectDisplay();
      });

      await test.step("Complete the payment with valid card information", async () => {
        await purchaseFlow.submitSubscriptionPayment();
      });

      const homeTitle = await homeExceptAdminPage.getHomeTitle();

      await UiAssert.allVisible([homeTitle], { timeout: 30000 });
    },
  );

  test(
    "TC50",
    {
      tag: "@After a successful payment, the partner user is redirected to the Partner Homepage.",
    },
    async ({ loginPage, homeExceptAdminPage, onboardingFlow, tempEmailFreePage, purchaseFlow }, testInfo) => {
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
          .withBankTransfer(false)
          .build();
      });

      let newPartner;
      await test.step("Create a new partner", async () => {
        newPartner = await onboardingFlow.createPartner(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
      });

      let partnerPage: any;
      await test.step("Buy plan through Stripe", async () => {
        partnerPage = await purchaseFlow.buyPlanInPartnerPortal(partnerInfo!);
      });

      await test.step("Verify the partner user is redirected to the Partner Homepage after a successful payment", async () => {
        const homeTitle = await homeExceptAdminPage.getHomeTitle();

        await UiAssert.allVisible([homeTitle]);
      });
    },
  );

  test(
    "TC51",
    {
      tag: "@Verify that for other payment configurations, the partner user is not required to make any payment through Stripe.",
    },
    async ({ loginPage: loginAdminPage, homeExceptAdminPage, onboardingFlow, tempEmailFreePage, authFlow }, testInfo) => {
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
        newPartner = await onboardingFlow.createPartner(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
      });

      await test.step("Verify the partner user is not required to make any payment through Stripe.", async () => {
        await authFlow.activateIndividualCustomerAccountAndSetPassword(partnerInfo!.accountInfo?.email!, "Partner portal");
        const homeTitle = await homeExceptAdminPage.getHomeTitle();

        await UiAssert.allVisible([homeTitle]);
      });
    },
  );

  test(
    "TC52",
    {
      tag: "@Verify that when Payment Options = Partner/Consultant Owner, the partner account is both the Owner of the Partner Team and the Owner of all Businesses under it.",
    },
    async ({ loginPage: loginAdminPage, partnerManagementPage, onboardingFlow, tempEmailFreePage, partnerPage }, testInfo) => {
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

      let owner;
      let newPartnerPage: Page;
      await test.step("Create business", async () => {
        newPartnerPage = await onboardingFlow.activateAccountAndSetPassword(tempEmailFreePage, partnerInfo!.accountInfo?.email!);
        owner = await onboardingFlow.createBusinessFromPartnerPortal(newPartnerPage!, partnerInfo!, partnerInfo!);
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
    async ({ loginPage: loginAdminPage, partnerManagementPage, onboardingFlow, tempEmailFreePage, partnerPage }, testInfo) => {
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
        newPartnerPage = await onboardingFlow.activateAccountAndSetPassword(tempEmailFreePage, partnerInfo!.accountInfo?.email!);
      });

      let owner;
      await test.step("Create a new business", async () => {
        const ownerAccount = await PersonDataGenerator.generate();

        owner = await onboardingFlow.createBusinessFromPartnerPortal(newPartnerPage!, partnerInfo!, ownerAccount);
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
