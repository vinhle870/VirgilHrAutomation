import { test } from "src/fixtures";
import { DataFactory, PersonDataGenerator } from "src/data-factory";
import { Partner } from "src/objects";
import { plans } from "src/constant/static-data";

test.describe("E2E -> Admin Portal -> Partner Management", { tag: ["@regression_UI", "@partner_management"] }, () => {
  test(
    "TC35 With Payment Options = Partner/Consultant Owner, the user will make payments in the Partner Portal, and the Partner account will be the owner of all Businesses.",
    {
      tag: "@TC35",
    },
    async ({ loginPage, onboardingFlow, purchaseFlow, authFlow }) => {
      test.setTimeout(120000);

      await test.step("1 - Login to Admin portal", async () => {
        await loginPage.login();
      });

      let partnerInfo: Partner;
      await test.step("2 - Create partner info", async () => {
        partnerInfo = await DataFactory.partnerBuilder()
          .withDepartmentName(process.env.DEPARTMENT_NAME!)
          .withPaymentOption("Partner/Consultant Owner")
          .withProductsType([plans[0]])
          .withBankTransfer(false)
          .withIsPublic(false)
          .build();
      });

      await test.step("3 - Create a new partner", async () => {
        await onboardingFlow.createPartnerAndAddPeoInAdminPortal(partnerInfo!);
      });

      await test.step("4 - Verify the domain is empty", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo!);
      });

      await test.step("5 - Activate partner", async () => {
        await authFlow.activateAndChangePassIndividualCustomer(partnerInfo!.accountInfo!.email, "Partner portal", "Password@123");
      });

      await test.step("6 - Buy plan", async () => {
        await purchaseFlow.buyPlanInPartnerPortal(partnerInfo!);
      });

      await test.step("7 - Create a new business", async () => {
        await onboardingFlow.createBusinessFromPartnerPortal(partnerInfo!);

      });

       await test.step("8 - Verify owner", async () => {
          await onboardingFlow.verifyOwnerVisible();
        });
    },
  );

  test(
    "TC36 With Payment Options = Member Portal Consumer, the user does not handle payments, and each Business will have its own owner.",
    {
      tag: "@TC36",
    },
    async ({ loginPage, onboardingFlow, authFlow }) => {
      await test.step("1 - Login to Admin portal", async () => {
        await loginPage.login();
      });

      let partnerInfo: any;
      await test.step("2 - Create partner info", async () => {
        partnerInfo = await DataFactory.partnerBuilder()
          .withDepartmentName(process.env.DEPARTMENT_NAME!)
          .withIsPublic(false)
          .withPaymentOption("Member Portal Consumer")
          .withProductsType([plans[0]])
          .build();
      });

      await test.step("3 - Create a new partner", async () => {
        await onboardingFlow.createPartnerAndAddPeoInAdminPortal(partnerInfo!);
      });

      await test.step("4 - Verify the partner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo);
      });

      await test.step("5 - Activate partner", async () => {
        await authFlow.activateAndChangePassIndividualCustomer(partnerInfo!.accountInfo?.email!, "Partner portal", "Password@123");
      });

      await test.step("6 - Create owner", async () => {
        const ownerIfno = await PersonDataGenerator.generate({ emailDomain: "chinasteel.xyz" });

        await onboardingFlow.createBusinessFromPartnerPortal(partnerInfo!, ownerIfno!);
      });

      await test.step("7 - Verify owner visible", async () => {
        await onboardingFlow.verifyOwnerVisible();
      });
    },
  );

  test(
    "TC37 Verify that when creating a new Partner, the admin can allow certain benefits to appear in the Member Portal.",
    {
      tag: "@TC37",
    },
    async ({ loginPage, onboardingFlow, authFlow }) => {
      await test.step("1 - Login to admin portal", async () => {
        await loginPage.login();
      });

      let partnerInfo: Partner;
      await test.step("2 - Create partner info", async () => {
        partnerInfo = await DataFactory.partnerBuilder()
          .withDepartmentName(process.env.DEPARTMENT_NAME!)
          .withPaymentOption("Partner/Consultant Owner")
          .withProductsType([plans[0]])
          .withBankTransfer(true)
          .withIsPublic(false)
          .build();
      });

      await test.step("3 - Create a new partner", async () => {
        await onboardingFlow.createPartnerAndAddPeoInAdminPortal(partnerInfo!);
      });

      await test.step("4 - Verify the partner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo!);
      });

      await test.step("5 - Activate partner", async () => {
        await authFlow.activateAndChangePassIndividualCustomer(partnerInfo.accountInfo!.email, "Partner portal", "Password@123");
      });

      await test.step("6 - Activate member", async () => {
        await authFlow.activateCustomerAccount(partnerInfo!.accountInfo?.email!, "Password@123");
      });

      await test.step("7 - Verify benifits", async () => {
        await onboardingFlow.redirectToHomePage();
      });
    },
  );

  test(
    "TC38 Verify that the admin can specify which plans a Partner can use for its Businesses via the Product Type field.",
    {
      tag: "@TC38",
    },
    async ({ loginPage, onboardingFlow }) => {
      await test.step("1 - Login to Admin portal", async () => {
        await loginPage.login();
      });

      let partnerInfo;
      await test.step("2 - Create partner info", async () => {
        partnerInfo = await DataFactory.partnerBuilder()
          .withDepartmentName(process.env.DEPARTMENT_NAME!)
          .withIsPublic(false)
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
    "TC39 Verify that the Partner email must be unique (no duplicates allowed).",
    {
      tag: "@TC39",
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

      await test.step("5 - Verify duplicated email", async () => {
        await onboardingFlow.verifyDuplicatedEmailWhenCreatingPartner(partnerInfo!);
      });
    },
  );
});
