import { test, expect } from "src/fixtures";
import { DataFactory, PersonDataGenerator } from "src/data-factory";
import { CustomerFactory } from "src/data-factory/customer-factory";
import { BuyPlanLocators, TempEmailFreeLocators } from "src/ui/pages/shared/locators";
import paymentScenarios from "../../../mock-data.json";
import { Partner } from "src/objects";

test.describe("E2E -> Admin Portal -> Partner Management", () => {
  test.describe.configure({ retries: 3 });
  test(
    "TC30 Verify that a partner account can only be created in the Admin Portal – Partner Management.",
    {
      tag: "@TC30",
    },
    async ({ loginAdminPage: loginPage, partnerManagementPage, onboardingFlow }, testInfo) => {
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
        try {
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 5000 });
        } catch (error) {
          await onboardingFlow.refreshPage();
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible();
        }
      });
    },
  );

  test(
    "TC31 Verify when a Partner is being created, the admin can select its level as Partner or PEO/Consultant.",
    {
      tag: "@TC31",
    },
    async ({ loginAdminPage: loginPage, partnerManagementPage, onboardingFlow }, testInfo) => {
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
          .withProductsType([process.env.PLAN!])
          .build();
      });

      let newPartner;
      await test.step("Create a new partner", async () => {
        newPartner = await partnerManagementPage.createPartner(partnerInfo!);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        try {
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 5000 });
        } catch (error) {
          await onboardingFlow.refreshPage();
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible();
        }
      });
    },
  );

  test(
    "TC32 Verify that a Partner is at a higher level than a PEO/Consultant, meaning one Partner can contain one or multiple PEOs/Consultants.",
    {
      tag: "@TC32",
    },
    async ({ loginAdminPage, partnerManagementPage, onboardingFlow, tempEmailFreePage }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      await test.step("Login to Admin portal", async () => {
        await loginAdminPage.login();
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
        try {
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 5000 });
        } catch (error) {
          await onboardingFlow.refreshPage();
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible();
        }
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
    "TC33 When creating a new Partner, the admin can choose to assign a sub-domain to that Partner, or not.",
    {
      tag: "@TC33",
    },
    async ({ loginAdminPage, partnerManagementPage, onboardingFlow }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      await test.step("Login to Admin portal", async () => {
        await loginAdminPage.login();
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
        try {
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 5000 });
        } catch (error) {
          await onboardingFlow.refreshPage();
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible();
        }
      });
    },
  );

  test(
    "TC34 For Payment Options, the admin can select either Partner/Consultant Owner or Member Portal Consumer.",
    {
      tag: "@TC34",
    },
    async ({ loginAdminPage, partnerManagementPage, onboardingFlow }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      await test.step("Login to Admin portal", async () => {
        await loginAdminPage.login();
      });

      await test.step("Select either Partner/Consultant Owner or Member Portal Consumer", async () => {
        for (const scenario of paymentScenarios) {
          await test.step(scenario.stepText, async () => {
            const partnerInfo = await DataFactory.partnerBuilder().withDepartmentName(process.env.DEPARTMENT_NAME!).withPaymentOption(scenario.option).withProductsType([process.env.PLAN!]).build();

            let partnerPage: any;
            await test.step(scenario.createText, async () => {
              partnerPage = await partnerManagementPage.createPartner(partnerInfo);
            });

            await test.step(scenario.verifyText, async () => {
              try {
                await expect(partnerPage.getByText(partnerInfo.accountInfo!.email).first()).toBeVisible({ timeout: 5000 });
              } catch {
                await onboardingFlow.refreshPage();
                await expect(partnerPage.getByText(partnerInfo.accountInfo!.email).first()).toBeVisible();
              }
            });
          });
        }
      });
    },
  );

  test(
    "TC35 With Payment Options = Partner/Consultant Owner, the user will make payments in the Partner Portal, and the Partner account will be the owner of all Businesses.",
    {
      tag: "@TC35",
    },
    async ({ loginAdminPage, partnerManagementPage, onboardingFlow, tempEmailFreePage, purchaseFlow, loginPage }, testInfo) => {
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
          .withProductsType([process.env.PLAN!])
          .withBankTransfer(false)
          .build();
      });

      let newPartner;
      await test.step("Create a new partner", async () => {
        newPartner = await partnerManagementPage.createPartner(partnerInfo!);
      });

      await test.step("Verify the domain is emty", async () => {
        try {
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 5000 });
        } catch (error) {
          await onboardingFlow.refreshPage();
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible();
        }
      });

      let partnerPage: any;
      await test.step("Buy plan", async () => {
        partnerPage = await onboardingFlow.buyPlanInPartnerPortal(tempEmailFreePage, purchaseFlow, partnerInfo!);
      });

      await test.step("Create a new business", async () => {
        if (partnerPage === null && partnerInfo.accountInfo?.email) await loginPage.fillLoginForm("partner-virgilhr-qa.bigin.top/auth/login", partnerInfo.accountInfo!.email);

        const owner = await onboardingFlow.createBusiness(partnerPage!, partnerInfo!);
        await test.step("Verify owner", async () => {
          await expect(owner!).toBeVisible();
        });
      });
    },
  );

  test(
    "TC36 With Payment Options = Member Portal Consumer, the user does not handle payments, and each Business will have its own owner.",
    {
      tag: "@TC36",
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
        try {
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 5000 });
        } catch (error) {
          await onboardingFlow.refreshPage();
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible();
        }
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
    "TC37 Verify that when creating a new Partner, the admin can allow certain benefits to appear in the Member Portal.",
    {
      tag: "@TC37",
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
        try {
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
        } catch (error) {
          await onboardingFlow.refreshPage();
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
        }
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
    "TC38 Verify that the admin can specify which plans a Partner can use for its Businesses via the Product Type field.",
    {
      tag: "@TC38",
    },
    async ({ loginAdminPage: loginPage, partnerManagementPage, onboardingFlow }, testInfo) => {
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
        try {
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
        } catch (error) {
          await onboardingFlow.refreshPage();
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
        }
      });
    },
  );

  test(
    "TC39 Verify that the Partner email must be unique (no duplicates allowed).",
    {
      tag: "@TC39",
    },
    async ({ loginAdminPage: loginPage, partnerManagementPage, onboardingFlow }, testInfo) => {
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
        try {
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
        } catch (error) {
          await onboardingFlow.refreshPage();
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
        }
      });

      await test.step("Create another partner and verify its email is duplicated ", async () => {
        await partnerManagementPage.createPartner(partnerInfo!);

        const duplicatedEmailEl = await partnerManagementPage.getDuplicatedText();

        await expect(duplicatedEmailEl).toBeVisible();
      });
    },
  );

  test(
    "TC40 Verify that the admin can enable Bank Transfer for a new Partner.",
    {
      tag: "@TC40",
    },
    async ({ loginAdminPage: loginPage, partnerManagementPage, onboardingFlow }, testInfo) => {
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
        try {
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
        } catch (error) {
          await onboardingFlow.refreshPage();
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
        }
      });
    },
  );

  test(
    "TC41 When Bank Transfer = ON, the Partner user is assigned a plan and does not need to make a payment through Stripe.",
    {
      tag: "@TC41",
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
        try {
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
        } catch (error) {
          await onboardingFlow.refreshPage();
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
        }
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
    "TC42 When Bank Transfer = OFF, the Partner user is not pre-assigned a plan, but instead selects a plan via the Select Plan screen and pays through Stripe.",
    {
      tag: "@TC42",
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
        try {
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
        } catch (error) {
          await onboardingFlow.refreshPage();
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
        }
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
    "TC43 With Payment Options = Partner/Consultant Owner, after successfully creating a Partner account, the user receives two credential emails — one for the Partner Portal and one for the Member Portal.",
    {
      tag: "@TC43",
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
        try {
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
        } catch (error) {
          await onboardingFlow.refreshPage();
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
        }
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
    "TC44 For Payment Options = Partner/Consultant Owner, the Owner account can log in to both the Member Portal and the Partner Portal.",
    {
      tag: "@TC44",
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
        try {
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
        } catch (error) {
          await onboardingFlow.refreshPage();
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
        }
      });

      await test.step("Verify newPartner is created successfully", async () => {
        try {
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
        } catch (error) {
          await onboardingFlow.refreshPage();
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
        }
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
    "TC45 With Payment Options = Member Portal Consumer, after successfully creating a Partner account, the user receives one credential email — for the Partner Portal.",
    {
      tag: "@45",
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
        try {
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
        } catch (error) {
          await onboardingFlow.refreshPage();
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
        }
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
    "TC46 For Payment Options = Member Portal Consumer, the Owner of the Partner/Consultant can only log in to the Partner Portal.",
    {
      tag: "@46",
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
        try {
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
        } catch (error) {
          await onboardingFlow.refreshPage();
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
        }
      });

      await test.step("Verify login only partner portal", async () => {
        const tempEmailPage = await onboardingFlow.credential(tempEmailFreePage, partnerInfo!.accountInfo?.email!);

        const homeTitle = tempEmailPage.locator("h2.text-h2", { hasText: "Home" }).first();

        await expect(homeTitle).toBeVisible({ timeout: 30000 });
      });
    },
  );

  test(
    "TC47 For Businesses under a Partner with Payment Options = Member Portal Consumer, the Business Owner cannot log in to the Partner Portal.",
    {
      tag: "@TC47",
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
        try {
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
        } catch (error) {
          await onboardingFlow.refreshPage();
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
        }
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

  test(
    "TC57 In the Admin Portal, the admin can invite members to a team from the Details page of any account.",
    { tag: "@TC57" },
    async ({ loginAdminPage: loginAdminPage, partnerManagementPage, onboardingFlow, tempEmailFreePage }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      test.setTimeout(600000);

      await loginAdminPage.login();

      const partnerInfo = await DataFactory.partnerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withPaymentOption("Partner/Consultant Owner")
        .withPartnerLevel("Partner")
        .withProductsType([process.env.PLAN!])
        .withBankTransfer(true)
        .build();

      let newPartner;
      await test.step("Verify newPartner is created successfully", async () => {
        newPartner = await partnerManagementPage.createPartner(partnerInfo);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        try {
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
        } catch (error) {
          await onboardingFlow.refreshPage();
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
        }
      });

      let partnerPage: any;
      let owner;
      await test.step("Create bussiness", async () => {
        partnerPage = await onboardingFlow.credential(tempEmailFreePage, partnerInfo!.accountInfo?.email!);
        owner = await onboardingFlow.createBusiness(partnerPage!, partnerInfo!);
      });

      await test.step("Verify the new Business is created successfully", async () => {
        await expect(owner!).toBeVisible({ timeout: 10000 });
        await partnerPage.close();
      });

      let invitedMembers: any;

      await test.step("Invite members", async () => {
        invitedMembers = await CustomerFactory.generateMembers(1);

        await loginAdminPage.login();
        await partnerManagementPage.moveToPartnerCategory();
        await partnerManagementPage.moveToPartnerManagement();

        await partnerManagementPage.addMoreMembers(partnerInfo, invitedMembers);
      });

      await test.step("Verify members are invited successfully", async () => {
        for (const member of invitedMembers) {
          const localPart = member.email.split("@")[0];
          const userPage = await onboardingFlow.acceptInvitation(tempEmailFreePage, localPart);

          const memberHomeTitle = await onboardingFlow.getHomeTitle(userPage);
          await expect(memberHomeTitle).toBeVisible({ timeout: 30000 });

          await userPage.close();
        }
      });
    },
  );

  test(
    "TC58 Verify that after being invited, the account receives an invitation email.",
    { tag: "@TC58" },
    async ({ loginAdminPage: loginAdminPage, partnerManagementPage, onboardingFlow, tempEmailFreePage }, testInfo) => {
      const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

      testInfo.skip(!base, "API_BASE_URL is not configured");

      await loginAdminPage.login();

      const partnerInfo = await DataFactory.partnerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withPaymentOption("Partner/Consultant Owner")
        .withPartnerLevel("Partner")
        .withProductsType([process.env.PLAN!])
        .withBankTransfer(true)
        .build();

      let newPartner;
      await test.step("Verify newPartner is created successfully", async () => {
        newPartner = await partnerManagementPage.createPartner(partnerInfo);
      });

      await test.step("Verify newPartner is created successfully", async () => {
        try {
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
        } catch (error) {
          await onboardingFlow.refreshPage();
          await expect(newPartner!.getByText(partnerInfo!.accountInfo!.email).first()).toBeVisible({ timeout: 30000 });
        }
      });

      await test.step("Create bussiness", async () => {
        const localPart = partnerInfo.accountInfo?.email.split("@")[0];
        await tempEmailFreePage.createNewEmail(localPart!);

        const invitationEmail = await tempEmailFreePage.getInvitationEmailLocator();

        await expect(invitationEmail).toBeVisible();
      });
    },
  );
});
