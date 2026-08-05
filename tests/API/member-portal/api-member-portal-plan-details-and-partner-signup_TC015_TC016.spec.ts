import { test, expect } from "src/fixtures";
import { DataFactory } from "src/data-factory";
import { AdminPortalService } from "src/api/services/admin-portal.services";
import { plans } from "src/constant/static-data";
import { TestDataProvider } from "src/test-data";
import { ProductInfo } from "src/objects/iproduct";

test.describe(
  "MemberPortalService - signUpConsumer",
  {
    tag: ["@API", "@Member Portal", "@Sign Up", "@Consumer", "@regression_API"],
  },
  () => {
    test(
      "TC015_API_Verify GET Plan/me returns 200-OK and correct paid plan details",
      {
        tag: ["@TC015", "@API", "@Member Portal", "@Plan", "@Subscription"],
      },
      async ({ memberPortalService, authenticationService, authFlow, purchaseFlow, apiClient }, testInfo) => {
        const env = process.env.ENV;

        testInfo.skip(env === "prod", "This test is not suitable for production environment");

        let consumerData!: Awaited<ReturnType<ReturnType<typeof DataFactory.customerBuilder>["build"]>>;
        let customerAccountInfo: unknown;

        await test.step("1 - Pre-condition: Build consumer payload", async () => {
          const adminService = await AdminPortalService.create(apiClient, authenticationService);
          const testData = new TestDataProvider(adminService);
          const departmentID = await testData.getDepartmentId(process.env.DEPARTMENT_NAME);

          consumerData = await DataFactory.customerBuilder().forMemberPortal().withDepartment(departmentID).build();
          customerAccountInfo = consumerData.accountInfo;
        });

        const tempPassword = "TempPass@" + Date.now().toString().slice(-4);

        let consumerToken: string;

        await test.step("2 - Sign up consumer, activate account, and obtain token", async () => {
          const resp = await memberPortalService.signUpConsumer(consumerData);

          expect(resp).toBeTruthy();
          if (typeof (resp as any) === "string")
            expect((resp as any).length).toBeGreaterThan(0);
          else
            expect(Object.keys(resp as any).length).toBeGreaterThan(0);

          await authenticationService.resetPasswordWithoutToken({ username: (customerAccountInfo as any).email, password: tempPassword }, undefined, "4");

          await authenticationService.confirmEmailWithoutToken((customerAccountInfo as any).email, undefined, "4");

          consumerToken = await authenticationService.getAuthToken((customerAccountInfo as any).email, tempPassword, "4");
        });

        await test.step("3 - Checkout plan and complete payment (UI)", async () => {
          const planResponse = await memberPortalService.checkOutPlan("1", consumerToken);

          const planUrl = String((planResponse as any).returnUrl);

          await authFlow.loginToPortals(planUrl, (customerAccountInfo as any).email, tempPassword);

          await purchaseFlow.buyPlanByCustomer(planUrl, (customerAccountInfo as any).email, consumerData.plan);
        });

        await test.step("4 - GET Plan/me and verify subscribed plan details", async () => {
          const newConsumerToken = await authenticationService.getAuthToken((customerAccountInfo as any).email, tempPassword, "4");

          const planDetailsResp = await memberPortalService.getCurrentSubscribedPlan(newConsumerToken);
          expect(planDetailsResp).toBeDefined();
          expect(typeof planDetailsResp).toBe("object");
          expect(planDetailsResp as any).toHaveProperty("id");
          expect(planDetailsResp as any).toHaveProperty("name");
          expect(planDetailsResp as any).toHaveProperty("priceId");
          expect(planDetailsResp as any).toHaveProperty("departmentId");
          expect(planDetailsResp as any).toHaveProperty("productType");
          expect(planDetailsResp as any).toHaveProperty("licenseQuantity");
          expect(planDetailsResp as any).toHaveProperty("b2CFeatureRestrictions");
          expect(planDetailsResp as any).toHaveProperty("freeTrialRestrictions");
          expect(planDetailsResp as any).toHaveProperty("price");
          expect(planDetailsResp as any).toHaveProperty("partnerSetting");
          //Verify some plan details
          expect((planDetailsResp as any).departmentId).toBe(consumerData.company.departmentId);
          const planName = consumerData.plan;
          expect((planDetailsResp as any).name).toContain(planName);
        });
      },
    );

    test(
      "TC016_API Verify that new member portal user can be signed up under an existing partner",
      {
        tag: ["@TC016", "@API", "@Member Portal", "@Sign Up", "@Partner"],
      },
      async ({ apiClient, memberPortalService, authenticationService, authFlow, purchaseFlow }, testInfo) => {
        const env = process.env.ENV;

        testInfo.skip(env === "prod", "This test is not suitable for production environment");

        const paymentProductName: string = plans[1];

        const adminService = await AdminPortalService.create(apiClient, authenticationService);

        let partnerInfoRsp: Awaited<ReturnType<typeof adminService.searchPartner>>;

        await test.step("1 - Pre-condition: Create partner, activate, and obtain partner token", async () => {
          const testData = new TestDataProvider(adminService);

          const departmentID = await testData.getDepartmentId(process.env.DEPARTMENT_NAME);

          const productTypesAndNamesToSend: ProductInfo[] = await testData.getProductTypesBasedDepartmentId(departmentID);

          const masterPlan: any = await testData.filterMasterPlanBasedName(departmentID, paymentProductName);

          const masterPlanId = masterPlan.masterPlanId;

          const partner = await DataFactory.partnerBuilder()
            .withIsPublic(true)
            .withWhoPay(0)
            .withBankTransfer(true)
            .withDepartment(departmentID)
            .withFilterProductTypes(productTypesAndNamesToSend)
            .withPlanId(masterPlanId)
            .build();

          await adminService.createPartner(partner);

          partnerInfoRsp = await adminService.searchPartner(partner.partnerInfo?.name!);

          const ParntertempPassword = "TempPass@" + Date.now().toString().slice(-4);

          const partnerEmail = partner.accountInfo?.email!;

          await authenticationService.resetPasswordWithoutToken({ username: partnerEmail, password: ParntertempPassword }, undefined, "5");

          const confirmEmailResponse = await authenticationService.confirmEmailWithoutToken(partnerEmail, undefined, "5");

          if (!confirmEmailResponse)
            throw new Error("Failed to confirm email");
          expect(confirmEmailResponse).toBe(true);

          await authenticationService.getAuthToken(partnerEmail, ParntertempPassword, "5");
        });

        let consumerData!: Awaited<ReturnType<ReturnType<typeof DataFactory.customerBuilder>["build"]>>;
        let customerAccountInfo: unknown;
        let consumerTempPassword: string;

        await test.step("2 - Member Portal: Sign up under partner, activate, GET Payment/products", async () => {
          consumerData = await DataFactory.customerBuilder().forMemberPortal().withPartner(partnerInfoRsp.partnerId!).withDepartment(partnerInfoRsp.departmentId!).build();
          customerAccountInfo = consumerData.accountInfo;

          const resp = await memberPortalService.signUpConsumer(consumerData);

          expect(resp).toBeTruthy();
          if (typeof (resp as any) === "string")
            expect((resp as any).length).toBeGreaterThan(0);
          else
            expect(Object.keys(resp as any).length).toBeGreaterThan(0);

          consumerTempPassword = "TempPass@" + Date.now().toString().slice(-4);
          const tempPassword = consumerTempPassword;
          const resetResp = await authenticationService.resetPasswordWithoutToken({ username: (customerAccountInfo as any).email, password: tempPassword }, undefined, "4");

          await authenticationService.confirmEmailWithoutToken((customerAccountInfo as any).email, undefined, "4");

          expect(resetResp).toBeDefined();
          expect(typeof resetResp).toBe("boolean");

          const consumerToken = await authenticationService.getAuthToken((customerAccountInfo as any).email, tempPassword, "4");

          expect(consumerToken).toBeDefined();
          expect(typeof consumerToken).toBe("string");
          expect(consumerToken.length).toBeGreaterThan(10);

          const plansResp = await memberPortalService.getPlansList(partnerInfoRsp.departmentId!, consumerToken);

          expect(plansResp).toBeDefined();
          expect(typeof plansResp).toBe("object");
          expect(Array.isArray(plansResp as any)).toBeTruthy();
          expect(Object.keys(plansResp as any).length).toEqual(6);
        });

        await test.step("3 - GET Plan/me and verify plan details", async () => {
          const newConsumerToken = await authenticationService.getAuthToken((customerAccountInfo as any).email, consumerTempPassword, "4");

          const planDetailsResp = await memberPortalService.getCurrentSubscribedPlan(newConsumerToken);
          expect(planDetailsResp).toBeDefined();
          expect(typeof planDetailsResp).toBe("object");
          expect(planDetailsResp as any).toHaveProperty("id");
          expect(planDetailsResp as any).toHaveProperty("name");
          expect(planDetailsResp as any).toHaveProperty("priceId");
          expect(planDetailsResp as any).toHaveProperty("departmentId");
          expect(planDetailsResp as any).toHaveProperty("productType");
          expect(planDetailsResp as any).toHaveProperty("licenseQuantity");
          expect(planDetailsResp as any).toHaveProperty("b2CFeatureRestrictions");
          expect(planDetailsResp as any).toHaveProperty("freeTrialRestrictions");
          expect(planDetailsResp as any).toHaveProperty("price");
          expect(planDetailsResp as any).toHaveProperty("partnerSetting");
          expect((planDetailsResp as any).departmentId).toBe(partnerInfoRsp.departmentId);

          expect((planDetailsResp as any).name).toContain(paymentProductName);
        });
      },
    );
  },
);
