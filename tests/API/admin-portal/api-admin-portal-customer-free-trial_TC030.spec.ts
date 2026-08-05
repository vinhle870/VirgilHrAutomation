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
      "TC030_API Verify that new customer can be Added under PartnerID return 201-Created and correct Response",
      {
        tag: ["@TC030", "@API", "@Admin Portal", "@Customer Management", "@Create Customer", "@Boarding", "@Free Trial"],
      },
      async ({ apiClient, authenticationService }) => {
        const adminService = await AdminPortalService.create(apiClient, authenticationService);

        let consumerData: CustomerInfo | undefined;
        let customerAccountInfo: UserInfo | undefined;
        let resp: any;
        let consumerById: any;
        let plan: string;

        await test.step("1 - Pre-condition: Resolve partner, product type, build free trial payload", async () => {
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

        await test.step("2 - SEND POST API /Manage/Consumers: Create free trial customer", async () => {
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

        await test.step("4 - GET consumer by ID: Verify plan name and trial duration", async () => {
          consumerById = await adminService.getConsumerById((resp as any).id);
          const startDate = new Date(consumerById.subscription.startDate);
          const endDate = new Date(consumerById.subscription.endDate);
          const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          expect(consumerById.subscription.name).toBe(paymentProductName);
          expect(diffDays).toBe(consumerData!.company.trialDays);
        });
      },
    );
  },
);
