import { test } from "src/fixtures";
import { DataFactory, PersonDataGenerator } from "src/data-factory";
import { plans } from "src/constant/static-data";

test.describe("E2E -> Admin Portal -> Partner Management", () => {
  test(
    "TC48",
    {
      tag: "@Verify that after the first login, the system requires the partner user to change the system-generated password to a personal password.",
    },
    async ({ loginPage, onboardingFlow, authFlow }) => {
      await test.step("Login to Admin portal", async () => {
        await loginPage.login();
      });

      const partnerInfo = await DataFactory.partnerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withPaymentOption("Partner/Consultant Owner")
        .withProductsType([plans[0]])
        .withBankTransfer(true)
        .build();

      await test.step("Create a new partner", async () => {
        await onboardingFlow.createPartnerAndAddPeoInAdminPortal(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo!);
      });

      await test.step("Verify the partner user must change the system-generated password to a personal password", async () => {
        await authFlow.activateIndividualCustomerAccountAndChangePassword(partnerInfo!.accountInfo?.email!, "Partner portal", "Password@123");

        await onboardingFlow.redirectToHomePage();
      });
    },
  );

  test(
    "TC49",
    {
      tag: "@Verify that after a successful login, the partner user proceeds to make a payment through Stripe when Payment Options = Partner/Consultant Owner and Bank Transfer = OFF.",
    },
    async ({ loginPage: loginAdminPage, onboardingFlow, purchaseFlow, authFlow }) => {
      await test.step("Login to Admin portal", async () => {
        await loginAdminPage.login();
      });

      const partnerInfo = await DataFactory.partnerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withPaymentOption("Partner/Consultant Owner")
        .withBankTransfer(false)
        .withProductsType([plans[0]])
        .build();

      await test.step("Create a new partner", async () => {
        await onboardingFlow.createPartnerAndAddPeoInAdminPortal(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo!);
      });

      await test.step("Buy the plan through Stripe", async () => {
        await authFlow.activateIndividualCustomerAccountAndChangePassword(partnerInfo!.accountInfo!.email!, "Partner portal", "Password@123");

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
    async ({ loginPage, onboardingFlow, purchaseFlow, authFlow }) => {
      await test.step("Login to Admin portal", async () => {
        await loginPage.login();
      });

      const partnerInfo = await DataFactory.partnerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withPaymentOption("Partner/Consultant Owner")
        .withProductsType([plans[0]])
        .withBankTransfer(false)
        .build();

      await test.step("Create a new partner", async () => {
        await onboardingFlow.createPartnerAndAddPeoInAdminPortal(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo!);
      });

      await test.step("Activate the partner account and change password", async () => {
        await authFlow.activateIndividualCustomerAccountAndChangePassword(partnerInfo!.accountInfo!.email!, "Partner portal", "Password@123");
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
    async ({ loginPage: loginAdminPage, onboardingFlow, authFlow }) => {
      await test.step("Login to Admin portal", async () => {
        await loginAdminPage.login();
      });

      const partnerInfo = await DataFactory.partnerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withPaymentOption("Partner/Consultant Owner")
        .withProductsType([plans[0]])
        .withBankTransfer(true)
        .build();

      await test.step("Create a new partner", async () => {
        await onboardingFlow.createPartnerAndAddPeoInAdminPortal(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo!);
      });

      await test.step("Activate the partner account and change password", async () => {
        await authFlow.activateIndividualCustomerAccountAndChangePassword(partnerInfo!.accountInfo?.email!, "Partner portal", "Password@123");
      });

      await test.step("Verify the partner user is not required to make any payment through Stripe.", async () => {
        await onboardingFlow.redirectToHomePage();
      });
    },
  );

  test(
    "TC52",
    {
      tag: "@Verify that when Payment Options = Partner/Consultant Owner, the partner account is both the Owner of the Partner Team and the Owner of all Businesses under it.",
    },
    async ({ loginPage: loginAdminPage, authFlow, onboardingFlow }) => {
      await test.step("Login to Admin portal", async () => {
        await loginAdminPage.login();
      });

      const partnerInfo = await DataFactory.partnerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withPaymentOption("Partner/Consultant Owner")
        .withProductsType([plans[0]])
        .withBankTransfer(true)
        .build();

      await test.step("Create a new partner", async () => {
        await onboardingFlow.createPartnerAndAddPeoInAdminPortal(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo!);
      });

      await test.step("Activate the partner account and change password", async () => {
        await authFlow.activateIndividualCustomerAccountAndChangePassword(partnerInfo!.accountInfo?.email!, "Partner portal", "Password@123");
      });

      await test.step("Create business", async () => {
        const ownerInfor = await PersonDataGenerator.generate();

        await onboardingFlow.createBusinessFromPartnerPortal(partnerInfo!, ownerInfor!);
      });

      await test.step("Verify the partner account is the Owner of all Businesses under it", async () => {
        await onboardingFlow.verifyOwnerVisible();
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
    async ({ loginPage, authFlow, onboardingFlow }) => {
      await test.step("Login to Admin portal", async () => {
        await loginPage.login();
      });

      const partnerInfo = await DataFactory.partnerBuilder().withDepartmentName(process.env.DEPARTMENT_NAME!).withPaymentOption("Member Portal Consumer").withProductsType([plans[0]]).build();

      await test.step("Create a new partner", async () => {
        await onboardingFlow.createPartnerAndAddPeoInAdminPortal(partnerInfo);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo);
      });

      await test.step("Activate the partner", async () => {
        await authFlow.activateIndividualCustomerAccountAndChangePassword(partnerInfo!.accountInfo?.email!, "Partner portal", "Password@123");
      });

      await test.step("Create a new business", async () => {
        const ownerAccount = await PersonDataGenerator.generate();

        await onboardingFlow.createBusinessFromPartnerPortal(partnerInfo!, ownerAccount);
      });

      await test.step("Verify each Business has its own Owner.", async () => {
        await onboardingFlow.verifyOwnerVisible();
      });

      await test.step("Verify the partner account is the Owner of the Partner Team", async () => {
        await onboardingFlow.verifyOwnerRoleInUserPage(partnerInfo!);
      });
    },
  );
});
