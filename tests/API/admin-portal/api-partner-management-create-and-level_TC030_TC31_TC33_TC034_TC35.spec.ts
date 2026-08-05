import { test, expect } from "src/fixtures";
import { AdminPortalService } from "src/api/services/admin-portal.services";
import { DataFactory } from "src/data-factory";
import { TestDataProvider } from "src/test-data";
import { CollectionUtils } from "src/utilities";
import { ProductInfo } from "src/objects/iproduct";
import { plans } from "src/constant/static-data";

test.describe(
  "Partner managerment",
  {
    tag: ["@API", "@Admin Portal", "@Partner Management", "@regression_API"],
  },
  () => {
    test(
      "TC030_API Verify that a partner account can only be created in the Admin Portal – Partner Management.",
      {
        tag: ["@TC030", "@API", "@Admin Portal", "@Partner Management", "@Create Partner"],
      },
      async ({ apiClient, authenticationService, adminPortalService }) => {
        const adminService = await AdminPortalService.create(apiClient, authenticationService);

        let partnerInfo!: Awaited<ReturnType<ReturnType<typeof DataFactory.partnerBuilder>["build"]>>;

        await test.step("1 - Pre-condition: Resolve department, plan, product types, and partner payload", async () => {
          const testData = new TestDataProvider(adminPortalService);

          const departmentID = await testData.getDepartmentId(process.env.DEPARTMENT_NAME);
          const paymentProductName: string = plans[0];

          const masterPlan: any = await testData.filterMasterPlanBasedName(departmentID, paymentProductName);
          const masterPlanId = masterPlan.masterPlanId;
          const productTypesAndNamesToSend: ProductInfo[] = await testData.getProductTypesBasedDepartmentId(departmentID);

          partnerInfo = await DataFactory.partnerBuilder()
            .withIsPublic(false)
            .withWhoPay(0)
            .withBankTransfer(true)
            .withFilterProductTypes(productTypesAndNamesToSend)
            .withDepartment(departmentID)
            .withPlanId(masterPlanId)
            .build();
        });

        await test.step("2 - Create partner and verify partner id response", async () => {
          const response = await adminService.createPartner(partnerInfo);


          expect(response).toBeDefined();
          expect(typeof response).toBe("string");
          expect(response.length).toBeGreaterThan(0);
        });
      },
    );

    test(
      "TC31 Verify when a Partner is being created, the admin can select its level as Partner or PEO/Consultant.",
      {
        tag: ["@TC31", "@API", "@Admin Portal", "@Partner Management", "@Create Partner", "@Partner Level"],
      },
      async ({ apiClient, authenticationService, adminPortalService }) => {
        const adminService = await AdminPortalService.create(apiClient, authenticationService);

        let departmentID: string;
        let masterPlanId: string;
        let productTypesAndNamesToSend: ProductInfo[];

        await test.step("1 - Pre-condition: Resolve department, plan, and product types", async () => {
          const testData = new TestDataProvider(adminPortalService);

          departmentID = await testData.getDepartmentId(process.env.DEPARTMENT_NAME);
          const paymentProductName: string = plans[0];

          const masterPlan: any = await testData.filterMasterPlanBasedName(departmentID, paymentProductName);
          masterPlanId = masterPlan.masterPlanId;
          productTypesAndNamesToSend = await testData.getProductTypesBasedDepartmentId(departmentID);
        });

        await test.step("2 - Create PEO/Consultant partner and verify level is 1", async () => {
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


          const peoLevel = (await adminService.searchPartnerByText(nameOfPeoInfo)).entities[0].level;

          expect(peoLevel).toBe(1);
        });

        await test.step("3 - Create Partner-level partner and verify level is 0", async () => {
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

          const partnerLevel = (await adminService.searchPartnerByText(nameOfpartnerInfo)).entities[0].level;

          expect(partnerLevel).toBe(0);
        });
      },
    );
    test(
      "TC_33 When creating a new Partner, the admin can choose to assign a sub-domain to that Partner, or not.",
      {
        tag: ["@TC33", "@API", "@Admin Portal", "@Partner Management", "@Create Partner", "@Sub-domain"],
      },
      async ({ apiClient, authenticationService, adminPortalService }) => {
        const adminService = await AdminPortalService.create(apiClient, authenticationService);

        await test.step("1 - With and without sub-domain: create partner and verify response", async () => {
          for (let i = 0; i < 2; i++) {
            const seq = CollectionUtils.randomInt(1, 9999);

            let domain;

            if (i == 0) domain = "";
            else domain = `test${seq}`;

            const testData = new TestDataProvider(adminPortalService);

            const departmentID = await testData.getDepartmentId(process.env.DEPARTMENT_NAME);
            const paymentProductName: string = plans[0];

            const masterPlan: any = await testData.filterMasterPlanBasedName(departmentID, paymentProductName);
            const masterPlanId = masterPlan.masterPlanId;
            const productTypesAndNamesToSend: ProductInfo[] = await testData.getProductTypesBasedDepartmentId(departmentID);
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


            expect(responseOfPartner).toBeDefined();
            expect(typeof responseOfPartner).toBe("string");
            expect(responseOfPartner.length).toBeGreaterThan(0);
          }
        });
      },
    );

    test(
      "TC034_API For Payment Options, the admin can select either Partner/Consultant Owner or Member Portal Consumer.",
      {
        tag: ["@TC034", "@API", "@Admin Portal", "@Partner Management", "@Create Partner", "@Payment Options"],
      },
      async ({ apiClient, authenticationService, adminPortalService }) => {
        const adminService = await AdminPortalService.create(apiClient, authenticationService);

        await test.step("1 - Payment options Partner vs Member Portal Consumer: create partner and verify paymentEnable", async () => {
          const paymentOptions = [0, 1]; // 0: Partner, 1: Customer
          for (let i = 0; i < paymentOptions.length; i++) {
            const testData = new TestDataProvider(adminPortalService);

            const departmentID = await testData.getDepartmentId(process.env.DEPARTMENT_NAME);
            const paymentProductName: string = plans[0];

            const masterPlan: any = await testData.filterMasterPlanBasedName(departmentID, paymentProductName);
            const masterPlanId = masterPlan.masterPlanId;
            const productTypesAndNamesToSend: ProductInfo[] = await testData.getProductTypesBasedDepartmentId(departmentID);
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


            const nameOfPartnerInfo = partnerInfo.partnerInfo?.name!;

            const paymentEnable = (await adminService.searchPartnerByText(nameOfPartnerInfo)).entities[0].paymentEnable;

            if (i == 0) expect(paymentEnable).toBe(false);
            else expect(paymentEnable).toBe(true);
          }
        });
      },
    );

    test(
      "TC35 With Payment Options = Partner/Consultant Owner, the user will make payments in the Partner Portal, and the Partner account will be the owner of all Businesses.",
      {
        tag: ["@TC35", "@API", "@Admin Portal", "@Partner Management", "@Payment Options", "@Partner Owner"],
      },
      async ({ apiClient, authenticationService, adminPortalService }) => {
        const adminService = await AdminPortalService.create(apiClient, authenticationService);

        let partnerInfo!: Awaited<ReturnType<ReturnType<typeof DataFactory.partnerBuilder>["build"]>>;

        await test.step("1 - Pre-condition: Create partner (Partner/Consultant Owner)", async () => {
          const testData = new TestDataProvider(adminPortalService);

          const departmentID = await testData.getDepartmentId(process.env.DEPARTMENT_NAME);
          const paymentProductName: string = plans[0];

          const masterPlan: any = await testData.filterMasterPlanBasedName(departmentID, paymentProductName);
          const masterPlanId = masterPlan.masterPlanId;
          const productTypesAndNamesToSend: ProductInfo[] = await testData.getProductTypesBasedDepartmentId(departmentID);

          partnerInfo = await DataFactory.partnerBuilder()
            .withIsPublic(false)
            .withWhoPay(0)
            .withBankTransfer(true)
            .withFilterProductTypes(productTypesAndNamesToSend)
            .withDepartment(departmentID)
            .withPlanId(masterPlanId)
            .build();

          await adminService.createPartner(partnerInfo);

        });

        const tempPassword = "TempPass@" + Date.now().toString().slice(-4);
        const email = partnerInfo.accountInfo?.email!;

        await test.step("2 - Activate partner account", async () => {
          await authenticationService.resetPasswordWithoutToken({ username: email, password: tempPassword }, undefined, "5");

          await authenticationService.confirmEmailWithoutToken(email, undefined, "5");
        });

        await test.step("3 - Verify linked customer is Owner (role 0)", async () => {
          const emailOfPartner = partnerInfo.accountInfo?.email!;

          const searchResponse = await adminService.getCustomerByEmail(emailOfPartner);

          const customerId = searchResponse.entities[0].consumerObjectId;

          const customerRole = await adminService.getCustomer(customerId);

          expect(customerRole.role).toBe(0);
        });
      },
    );
  },
);
