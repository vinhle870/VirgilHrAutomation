import { test, expect } from "src/fixtures";
import { DataFactory, PersonDataGenerator } from "src/data-factory";
import { Partner } from "src/objects";
import { plans } from "src/constant/static-data";

test.describe("E2E -> Admin Portal -> Partner Management", () => {
  test(
    "TC30 Verify that a partner account can only be created in the Admin Portal – Partner Management.",
    {
      tag: "@TC30",
    },
    async ({ loginPage, onboardingFlow }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      await test.step("Login to Admin portal", async () => {
        await loginPage.login();
      });

      let partnerInfo = await DataFactory.partnerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withPaymentOption("Partner/Consultant Owner")
        .withIsPublic(false)
        .withProductsType([plans[0]])
        .build();

      await test.step("Create a new partner", async () => {
        await onboardingFlow.createPartnerAndAddPeo(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo!);
      });
    },
  );

  test(
    "TC31 Verify when a Partner is being created, the admin can select its level as Partner or PEO/Consultant.",
    {
      tag: "@TC31",
    },
    async ({ loginPage: loginPage, onboardingFlow }, testInfo) => {
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
          .withBankTransfer(false)
          .withProductsType([plans[0]])
          .withIsPublic(false)
          .build();
      });

      await test.step("Create a new partner", async () => {
        await onboardingFlow.createPartnerAndAddPeo(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo!);
      });
    },
  );

  test(
    "TC32 Verify that a Partner is at a higher level than a PEO/Consultant, meaning one Partner can contain one or multiple PEOs/Consultants.",
    {
      tag: "@TC32",
    },
    async ({ loginPage, authFlow, onboardingFlow }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      await test.step("Login to Admin portal", async () => {
        await loginPage.login();
      });

      const partnerInfo = await DataFactory.partnerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withPaymentOption("Partner/Consultant Owner")
        .withIsPublic(false)
        .withProductsType([plans[0]])
        .withBankTransfer(true)
        .build();

      await test.step("Create a new partner", async () => {
        await onboardingFlow.createPartnerAndAddPeo(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo!);
      });

      await test.step("Activate partner", async () => {
        await authFlow.activateIndividualCustomerAccountAndChangePassword(partnerInfo!.accountInfo?.email!, "Partner portal", "Password@123");
      });

      const peoPartnerInfo = await DataFactory.peoPartnerBuilder()
        .withName("Peo" + partnerInfo!.accountInfo?.firstName)
        .withCompanyType("Internal")
        .withCustomBranding(true)
        .build();
      const peoPartners = [peoPartnerInfo];

      await test.step("Add peo ", async () => {
        await loginPage.login();

        await onboardingFlow.createPartnerAndAddPeo(partnerInfo!, peoPartners!, true);
      });

      await test.step("Activate peo", async () => {
        for (const member of peoPartners!) await authFlow.activateIndividualCustomerAccountAndChangePassword(member.accountInfo?.email!, "Partner portal", "Password@123");
      });

      await test.step("Verify peoes are added successfully", async () => {
        await onboardingFlow.redirectToHomePage();
      });
    },
  );

  test(
    "TC33 When creating a new Partner, the admin can choose to assign a sub-domain to that Partner, or not.",
    {
      tag: "@TC33",
    },
    async ({ loginPage, onboardingFlow }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      await test.step("Login to Admin portal", async () => {
        await loginPage.login();
      });

      let partnerInfo: Partner;
      await test.step("Create partner info", async () => {
        partnerInfo = await DataFactory.partnerBuilder()
          .withDepartmentName(process.env.DEPARTMENT_NAME!)
          .withPaymentOption("Partner/Consultant Owner")
          .withSubDomain("")
          .withProductsType([plans[0]])
          .build();
      });

      await test.step("Create a new partner", async () => {
        await onboardingFlow.createPartnerAndAddPeo(partnerInfo!);
      });

      await test.step("Verify the domain is emty", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo);
      });
    },
  );

  test(
    "TC34 For Payment Options, the admin can select either Partner/Consultant Owner or Member Portal Consumer.",
    {
      tag: "@TC34",
    },
    async ({ loginPage, onboardingFlow }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;
      testInfo.skip(!base, "API_BASE_URL is not configured");

      await test.step("Login to Admin portal", async () => {
        await loginPage.login();
      });

      const paymentOptions = ["Partner/Consultant Owner", "Member Portal Consumer"];

      for (const paymentOption of paymentOptions) {
        await test.step(`Select ${paymentOption}`, async () => {
          const partnerInfo = await DataFactory.partnerBuilder()
            .withDepartmentName(process.env.DEPARTMENT_NAME!)
            .withIsPublic(false)
            .withPaymentOption(paymentOption)
            .withProductsType([plans[0]])
            .build();

          await test.step(`Create partner with ${paymentOption}`, async () => {
            await onboardingFlow.createPartnerAndAddPeo(partnerInfo);
          });

          await test.step(`Verify create partner with ${paymentOption} successfully`, async () => {
            await onboardingFlow.verifyPartnerVisible(partnerInfo);
          });
        });
      }
    },
  );

  test(
    "TC35 With Payment Options = Partner/Consultant Owner, the user will make payments in the Partner Portal, and the Partner account will be the owner of all Businesses.",
    {
      tag: "@TC35",
    },
    async ({ loginPage, onboardingFlow, purchaseFlow, authFlow }, testInfo) => {
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
          .withProductsType([plans[0]])
          .withBankTransfer(false)
          .withIsPublic(false)
          .build();
      });

      await test.step("Create a new partner", async () => {
        await onboardingFlow.createPartnerAndAddPeo(partnerInfo!);
      });

      await test.step("Verify the domain is emty", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo!);
      });

      await test.step("Activate partner", async () => {
        await authFlow.activateIndividualCustomerAccountAndChangePassword(partnerInfo!.accountInfo!.email, "Partner portal", "Password@123");
      });

      await test.step("Buy plan", async () => {
        await purchaseFlow.buyPlanInPartnerPortal(partnerInfo!);
      });

      await test.step("Create a new business", async () => {
        await onboardingFlow.createBusinessFromPartnerPortal(partnerInfo!);
        await test.step("Verify owner", async () => {
          await onboardingFlow.verifyOwnerVisible();
        });
      });
    },
  );

  test(
    "TC36 With Payment Options = Member Portal Consumer, the user does not handle payments, and each Business will have its own owner.",
    {
      tag: "@TC36",
    },
    async ({ loginPage, onboardingFlow, authFlow }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      await test.step("Login to Admin portal", async () => {
        await loginPage.login();
      });

      let partnerInfo: any;
      await test.step("Create partner info", async () => {
        partnerInfo = await DataFactory.partnerBuilder()
          .withDepartmentName(process.env.DEPARTMENT_NAME!)
          .withIsPublic(false)
          .withPaymentOption("Member Portal Consumer")
          .withProductsType([plans[0]])
          .build();
      });

      await test.step("Create a new partner", async () => {
        await onboardingFlow.createPartnerAndAddPeo(partnerInfo!);
      });

      await test.step("Verify the partner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo);
      });

      await test.step("Activate partner", async () => {
        await authFlow.activateIndividualCustomerAccountAndChangePassword(partnerInfo!.accountInfo?.email!, "Partner portal", "Password@123");
      });

      await test.step("Create owner", async () => {
        const ownerIfno = await PersonDataGenerator.generate();

        await onboardingFlow.createBusinessFromPartnerPortal(partnerInfo!, ownerIfno!);
      });

      await test.step("Verify owner visible", async () => {
        await onboardingFlow.verifyOwnerVisible();
      });
    },
  );

  test(
    "TC37 Verify that when creating a new Partner, the admin can allow certain benefits to appear in the Member Portal.",
    {
      tag: "@TC37",
    },
    async ({ loginPage, onboardingFlow, authFlow }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      await test.step("Login to admin portal", async () => {
        await loginPage.login();
      });

      const partnerInfo = await DataFactory.partnerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withPaymentOption("Partner/Consultant Owner")
        .withProductsType([plans[0]])
        .withBankTransfer(true)
        .build();

      await test.step("Create a new partner", async () => {
        await onboardingFlow.createPartnerAndAddPeo(partnerInfo!);
      });

      await test.step("Verify the partner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo!);
      });

      await test.step("Credential partner", async () => {
        await authFlow.activateIndividualCustomerAccountAndChangePassword(partnerInfo.accountInfo!.email, "Partner portal", "Password@123");
      });

      await test.step("Crendential member", async () => {
        await authFlow.activateCustomerAccount(partnerInfo!.accountInfo?.email!, "Password@123");
      });

      await test.step("Verify benifits", async () => {
        await onboardingFlow.redirectToHomePage();
      });
    },
  );

  test(
    "TC38 Verify that the admin can specify which plans a Partner can use for its Businesses via the Product Type field.",
    {
      tag: "@TC38",
    },
    async ({ loginPage, onboardingFlow }, testInfo) => {
      await test.step("Login to Admin portal", async () => {
        await loginPage.login();
      });

      let partnerInfo;
      await test.step("Create partner info", async () => {
        partnerInfo = await DataFactory.partnerBuilder()
          .withDepartmentName(process.env.DEPARTMENT_NAME!)
          .withIsPublic(false)
          .withPaymentOption("Partner/Consultant Owner")
          .withProductsType([plans[0]])
          .build();
      });

      await test.step("Create a new partner", async () => {
        await onboardingFlow.createPartnerAndAddPeo(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo!);
      });
    },
  );

  test(
    "TC39 Verify that the Partner email must be unique (no duplicates allowed).",
    {
      tag: "@TC39",
    },
    async ({ loginPage, onboardingFlow }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      await test.step("Login to Admin portal", async () => {
        await loginPage.login();
      });

      let partnerInfo;
      await test.step("Create partner info", async () => {
        partnerInfo = await DataFactory.partnerBuilder()
          .withIsPublic(false)
          .withDepartmentName(process.env.DEPARTMENT_NAME!)
          .withPaymentOption("Partner/Consultant Owner")
          .withProductsType([plans[0]])
          .build();
      });

      await test.step("Create a new partner", async () => {
        await onboardingFlow.createPartnerAndAddPeo(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo!);
      });

      await test.step("Create another partner and verify its email is duplicated ", async () => {
        await onboardingFlow.createPartnerAndAddPeo(partnerInfo!);

        const duplicatedEmailEl = await onboardingFlow.getDuplicatedText();

        await expect(duplicatedEmailEl).toBeVisible();
      });
    },
  );

  test(
    "TC40 Verify that the admin can enable Bank Transfer for a new Partner.",
    {
      tag: "@TC40",
    },
    async ({ loginPage, onboardingFlow }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      await test.step("Login to Admin portal", async () => {
        await loginPage.login();
      });

      let partnerInfo;
      await test.step("Create partner info", async () => {
        partnerInfo = await DataFactory.partnerBuilder()
          .withIsPublic(false)
          .withDepartmentName(process.env.DEPARTMENT_NAME!)
          .withPaymentOption("Partner/Consultant Owner")
          .withProductsType([plans[0]])
          .build();
      });

      await test.step("Create a new partner", async () => {
        await onboardingFlow.createPartnerAndAddPeo(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo!);
      });
    },
  );

  test(
    "TC41 When Bank Transfer = ON, the Partner user is assigned a plan and does not need to make a payment through Stripe.",
    {
      tag: "@TC41",
    },
    async ({ loginPage, authFlow, onboardingFlow }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      await test.step("Login to Admin portal", async () => {
        await loginPage.login();
      });

      const partnerInfo = await DataFactory.partnerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withPaymentOption("Partner/Consultant Owner")
        .withProductsType([plans[0]])
        .withBankTransfer(true)
        .withIsPublic(false)
        .build();

      await test.step("Create a new partner", async () => {
        await onboardingFlow.createPartnerAndAddPeo(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo!);
      });

      await test.step("Partner does not need to make a payment through tripe", async () => {
        await authFlow.activateIndividualCustomerAccountAndChangePassword(partnerInfo!.accountInfo?.email!, "Partner portal", "Password@123");

        await onboardingFlow.redirectToHomePage();
      });
    },
  );

  test(
    "TC42 When Bank Transfer = OFF, the Partner user is not pre-assigned a plan, but instead selects a plan via the Select Plan screen and pays through Stripe.",
    {
      tag: "@TC42",
    },
    async ({ loginPage, authFlow, purchaseFlow, onboardingFlow }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      await test.step("Login to Admin portal", async () => {
        await loginPage.login();
      });

      const partnerInfo = await DataFactory.partnerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withPaymentOption("Partner/Consultant Owner")
        .withProductsType([plans[0]])
        .withBankTransfer(false)
        .withIsPublic(false)
        .build();

      await test.step("Create a new partner", async () => {
        await onboardingFlow.createPartnerAndAddPeo(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo!);
      });

      await test.step("Verify partner needs to make a payment through tripe", async () => {
        await authFlow.activateIndividualCustomerAccountAndChangePassword(partnerInfo!.accountInfo?.email!, "Partner portal", "Password@123");

        await onboardingFlow.validatePlanVisible();

        await purchaseFlow.selectPlanBeforePurchase("", partnerInfo!.accountInfo?.email, plans[0]);

        //   await expect(await partnerPage.getPlanToBuy(BuyPlanLocators.paymentIframe)).toBeVisible();
      });
    },
  );

  test(
    "TC43 With Payment Options = Partner/Consultant Owner, after successfully creating a Partner account, the user receives two credential emails — one for the Partner Portal and one for the Member Portal.",
    {
      tag: "@TC43",
    },
    async ({ loginPage, onboardingFlow }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      await test.step("Login to Admin portal", async () => {
        await loginPage.login();
      });

      const partnerInfo = await DataFactory.partnerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withPaymentOption("Partner/Consultant Owner")
        .withProductsType([plans[0]])
        .withBankTransfer(false)
        .withIsPublic(false)
        .build();

      await test.step("Create a new partner", async () => {
        await onboardingFlow.createPartnerAndAddPeo(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo!);
      });

      await test.step("Verify With Payment Options = Partner/Consultant Owner, after successfully creating a Partner account, the user receives two credential emails", async () => {
        await onboardingFlow.validateReceivedTwoEmails(partnerInfo!);
      });
    },
  );

  test(
    "TC44 For Payment Options = Partner/Consultant Owner, the Owner account can log in to both the Member Portal and the Partner Portal.",
    {
      tag: "@TC44",
    },
    async ({ loginPage, authFlow, onboardingFlow }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      await test.step("Login to Admin portal", async () => {
        await loginPage.login();
      });

      const partnerInfo = await DataFactory.partnerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withPaymentOption("Partner/Consultant Owner")
        .withProductsType([plans[0]])
        .withBankTransfer(true)
        .withIsPublic(false)
        .build();

      await test.step("Create a new partner", async () => {
        await onboardingFlow.createPartnerAndAddPeo(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo!);
      });

      await test.step("Verify With Payment Options = Partner/Consultant Owner, after successfully creating a Partner account, the user receives two credential emails", async () => {
        await authFlow.activateIndividualCustomerAccountAndChangePassword(partnerInfo!.accountInfo?.email!, "Partner portal", "Password@123");

        await onboardingFlow.redirectToHomePage();

        await authFlow.activateIndividualCustomerAccountAndChangePassword(partnerInfo!.accountInfo?.email!, "Member", "Password@123");

        await onboardingFlow.redirectToHomePage();
      });
    },
  );

  test(
    "TC45 With Payment Options = Member Portal Consumer, after successfully creating a Partner account, the user receives one credential email — for the Partner Portal.",
    {
      tag: "@45",
    },
    async ({ loginPage: loginPage, onboardingFlow }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      await test.step("Login to Admin portal", async () => {
        await loginPage.login();
      });

      const partnerInfo = await DataFactory.partnerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withPaymentOption("Member Portal Consumer")
        .withProductsType([plans[0]])
        .withBankTransfer(true)
        .withIsPublic(false)
        .build();

      await test.step("Create a new partner with payment option = 'Member Portal Consumer'", async () => {
        await onboardingFlow.createPartnerAndAddPeo(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo!);
      });

      await test.step("Verify the user receives one credential partner email", async () => {
        await onboardingFlow.validateReceivedOneEmail(partnerInfo!);
      });
    },
  );

  test(
    "TC46 For Payment Options = Member Portal Consumer, the Owner of the Partner/Consultant can only log in to the Partner Portal.",
    {
      tag: "@46",
    },
    async ({ loginPage, authFlow, onboardingFlow }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      await test.step("Login to Admin portal", async () => {
        await loginPage.login();
      });

      const partnerInfo = await DataFactory.partnerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withPaymentOption("Member Portal Consumer")
        .withProductsType([plans[0]])
        .withBankTransfer(true)
        .withIsPublic(false)
        .build();

      await test.step("Create a new partner with payment option = 'Member Portal Consumer'", async () => {
        await onboardingFlow.createPartnerAndAddPeo(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo!);
      });

      await test.step("Verify login only partner portal", async () => {
        await authFlow.activateIndividualCustomerAccountAndChangePassword(partnerInfo!.accountInfo?.email!, "Partner Portal", "Password@123");

        await onboardingFlow.redirectToHomePage();
      });
    },
  );

  test(
    "TC47 For Businesses under a Partner with Payment Options = Member Portal Consumer, the Business Owner cannot log in to the Partner Portal.",
    {
      tag: "@TC47",
    },
    async ({ loginPage, onboardingFlow, partnerPage, authFlow }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      await test.step("Login to Admin portal", async () => {
        await loginPage.login();
      });

      const partnerInfo = await DataFactory.partnerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withPaymentOption("Member Portal Consumer")
        .withProductsType([plans[0]])
        .withBankTransfer(true)
        .withIsPublic(false)
        .build();

      await test.step("Create a new partner with payment option = 'Member Portal Consumer'", async () => {
        await onboardingFlow.createPartnerAndAddPeo(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo!);
      });

      const ownerAccount = await PersonDataGenerator.generate();
      await test.step("Create a business and verify the owner can log in to Member Portal", async () => {
        await authFlow.activateIndividualCustomerAccountAndChangePassword(partnerInfo!.accountInfo?.email!, "Partner portal", "Password@123");

        await onboardingFlow.createBusinessFromPartnerPortal(partnerInfo!, ownerAccount!);

        await onboardingFlow.verifyOwnerVisible();

        await authFlow.activateIndividualCustomerAccountAndSetPassword(ownerAccount.email!, "Consumer", "Password@123");

        await onboardingFlow.redirectToHomePage();
      });

      await test.step("Verify the owner cannot log in to Partner Portal", async () => {
        await loginPage.fillLoginForm(partnerPage.getURL(), ownerAccount.email!, ownerAccount.password!);

        await onboardingFlow.validateAccountNotExist();
      });
    },
  );
});
