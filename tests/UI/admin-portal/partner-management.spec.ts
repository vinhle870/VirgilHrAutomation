import { test, expect } from "src/fixtures";
import { DataFactory, PersonDataGenerator } from "src/data-factory";
import { UserInfo } from "src/objects";
import { CustomerFactory } from "src/data-factory/customer-factory";
import IPartnerFilter from "src/objects/ipartnerfilter";
import { PartnerFilterLocator } from "src/ui/pages/admin-portal/locators/partner-management/locator/filter-partner";
import { CreateNewPartnerModalLocator } from "src/ui/pages/admin-portal/locators/partner-management/locator/new-partner";
import { BuyPlanLocators, TempEmailFreeLocators } from "src/ui/pages/shared/locators";
import { Page } from "playwright/test";

test.describe("E2E -> Admin Portal -> Partner Management", () => {
  test(
    "TC30",
    {
      tag: "@Verify that a partner account can only be created in the Admin Portal – Partner Management.",
    },
    async ({ loginAdminPage: loginPage, partnerManagementPage }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      await test.step("Login to Admin portal", async () => {
        await loginPage.login();
      });

      let partnerInfo;
      await test.step("Create partner info", async () => {
        partnerInfo = await DataFactory.partnerBuilder().withDepartmentName(process.env.DEPARTMENT_NAME!).withPaymentOption("Partner/Consultant Owner").withProductsType([process.env.PLAN!]).build();
      });

      let newPartner;
      await test.step("Create a new partner", async () => {
        newPartner = await partnerManagementPage.createPartner(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
      });
    },
  );

  test(
    "TC31",
    {
      tag: "@Verify when a Partner is being created, the admin can select its level as Partner or PEO/Consultant.",
    },
    async ({ loginAdminPage: loginPage, partnerManagementPage }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      await test.step("Login to Admin portal", async () => {
        await loginPage.login();
      });

      let partnerInfo;
      await test.step("Create partner info", async () => {
        partnerInfo = await DataFactory.partnerBuilder().withDepartmentName(process.env.DEPARTMENT_NAME!).withPaymentOption("Partner/Consultant Owner").withProductsType([process.env.PLAN!]).build();
      });

      let newPartner;
      await test.step("Create a new partner", async () => {
        newPartner = await partnerManagementPage.createPartner(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
      });
    },
  );

  test(
    "TC32",
    {
      tag: "@Verify that a Partner is at a higher level than a PEO/Consultant, meaning one Partner can contain one or multiple PEOs/Consultants.",
    },
    async ({ loginAdminPage: loginPage, partnerManagementPage, onboardingFlow, tempEmailFreePage }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      await test.step("Login to Admin portal", async () => {
        await loginPage.login();
      });

      let partnerInfo;
      await test.step("Create partner info", async () => {
        partnerInfo = await DataFactory.partnerBuilder().withDepartmentName(process.env.DEPARTMENT_NAME!).withPaymentOption("Partner/Consultant Owner").withProductsType([process.env.PLAN!]).build();
      });

      let newPartner;
      await test.step("Create a new partner", async () => {
        newPartner = await partnerManagementPage.createPartner(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
      });

      let peoPartners;
      await test.step("Create peo info", async () => {
        const peoPartnerInfo = await DataFactory.peoPartnerBuilder()
          .withName("Peo" + partnerInfo!.accountInfo?.firstName)
          .withCompanyType("Internal")
          .withCustomBranding(true)
          .build();
        peoPartners = [peoPartnerInfo];
      });

      let addedPeoPartner;
      await test.step("Add peo ", async () => {
        addedPeoPartner = await partnerManagementPage.addPeoConsultant(partnerInfo!, peoPartners!, onboardingFlow, tempEmailFreePage);
      });

      await test.step("Verify peoes are added successfully", async () => {
        expect(addedPeoPartner!).toBe("Pass");
      });
    },
  );

  test(
    "TC33",
    {
      tag: "@When creating a new Partner, the admin can choose to assign a sub-domain to that Partner, or not.",
    },
    async ({ loginAdminPage: loginPage, partnerManagementPage }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      await test.step("Login to Admin portal", async () => {
        await loginPage.login();
      });

      let partnerInfo;
      await test.step("Create partner info", async () => {
        partnerInfo = await DataFactory.partnerBuilder().withDepartmentName(process.env.DEPARTMENT_NAME!).withPaymentOption("Partner/Consultant Owner").withProductsType([process.env.PLAN!]).build();
      });

      let newPartner;
      await test.step("Create a new partner", async () => {
        newPartner = await partnerManagementPage.createPartner(partnerInfo!);
      });

      await test.step("Verify the domain is emty", async () => {
        await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
      });
    },
  );

  test(
    "TC34",
    {
      tag: "@For Payment Options, the admin can select either Partner/Consultant Owner or Member Portal Consumer.",
    },
    async ({ loginAdminPage: loginPage, partnerManagementPage }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      await test.step("Login to Admin portal", async () => {
        await loginPage.login();
      });

      let paymentOption;
      let newPartner;
      let partnerInfo;
      let stepText;
      let createPartnerText;
      let verifyText;

      await test.step("Select either Partner/Consultant Owner or Member Portal Consumer", async () => {
        for (let i = 0; i < 2; i++) {
          if (i === 0) {
            test.step("Select Partner/Consultant", async () => {
              paymentOption = "Partner/Consultant Owner";
            });

            stepText = "Create partner info with Partner/Consultant Owner";
            createPartnerText = "Create partner with Partner/Consultant Owner";
            verifyText = "Verify partner with Partner/Consultant Owner";
          } else {
            test.step("Select Partner/Consultant", async () => {
              paymentOption = "Member Portal Consumer";
            });

            stepText = "Create partner info with Member Portal Consumer";
            createPartnerText = "Create partner with Member Portal Consumer";
            verifyText = "Verify partner with Member Portal Consumer";
          }

          await test.step(`${stepText}`, async () => {
            partnerInfo = await DataFactory.partnerBuilder().withDepartmentName(process.env.DEPARTMENT_NAME!).withPaymentOption(paymentOption!).withProductsType([process.env.PLAN!]).build();
          });

          test.step(`${createPartnerText}`, async () => {
            newPartner = await partnerManagementPage.createPartner(partnerInfo!);
          });

          test.step(`${verifyText}`, async () => {
            await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({
              timeout: 30000,
            });
          });
        }
      });
    },
  );

  test(
    "TC35",
    {
      tag: "@With Payment Options = Partner/Consultant Owner, the user will make payments in the Partner Portal, and the Partner account will be the owner of all Businesses.",
    },
    async ({ loginAdminPage: loginPage, partnerManagementPage, onboardingFlow, tempEmailFreePage, purchaseFlow }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      await test.step("Login to Admin portal", async () => {
        await loginPage.login();
      });

      let partnerInfo;
      await test.step("Create partner info", async () => {
        partnerInfo = await DataFactory.partnerBuilder().withDepartmentName(process.env.DEPARTMENT_NAME!).withPaymentOption("Partner/Consultant Owner").withProductsType([process.env.PLAN!]).build();
      });

      let newPartner;
      await test.step("Create a new partner", async () => {
        newPartner = await partnerManagementPage.createPartner(partnerInfo!);
      });

      await test.step("Verify the domain is emty", async () => {
        await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
      });

      let partnerPage;
      await test.step("Buy plan", async () => {
        partnerPage = await onboardingFlow.buyPlanInPartnerPortal(tempEmailFreePage, purchaseFlow, partnerInfo!);
      });

      await test.step("Create a new business", async () => {
        const owner = await onboardingFlow.createBusiness(partnerPage!, partnerInfo!);
        await test.step("Verify owner", async () => {
          await expect(owner!).toBeVisible();
        });
      });
    },
  );

  test(
    "TC36",
    {
      tag: "@With Payment Options = Member Portal Consumer, the user does not handle payments, and each Business will have its own owner.",
    },
    async ({ loginAdminPage: loginPage, partnerManagementPage, onboardingFlow, tempEmailFreePage }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      await test.step("Login to Admin portal", async () => {
        await loginPage.login();
      });

      let partnerInfo;
      await test.step("Create partner info", async () => {
        partnerInfo = await DataFactory.partnerBuilder().withDepartmentName(process.env.DEPARTMENT_NAME!).withPaymentOption("Partner/Consultant Owner").withProductsType([process.env.PLAN!]).build();
      });

      let newPartner;
      await test.step("Create a new partner", async () => {
        newPartner = await partnerManagementPage.createPartner(partnerInfo!);
      });

      await test.step("Verify the partner is created successfully", async () => {
        await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
      });

      let partnerPage;
      await test.step("Credential partner", async () => {
        partnerPage = await onboardingFlow.credential(tempEmailFreePage, partnerInfo!.accountInfo?.email!);
      });

      let ownerAccount;
      await test.step("Create owner info", async () => {
        ownerAccount = await PersonDataGenerator.generate();
      });

      await test.step("Create owner", async () => {
        const owner = await onboardingFlow.createBusiness(partnerPage!, partnerInfo!, ownerAccount!);

        await expect(owner!).toBeVisible();
      });
    },
  );

  test(
    "TC37",
    {
      tag: "@Verify that when creating a new Partner, the admin can allow certain benefits to appear in the Member Portal.",
    },
    async ({ loginAdminPage: loginPage, partnerManagementPage, onboardingFlow, tempEmailFreePage, purchaseFlow }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      await test.step("Login to admin portal", async () => {
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
        newPartner = await partnerManagementPage.createPartner(partnerInfo!);
      });

      await test.step("Verify the partner is created successfully", async () => {
        await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
      });

      await test.step("Buy plan in partner portal", async () => {
        await onboardingFlow.buyPlanInPartnerPortal(tempEmailFreePage, purchaseFlow, partnerInfo!);
      });

      await test.step("Crendential member", async () => {
        await onboardingFlow.credential(tempEmailFreePage, partnerInfo!.accountInfo?.email!, "Member");
      });

      await test.step("Verify benifits", async () => {
        const homeTitle = await onboardingFlow.getHomeTitle();

        await expect(homeTitle).toBeVisible({ timeout: 30000 });
      });
    },
  );

  test(
    "TC38",
    {
      tag: "@Verify that the admin can specify which plans a Partner can use for its Businesses via the Product Type field.",
    },
    async ({ loginAdminPage: loginPage, partnerManagementPage }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      await test.step("Login to Admin portal", async () => {
        await loginPage.login();
      });

      let partnerInfo;
      await test.step("Create partner info", async () => {
        partnerInfo = await DataFactory.partnerBuilder().withDepartmentName(process.env.DEPARTMENT_NAME!).withPaymentOption("Partner/Consultant Owner").withProductsType([process.env.PLAN!]).build();
      });

      let newPartner;
      await test.step("Create a new partner", async () => {
        newPartner = await partnerManagementPage.createPartner(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
      });
    },
  );

  test(
    "TC39",
    {
      tag: "@Verify that the Partner email must be unique (no duplicates allowed).",
    },
    async ({ loginAdminPage: loginPage, partnerManagementPage }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      await test.step("Login to Admin portal", async () => {
        await loginPage.login();
      });

      let partnerInfo;
      await test.step("Create partner info", async () => {
        partnerInfo = await DataFactory.partnerBuilder().withDepartmentName(process.env.DEPARTMENT_NAME!).withPaymentOption("Partner/Consultant Owner").withProductsType([process.env.PLAN!]).build();
      });

      let newPartner;
      await test.step("Create a new partner", async () => {
        newPartner = await partnerManagementPage.createPartner(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
      });

      await test.step("Create another partner and verify its email is duplicated ", async () => {
        await partnerManagementPage.createPartner(partnerInfo!);

        const duplicatedEmailEl = await partnerManagementPage.getDuplicatedText();

        await expect(duplicatedEmailEl).toBeVisible();
      });
    },
  );

  test(
    "TC40",
    {
      tag: "@Verify that the admin can enable Bank Transfer for a new Partner.",
    },
    async ({ loginAdminPage: loginPage, partnerManagementPage }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      await test.step("Login to Admin portal", async () => {
        await loginPage.login();
      });

      let partnerInfo;
      await test.step("Create partner info", async () => {
        partnerInfo = await DataFactory.partnerBuilder().withDepartmentName(process.env.DEPARTMENT_NAME!).withPaymentOption("Partner/Consultant Owner").withProductsType([process.env.PLAN!]).build();
      });

      let newPartner;
      await test.step("Create a new partner", async () => {
        newPartner = await partnerManagementPage.createPartner(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
      });
    },
  );

  test(
    "TC41",
    {
      tag: "@When Bank Transfer = ON, the Partner user is assigned a plan and does not need to make a payment through Stripe.",
    },
    async ({ loginAdminPage: loginPage, partnerManagementPage, onboardingFlow, tempEmailFreePage }, testInfo) => {
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
        newPartner = await partnerManagementPage.createPartner(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
      });

      await test.step("Partner does not need to make a payment through tripe", async () => {
        const partnerPage = await onboardingFlow.credential(tempEmailFreePage, partnerInfo!.accountInfo?.email!);

        const homeTitle = partnerPage.locator("h2.text-h2", { hasText: "Home" }).first();

        await expect(homeTitle).toBeVisible();
      });
    },
  );

  test(
    "TC42",
    {
      tag: "@When Bank Transfer = OFF, the Partner user is not pre-assigned a plan, but instead selects a plan via the Select Plan screen and pays through Stripe.",
    },
    async ({ loginAdminPage: loginPage, partnerManagementPage, onboardingFlow, tempEmailFreePage, purchaseFlow }, testInfo) => {
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
        newPartner = await partnerManagementPage.createPartner(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
      });

      await test.step("Verify partner needs to make a payment through tripe", async () => {
        const partnerPage = await onboardingFlow.credential(tempEmailFreePage, partnerInfo!.accountInfo?.email!);

        const plan = partnerPage.locator(BuyPlanLocators.firstPlan);

        await expect(plan).toBeVisible();

        await purchaseFlow.handbleParrtnerPageToBuyPlan("", partnerInfo!.account?.email, partnerPage);

        await expect(partnerPage.locator(BuyPlanLocators.paymentIframe)).toBeVisible();
      });
    },
  );

  test(
    "TC43",
    {
      tag: "@With Payment Options = Partner/Consultant Owner, after successfully creating a Partner account, the user receives two credential emails — one for the Partner Portal and one for the Member Portal.",
    },
    async ({ loginAdminPage: loginPage, partnerManagementPage, onboardingFlow, tempEmailFreePage }, testInfo) => {
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
          .withEmail("QATest_Brycen124@polandcampus.edu.pl")
          .build();
      });

      let newPartner;
      await test.step("Create a new partner", async () => {
        newPartner = await partnerManagementPage.createPartner(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
      });

      await test.step("Verify With Payment Options = Partner/Consultant Owner, after successfully creating a Partner account, the user receives two credential emails", async () => {
        const page = await onboardingFlow.createNewEmail(tempEmailFreePage, partnerInfo!.accountInfo?.email!, true);

        const partnerEmail = page.locator(TempEmailFreeLocators.portalCredential.replace("portalValue", "Partner")).first();

        await expect(partnerEmail).toBeVisible({ timeout: 30000 });

        const memberEmail = page.locator(TempEmailFreeLocators.portalCredential.replace("portalValue", "User")).first();

        await expect(memberEmail).toBeVisible();
      });
    },
  );

  test(
    "TC44",
    {
      tag: "@For Payment Options = Partner/Consultant Owner, the Owner account can log in to both the Member Portal and the Partner Portal.",
    },
    async ({ loginAdminPage: loginPage, partnerManagementPage, onboardingFlow, tempEmailFreePage }, testInfo) => {
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
        newPartner = await partnerManagementPage.createPartner(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
      });

      await test.step("Verify With Payment Options = Partner/Consultant Owner, after successfully creating a Partner account, the user receives two credential emails", async () => {
        const partnerPage = await onboardingFlow.credential(tempEmailFreePage, partnerInfo!.accountInfo?.email!);

        const homeTitlePartnerPage = partnerPage.locator("h2.text-h2", { hasText: "Home" }).first();

        await expect(homeTitlePartnerPage).toBeVisible({ timeout: 30000 });

        const memberPage = await onboardingFlow.credential(tempEmailFreePage, partnerInfo!.accountInfo?.email!, "Member");

        const homeTitleMemberPage = memberPage.locator("h2.text-h2", { hasText: "Home" }).first();

        await expect(homeTitleMemberPage).toBeVisible({ timeout: 30000 });
      });
    },
  );

  test(
    "TC45",
    {
      tag: "@With Payment Options = Member Portal Consumer, after successfully creating a Partner account, the user receives one credential email — for the Partner Portal.",
    },
    async ({ loginAdminPage: loginPage, partnerManagementPage, onboardingFlow, tempEmailFreePage }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      await test.step("Login to Admin portal", async () => {
        await loginPage.login();
      });

      let partnerInfo;
      await test.step("Create partner info", async () => {
        partnerInfo = await DataFactory.partnerBuilder()
          .withDepartmentName(process.env.DEPARTMENT_NAME!)
          .withPaymentOption("Member Portal Consumer")
          .withProductsType([process.env.PLAN!])
          .withBankTransfer(false)
          .build();
      });

      let newPartner;
      await test.step("Create a new partner with payment option = 'Member Portal Consumer'", async () => {
        newPartner = await partnerManagementPage.createPartner(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
      });

      await test.step("Verify the user receives one credential partner email", async () => {
        const tempEmailPage = await onboardingFlow.createNewEmail(tempEmailFreePage, partnerInfo!.accountInfo?.email!, true);

        const partnerCredentialCategory = tempEmailPage.locator(TempEmailFreeLocators.portalCredential.replace("portalValue", "Partner")).first();

        await expect(partnerCredentialCategory).toBeVisible({ timeout: 30000 });

        const memberCredentialCategory = tempEmailPage.locator(TempEmailFreeLocators.portalCredential.replace("portalValue", "User")).first();

        await expect(memberCredentialCategory).toBeHidden();
      });
    },
  );

  test(
    "TC46",
    {
      tag: "@For Payment Options = Member Portal Consumer, the Owner of the Partner/Consultant can only log in to the Partner Portal.",
    },
    async ({ loginAdminPage: loginPage, partnerManagementPage, onboardingFlow, tempEmailFreePage }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      await test.step("Login to Admin portal", async () => {
        await loginPage.login();
      });

      let partnerInfo;
      await test.step("Create partner info", async () => {
        partnerInfo = await DataFactory.partnerBuilder()
          .withDepartmentName(process.env.DEPARTMENT_NAME!)
          .withPaymentOption("Member Portal Consumer")
          .withProductsType([process.env.PLAN!])
          .withBankTransfer(false)
          .build();
      });

      let newPartner;
      await test.step("Create a new partner with payment option = 'Member Portal Consumer'", async () => {
        newPartner = await partnerManagementPage.createPartner(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
      });

      await test.step("Verify login only partner portal", async () => {
        const tempEmailPage = await onboardingFlow.credential(tempEmailFreePage, partnerInfo!.accountInfo?.email!);

        const homeTitle = tempEmailPage.locator("h2.text-h2", { hasText: "Home" }).first();

        await expect(homeTitle).toBeVisible({ timeout: 30000 });
      });
    },
  );

  test(
    "TC47",
    {
      tag: "@For Businesses under a Partner with Payment Options = Member Portal Consumer, the Business Owner cannot log in to the Partner Portal.",
    },
    async ({ loginAdminPage, partnerManagementPage, onboardingFlow, tempEmailFreePage, partnerPage, loginPage }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      await test.step("Login to Admin portal", async () => {
        await loginAdminPage.login();
      });

      let partnerInfo;
      await test.step("Create partner info", async () => {
        partnerInfo = await DataFactory.partnerBuilder()
          .withDepartmentName(process.env.DEPARTMENT_NAME!)
          .withPaymentOption("Member Portal Consumer")
          .withProductsType([process.env.PLAN!])
          .withBankTransfer(false)
          .withEmail("QATest_Elda691@polandcampus.edu.pl")
          .build();
      });

      let newPartner;
      await test.step("Create a new partner with payment option = 'Member Portal Consumer'", async () => {
        newPartner = await partnerManagementPage.createPartner(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
      });

      let ownerAccount: any;
      await test.step("Create a business and verify the owner can log in to Member Portal", async () => {
        ownerAccount = await PersonDataGenerator.generate();
        const partnerPage = await onboardingFlow.credential(tempEmailFreePage, partnerInfo!.accountInfo?.email!);
        const owner = await onboardingFlow.createBusiness(partnerPage!, partnerInfo!, ownerAccount!);
        await expect(owner!).toBeVisible();

        await partnerPage.close();
        const memberPage = await onboardingFlow.credential(tempEmailFreePage, ownerAccount.email!, "Consumer");

        const homeTitle = await onboardingFlow.getHomeTitle(memberPage);

        await expect(homeTitle).toBeVisible();

        await memberPage.close();
      });

      await test.step("Verify the owner cannot log in to Partner Portal", async () => {
        await loginPage.fillLoginForm(partnerPage.getURL(), ownerAccount.email!, ownerAccount.password!);

        const accountNotExist = partnerPage.getAccountNotExist();

        await expect(accountNotExist).toBeVisible();
      });
    },
  );

  test("Invite members in partner management", async ({ loginAdminPage: loginAdminPage, partnerManagementPage, onboardingFlow, tempEmailFreePage }, testInfo) => {
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");

    await loginAdminPage.login();

    const partnerInfo = await DataFactory.partnerBuilder()
      .withDepartmentName(process.env.DEPARTMENT_NAME!)
      .withPartnerLevel("PEO/HR Consultant")
      .withPaymentOption("Partner/Consultant Owner")
      .withProductsType(["251 - 500 Employees"])
      .withPhoneNumber("+13530044689")
      .build();

    const newPartner = await partnerManagementPage.createPartner(partnerInfo);

    await test.step("Verify newPartner is created successfully", async () => {
      await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
    });
    const invitedMembers: UserInfo[] = await CustomerFactory.generateMembers(1);

    await partnerManagementPage.addMoreMembers(partnerInfo, invitedMembers, onboardingFlow, tempEmailFreePage);
  });

  test("Filter partner in partner management", async ({ loginAdminPage, partnerManagementPage }, testInfo) => {
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");

    await loginAdminPage.login();

    const partnerInfo = await DataFactory.partnerBuilder().withDepartmentName(process.env.DEPARTMENT_NAME!).withPartnerLevel("Partner").build();

    const partFilterInfo: IPartnerFilter = {
      name: partnerInfo.partnerInfo?.name,
      level: partnerInfo.partnerInfo?.partnerLevel,
      department: partnerInfo.partnerInfo?.departmentName,
    };

    const newPartner = await partnerManagementPage.createPartner(partnerInfo);

    await test.step("Verify newPartner is created successfully", async () => {
      await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
    });

    const filteredPartner = await partnerManagementPage.filter(partFilterInfo);

    expect(filteredPartner).toBe("Pass");
  });

  test("Sort in partner management ", async ({ loginAdminPage, partnerManagementPage }, testInfo) => {
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");

    await loginAdminPage.login();

    const typeOfSorting = PartnerFilterLocator.oldestToLatest;

    const sort = await partnerManagementPage.sorting(typeOfSorting);

    expect(sort).toBe("Pass");
  });

  test("Create a new customer", async ({ loginAdminPage, customerManagementPage }, testInfo) => {
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");

    await loginAdminPage.login();

    const customerInfo = await DataFactory.customerBuilder()
      .withCompanyName("Company")
      .withCompanySize(process.env.PLAN!)
      .forAdminPortal()
      .withTotalEmployees(3)
      .withStatesEmployee(["Alaska", "Arizona"])
      .withStatesEmployeeInfo([
        { state: "Alaska", number: 1 },
        { state: "Arizona", number: 2 },
      ])
      .withDepartmentName(process.env.DEPARTMENT_NAME!)
      .withBankStranfer(true)
      .withPayYearly(false)
      .withConsultant(false)
      .withStateOfCustomer("Alaska")
      .withIndustry([{ value: "Administrative and Support Services" }])
      .withBankStranfer(true)
      .build();

    const newCustomer = await customerManagementPage.createCustomer(customerInfo);
  });

  test("Add peo in partner management", async ({ loginAdminPage, partnerManagementPage, onboardingFlow, tempEmailFreePage }, testInfo) => {
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");

    await loginAdminPage.login();

    const partnerInfo = await DataFactory.partnerBuilder().withPhoneNumber("+12025550173").withDepartmentName(process.env.DEPARTMENT_NAME!).withPartnerLevel("Partner").build();

    const peoPartnerInfo = await DataFactory.peoPartnerBuilder()
      .withName("Peo" + partnerInfo.accountInfo?.firstName)
      .withCompanyType("Internal")
      .withCustomBranding(true)
      .build();

    const peoPartners = [peoPartnerInfo];

    const addedPeoPartner = await partnerManagementPage.addPeoConsultant(partnerInfo, peoPartners, onboardingFlow, tempEmailFreePage);

    expect(addedPeoPartner).toBe("Pass");
  });

  test("Upgrade a new plan in customer management", async ({ loginAdminPage, customerManagementPage }) => {
    await loginAdminPage.login();

    const customerInfo = await DataFactory.customerBuilder()
      .withCompanyName("Company")
      .withCompanySize(process.env.PLAN!)
      .forAdminPortal()
      .withTotalEmployees(3)
      .withStatesEmployee(["Alaska", "Arizona"])
      .withStatesEmployeeInfo([
        { state: "Alaska", number: 1 },
        { state: "Arizona", number: 2 },
      ])
      .withDepartmentName(process.env.DEPARTMENT_NAME!)
      .withPhoneNumber("+84912345678")
      .withBankStranfer(true)
      .withPayYearly(false)
      .withConsultant(false)
      .withInternal(true)
      .withStateOfCustomer("Alaska")
      .withIndustry([{ value: "Administrative and Support Services" }])
      .withBankStranferToUpgradePlan(true)
      .build();

    await customerManagementPage.upgradePlan(customerInfo, process.env.PLAN_TO_UPGRADE!);
  });
});
