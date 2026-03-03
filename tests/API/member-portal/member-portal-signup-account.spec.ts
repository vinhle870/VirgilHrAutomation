import { test, expect } from "src/fixtures";
import { DataFactory, CustomerBuilder } from "src/data-factory";
import { AdminPortalService } from "src/api/services/admin-portal.services";
import { plans, validCardInfo } from "src/constant/static-data";
import { TestDataProvider } from "src/test-data";
import { ApiClient } from "src/utilities";
import { ProductInfo } from "src/objects/iproduct";

test.describe("MemberPortalService - signUpConsumer", () => {
  test("TC001_API_Verify the API POST v1/Consumer/Consumers Without PartnerID returns 201-Created", async ({
    memberPortalService,
    apiClient,
    authenticationService,
  }, testInfo) => {
    const base = process.env.API_BASE_URL;
    testInfo.skip(!base, "API_BASE_URL is not configured");

    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );
    const testData = new TestDataProvider(adminService);
    const departmentID = await testData.getDepartmentId(process.env.DEPARTMENT_NAME);

    // Generate consumer payload with discovered IDs (if any)
    //const consumerData = await DataFactory.customerBuilder().forMemberPortal().build();
    const consumerData = await DataFactory.customerBuilder()
      .forMemberPortal()
      .withDepartment(departmentID)
      .build();
    const customerAccountInfo = consumerData.accountInfo;
    //*****---------------------------------------------------*****

    // API VERIFICATION:
    // Call the service (the fixture `memberPortalService` wraps ApiClient):  v1/Consumer/Consumers
    const resp = await memberPortalService.signUpConsumer(consumerData);

    expect(resp).toBeTruthy();
    // API may return a plain string id or a JSON object; accept either.
    if (typeof (resp as any) === "string") {
      expect((resp as any).length).toBeGreaterThan(0);
    } else {
      expect(Object.keys(resp as any).length).toBeGreaterThan(0);
    }
  });

  test("TC007_API_Verify the API GET Payment/products returns 200-OK and the correct Plans list", async ({
    memberPortalService,
    authenticationService,
    apiClient,
  }, testInfo) => {
    const base = process.env.API_BASE_URL;
    const username = process.env.API_USERNAME;
    const password = process.env.API_PASSWORD;
    testInfo.skip(!base, "API_BASE_URL is not configured");

    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );
    const testData = new TestDataProvider(adminService);
    const departmentID = await testData.getDepartmentId(process.env.DEPARTMENT_NAME);

    // Generate consumer payload with discovered IDs (if any)
    const consumerData = await DataFactory.customerBuilder()
      .forMemberPortal()
      .withDepartment(departmentID)
      .build();
    const customerAccountInfo = consumerData.accountInfo;
    //*****---------------------------------------------------*****

    // API VERIFICATION:
    // Call the service (the fixture `memberPortalService` wraps ApiClient)
    const resp = await memberPortalService.signUpConsumer(consumerData);

    //****----------Now attempt to reset password for the newly created consumer using the----------*****
    // Authentication service helper. Use a temporary password for the reset.
    const tempPassword = "TempPass@" + Date.now().toString().slice(-4);
    const resetResp = await authenticationService.resetPasswordWithoutToken(
      { username: (customerAccountInfo as any).email, password: tempPassword },
      undefined,
      "4",
    );

    //Activate the user account if needed (depends on system settings)
    await authenticationService.confirmEmailWithoutToken(
      (customerAccountInfo as any).email,
      undefined,
      "4",
    );

    // Finally, attempt to obtain an auth token for the new consumer using
    // the Authentication service.
    const consumerToken = await authenticationService.getAuthToken(
      (customerAccountInfo as any).email,
      tempPassword,
      "4",
    );

    //****------------------------------------------------------------------------------------------------*****

    // API VERIFICATION: GET PLANS: GET Payment/products
    const plansResp = await memberPortalService.getPlansList(
      consumerData.company.departmentId!,
      consumerToken,
    );

    expect(plansResp).toBeDefined();
    expect(typeof plansResp).toBe("object");
    expect(Array.isArray(plansResp as any)).toBeTruthy();
    expect(Object.keys(plansResp as any).length).toEqual(6);
  });

  test("TC008_API_GET_v1/Payment/checkout return 200-OK with correct URL", async ({
    memberPortalService,
    authenticationService,
    apiClient,
  }, testInfo) => {
    const base = process.env.API_BASE_URL;
    const username = process.env.API_USERNAME;
    const password = process.env.API_PASSWORD;
    testInfo.skip(!base, "API_BASE_URL is not configured");

    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );
    const testData = new TestDataProvider(adminService);
    const departmentID = await testData.getDepartmentId(process.env.DEPARTMENT_NAME);

    // Generate consumer payload with discovered IDs (if any)
    const consumerData = await DataFactory.customerBuilder()
      .forMemberPortal()
      .withDepartment(departmentID)
      .build();
    const customerAccountInfo = consumerData.accountInfo;
    //*****---------------------------------------------------*****

    // API VERIFICATION:
    // Call the service (the fixture `memberPortalService` wraps ApiClient)
    const resp = await memberPortalService.signUpConsumer(consumerData);

    //****----------Now attempt to reset password for the newly created consumer using the----------*****
    // Authentication service helper. Use a temporary password for the reset.
    const tempPassword = "TempPass@" + Date.now().toString().slice(-4);
    const resetResp = await authenticationService.resetPasswordWithoutToken(
      { username: (customerAccountInfo as any).email, password: tempPassword },
      undefined,
      "4",
    );

    //Activate the user account if needed (depends on system settings)
    await authenticationService.confirmEmailWithoutToken(
      (customerAccountInfo as any).email,
      undefined,
      "4",
    );

    // Finally, attempt to obtain an auth token for the new consumer using
    // the Authentication service.
    const consumerToken = await authenticationService.getAuthToken(
      (customerAccountInfo as any).email,
      tempPassword,
      "4",
    );

    expect(consumerToken).toBeDefined();
    expect(typeof consumerToken).toBe("string");
    expect(consumerToken.length).toBeGreaterThan(10);
    //****------------------------------------------------------------------------------------------------*****

    // API VERIFICATION:
    //Now, test the checkOutPlan API with the obtained token: v1/Payment/checkout
    const planResponse = await memberPortalService.checkOutPlan(
      "1",
      consumerToken,
    );

    const memberPortalBaseUrl = process.env.MEMBER_PORTAL_BASEURL;
    if (!memberPortalBaseUrl) {
      testInfo.skip(true, "MEMBER_PORTAL_BASEURL is not configured");
      return;
    }
    const returnUrl = new URL(memberPortalBaseUrl);
    const guid = String((planResponse as any).checkoutSessionGuid);
    expect(planResponse).toBeDefined();
    expect(typeof planResponse).toBe("object");
    expect(Object.keys(planResponse as any).length).toBeGreaterThan(0);
    expect((planResponse as any).returnUrl).toContain(returnUrl.toString());
  });

  test("TC012_API_Verify GET Payment/Status returns 200-OK with correct status", async ({
    memberPortalService,
    authenticationService,
    purchaseFlow,
    authFlow,
    apiClient,
  }, testInfo) => {
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;
    const username = process.env.API_USERNAME ?? process.env.ADMIN_USERNAME;
    const password = process.env.API_PASSWORD ?? process.env.ADMIN_PASSWORD;
    const env   = process.env.ENV;

    testInfo.skip(env === "prod", "This test is not suitable for production environment");

    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );
    const testData = new TestDataProvider(adminService);
    const departmentID = await testData.getDepartmentId(process.env.DEPARTMENT_NAME);

    // Generate consumer payload with discovered IDs (if any)
    const consumerData = await DataFactory.customerBuilder()
      .forMemberPortal()
      .withDepartment(departmentID)
      .build();
    const customerAccountInfo = consumerData.accountInfo;
    const planName = consumerData.plan;
    //*****---------------------------------------------------*****

    // Call the service (the fixture `memberPortalService` wraps ApiClient)
    const resp = await memberPortalService.signUpConsumer(consumerData);

    //****----------Now attempt to reset password for the newly created consumer using the----------*****
    // Authentication service helper. Use a temporary password for the reset.
    const tempPassword = "TempPass@" + Date.now().toString().slice(-4);
    const resetResp = await authenticationService.resetPasswordWithoutToken(
      { username: (customerAccountInfo as any).email, password: tempPassword },
      undefined,
      "4",
    );

    //Activate the user account if needed (depends on system settings)
    await authenticationService.confirmEmailWithoutToken(
      (customerAccountInfo as any).email,
      undefined,
      "4",
    );

    // Finally, attempt to obtain an auth token for the new consumer using
    // the Authentication service.
    let consumerToken = await authenticationService.getAuthToken(
      (customerAccountInfo as any).email,
      tempPassword,
      "4",
    );

    //****------------------------------------------------------------------------------------------------*****

    //Now, test the checkOutPlan API with the obtained token
    let planResponse = await memberPortalService.checkOutPlan(
      "1",
      consumerToken,
    );

    let guid = String((planResponse as any).checkoutSessionGuid);

    //VERFICATION POINT:
    //****-------------Complete Payment to subscribe the plan-------------*****
    const planUrl = String((planResponse as any).returnUrl);

    await authFlow.loginWithValidAccount(
      planUrl,
      (customerAccountInfo as any).email,
      tempPassword,
    );

    await purchaseFlow.buyPlan(
      planUrl,
      (customerAccountInfo as any).email,
      tempPassword,
      validCardInfo,
    );

    //Refresh the consumer token after the payment is completed
    const consumerToken_2 = await authenticationService.getAuthToken(
      (customerAccountInfo as any).email,
      tempPassword,
      "4",
    );

    // API VERIFICATION: GET Payment/subscription/me
    const paymentSubscriptionResp =
      await memberPortalService.getPaymentSubscription(consumerToken_2);
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
    expect((paymentSubscriptionResp as any).main).toHaveProperty(
      "contractStartDate",
    );
    expect((paymentSubscriptionResp as any).main).toHaveProperty(
      "contractEndDate",
    );
    expect((paymentSubscriptionResp as any).main).toHaveProperty(
      "remainingDays",
    );
    expect((paymentSubscriptionResp as any).main).toHaveProperty("planId");
    expect((paymentSubscriptionResp as any).main).toHaveProperty("isTrial");
    expect((paymentSubscriptionResp as any).main).toHaveProperty("isCanceled");
    expect((paymentSubscriptionResp as any).main).toHaveProperty(
      "isPaymentLate",
    );
    expect((paymentSubscriptionResp as any).main).toHaveProperty(
      "cancelAtPeriodEnd",
    );
    expect((paymentSubscriptionResp as any).main).toHaveProperty("canceledBy");
    expect((paymentSubscriptionResp as any).main).toHaveProperty(
      "canceledDate",
    );
    expect((paymentSubscriptionResp as any).main).toHaveProperty(
      "cancellationReason",
    );
    expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
      "name",
    );
    expect((paymentSubscriptionResp as any).handbookBuilder.name).toContain(
      planName,
    );
    expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
      "productType",
    );
    expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
      "quantity",
    );
    expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
      "price",
    );
    expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
      "discount",
    );
    expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
      "startDate",
    );
    expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
      "endDate",
    );
    expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
      "contractStartDate",
    );
    expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
      "contractEndDate",
    );
    expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
      "remainingDays",
    );
    expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
      "isTrial",
    );
    expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
      "isCanceled",
    );
    expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
      "isPaymentLate",
    );
    expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
      "cancelAtPeriodEnd",
    );
    expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
      "canceledBy",
    );
    expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
      "canceledDate",
    );
    expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
      "cancellationReason",
    );
    expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
      "planId",
    );
    expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
      "currentPlan",
    );
    expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
      "rootPlan",
    );
    expect((paymentSubscriptionResp as any)).toHaveProperty("lms");

    //****-----------------------------------------------------------------*****
  });

  test("TC014_UI_Verify that after a successful payment, the system automatically redirects the user to the Virgil homepage", async ({
    memberPortalService,
    authenticationService,
    authFlow,
    purchaseFlow,
    apiClient,
    page,
  }, testInfo) => {
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;
    const username = process.env.API_USERNAME ?? process.env.ADMIN_USERNAME;
    const password = process.env.API_PASSWORD ?? process.env.ADMIN_PASSWORD;
    const env   = process.env.ENV;

    testInfo.skip(env === "prod", "This test is not suitable for production environment");

    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );
    const testData = new TestDataProvider(adminService);
    const departmentID = await testData.getDepartmentId(process.env.DEPARTMENT_NAME);

    // Generate consumer payload with discovered IDs (if any)
    const consumerData = await DataFactory.customerBuilder()
      .forMemberPortal()
      .withDepartment(departmentID)
      .build();
    const customerAccountInfo = consumerData.accountInfo;
    //*****---------------------------------------------------*****

    // API VERIFICATION:
    // Call the service (the fixture `memberPortalService` wraps ApiClient)
    const resp = await memberPortalService.signUpConsumer(consumerData);

    expect(resp).toBeTruthy();
    if (typeof (resp as any) === "string") {
      expect((resp as any).length).toBeGreaterThan(0);
    } else {
      expect(Object.keys(resp as any).length).toBeGreaterThan(0);
    }

    //****----------Now attempt to reset password for the newly created consumer using the----------*****
    // Authentication service helper. Use a temporary password for the reset.
    const tempPassword = "TempPass@" + Date.now().toString().slice(-4);
    const resetResp = await authenticationService.resetPasswordWithoutToken(
      { username: (customerAccountInfo as any).email, password: tempPassword },
      undefined,
      "4",
    );

    //Activate the user account if needed (depends on system settings)
    await authenticationService.confirmEmailWithoutToken(
      (customerAccountInfo as any).email,
      undefined,
      "4",
    );

    // Basic assertions for reset response
    expect(resetResp).toBeDefined();
    expect(typeof resetResp).toBe("boolean");

    // Finally, attempt to obtain an auth token for the new consumer using
    // the Authentication service.
    const consumerToken = await authenticationService.getAuthToken(
      (customerAccountInfo as any).email,
      tempPassword,
      "4",
    );

    expect(consumerToken).toBeDefined();
    expect(typeof consumerToken).toBe("string");
    expect(consumerToken.length).toBeGreaterThan(10);
    //****------------------------------------------------------------------------------------------------*****

    // API VERIFICATION: GET PLANS:
    const plansResp = await memberPortalService.getPlansList(
      consumerData.company.departmentId!,
      consumerToken,
    );

    expect(plansResp).toBeDefined();
    expect(typeof plansResp).toBe("object");
    expect(Array.isArray(plansResp as any)).toBeTruthy();
    expect(Object.keys(plansResp as any).length).toEqual(6);

    // API VERIFICATION:
    //Now, test the checkOutPlan API with the obtained token
    const planResponse = await memberPortalService.checkOutPlan(
      "1",
      consumerToken,
    );

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

    //****-------------Complete Payment to subscribe the plan-------------*****
    //const subDomainUrl = `https://${partnerInfo.subDomain}.member-virgilhr-${process.env.exec_env}.bigin.top`;
    const planUrl = String((planResponse as any).returnUrl);

 let guid = String((planResponse as any).checkoutSessionGuid);

  await authFlow.loginWithValidAccount(
      planUrl,
      (customerAccountInfo as any).email,
      tempPassword,
    );

    await purchaseFlow.buyPlan(
      planUrl,
      (customerAccountInfo as any).email,
      tempPassword,
      validCardInfo,
    );

    const urlRegex = new RegExp(`.*/home$`);
    expect(page.url()).toMatch(urlRegex);
  });

  test("TC015_API_Verify GET Plan/me returns 200-OK and correct paid plan details", async ({
    memberPortalService,
    authenticationService,
    authFlow,
    purchaseFlow,
    apiClient,
  }, testInfo) => {
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;
    const username = process.env.API_USERNAME ?? process.env.ADMIN_USERNAME;
    const password = process.env.API_PASSWORD ?? process.env.ADMIN_PASSWORD;
    const env   = process.env.ENV;

    testInfo.skip(env === "prod", "This test is not suitable for production environment");

    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );
    const testData = new TestDataProvider(adminService);
    const departmentID = await testData.getDepartmentId(process.env.DEPARTMENT_NAME);

    // Generate consumer payload with discovered IDs (if any)
    const consumerData = await DataFactory.customerBuilder()
      .forMemberPortal()
      .withDepartment(departmentID)
      .build();
    const customerAccountInfo = consumerData.accountInfo;
    //*****---------------------------------------------------*****

    // API VERIFICATION:
    // Call the service (the fixture `memberPortalService` wraps ApiClient)
    const resp = await memberPortalService.signUpConsumer(consumerData);

    expect(resp).toBeTruthy();
    if (typeof (resp as any) === "string") {
      expect((resp as any).length).toBeGreaterThan(0);
    } else {
      expect(Object.keys(resp as any).length).toBeGreaterThan(0);
    }

    //****----------Now attempt to reset password for the newly created consumer using the----------*****
    // Authentication service helper. Use a temporary password for the reset.
    const tempPassword = "TempPass@" + Date.now().toString().slice(-4);
    const resetResp = await authenticationService.resetPasswordWithoutToken(
      { username: (customerAccountInfo as any).email, password: tempPassword },
      undefined,
      "4",
    );

    //Activate the user account if needed (depends on system settings)
    await authenticationService.confirmEmailWithoutToken(
      (customerAccountInfo as any).email,
      undefined,
      "4",
    );

    // Finally, attempt to obtain an auth token for the new consumer using
    // the Authentication service.
    const consumerToken = await authenticationService.getAuthToken(
      (customerAccountInfo as any).email,
      tempPassword,
      "4",
    );

    //****------------------------------------------------------------------------------------------------*****

    // API VERIFICATION:
    //Now, test the checkOutPlan API with the obtained token
    const planResponse = await memberPortalService.checkOutPlan(
      "1",
      consumerToken,
    );

    //****-------------Complete Payment to subscribe the plan-------------*****
    const planUrl = String((planResponse as any).returnUrl);

    await authFlow.loginWithValidAccount(
      planUrl,
      (customerAccountInfo as any).email,
      tempPassword,
    );

    await purchaseFlow.buyPlan(
      planUrl,
      (customerAccountInfo as any).email,
      tempPassword,
      validCardInfo,
    );

    //****-----------------------------------------------------------------*****

    //Refresh token after plan subscription (in case it changed)
    const newConsumerToken = await authenticationService.getAuthToken(
      (customerAccountInfo as any).email,
      tempPassword,
      "4",
    );

    // API VERIFICATION:
    // PreviewPlan  API call to get current user's plan: GET Plan/me
    const planDetailsResp =
      await memberPortalService.getCurrentSubscribedPlan(newConsumerToken);
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
    expect((planDetailsResp as any).departmentId).toBe(
      consumerData.company.departmentId,
    );
    const planName = consumerData.plan;
    expect((planDetailsResp as any).name).toContain(planName);
  });

  test("TC016_API Verify that new member portal user can be signed up under an existing partner", async ({
    apiClient,
    memberPortalService,
    authenticationService,
    authFlow,
    purchaseFlow,
  }, testInfo) => {
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;
    const username = process.env.API_USERNAME ?? process.env.ADMIN_USERNAME;
    const password = process.env.API_PASSWORD ?? process.env.ADMIN_PASSWORD;
    const env   = process.env.ENV;

    testInfo.skip(env === "prod", "This test is not suitable for production environment");

  //*****-----DATA PREPRATION-----*****
    // generated consumer. If search finds nothing, generator will use defaults.
      const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );
    const testData = new TestDataProvider(adminService);

    //Get department id to send
    let departmentID = await testData.getDepartmentId(process.env.DEPARTMENT_NAME);

    //Choose a plan = "50 - 100 Employees"
    const paymentProductName: string = plans[1];

    //Get all product types of a department (departmentID):
    // It is required for scenario Bank Transfer is True
    const productTypesAndNamesToSend: ProductInfo[] = await testData.getProductTypesBasedDepartmentId(departmentID);

    const masterPlan: any = await testData.filterMasterPlanBasedName(
      departmentID,
      paymentProductName,
    );

    const masterPlanId = masterPlan.masterPlanId;

    //Generate partner info using PartnerBuilder
    const partner = await DataFactory.partnerBuilder()
      .withIsPublic(true)
      .withWhoPay(0) //Partner pays
      .withBankTransfer(true)
      .withDepartment(departmentID)
      .withFilterProductTypes(productTypesAndNamesToSend)
      .withPlanId(masterPlanId)
      .build();


    //*************Pre-condition ****************  //
    //*********API Step: Create partner
    const partnerResponse = await adminService.createPartner(partner);

    const partnerInfoRsp = await adminService.searchPartner(partner.partnerInfo?.name!);

    //Activate Partner
     const ParntertempPassword = "TempPass@" + Date.now().toString().slice(-4);

      const partnerEmail = partner.accountInfo?.email!;
     const resetPartner =
        await authenticationService.resetPasswordWithoutToken(
          { username: partnerEmail, password: ParntertempPassword },
          undefined,
          "5",
        );

        const confirmEmailResponse =
          await authenticationService.confirmEmailWithoutToken(
            partnerEmail,
            undefined,
            "5", //Partner Portal
          );

        if (!confirmEmailResponse) {
          throw new Error("Failed to confirm email");
        }
        expect(confirmEmailResponse).toBe(true);

        //API Step: Get auth token from Partner
        const partnerToken = await authenticationService.getAuthToken(
        partnerEmail, ParntertempPassword,"5", //Partner Portal
        );

    // Generate consumer payload with discovered IDs (if any)
    // const consumerData = await DataFactory.generateCustomerInfo("member", {partnerId:partnerInfo.partnerId, departmentId:partnerInfo.departmentId});
    const consumerData = await DataFactory.customerBuilder()
      .forMemberPortal()
      .withPartner(partnerInfoRsp.partnerId!)
      .withDepartment(partnerInfoRsp.departmentId!)
      .build();
    const customerAccountInfo = consumerData.accountInfo;

    //*****---------------------------------------------------*****

    // API VERIFICATION:
    // Call the service (the fixture `memberPortalService` wraps ApiClient)
    const resp = await memberPortalService.signUpConsumer(consumerData);

    expect(resp).toBeTruthy();
    if (typeof (resp as any) === "string") {
      expect((resp as any).length).toBeGreaterThan(0);
    } else {
      expect(Object.keys(resp as any).length).toBeGreaterThan(0);
    }

    //****----------Now attempt to reset password for the newly created consumer using the----------*****
    // Authentication service helper. Use a temporary password for the reset.
    const tempPassword = "TempPass@" + Date.now().toString().slice(-4);
    const resetResp = await authenticationService.resetPasswordWithoutToken(
      { username: (customerAccountInfo as any).email, password: tempPassword },
      undefined,
      "4",
    );

    //Activate the user account if needed (depends on system settings)
    await authenticationService.confirmEmailWithoutToken(
      (customerAccountInfo as any).email,
      undefined,
      "4",
    );

    // Basic assertions for reset response
    expect(resetResp).toBeDefined();
    expect(typeof resetResp).toBe("boolean");

    // Finally, attempt to obtain an auth token for the new consumer using
    // the Authentication service.
    const consumerToken = await authenticationService.getAuthToken(
      (customerAccountInfo as any).email,
      tempPassword,
      "4",
    );

    expect(consumerToken).toBeDefined();
    expect(typeof consumerToken).toBe("string");
    expect(consumerToken.length).toBeGreaterThan(10);
    //****------------------------------------------------------------------------------------------------*****

    // API VERIFICATION: GET PLANS:
    const plansResp = await memberPortalService.getPlansList(
      partnerInfoRsp.departmentId!,
      consumerToken,
    );

    expect(plansResp).toBeDefined();
    expect(typeof plansResp).toBe("object");
    expect(Array.isArray(plansResp as any)).toBeTruthy();
    expect(Object.keys(plansResp as any).length).toEqual(6);

        //****-----------------------------------------------------------------*****

    //Refresh token after plan subscription (in case it changed)
    const newConsumerToken = await authenticationService.getAuthToken(
      (customerAccountInfo as any).email,
      tempPassword,
      "4",
    );

    // API VERIFICATION:
    // PreviewPlan  API call to get current user's plan
    const planDetailsResp =
      await memberPortalService.getCurrentSubscribedPlan(newConsumerToken);
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
    expect((planDetailsResp as any).departmentId).toBe(partnerInfoRsp.departmentId);

    expect((planDetailsResp as any).name).toContain(paymentProductName);
  });
});
