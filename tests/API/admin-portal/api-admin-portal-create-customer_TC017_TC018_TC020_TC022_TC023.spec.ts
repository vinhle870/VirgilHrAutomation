import { test, expect } from "src/fixtures";
import { DataFactory } from "src/data-factory";
import { AdminPortalService } from "src/api/services/admin-portal.services";
import { plans } from "src/constant/static-data";
import { CollectionUtils } from "src/utilities";
import { CustomerInfo, Partner, ProductInfo, UserInfo } from "src/objects";
import { TestDataProvider } from "src/test-data";

test.describe(
  "Admin Portal -> Customer Management",
  {
    tag: ["@API", "@Admin Portal", "@Customer Management", "@Boarding", "@regression_API"],
  },

  () => {
    let partnerData: Partner;
    let paymentProductName: string;
    test.beforeAll(async ({ apiClient, adminPortalService }) => {
      await test.step("1 - Pre-condition: Call API -> create partner", async () => {
        const testData = new TestDataProvider(adminPortalService);

        const departmentID = await testData.getDepartmentId(process.env.DEPARTMENT_NAME);
        paymentProductName = plans[5];

        const masterPlan: any = await testData.filterMasterPlanBasedName(departmentID, paymentProductName);
        const masterPlanId = masterPlan.masterPlanId;
        const productTypesAndNamesToSend: ProductInfo[] = await testData.getProductTypesBasedDepartmentId(departmentID);
        partnerData = await DataFactory.partnerBuilder()
          .withIsPublic(false)
          .withWhoPay(0)
          .withBankTransfer(true)
          .withFilterProductTypes(productTypesAndNamesToSend)
          .withDepartment(departmentID)
          .withPlanId(masterPlanId)
          .build();
      });

      await test.step("2 - Create partner and verify partner id response", async () => {
        const response = await adminPortalService.createPartner(partnerData);


        expect(response).toBeDefined();
        expect(typeof response).toBe("string");
        expect(response.length).toBeGreaterThan(0);
      });
    });

    test(
      "TC017_API Verify that new customer can be Added under PartnerID return 201-Created and correct Response",
      {
        tag: ["@TC017", "@API", "@Admin Portal", "@Customer Management", "@Create Customer", "@Boarding"],
      },
      async ({ apiClient, authenticationService }) => {
        //*****-----Optionally discover partnerId/departmentId from the system to use in the-----*****
        // generated consumer. If search finds nothing, generator will use defaults.
        const adminService = await AdminPortalService.create(apiClient, authenticationService);

        let consumerData: CustomerInfo | undefined;
        let customerAccountInfo: UserInfo | undefined;
        let resp: any;

        await test.step("1 - Pre-condition: Create Test Data", async () => {
          const partnerName = partnerData.partnerInfo?.name;
          if (!partnerName) {
            throw new Error("PARTNER_NAME is not configured");
          }

          const partnerInfo = await adminService.searchPartner(partnerName);

          // Generate consumer payload with discovered IDs (if any)
          consumerData = await DataFactory.customerBuilder().forAdminPortal().withDepartment(partnerInfo.departmentId!).build();
          customerAccountInfo = consumerData.accountInfo;
        });

        await test.step("2 - SEND POST API /Manage/Consumers: Create a new consumer to create Customer", async () => {
          if (!consumerData) {
            throw new Error("consumerData was not created in pre-condition step");
          }
          resp = await adminService.createCustomer(consumerData);
        });

        await test.step("3 - Verify API /Manage/Consumers Response", async () => {
          expect(resp).toBeDefined();
          expect(typeof resp).toBe("object");
          expect(Object.keys(resp as any).length).toBeGreaterThan(0);
          expect(Object.keys((resp as any).id).length).toBeGreaterThan(0);
          expect((resp as any).email).toBe(customerAccountInfo!.email);
        });
      },
    );

    test(
      "TC018_API Verify Customer creation under a HR System (Partner) will return 201-Created and correct Response",
      {
        tag: ["@TC018", "@API", "@Admin Portal", "@Customer Management", "@Create Customer", "@Boarding"],
      },

      async ({ apiClient, authenticationService }) => {
        const adminService = await AdminPortalService.create(apiClient, authenticationService);

        let consumerData: CustomerInfo | undefined;
        let customerAccountInfo: UserInfo | undefined;
        let resp: any;

        await test.step("1 - Pre-condition: Resolve partner, product type, and build consumer payload", async () => {
          const partnerName = partnerData.partnerInfo?.name;
          if (!partnerName) {
            throw new Error("PARTNER_NAME is not configured");
          }

          const partnerInfo = await adminService.searchPartner(partnerName);

          const productTypeFilters = await adminService.getProductTypeFilters();

          const matchedProduct = CollectionUtils.findByPropertyOrNull(Array.isArray(productTypeFilters) ? productTypeFilters : [productTypeFilters], "name" as any, paymentProductName);
          const filteredProductType = matchedProduct ? (matchedProduct as any).productType : undefined;

          consumerData = await DataFactory.customerBuilder()
            .forAdminPortal()
            .withCompanySize(filteredProductType)
            .withProductType(filteredProductType)
            .withAdminOptions({ trialDays: 30 })
            .withPartner(partnerInfo.partnerId!)
            .withDepartment(partnerInfo.departmentId!)
            .build();
          customerAccountInfo = consumerData.accountInfo;
        });

        await test.step("2 - SEND POST API /Manage/Consumers: Create customer under HR System (Partner)", async () => {
          if (!consumerData) {
            throw new Error("consumerData was not created in pre-condition step");
          }
          resp = await adminService.createCustomer(consumerData);
        });

        await test.step("3 - Verify API /Manage/Consumers Response", async () => {
          expect(resp).toBeDefined();
          expect(typeof resp).toBe("object");
          expect(Object.keys(resp as any).length).toBeGreaterThan(0);
          expect(Object.keys((resp as any).id).length).toBeGreaterThan(0);
          expect((resp as any).email).toBe(customerAccountInfo!.email);
          expect((resp as any).team.name).toBe(consumerData!.company.companyName);
        });
      },
    );

    test(
      "TC020_API Verify Customer creation with Trial Subscription will return 201-Created and correct Response",
      {
        tag: ["@TC020", "@API", "@Admin Portal", "@Customer Management", "@Create Customer", "@Boarding", "@Trial Subscription"],
      },
      async ({ apiClient, authenticationService }) => {
        const adminService = await AdminPortalService.create(apiClient, authenticationService);

        let consumerData: CustomerInfo | undefined;
        let customerAccountInfo: UserInfo | undefined;
        let resp: any;

        await test.step("1 - Pre-condition: Resolve partner, product type, build trial subscription payload", async () => {
          const partnerName = process.env.PARTNER_NAME;
          if (!partnerName) {
            throw new Error("PARTNER_NAME is not configured");
          }

          const partnerInfo = await adminService.searchPartner(partnerName);

          const productTypeFilters = await adminService.getProductTypeFilters();

          const matchedPlan = CollectionUtils.findByPropertyOrNull(Array.isArray(productTypeFilters) ? productTypeFilters : [productTypeFilters], "name" as any, paymentProductName);
          const filteredProductType = matchedPlan ? (matchedPlan as any).productType : undefined;

          consumerData = await DataFactory.customerBuilder()
            .forAdminPortal()
            .withCompanySize(filteredProductType)
            .withAdminOptions({ productType: filteredProductType, trialDays: 30 })
            .withDepartment(partnerInfo.departmentId!)
            .build();
          customerAccountInfo = consumerData.accountInfo;
        });

        await test.step("2 - SEND POST API /Manage/Consumers: Create customer with trial subscription", async () => {
          if (!consumerData) {
            throw new Error("consumerData was not created in pre-condition step");
          }
          resp = await adminService.createCustomer(consumerData);
        });

        await test.step("3 - Verify API /Manage/Consumers Response", async () => {
          expect(resp).toBeDefined();
          expect(typeof resp).toBe("object");
          expect(Object.keys(resp as any).length).toBeGreaterThan(0);
          expect(Object.keys((resp as any).id).length).toBeGreaterThan(0);
          expect((resp as any).email).toBe(customerAccountInfo!.email);
        });
      },
    );

    test(
      "TC022_API Verify Customer creation with Bank Transfer = ON will return 201-Created and correct Response",
      {
        tag: ["@TC022", "@API", "@Admin Portal", "@Customer Management", "@Create Customer", "@Boarding", "@Bank Transfer ON"],
      },
      async ({ apiClient, authenticationService }) => {
        const adminService = await AdminPortalService.create(apiClient, authenticationService);

        let consumerData: CustomerInfo | undefined;
        let customerAccountInfo: UserInfo | undefined;
        let resp: any;
        let consumerById: any;
        let plan: string;

        await test.step("1 - Pre-condition: Resolve partner, product type, build bank transfer ON payload", async () => {
          const partnerName = process.env.PARTNER_NAME;
          if (!partnerName) {
            throw new Error("PARTNER_NAME is not configured");
          }

          const partnerInfo = await adminService.searchPartner(partnerName);

          const productTypeFilters = await adminService.getProductTypeFilters();

          const matchedPlan = CollectionUtils.findByPropertyOrNull(Array.isArray(productTypeFilters) ? productTypeFilters : [productTypeFilters], "name" as any, paymentProductName);
          const filteredProductType = matchedPlan ? (matchedPlan as any).productType : undefined;

          consumerData = await DataFactory.customerBuilder()
            .forAdminPortal()
            .withCompanySize(filteredProductType)
            .withAdminOptions({
              productType: filteredProductType,
              billingcycle: 1,
              useCredit: true,
            })
            .withDepartment(partnerInfo.departmentId!)
            .build();
          customerAccountInfo = consumerData.accountInfo;
        });

        await test.step("2 - SEND POST API /Manage/Consumers: Create customer with bank transfer ON", async () => {
          if (!consumerData) {
            throw new Error("consumerData was not created in pre-condition step");
          }
          resp = await adminService.createCustomer(consumerData);
        });

        await test.step("3 - Verify API /Manage/Consumers Response", async () => {
          expect(resp).toBeDefined();
          expect(typeof resp).toBe("object");
          expect(Object.keys(resp as any).length).toBeGreaterThan(0);
          expect(Object.keys((resp as any).id).length).toBeGreaterThan(0);
          expect((resp as any).email).toBe(customerAccountInfo!.email);
          expect((resp as any).team.name).toBe(consumerData!.company.companyName);
        });

        await test.step("4 - GET consumer by ID: Verify subscription plan", async () => {
          consumerById = await adminService.getConsumerById((resp as any).id);
          expect(consumerById.subscription.name).toBe(paymentProductName);
        });
      },
    );

    test(
      "TC023_API Verify Customer creation with Bank Transfer = OFF will return 201-Created and correct Respons",
      {
        tag: ["@TC023", "@API", "@Admin Portal", "@Customer Management", "@Create Customer", "@Boarding", "@Bank Transfer OFF"],
      },
      async ({ apiClient, authenticationService }) => {
        const adminService = await AdminPortalService.create(apiClient, authenticationService);

        let consumerData: CustomerInfo | undefined;
        let customerAccountInfo: UserInfo | undefined;
        let resp: any;
        let consumerById: any;

        await test.step("1 - Pre-condition: Resolve partner and build consumer payload (bank transfer OFF)", async () => {
          const partnerName = process.env.PARTNER_NAME;
          if (!partnerName) {
            throw new Error("PARTNER_NAME is not configured");
          }

          const partnerInfo = await adminService.searchPartner(partnerName);

          consumerData = await DataFactory.customerBuilder().forAdminPortal().withDepartment(partnerInfo.departmentId!).build();
          customerAccountInfo = consumerData.accountInfo;
        });

        await test.step("2 - SEND POST API /Manage/Consumers: Create customer with bank transfer OFF", async () => {
          if (!consumerData) {
            throw new Error("consumerData was not created in pre-condition step");
          }
          resp = await adminService.createCustomer(consumerData);
        });

        await test.step("3 - Verify API /Manage/Consumers Response", async () => {
          expect(resp).toBeDefined();
          expect(typeof resp).toBe("object");
          expect(Object.keys(resp as any).length).toBeGreaterThan(0);
          expect(Object.keys((resp as any).id).length).toBeGreaterThan(0);
          expect((resp as any).email).toBe(customerAccountInfo!.email);
        });

        await test.step("4 - GET consumer by ID: Verify subscription is null (bank transfer OFF)", async () => {
          consumerById = await adminService.getConsumerById((resp as any).id);
          expect(consumerById.subscription).toBe(null);
        });
      },
    );
  },
);
