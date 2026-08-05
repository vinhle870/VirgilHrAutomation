import { test } from "src/fixtures";
import { DataFactory, PersonDataGenerator } from "src/data-factory";
import { plans } from "src/constant/static-data";

test.describe("E2E -> Admin Portal -> Partner Management", { tag: ["@regression_UI", "@partner_management"] }, () => {
  test(
    "TC45 With Payment Options = Member Portal Consumer, after successfully creating a Partner account, the user receives one credential email — for the Partner Portal.",
    {
      tag: "@45",
    },
    async ({ loginPage: loginPage, onboardingFlow }) => {
      await test.step("1 - Login to Admin portal", async () => {
        await loginPage.login();
      });

      const partnerInfo = await DataFactory.partnerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withPaymentOption("Member Portal Consumer")
        .withProductsType([plans[0]])
        .withBankTransfer(true)
        .withIsPublic(false)
        .build();

      await test.step("2 - Create a new partner with payment option = 'Member Portal Consumer'", async () => {
        await onboardingFlow.createPartnerAndAddPeoInAdminPortal(partnerInfo!);
      });

      await test.step("3 - Verify newPartner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo!);
      });

      await test.step("4 - Verify the user receives one credential partner email", async () => {
        await onboardingFlow.validateReceivedOneEmail(partnerInfo!);
      });
    },
  );

  test(
    "TC46 For Payment Options = Member Portal Consumer, the Owner of the Partner/Consultant can only log in to the Partner Portal.",
    {
      tag: "@46",
    },
    async ({ loginPage, authFlow, onboardingFlow }) => {
      await test.step("1 - Login to Admin portal", async () => {
        await loginPage.login();
      });

      const partnerInfo = await DataFactory.partnerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withPaymentOption("Member Portal Consumer")
        .withProductsType([plans[0]])
        .withBankTransfer(true)
        .withIsPublic(false)
        .build();

      await test.step("2 - Create a new partner with payment option = 'Member Portal Consumer'", async () => {
        await onboardingFlow.createPartnerAndAddPeoInAdminPortal(partnerInfo!);
      });

      await test.step("3 - Verify newPartner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo!);
      });

      await test.step("4 - Verify login only partner portal", async () => {
        await authFlow.activateAndChangePassIndividualCustomer(partnerInfo!.accountInfo?.email!, "Partner Portal", "Password@123");

        await onboardingFlow.redirectToHomePage();
      });
    },
  );

  test(
    "TC47 For Businesses under a Partner with Payment Options = Member Portal Consumer, the Business Owner cannot log in to the Partner Portal.",
    {
      tag: "@TC47",
    },
    async ({ loginPage, onboardingFlow, partnerPage, authFlow }) => {
      await test.step("1 - Login to Admin portal", async () => {
        await loginPage.login();
      });

      const partnerInfo = await DataFactory.partnerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withPaymentOption("Member Portal Consumer")
        .withProductsType([plans[0]])
        .withBankTransfer(true)
        .withIsPublic(false)
        .build();

      await test.step("2 - Create a new partner with payment option = 'Member Portal Consumer'", async () => {
        await onboardingFlow.createPartnerAndAddPeoInAdminPortal(partnerInfo!);
      });

      await test.step("3 - Verify newPartner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo!);
      });

      const ownerAccount = await PersonDataGenerator.generate({ emailDomain: "chinasteel.xyz" });
      await test.step("4 - Create a business and verify the owner can log in to Member Portal", async () => {
        await authFlow.activateAndChangePassIndividualCustomer(partnerInfo!.accountInfo?.email!, "Partner portal", "Password@123");

        await onboardingFlow.createBusinessFromPartnerPortal(partnerInfo!, ownerAccount!);

        await onboardingFlow.verifyOwnerVisible();

        await authFlow.activateAndChangePassIndividualCustomer(ownerAccount.email!, "Consumer", "Password@123");

        await onboardingFlow.redirectToHomePage();
      });

      await test.step("5 - Verify the owner cannot log in to Partner Portal", async () => {
        await loginPage.fillLoginForm(partnerPage.getURL(), ownerAccount.email!, ownerAccount.password!);

        await onboardingFlow.validateAccountNotExist();
      });
    },
  );
});
