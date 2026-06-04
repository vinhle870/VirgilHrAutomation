import { test, expect } from "src/fixtures";
import { UiAssert } from "src/assertions";
import { DataFactory, PersonDataGenerator } from "src/data-factory";
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
        await onboardingFlow.createPartnerAndAddPeo(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo!);
      });

      await test.step("Verify the partner user must change the system-generated password to a personal password", async () => {
        await authFlow.activateIndividualCustomerAccountAndSetPassword(partnerInfo!.accountInfo?.email!, "Partner portal", "Password@123");

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
    async ({ loginPage: loginAdminPage, onboardingFlow, homeExceptAdminPage, purchaseFlow, authFlow }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      await test.step("Login to Admin portal", async () => {
        await loginAdminPage.login();
      });

      let partnerInfo: Partner;
      await test.step("Create partner info", async () => {
        partnerInfo = await DataFactory.partnerBuilder()
          .withDepartmentName(process.env.DEPARTMENT_NAME!)
          .withPaymentOption("Partner/Consultant Owner")
          .withBankTransfer(false)
          .withProductsType(Array.from(plans[0]))
          .build();
      });

      await test.step("Create a new partner", async () => {
        await onboardingFlow.createPartnerAndAddPeo(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo!);
      });

      await test.step("Buy the plan through Stripe", async () => {
        await authFlow.activateIndividualCustomerAccountAndSetPassword(partnerInfo!.accountInfo!.email!, "Partner portal", "Password@123");

        await purchaseFlow.selectPlanBeforePurchase("", partnerInfo.accountInfo!.email!, partnerInfo.partnerInfo!.productsType![0]);
      });

      await test.step("Verify the user can see the Stripe payment form displayed correctly", async () => {
        await purchaseFlow.verifyStripePaymentFormCorrectDisplay();
      });

      await test.step("Complete the payment with valid card information", async () => {
        await purchaseFlow.submitSubscriptionPayment();
      });

      await test.step("Verify the partner user is redirected to the Partner Homepage after a successful payment", async () => {
        await onboardingFlow.redirectToHomePage();
      });
    },
  );

  test(
    "TC50",
    {
      tag: "@After a successful payment, the partner user is redirected to the Partner Homepage.",
    },
    async ({ loginPage, homeExceptAdminPage, onboardingFlow, purchaseFlow }, testInfo) => {
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

      await test.step("Create a new partner", async () => {
        await onboardingFlow.createPartnerAndAddPeo(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo!);
      });

      await test.step("Buy plan through Stripe", async () => {
        await purchaseFlow.buyPlanInPartnerPortal(partnerInfo!);
      });

      await test.step("Verify the partner user is redirected to the Partner Homepage after a successful payment", async () => {
        await onboardingFlow.redirectToHomePage();
      });
    },
  );

  test(
    "TC51",
    {
      tag: "@Verify that for other payment configurations, the partner user is not required to make any payment through Stripe.",
    },
    async ({ loginPage: loginAdminPage, homeExceptAdminPage, onboardingFlow, authFlow }, testInfo) => {
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

      await test.step("Create a new partner", async () => {
        await onboardingFlow.createPartnerAndAddPeo(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo!);
      });

      await test.step("Verify the partner user is not required to make any payment through Stripe.", async () => {
        await authFlow.activateIndividualCustomerAccountAndSetPassword(partnerInfo!.accountInfo?.email!, "Partner portal", "Password@123");
        await onboardingFlow.redirectToHomePage();
      });
    },
  );

  test(
    "TC52",
    {
      tag: "@Verify that when Payment Options = Partner/Consultant Owner, the partner account is both the Owner of the Partner Team and the Owner of all Businesses under it.",
    },
    async ({ loginPage: loginAdminPage, authFlow, onboardingFlow }, testInfo) => {
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

      await test.step("Create a new partner", async () => {
        await onboardingFlow.createPartnerAndAddPeo(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo!);
      });

      let owner;
      await test.step("Create business", async () => {
        await authFlow.activateIndividualCustomerAccountAndSetPassword(partnerInfo!.accountInfo?.email!, "Partner portal", "Password@123");
        const ownerInfor = await PersonDataGenerator.generate();

        owner = await onboardingFlow.createBusinessFromPartnerPortal(partnerInfo!, ownerInfor!);
      });

      await test.step("Verify the partner account is the Owner of all Businesses under it", async () => {
        await expect(owner!).toBeVisible();
      });

      await test.step("Verify the partner account is the Owner of the Partner Team", async () => {
        await onboardingFlow.verifyOwnerRoleInUserPage(partnerInfo!);
      });
    },
  );

  test(
    "TC53",
    {
      tag: "@ Verify that when Payment Options = Member Portal Consumer, the partner account is the Owner of the Partner Team, while each Business has its own Owner.",
    },
    async ({ loginPage, authFlow, onboardingFlow }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      await test.step("Login to Admin portal", async () => {
        await loginPage.login();
      });

      let partnerInfo;
      await test.step("Create partner info", async () => {
        partnerInfo = await DataFactory.partnerBuilder().withDepartmentName(process.env.DEPARTMENT_NAME!).withPaymentOption("Member Portal Consumer").withProductsType([process.env.PLAN!]).build();
      });

      await test.step("Create a new partner", async () => {
        await onboardingFlow.createPartnerAndAddPeo(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo!);
      });

      await test.step("Credential the partner", async () => {
        await authFlow.activateIndividualCustomerAccountAndSetPassword(partnerInfo!.accountInfo?.email!, "Partner portal", "Password@123");
      });

      let owner;
      await test.step("Create a new business", async () => {
        const ownerAccount = await PersonDataGenerator.generate();

        owner = await onboardingFlow.createBusinessFromPartnerPortal(partnerInfo!, ownerAccount);
      });

      await test.step("Verify each Business has its own Owner.", async () => {
        await expect(owner!).toBeVisible();
      });

      await test.step("Verify the partner account is the Owner of the Partner Team", async () => {
        await onboardingFlow.verifyOwnerRoleInUserPage(partnerInfo!);
      });
    },
  );
});
