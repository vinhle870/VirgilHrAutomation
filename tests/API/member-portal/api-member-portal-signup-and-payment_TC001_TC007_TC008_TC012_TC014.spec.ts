import { test, expect } from "src/fixtures";
import { DataFactory } from "src/data-factory";
import { AdminPortalService } from "src/api/services/admin-portal.services";
import { TestDataProvider } from "src/test-data";

test.describe(
  "MemberPortalService - signUpConsumer",
  {
    tag: ["@API", "@Member Portal", "@Sign Up", "@Consumer", "@regression_API"],
  },
  () => {
    test(
      "TC001_API_Verify the API POST v1/Consumer/Consumers Without PartnerID returns 201-Created",
      {
        tag: ["@TC001", "@API", "@Member Portal", "@Sign Up", "@Consumer"],
      },
      async ({ memberPortalService, apiClient, authenticationService }) => {
        let consumerData!: Awaited<ReturnType<ReturnType<typeof DataFactory.customerBuilder>["build"]>>;

        await test.step("1 - Pre-condition: Build consumer payload", async () => {
          const adminService = await AdminPortalService.create(apiClient, authenticationService);
          const testData = new TestDataProvider(adminService);
          const departmentID = await testData.getDepartmentId(process.env.DEPARTMENT_NAME);

          consumerData = await DataFactory.customerBuilder().forMemberPortal().withDepartment(departmentID).build();
        });

        await test.step("2 - POST v1/Consumer/Consumers and verify 201-Created response", async () => {
          const resp = await memberPortalService.signUpConsumer(consumerData);

          expect(resp).toBeTruthy();
          if (typeof (resp as any) === "string")
            expect((resp as any).length).toBeGreaterThan(0);
          else
            expect(Object.keys(resp as any).length).toBeGreaterThan(0);
        });
      },
    );

    test(
      "TC007_API_Verify the API GET Payment/products returns 200-OK and the correct Plans list",
      {
        tag: ["@TC007", "@API", "@Member Portal", "@Payment", "@Plans"],
      },
      async ({ memberPortalService, authenticationService, apiClient }) => {
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

        await test.step("2 - Sign up consumer, activate account, and obtain token", async () => {
          await memberPortalService.signUpConsumer(consumerData);

          await authenticationService.resetPasswordWithoutToken({ username: (customerAccountInfo as any).email, password: tempPassword }, undefined, "4");

          await authenticationService.confirmEmailWithoutToken((customerAccountInfo as any).email, undefined, "4");
        });

        await test.step("3 - GET Payment/products and verify plans list", async () => {
          const consumerToken = await authenticationService.getAuthToken((customerAccountInfo as any).email, tempPassword, "4");

          const plansResp = await memberPortalService.getPlansList(consumerData.company.departmentId!, consumerToken);

          expect(plansResp).toBeDefined();
          expect(typeof plansResp).toBe("object");
          expect(Array.isArray(plansResp as any)).toBeTruthy();
          expect(Object.keys(plansResp as any).length).toBeGreaterThan(0);
          expect((plansResp as any)[0].name).not.toBe("");
          expect((plansResp as any)[0].description).not.toBe("");
          expect((plansResp as any)[0].companySize).not.toBe("");
          expect(typeof (plansResp as any)[0].freeTrialAllowed).toBe("boolean");
          expect(Array.isArray((plansResp as any)[0].benefits)).toBeTruthy();
          expect(Object.keys((plansResp as any)[0].benefits).length).toBeGreaterThan(0);
          expect((plansResp as any)[0].benefits[0].benefit).not.toBe("");
          expect((plansResp as any)[0].benefits[0].benefitKey).not.toBe("");
          expect(typeof (plansResp as any)[0].benefits[0].requiredPayment).toBe("boolean");
          expect(typeof (plansResp as any)[0].benefits[0].isSame).toBe("boolean");
        });
      },
    );

    test(
      "TC008_API_GET_v1/Payment/checkout return 200-OK with correct URL",
      {
        tag: ["@TC008", "@API", "@Member Portal", "@Payment", "@Checkout"],
      },
      async ({ memberPortalService, authenticationService, apiClient }, testInfo) => {
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
          await memberPortalService.signUpConsumer(consumerData);

          await authenticationService.resetPasswordWithoutToken({ username: (customerAccountInfo as any).email, password: tempPassword }, undefined, "4");

          await authenticationService.confirmEmailWithoutToken((customerAccountInfo as any).email, undefined, "4");

          consumerToken = await authenticationService.getAuthToken((customerAccountInfo as any).email, tempPassword, "4");

          expect(consumerToken).toBeDefined();
          expect(typeof consumerToken).toBe("string");
          expect(consumerToken.length).toBeGreaterThan(10);
        });

        await test.step("3 - GET v1/Payment/checkout and verify return URL", async () => {
          const planResponse = await memberPortalService.checkOutPlan("1", consumerToken);

          const memberPortalBaseUrl = process.env.MEMBER_PORTAL_BASEURL;
          if (!memberPortalBaseUrl) {
            testInfo.skip(true, "MEMBER_PORTAL_BASEURL is not configured");
            return;
          }
          const returnUrl = new URL(memberPortalBaseUrl);
          expect(planResponse).toBeDefined();
          expect(typeof planResponse).toBe("object");
          expect(Object.keys(planResponse as any).length).toBeGreaterThan(0);
          expect((planResponse as any).returnUrl).toContain(returnUrl.toString());
        });
      },
    );

    test(
      "TC012_API_Verify GET Payment/Status returns 200-OK with correct status",
      {
        tag: ["@TC012", "@API", "@Member Portal", "@Payment", "@Status"],
      },
      async ({ memberPortalService, authenticationService, purchaseFlow, authFlow, apiClient }, testInfo) => {
        const env = process.env.ENV;

        testInfo.skip(env === "prod", "This test is not suitable for production environment");

        let consumerData!: Awaited<ReturnType<ReturnType<typeof DataFactory.customerBuilder>["build"]>>;
        let customerAccountInfo: unknown;
        let planName: string;

        await test.step("1 - Pre-condition: Build consumer payload", async () => {
          const adminService = await AdminPortalService.create(apiClient, authenticationService);
          const testData = new TestDataProvider(adminService);
          const departmentID = await testData.getDepartmentId(process.env.DEPARTMENT_NAME);

          consumerData = await DataFactory.customerBuilder().forMemberPortal().withDepartment(departmentID).build();
          customerAccountInfo = consumerData.accountInfo;
          planName = consumerData.plan;
        });

        const tempPassword = "TempPass@" + Date.now().toString().slice(-4);

        let consumerToken: string;

        await test.step("2 - Sign up consumer, activate account, and obtain token", async () => {
          await memberPortalService.signUpConsumer(consumerData);

          await authenticationService.resetPasswordWithoutToken({ username: (customerAccountInfo as any).email, password: tempPassword }, undefined, "4");

          await authenticationService.confirmEmailWithoutToken((customerAccountInfo as any).email, undefined, "4");

          consumerToken = await authenticationService.getAuthToken((customerAccountInfo as any).email, tempPassword, "4");
        });

        await test.step("3 - Checkout plan and complete payment (UI)", async () => {
          const planResponse = await memberPortalService.checkOutPlan("1", consumerToken);

          const planUrl = String((planResponse as any).returnUrl);

          await authFlow.loginToPortals(planUrl, (customerAccountInfo as any).email, tempPassword);

          await purchaseFlow.buyPlanByCustomer(planUrl, (customerAccountInfo as any).email, planName);
        });

        await test.step("4 - Verify GET Payment/subscription/me", async () => {
          const consumerToken_2 = await authenticationService.getAuthToken((customerAccountInfo as any).email, tempPassword, "4");

          const paymentSubscriptionResp = await memberPortalService.getPaymentSubscription(consumerToken_2);
          expect(paymentSubscriptionResp).toBeDefined();
          expect(typeof paymentSubscriptionResp).toBe("object");
          expect((paymentSubscriptionResp as any).main).toBeDefined();
          expect((paymentSubscriptionResp as any).handbookBuilder).toBeDefined();
          expect((paymentSubscriptionResp as any).lms).toBeDefined();
          expect((paymentSubscriptionResp as any).main.name).toContain(planName);
          expect((paymentSubscriptionResp as any).main).toHaveProperty("productType");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("quantity");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("productType");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("price");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("discount");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("startDate");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("endDate");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("contractStartDate");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("contractEndDate");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("remainingDays");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("planId");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("isTrial");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("isCanceled");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("isPaymentLate");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("cancelAtPeriodEnd");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("canceledBy");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("canceledDate");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("cancellationReason");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("name");
          expect((paymentSubscriptionResp as any).handbookBuilder.name).toContain(planName);
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("productType");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("quantity");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("price");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("discount");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("startDate");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("endDate");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("contractStartDate");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("contractEndDate");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("remainingDays");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("isTrial");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("isCanceled");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("isPaymentLate");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("cancelAtPeriodEnd");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("canceledBy");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("canceledDate");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("cancellationReason");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("planId");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("currentPlan");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("rootPlan");
          expect(paymentSubscriptionResp as any).toHaveProperty("lms");

          //****-----------------------------------------------------------------*****
        });
      },
    );

    test("TC014_UI_Verify that after a successful payment, the system automatically redirects the user to the Virgil homepage", async ({
      memberPortalService,
      authenticationService,
      authFlow,
      purchaseFlow,
      apiClient,
      page,
    }, testInfo) => {
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

      await test.step("2 - Sign up consumer, activate account, token, and GET Payment/products", async () => {
        const resp = await memberPortalService.signUpConsumer(consumerData);

        expect(resp).toBeTruthy();
        if (typeof (resp as any) === "string")
          expect((resp as any).length).toBeGreaterThan(0);
        else
          expect(Object.keys(resp as any).length).toBeGreaterThan(0);

        const resetResp = await authenticationService.resetPasswordWithoutToken({ username: (customerAccountInfo as any).email, password: tempPassword }, undefined, "4");

        await authenticationService.confirmEmailWithoutToken((customerAccountInfo as any).email, undefined, "4");

        expect(resetResp).toBeDefined();
        expect(typeof resetResp).toBe("boolean");

        consumerToken = await authenticationService.getAuthToken((customerAccountInfo as any).email, tempPassword, "4");

        expect(consumerToken).toBeDefined();
        expect(typeof consumerToken).toBe("string");
        expect(consumerToken.length).toBeGreaterThan(10);

        const plansResp = await memberPortalService.getPlansList(consumerData.company.departmentId!, consumerToken);

        expect(plansResp).toBeDefined();
        expect(typeof plansResp).toBe("object");
        expect(Array.isArray(plansResp as any)).toBeTruthy();
        expect(Object.keys(plansResp as any).length).toEqual(6);
      });

      let planResponse: Awaited<ReturnType<typeof memberPortalService.checkOutPlan>>;

      await test.step("3 - GET v1/Payment/checkout and verify return URL", async () => {
        planResponse = await memberPortalService.checkOutPlan("1", consumerToken);

        const memberPortalBaseUrl = process.env.MEMBER_PORTAL_BASEURL;
        if (!memberPortalBaseUrl) {
          testInfo.skip(true, "MEMBER_PORTAL_BASEURL is not configured");
          return;
        }
        const returnUrl = new URL(memberPortalBaseUrl);
        expect(planResponse).toBeDefined();
        expect(typeof planResponse).toBe("object");
        expect(Object.keys(planResponse as any).length).toBeGreaterThan(0);
        expect((planResponse as any).returnUrl).toContain(returnUrl.toString());
      });

      await test.step("4 - Complete payment and verify redirect to Virgil home", async () => {
        const planUrl = String((planResponse as any).returnUrl);

        await authFlow.loginToPortals(planUrl, (customerAccountInfo as any).email, tempPassword);

        await purchaseFlow.buyPlanByCustomer(planUrl, (customerAccountInfo as any).email, consumerData.plan);

        const urlRegex = new RegExp(`.*/home$`);
        expect(page.url()).toMatch(urlRegex);
      });
    });
  },
);
