import { test } from "src/fixtures";
import { DataFactory } from "src/data-factory";
import { plans } from "src/constant/static-data";

test.describe("E2E -> Admin Portal -> Partner Management", { tag: ["@regression_UI", "@partner_management"] }, () => {
  test(
    "TC40 Verify that the admin can enable Bank Transfer for a new Partner.",
    {
      tag: "@TC40",
    },
    async ({ loginPage, onboardingFlow }) => {
      await test.step("1 - Login to Admin portal", async () => {
        await loginPage.login();
      });

      let partnerInfo;
      await test.step("2 - Create partner info", async () => {
        partnerInfo = await DataFactory.partnerBuilder()
          .withIsPublic(false)
          .withDepartmentName(process.env.DEPARTMENT_NAME!)
          .withPaymentOption("Partner/Consultant Owner")
          .withProductsType([plans[0]])
          .build();
      });

      await test.step("3 - Create a new partner", async () => {
        await onboardingFlow.createPartnerAndAddPeoInAdminPortal(partnerInfo!);
      });

      await test.step("4 - Verify newPartner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo!);
      });
    },
  );

  test(
    "TC41 When Bank Transfer = ON, the Partner user is assigned a plan and does not need to make a payment through Stripe.",
    {
      tag: "@TC41",
    },
    async ({ loginPage, authFlow, onboardingFlow }) => {
      await test.step("1 - Login to Admin portal", async () => {
        await loginPage.login();
      });

      const partnerInfo = await DataFactory.partnerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withPaymentOption("Partner/Consultant Owner")
        .withProductsType([plans[0]])
        .withBankTransfer(true)
        .withIsPublic(false)
        .build();

      await test.step("2 - Create a new partner", async () => {
        await onboardingFlow.createPartnerAndAddPeoInAdminPortal(partnerInfo!);
      });

      await test.step("3 - Verify newPartner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo!);
      });

      await test.step("4 - Partner does not need to make a payment through tripe", async () => {
        await authFlow.activateAndChangePassIndividualCustomer(partnerInfo!.accountInfo?.email!, "Partner portal", "Password@123");

        await onboardingFlow.redirectToHomePage();
      });
    },
  );

  test(
    "TC42 When Bank Transfer = OFF, the Partner user is not pre-assigned a plan, but instead selects a plan via the Select Plan screen and pays through Stripe.",
    {
      tag: "@TC42",
    },
    async ({ loginPage, authFlow, purchaseFlow, onboardingFlow }) => {
      await test.step("1 - Login to Admin portal", async () => {
        await loginPage.login();
      });

      const partnerInfo = await DataFactory.partnerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withPaymentOption("Partner/Consultant Owner")
        .withProductsType([plans[0]])
        .withBankTransfer(false)
        .withIsPublic(false)
        .build();

      await test.step("2 - Create a new partner", async () => {
        await onboardingFlow.createPartnerAndAddPeoInAdminPortal(partnerInfo!);
      });

      await test.step("3 - Verify newPartner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo!);
      });

      await test.step("4 - Verify partner needs to make a payment through tripe", async () => {
        await authFlow.activateAndChangePassIndividualCustomer(partnerInfo!.accountInfo?.email!, "Partner portal", "Password@123");

        await onboardingFlow.validatePlanVisible();

        await purchaseFlow.selectPlanBeforePurchase("", partnerInfo!.accountInfo?.email, plans[0]);

        await purchaseFlow.submitSubscriptionPayment();

        await onboardingFlow.redirectToHomePage();
      });
    },
  );

  test(
    "TC43 With Payment Options = Partner/Consultant Owner, after successfully creating a Partner account, the user receives two credential emails — one for the Partner Portal and one for the Member Portal.",
    {
      tag: "@TC43",
    },
    async ({ loginPage, onboardingFlow }) => {
      await test.step("1 - Login to Admin portal", async () => {
        await loginPage.login();
      });

      const partnerInfo = await DataFactory.partnerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withPaymentOption("Partner/Consultant Owner")
        .withProductsType([plans[0]])
        .withBankTransfer(false)
        .withIsPublic(false)
        .build();

      await test.step("2 - Create a new partner", async () => {
        await onboardingFlow.createPartnerAndAddPeoInAdminPortal(partnerInfo!);
      });

      await test.step("3 - Verify newPartner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo!);
      });

      await test.step("4 - Verify With Payment Options = Partner/Consultant Owner, after successfully creating a Partner account, the user receives two credential emails", async () => {
        await onboardingFlow.validateReceivedTwoEmails(partnerInfo!);
      });
    },
  );

  test(
    "TC44 For Payment Options = Partner/Consultant Owner, the Owner account can log in to both the Member Portal and the Partner Portal.",
    {
      tag: "@TC44",
    },
    async ({ loginPage, authFlow, onboardingFlow }) => {
      await test.step("1 - Login to Admin portal", async () => {
        await loginPage.login();
      });

      const partnerInfo = await DataFactory.partnerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withPaymentOption("Partner/Consultant Owner")
        .withProductsType([plans[0]])
        .withBankTransfer(true)
        .withIsPublic(false)
        .build();

      await test.step("2 - Create a new partner", async () => {
        await onboardingFlow.createPartnerAndAddPeoInAdminPortal(partnerInfo!);
      });

      await test.step("3 - Verify newPartner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo!);
      });

      await test.step("4 - Verify With Payment Options = Partner/Consultant Owner, after successfully creating a Partner account, the user receives two credential emails", async () => {
        await authFlow.activateAndChangePassIndividualCustomer(partnerInfo!.accountInfo?.email!, "Partner portal", "Password@123");

        await onboardingFlow.redirectToHomePage();

        await authFlow.activateAndChangePassIndividualCustomer(partnerInfo!.accountInfo?.email!, "Member", "Password@123");

        await onboardingFlow.redirectToHomePage();
      });
    },
  );
});
