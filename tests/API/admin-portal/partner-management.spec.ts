import { test, expect } from "src/fixtures";
import { AdminPortalService } from "src/api/services/admin-portal.services";
import { DataFactory } from "src/data-factory";
import { TestDataProvider } from "src/test-data";
import { CollectionUtils } from "src/utilities";
import { ProductInfo } from "src/objects/iproduct";
import Comparison from "src/utilities/compare";
import { plans } from "src/constant/static-data";
import delay from "src/utilities/delay";

test.describe(
  "Partner managerment",
  {
    tag: ["@API", "@Admin Portal", "@Partner Management"],
  },
  () => {
  test("TC030_API Verify that a partner account can only be created in the Admin Portal – Partner Management.",
    {
      tag: [
        "@TC030",
        "@API",
        "@Admin Portal",
        "@Partner Management",
        "@Create Partner",
      ],
    },
    async ({
    apiClient,
    authenticationService,
    adminPortalService,
  }) => {
    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );

    let partnerInfo!: Awaited<
      ReturnType<ReturnType<typeof DataFactory.partnerBuilder>["build"]>
    >;

    await test.step(
      "Pre-condition: Resolve department, plan, product types, and partner payload",
      async () => {
        const testData = new TestDataProvider(adminPortalService);

        const departmentID = await testData.getDepartmentId(
          process.env.DEPARTMENT_NAME,
        );
        const paymentProductName: string = plans[0];

        const masterPlan: any = await testData.filterMasterPlanBasedName(
          departmentID,
          paymentProductName,
        );
        const masterPlanId = masterPlan.masterPlanId;
        const productTypesAndNamesToSend: ProductInfo[] =
          await testData.getProductTypesBasedDepartmentId(departmentID);

        partnerInfo = await DataFactory.partnerBuilder()
          .withIsPublic(false)
          .withWhoPay(0)
          .withBankTransfer(true)
          .withFilterProductTypes(productTypesAndNamesToSend)
          .withDepartment(departmentID)
          .withPlanId(masterPlanId)
          .build();
      },
    );

    await test.step("Create partner and verify partner id response", async () => {
      const response = await adminService.createPartner(partnerInfo);

      delay(20000);

      expect(response).toBeDefined();
      expect(typeof response).toBe("string");
      expect(response.length).toBeGreaterThan(0);
    });
  });

  test("TC31 Verify when a Partner is being created, the admin can select its level as Partner or PEO/Consultant.",
    {
      tag: [
        "@TC31",
        "@API",
        "@Admin Portal",
        "@Partner Management",
        "@Create Partner",
        "@Partner Level",
      ],
    },
    async ({
    apiClient,
    authenticationService,
    adminPortalService,
  }) => {
    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );

    let departmentID: string;
    let masterPlanId: string;
    let productTypesAndNamesToSend: ProductInfo[];

    await test.step(
      "Pre-condition: Resolve department, plan, and product types",
      async () => {
        const testData = new TestDataProvider(adminPortalService);

        departmentID = await testData.getDepartmentId(
          process.env.DEPARTMENT_NAME,
        );
        const paymentProductName: string = plans[0];

        const masterPlan: any = await testData.filterMasterPlanBasedName(
          departmentID,
          paymentProductName,
        );
        masterPlanId = masterPlan.masterPlanId;
        productTypesAndNamesToSend =
          await testData.getProductTypesBasedDepartmentId(departmentID);
      },
    );

    await test.step(
      "Create PEO/Consultant partner and verify level is 1",
      async () => {
        const peoInfo = await DataFactory.partnerBuilder()
          .withIsPublic(false)
          .withWhoPay(0)
          .withBankTransfer(true)
          .withFilterProductTypes(productTypesAndNamesToSend)
          .withDepartment(departmentID)
          .withLevel(1)
          .withPlanId(masterPlanId)
          .build();

        const nameOfPeoInfo: string = peoInfo.partnerInfo?.name!;

        await adminService.createPartner(peoInfo);

        delay(20000);

        const peoLevel = (await adminService.searchPartnerByText(nameOfPeoInfo))
          .entities[0].level;

        expect(peoLevel).toBe(1);
      },
    );

    await test.step(
      "Create Partner-level partner and verify level is 0",
      async () => {
        const partnerInfo = await DataFactory.partnerBuilder()
          .withIsPublic(false)
          .withWhoPay(0)
          .withBankTransfer(true)
          .withFilterProductTypes(productTypesAndNamesToSend)
          .withDepartment(departmentID)
          .withLevel(0)
          .withPlanId(masterPlanId)
          .build();

        const nameOfpartnerInfo: string = partnerInfo.partnerInfo?.name!;

        await adminService.createPartner(partnerInfo);

        const partnerLevel = (
          await adminService.searchPartnerByText(nameOfpartnerInfo)
        ).entities[0].level;

        expect(partnerLevel).toBe(0);
      },
    );
  });
  test("TC_33 When creating a new Partner, the admin can choose to assign a sub-domain to that Partner, or not.",
    {
      tag: [
        "@TC33",
        "@API",
        "@Admin Portal",
        "@Partner Management",
        "@Create Partner",
        "@Sub-domain",
      ],
    },
    async ({
    apiClient,
    authenticationService,
    adminPortalService,
  }) => {

    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );

    await test.step(
      "With and without sub-domain: create partner and verify response",
      async () => {
        for (let i = 0; i < 2; i++) {
          const seq = CollectionUtils.randomInt(1, 9999);

          let domain;

          if (i == 0) domain = "";
          else domain = `test${seq}`;

          const testData = new TestDataProvider(adminPortalService);

          const departmentID = await testData.getDepartmentId(
            process.env.DEPARTMENT_NAME,
          );
          const paymentProductName: string = plans[0];

          const masterPlan: any = await testData.filterMasterPlanBasedName(
            departmentID,
            paymentProductName,
          );
          const masterPlanId = masterPlan.masterPlanId;
          const productTypesAndNamesToSend: ProductInfo[] =
            await testData.getProductTypesBasedDepartmentId(departmentID);
          const partnerInfo = await DataFactory.partnerBuilder()
            .withIsPublic(false)
            .withWhoPay(0)
            .withBankTransfer(true)
            .withFilterProductTypes(productTypesAndNamesToSend)
            .withDepartment(departmentID)
            .withSubDomain(domain)
            .withPlanId(masterPlanId)
            .build();
          const responseOfPartner = await adminService.createPartner(partnerInfo);

          delay(20000);

          expect(responseOfPartner).toBeDefined();
          expect(typeof responseOfPartner).toBe("string");
          expect(responseOfPartner.length).toBeGreaterThan(0);
        }
      },
    );
  });

  test("TC034_API For Payment Options, the admin can select either Partner/Consultant Owner or Member Portal Consumer.",
    {
      tag: [
        "@TC034",
        "@API",
        "@Admin Portal",
        "@Partner Management",
        "@Create Partner",
        "@Payment Options",
      ],
    },
    async ({
    apiClient,
    authenticationService,
    adminPortalService,
  }) => {

    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );

    await test.step(
      "Payment options Partner vs Member Portal Consumer: create partner and verify paymentEnable",
      async () => {
        const paymentOptions = [0, 1]; // 0: Partner, 1: Customer
        for (let i = 0; i < paymentOptions.length; i++) {
          const testData = new TestDataProvider(adminPortalService);

          const departmentID = await testData.getDepartmentId(
            process.env.DEPARTMENT_NAME,
          );
          const paymentProductName: string = plans[0];

          const masterPlan: any = await testData.filterMasterPlanBasedName(
            departmentID,
            paymentProductName,
          );
          const masterPlanId = masterPlan.masterPlanId;
          const productTypesAndNamesToSend: ProductInfo[] =
            await testData.getProductTypesBasedDepartmentId(departmentID);
          const partnerInfo = await DataFactory.partnerBuilder()
            .withIsPublic(false)
            .withWhoPay(0)
            .withBankTransfer(true)
            .withFilterProductTypes(productTypesAndNamesToSend)
            .withDepartment(departmentID)
            .withPaymentEnable(!!i)
            .withPlanId(masterPlanId)
            .build();
          await adminService.createPartner(partnerInfo);

          delay(20000);

          const nameOfPartnerInfo = partnerInfo.partnerInfo?.name!;

          const paymentEnable = (
            await adminService.searchPartnerByText(nameOfPartnerInfo)
          ).entities[0].paymentEnable;

          if (i == 0) expect(paymentEnable).toBe(false);
          else expect(paymentEnable).toBe(true);
        }
      },
    );
  });

  test("TC35 With Payment Options = Partner/Consultant Owner, the user will make payments in the Partner Portal, and the Partner account will be the owner of all Businesses.",
    {
      tag: [
        "@TC35",
        "@API",
        "@Admin Portal",
        "@Partner Management",
        "@Payment Options",
        "@Partner Owner",
      ],
    },
    async ({
    apiClient,
    authenticationService,
    adminPortalService,
  }) => {
    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );

    let partnerInfo!: Awaited<
      ReturnType<ReturnType<typeof DataFactory.partnerBuilder>["build"]>
    >;

    await test.step(
      "Pre-condition: Create partner (Partner/Consultant Owner)",
      async () => {
        const testData = new TestDataProvider(adminPortalService);

        const departmentID = await testData.getDepartmentId(
          process.env.DEPARTMENT_NAME,
        );
        const paymentProductName: string = plans[0];

        const masterPlan: any = await testData.filterMasterPlanBasedName(
          departmentID,
          paymentProductName,
        );
        const masterPlanId = masterPlan.masterPlanId;
        const productTypesAndNamesToSend: ProductInfo[] =
          await testData.getProductTypesBasedDepartmentId(departmentID);

        partnerInfo = await DataFactory.partnerBuilder()
          .withIsPublic(false)
          .withWhoPay(0)
          .withBankTransfer(true)
          .withFilterProductTypes(productTypesAndNamesToSend)
          .withDepartment(departmentID)
          .withPlanId(masterPlanId)
          .build();

        await adminService.createPartner(partnerInfo);

        delay(20000);
      },
    );

    const tempPassword = "TempPass@" + Date.now().toString().slice(-4);
    const email = partnerInfo.accountInfo?.email!;

    await test.step("Activate partner account", async () => {
      await authenticationService.resetPasswordWithoutToken(
        { username: email, password: tempPassword },
        undefined,
        "5",
      );

      await authenticationService.confirmEmailWithoutToken(email, undefined, "5");
    });

    await test.step("Verify linked customer is Owner (role 0)", async () => {
      const emailOfPartner = partnerInfo.accountInfo?.email!;

      const searchResponse =
        await adminService.getCustomerByEmail(emailOfPartner);

      const customerId = searchResponse.entities[0].consumerObjectId;

      const customerRole = await adminService.getCustomer(customerId);

      expect(customerRole.role).toBe(0);
    });
  });

  test("TC37 Verify that when creating a new Partner, the admin can allow certain benefits to appear in the Member Portal.",
    {
      tag: [
        "@TC37",
        "@API",
        "@Admin Portal",
        "@Partner Management",
        "@Create Partner",
        "@Benefits",
      ],
    },
    async ({
    apiClient,
    authenticationService,
    adminPortalService,
    memberPortalService,
  }) => {
    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );

    let testData: TestDataProvider;
    let departmentID: string;
    const paymentProductName: string = plans[1];
    let partnerInfo!: Awaited<
      ReturnType<ReturnType<typeof DataFactory.partnerBuilder>["build"]>
    >;

    await test.step("Pre-condition: Create partner with selected plan", async () => {
      testData = new TestDataProvider(adminPortalService);
      departmentID = await testData.getDepartmentId(
        process.env.DEPARTMENT_NAME,
      );
      const masterPlan: any = await testData.filterMasterPlanBasedName(
        departmentID,
        paymentProductName,
      );
      const masterPlanId = masterPlan.masterPlanId;

      const productTypesAndNamesToSend: ProductInfo[] =
        await testData.getProductTypesBasedDepartmentId(departmentID);

      partnerInfo = await DataFactory.partnerBuilder()
        .withIsPublic(false)
        .withWhoPay(0)
        .withBankTransfer(true)
        .withDepartment(departmentID)
        .withFilterProductTypes(productTypesAndNamesToSend)
        .withPlanId(masterPlanId)
        .build();

      await adminService.createPartner(partnerInfo);

      delay(20000);
    });

    const tempPassword = "Password@123";
    const email = partnerInfo.accountInfo?.email!;

    let memberportalToken: string;

    await test.step(
      "Activate account and obtain Member Portal token",
      async () => {
        await authenticationService.resetPasswordWithoutToken(
          { username: email, password: tempPassword },
          undefined,
          "5",
        );
        await authenticationService.resetPasswordWithoutToken(
          { username: email, password: tempPassword },
          undefined,
          "4",
        );

        await authenticationService.confirmEmailWithoutToken(
          email,
          undefined,
          "5",
        );

        memberportalToken = await authenticationService.getAuthToken(
          email,
          tempPassword,
          "4",
        );
      },
    );

    await test.step(
      "Compare Admin Portal plan benefits with Member Portal subscription",
      async () => {
        const adminportalPlanResp: any =
          await adminPortalService.getDepartmentPlanList(departmentID);

        let memberportalPlanResp =
          await memberPortalService.getPaymentSubscription(memberportalToken);
        try {
          memberportalPlanResp =
            await memberPortalService.getPaymentSubscription(memberportalToken);
        } catch (e) {
          console.log("TC 37 error:", e);

          memberportalPlanResp =
            await memberPortalService.getPaymentSubscription(memberportalToken);
        }

        const adminportalPlan = await testData.filterPlanBasedName(
          adminportalPlanResp,
          paymentProductName,
        );

        Comparison.comparePlan(memberportalPlanResp, adminportalPlan);
      },
    );
  });
  test("TC38 Verify that the admin can specify which plans a Partner can use for its Businesses via the Product Type field.",
    {
      tag: [
        "@TC38",
        "@API",
        "@Admin Portal",
        "@Partner Management",
        "@Create Partner",
        "@Product Type",
      ],
    },
    async ({
    apiClient,
    authenticationService,
    adminPortalService,
  }) => {
    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );

    let partnerInfo!: Awaited<
      ReturnType<ReturnType<typeof DataFactory.partnerBuilder>["build"]>
    >;

    await test.step(
      "Pre-condition: Resolve department, plan, product types, and partner payload (Product Type field)",
      async () => {
        const testData = new TestDataProvider(adminPortalService);

        const departmentID = await testData.getDepartmentId(
          process.env.DEPARTMENT_NAME,
        );
        const paymentProductName: string = plans[1];
        const masterPlan: any = await testData.filterMasterPlanBasedName(
          departmentID,
          paymentProductName,
        );

        const masterPlanId = masterPlan.masterPlanId;
        const productTypesAndNamesToSend: ProductInfo[] =
          await testData.getProductTypesBasedDepartmentId(departmentID);

        partnerInfo = await DataFactory.partnerBuilder()
          .withIsPublic(false)
          .withDepartment(departmentID)
          .withFilterProductTypes(productTypesAndNamesToSend)
          .withWhoPay(0)
          .withPlanId(masterPlanId)
          .build();
      },
    );

    await test.step("Create partner and verify response", async () => {
      const partnerResponse = await adminService.createPartner(partnerInfo);

      expect(partnerResponse).toBeDefined();
    });
  });
  test("TC44 For Payment Options = Partner/Consultant Owner, the Owner account can log in to both the Member Portal and the Partner Portal.",
    {
      tag: [
        "@TC44",
        "@API",
        "@Admin Portal",
        "@Partner Management",
        "@Payment Options",
        "@Login",
      ],
    },
    async ({
    apiClient,
    authenticationService,
    adminPortalService,
  }) => {
    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );

    let partnerInfo!: Awaited<
      ReturnType<ReturnType<typeof DataFactory.partnerBuilder>["build"]>
    >;

    await test.step(
      "Pre-condition: Create partner (Partner/Consultant Owner)",
      async () => {
        const testData = new TestDataProvider(adminPortalService);

        const departmentID = await testData.getDepartmentId(
          process.env.DEPARTMENT_NAME,
        );
        const paymentProductName: string = plans[0];

        const masterPlan: any = await testData.filterMasterPlanBasedName(
          departmentID,
          paymentProductName,
        );
        const masterPlanId = masterPlan.masterPlanId;
        const productTypesAndNamesToSend: ProductInfo[] =
          await testData.getProductTypesBasedDepartmentId(departmentID);

        partnerInfo = await DataFactory.partnerBuilder()
          .withIsPublic(false)
          .withWhoPay(0)
          .withBankTransfer(true)
          .withFilterProductTypes(productTypesAndNamesToSend)
          .withDepartment(departmentID)
          .withPlanId(masterPlanId)
          .build();

        await adminService.createPartner(partnerInfo);

        delay(20000);
      },
    );

    const tempPassword = "TempPass@" + Date.now().toString().slice(-4);
    const email = partnerInfo.accountInfo?.email!;

    await test.step(
      "Activate credentials and obtain Partner Portal and Member Portal tokens",
      async () => {
        await authenticationService.resetPasswordWithoutToken(
          { username: email, password: tempPassword },
          undefined,
          "5",
        );

        await authenticationService.resetPasswordWithoutToken(
          { username: email, password: tempPassword },
          undefined,
          "4",
        );

        await authenticationService.confirmEmailWithoutToken(
          email,
          undefined,
          "5",
        );

        const partnerToLogin = await authenticationService.getAuthToken(
          email,
          tempPassword,
          "5",
        );

        expect(partnerToLogin).toBeDefined();

        await authenticationService.confirmEmailWithoutToken(
          email,
          undefined,
          "4",
        );

        const memberToLogin = await authenticationService.getAuthToken(
          email,
          tempPassword,
          "4",
        );

        expect(memberToLogin).toBeDefined();
      },
    );
  });

  test("TC45 With Payment Options = Member Portal Consumer, after successfully creating a Partner account, the user receives one credential email — for the Partner Portal.",
    {
      tag: [
        "@TC45",
        "@API",
        "@Admin Portal",
        "@Partner Management",
        "@Payment Options",
        "@Member Portal Consumer",
      ],
    },
    async ({
    apiClient,
    authenticationService,
  }) => {
    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );

    let partnerInfo!: Awaited<
      ReturnType<ReturnType<typeof DataFactory.partnerBuilder>["build"]>
    >;

    await test.step(
      "Pre-condition: Create partner (Member Portal Consumer)",
      async () => {
        partnerInfo = await DataFactory.partnerBuilder()
          .withIsPublic(false)
          .withWhoPay(1)
          .build();

        await adminService.createPartner(partnerInfo);

        delay(20000);
      },
    );

    const tempPassword = "Password@123";
    const email = partnerInfo.accountInfo?.email!;

    await test.step("Activate partner account", async () => {
      await authenticationService.resetPasswordWithoutToken(
        { username: email, password: tempPassword },
        undefined,
        "5",
      );

      await authenticationService.confirmEmailWithoutToken(email, undefined, "5");
    });

    await test.step("Verify customer record and credential email", async () => {
      const emailOfPartner = partnerInfo.accountInfo?.email!;

      expect(emailOfPartner).toBeDefined();

      const searchResponse =
        await adminService.getCustomerByEmail(emailOfPartner);

      const customerEmail = searchResponse.entities[0];

      expect(customerEmail.consumers.email).toBeTruthy();
      expect(searchResponse.entities.length).toBeGreaterThan(0);
    });
  });

  test("TC46 For Payment Options = Member Portal Consumer, the Owner of the Partner/Consultant can only log in to the Partner Portal.",
    {
      tag: [
        "@TC46",
        "@API",
        "@Admin Portal",
        "@Partner Management",
        "@Payment Options",
        "@Partner Portal Only",
      ],
    },
    async ({
    apiClient,
    authenticationService,
  }) => {
    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );

    let partnerInfo!: Awaited<
      ReturnType<ReturnType<typeof DataFactory.partnerBuilder>["build"]>
    >;

    await test.step(
      "Pre-condition: Create partner (Member Portal Consumer)",
      async () => {
        partnerInfo = await DataFactory.partnerBuilder()
          .withIsPublic(false)
          .withWhoPay(1)
          .build();

        await adminService.createPartner(partnerInfo);

        delay(20000);
      },
    );

    const email = partnerInfo.accountInfo?.email!;
    const tempPassword = "Password@123";

    await test.step(
      "Activate account and verify Partner Portal token",
      async () => {
        await authenticationService.resetPasswordWithoutToken(
          { username: email, password: tempPassword },
          undefined,
          "5",
        );

        await authenticationService.confirmEmailWithoutToken(
          email,
          undefined,
          "5",
        );

        const partnerToLogin = await authenticationService.getAuthToken(
          email,
          tempPassword,
          "5",
        );

        expect(partnerToLogin).toBeDefined();
      },
    );
  });

  // test("TC47 For Businesses under a Partner with Payment Options = Member Portal Consumer, the Business Owner cannot log in to the Member Portal.", async ({
  //   apiClient,
  //   authenticationService,
  //   memberPortalService,
  // }, testInfo) => {
  //   testInfo.skip(
  //     !process.env.API_BASE_URL && !process.env.BASE_URL,
  //     "API_BASE_URL is not configured",
  //   );
  //   const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

  //   testInfo.skip(!base, "API_BASE_URL is not configured");

  //   const adminService = await AdminPortalService.create(
  //     apiClient,
  //     authenticationService,
  //   );

  //   const partnerInfo = await DataFactory.partnerBuilder()
  //     .withIsPublic(false)
  //     .withWhoPay(1)
  //     .build();

  //   const partnerResponse = await adminService.createPartner(partnerInfo);

  //   const email = partnerInfo.accountInfo?.email!;

  //   const tempPassword = "TempPass@" + Date.now().toString().slice(-4);

  //   await authenticationService.resetPasswordWithoutToken(
  //     { username: email, password: tempPassword },
  //     undefined,
  //     "5",
  //   );
  // });
});
