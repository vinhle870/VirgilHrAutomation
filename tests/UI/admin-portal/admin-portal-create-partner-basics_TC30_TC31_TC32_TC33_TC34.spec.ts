import { test } from "src/fixtures";
import { DataFactory } from "src/data-factory";
import { Partner } from "src/objects";
import { plans } from "src/constant/static-data";

test.describe("E2E -> Admin Portal -> Partner Management", { tag: ["@regression_UI", "@partner_management"] }, () => {
  test(
    "TC30 Verify that a partner account can only be created in the Admin Portal – Partner Management.",
    {
      tag: ["@TC30", "@1_test"],
    },
    async ({ loginPage, onboardingFlow }) => {
      await test.step("1 - Login to Admin portal", async () => {
        await loginPage.login();
      });

      let partnerInfo = await DataFactory.partnerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withPaymentOption("Partner/Consultant Owner")
        .withIsPublic(false)
        .withProductsType([plans[0]])
        .build();

      await test.step("2 - Create a new partner", async () => {
        await onboardingFlow.createPartnerAndAddPeoInAdminPortal(partnerInfo!);
      });

      await test.step("3 - Verify newPartner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo!);
      });
    },
  );

  test(
    "TC31 Verify when a Partner is being created, the admin can select its level as Partner or PEO/Consultant.",
    {
      tag: "@TC31_UI",
    },
    async ({ loginPage: loginPage, onboardingFlow }) => {
      await test.step("1 - Login to Admin portal", async () => {
        await loginPage.login();
      });

      let partnerInfo;
      await test.step("2 - Create partner info", async () => {
        partnerInfo = await DataFactory.partnerBuilder()
          .withDepartmentName(process.env.DEPARTMENT_NAME!)
          .withPaymentOption("Partner/Consultant Owner")
          .withBankTransfer(false)
          .withProductsType([plans[0]])
          .withIsPublic(false)
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
    "TC32 Verify that a Partner is at a higher level than a PEO/Consultant, meaning one Partner can contain one or multiple PEOs/Consultants.",
    {
      tag: "@TC32",
    },
    async ({ loginPage, authFlow, onboardingFlow }) => {
      await test.step("1 - Login to Admin portal", async () => {
        await loginPage.login();
      });

      const partnerInfo = await DataFactory.partnerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withPaymentOption("Partner/Consultant Owner")
        .withIsPublic(false)
        .withProductsType([plans[0]])
        .withBankTransfer(true)
        .build();

      await test.step("2 - Create a new partner", async () => {
        await onboardingFlow.createPartnerAndAddPeoInAdminPortal(partnerInfo!);
      });

      await test.step("3 - Verify newPartner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo!);
      });

      await test.step("4 - Activate partner", async () => {
        await authFlow.activateAndChangePassIndividualCustomer(partnerInfo!.accountInfo?.email!, "Partner portal", "Password@123");
      });

      const peoPartnerInfo = await DataFactory.peoPartnerBuilder()
        .withName("Peo" + partnerInfo!.accountInfo?.firstName)
        .withCompanyType("Internal")
        .withCustomBranding(true)
        .build();

      await test.step("5 - Add peo", async () => {
        await loginPage.login();

        await onboardingFlow.createPartnerAndAddPeoInAdminPortal(partnerInfo!, peoPartnerInfo!, true);
      });

      await test.step("6 - Activate peo", async () => {
        await authFlow.activateAndChangePassIndividualCustomer(peoPartnerInfo.accountInfo?.email!, "Partner portal", "Password@123");
      });

      await test.step("7 - Verify peo are added successfully", async () => {
        await onboardingFlow.redirectToHomePage();
      });
    },
  );

  test(
    "TC33 When creating a new Partner, the admin can choose to assign a sub-domain to that Partner, or not.",
    {
      tag: "@TC33_UI",
    },
    async ({ loginPage, onboardingFlow }) => {
      await test.step("1 - Login to Admin portal", async () => {
        await loginPage.login();
      });

      let partnerInfo: Partner;
      await test.step("2 - Create partner info", async () => {
        partnerInfo = await DataFactory.partnerBuilder()
          .withDepartmentName(process.env.DEPARTMENT_NAME!)
          .withPaymentOption("Partner/Consultant Owner")
          .withSubDomain("")
          .withProductsType([plans[0]])
          .build();
      });

      await test.step("3 - Create a new partner", async () => {
        await onboardingFlow.createPartnerAndAddPeoInAdminPortal(partnerInfo!);
      });

      await test.step("4 - Verify the domain is emty", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo);
      });
    },
  );

  test(
    "TC34 For Payment Options, the admin can select either Partner/Consultant Owner or Member Portal Consumer.",
    {
      tag: "@TC34",
    },
    async ({ loginPage, onboardingFlow }) => {
      await test.step("1 - Login to Admin portal", async () => {
        await loginPage.login();
      });

      const paymentOptions = ["Partner/Consultant Owner", "Member Portal Consumer"];

      for (const paymentOption of paymentOptions) {
        await test.step(`2 - Select ${paymentOption}`, async () => {
          const partnerInfo = await DataFactory.partnerBuilder()
            .withDepartmentName(process.env.DEPARTMENT_NAME!)
            .withIsPublic(false)
            .withPaymentOption(paymentOption)
            .withProductsType([plans[0]])
            .build();

          await test.step(`3 - Create partner with ${paymentOption}`, async () => {
            await onboardingFlow.createPartnerAndAddPeoInAdminPortal(partnerInfo);
          });

          await test.step(`4 - Verify create partner with ${paymentOption} successfully`, async () => {
            await onboardingFlow.verifyPartnerVisible(partnerInfo);
          });
        });
      }
    },
  );
});
