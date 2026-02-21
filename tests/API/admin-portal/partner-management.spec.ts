import { test, expect } from "src/fixtures";
import { AdminPortalService } from "src/api/services/admin-portal.services";
import { DataFactory } from "src/data-factory";
import { TestDataProvider } from "src/test-data";
import { DataGenerate } from "src/utilities";
import { ProductInfo } from "src/objects/iproduct";
import Comparison from "src/utilities/compare";
import { plans } from "src/constant/static-data";

test.describe("Partner managerment", () => {
  test("TC030_API Verify that a partner account can only be created in the Admin Portal – Partner Management.", async ({
    apiClient,
    authenticationService,
  }, testInfo) => {
    testInfo.skip(
      !process.env.API_BASE_URL && !process.env.BASE_URL,
      "API_BASE_URL is not configured",
    );
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");

    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );

    const partnerInfo = await DataFactory.partnerBuilder().build();

    const response = await adminService.createPartner(partnerInfo);

    expect(response).toBeDefined();
    expect(typeof response).toBe("string");
    expect(response.length).toBeGreaterThan(0);
  });

  test("TC31 Verify when a Partner is being created, the admin can select its level as Partner or PEO/Consultant.", async ({
    apiClient,
    authenticationService,
  }, testInfo) => {
    testInfo.skip(
      !process.env.API_BASE_URL && !process.env.BASE_URL,
      "API_BASE_URL is not configured",
    );
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");

    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );

    const peoInfo = await DataFactory.partnerBuilder().withLevel(1).build();

    const nameOfPeoInfo: string = peoInfo.partnerInfo?.name!;

    const responsePEO = await adminService.createPartner(peoInfo);

    const peoLevel = (await adminService.searchPartnerByText(nameOfPeoInfo))
      .entities[0].level;

    expect(peoLevel).toBe(1); //PEO level is 1

    //Create a new partner with level 0 as Partner
    const partnerInfo = await DataFactory.partnerBuilder().build();

    const nameOfpartnerInfo: string = partnerInfo.partnerInfo?.name!;

    const responsePartner = await adminService.createPartner(partnerInfo);

    //Search partner by name and get the level
    const partnerLevel = await (
      await adminService.searchPartnerByText(nameOfpartnerInfo)
    ).entities[0].level;

    expect(partnerLevel).toBe(0); //Partner level is 0
  });
  test("TC_33 When creating a new Partner, the admin can choose to assign a sub-domain to that Partner, or not.", async ({
    apiClient,
    authenticationService,
  }, testInfo) => {
    testInfo.skip(
      !process.env.API_BASE_URL && !process.env.BASE_URL,
      "API_BASE_URL is not configured",
    );
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");

    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );

    for (let i = 0; i < 2; i++) {
      const seq = DataGenerate.getRandomInt(1, 9999);

      let domain;

      if (i == 0) domain = "";
      else domain = `test${seq}`;

      const partnerInfo = await DataFactory.partnerBuilder()
        .withIsPublic(true)
        .withSubDomain(domain)
        .build();
      const responseOfPartner = await adminService.createPartner(partnerInfo);

      expect(responseOfPartner).toBeDefined();
      expect(typeof responseOfPartner).toBe("string");
      expect(responseOfPartner.length).toBeGreaterThan(0);
    }
  });
  test("TC034_API For Payment Options, the admin can select either Partner/Consultant Owner or Member Portal Consumer.", async ({
    apiClient,
    authenticationService,
  }, testInfo) => {
    testInfo.skip(
      !process.env.API_BASE_URL && !process.env.BASE_URL,
      "API_BASE_URL is not configured",
    );
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");

    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );

    const paymentOptions = [0, 1]; // 0: Partner, 1: Customer
    for (let i = 0; i < paymentOptions.length; i++) {
      const partnerInfo = await DataFactory.partnerBuilder()
        .withPaymentEnable(!!i)
        .build();

      const nameOfPartnerInfo = partnerInfo.partnerInfo?.name!;

      const responseOfPartner = await adminService.createPartner(partnerInfo);

      const paymentEnable = (
        await adminService.searchPartnerByText(nameOfPartnerInfo)
      ).entities[0].paymentEnable;

      if (i == 0) expect(paymentEnable).toBe(false);
      else expect(paymentEnable).toBe(true);
    } //end for loop
  });

  test("TC35 With Payment Options = Partner/Consultant Owner, the user will make payments in the Partner Portal, and the Partner account will be the owner of all Businesses.", async ({
    apiClient,
    authenticationService,
  }, testInfo) => {
    testInfo.skip(
      !process.env.API_BASE_URL && !process.env.BASE_URL,
      "API_BASE_URL is not configured",
    );
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");

    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );

    const partnerInfo = await DataFactory.partnerBuilder()
      .withIsPublic(true)
      .withWhoPay(0)
      .build();

    await adminService.createPartner(partnerInfo);

    const tempPassword = "TempPass@" + Date.now().toString().slice(-4);
    const email = partnerInfo.accountInfo?.email!;

    if (!email) {
      throw new Error(
        "Generated partnerInfo does not contain accountInfo.email",
      );
    }

    const resetResp = await authenticationService.resetPasswordWithoutToken(
      { username: email, password: tempPassword },
      undefined,
      "5",
    );

    if (resetResp) {
      await authenticationService.confirmEmailWithoutToken(
        email,
        undefined,
        "5",
      );

      const emailOfPartner = partnerInfo.accountInfo?.email!;

      const searchResponse =
        await adminService.getCustomerByEmail(emailOfPartner);

      const customerId = searchResponse.entities[0].consumerObjectId;

      const customerRole = await adminService.getCustomer(customerId);

      //Get the role of the customer: 0: Owner, 1: Admin, 3: User
      expect(customerRole.role).toBe(0);
    }
  });

  test("TC37 Verify that when creating a new Partner, the admin can allow certain benefits to appear in the Member Portal.", async ({
    apiClient,
    authenticationService,
    adminPortalService,
    memberPortalService,
  }, testInfo) => {
    testInfo.skip(
      !process.env.API_BASE_URL && !process.env.BASE_URL,
      "API_BASE_URL is not configured",
    );
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");

    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );

    const testData = new TestDataProvider(adminPortalService);
    //Create department id to send
    const departmentID = await testData.getDepartmentId("BiginHR");
    const paymentProductName: string = plans[1];
    //Choose masterID to send
    const masterPlan: any = await testData.filterMasterPlanBasedName(
      departmentID,
      paymentProductName,
    );
    const masterPlanId = masterPlan.masterPlanId;

    //Get all product types of a department (departmentID)
    const productTypesAndNamesToSend: ProductInfo[] =
      await testData.getProductTypesBasedDepartmentId(departmentID);
    //Create partner info
    const partnerInfo = await DataFactory.partnerBuilder()
      .withIsPublic(true)
      .withWhoPay(0)
      .withBankTransfer(true)
      .withDepartment(departmentID)
      .withFilterProductTypes(productTypesAndNamesToSend)
      .withPlanId(masterPlanId)
      .build();

    //Create partner
    await adminService.createPartner(partnerInfo);

    const tempPassword = "TempPass@" + Date.now().toString().slice(-4);

    const email = partnerInfo.accountInfo?.email!;
    //Reset partner
    await authenticationService.resetPasswordWithoutToken(
      { username: email, password: tempPassword },
      undefined,
      "5",
    );
    //Reset customer
    await authenticationService.resetPasswordWithoutToken(
      { username: email, password: tempPassword },
      undefined,
      "4",
    );

    await authenticationService.confirmEmailWithoutToken(email, undefined, "5");

    const memberportalToken = await authenticationService.getAuthToken(
      email,
      tempPassword,
      "4",
    );

    //Get benifits in member portal after partner bought the selected plan successfully
    const memberportalPlanResp: any =
      await memberPortalService.getPaymentSubscription(memberportalToken);

    //Get benifit imformation of selected plan in adminportal
    const adminportalPlanResp: any =
      await adminPortalService.getDepartmentPlanList(departmentID);

    const adminportalPlan = await testData.filterPlanBasedName(
      adminportalPlanResp,
      paymentProductName,
    );

    Comparison.comparePlan(memberportalPlanResp, adminportalPlan);
  });
  test("TC38 Verify that the admin can specify which plans a Partner can use for its Businesses via the Product Type field.", async ({
    apiClient,
    authenticationService,
    adminPortalService,
  }, testInfo) => {
    testInfo.skip(
      !process.env.API_BASE_URL && !process.env.BASE_URL,
      "API_BASE_URL is not configured",
    );
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");

    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );
    const testData = new TestDataProvider(adminPortalService);

    //Get all product types of a department (departmentID)
    const departmentID = await testData.getDepartmentId("BiginHR");
    const paymentProductName: string = plans[1];
    //Choose a plan to buy
    const masterPlan: any = await testData.filterMasterPlanBasedName(
      departmentID,
      paymentProductName,
    );

    const masterPlanId = masterPlan.masterPlanId;
    // Get all product types of a department
    const productTypesAndNamesToSend: ProductInfo[] =
      await testData.getProductTypesBasedDepartmentId(departmentID);
    //Create partner info
    const partnerInfo = await DataFactory.partnerBuilder()
      .withIsPublic(true)
      .withDepartment(departmentID)
      .withFilterProductTypes(productTypesAndNamesToSend)
      .withWhoPay(0)
      .withPlanId(masterPlanId)
      .build();
    //Create a new partner
    const partnerResponse = await adminService.createPartner(partnerInfo);

    expect(partnerResponse).toBeDefined();
  });
  test("TC44 For Payment Options = Partner/Consultant Owner, the Owner account can log in to both the Member Portal and the Partner Portal.", async ({
    apiClient,
    authenticationService,
  }, testInfo) => {
    testInfo.skip(
      !process.env.API_BASE_URL && !process.env.BASE_URL,
      "API_BASE_URL is not configured",
    );
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");

    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );
    //Create a new partner with Payment Options = Partner/Consultant Owner
    const partnerInfo = await DataFactory.partnerBuilder()
      .withIsPublic(true)
      .withWhoPay(0)
      .build();

    await adminService.createPartner(partnerInfo);

    const tempPassword = "TempPass@" + Date.now().toString().slice(-4);

    const email = partnerInfo.accountInfo?.email!;
    //Login in partner portal
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

    await authenticationService.confirmEmailWithoutToken(email, undefined, "5");

    const partnerToLogin = await authenticationService.getAuthToken(
      email,
      tempPassword,
      "5",
    );

    expect(partnerToLogin).toBeDefined();
    //Login in member portal
    await authenticationService.confirmEmailWithoutToken(email, undefined, "4");

    const memberToLogin = await authenticationService.getAuthToken(
      email,
      tempPassword,
      "4",
    );

    expect(memberToLogin).toBeDefined();
  });

  test("TC45 With Payment Options = Member Portal Consumer, after successfully creating a Partner account, the user receives one credential email — for the Partner Portal.", async ({
    apiClient,
    authenticationService,
  }, testInfo) => {
    testInfo.skip(
      !process.env.API_BASE_URL && !process.env.BASE_URL,
      "API_BASE_URL is not configured",
    );
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");

    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );

    const partnerInfo = await DataFactory.partnerBuilder()
      .withIsPublic(true)
      .withWhoPay(1)
      .build();

    await adminService.createPartner(partnerInfo);

    const tempPassword = "TempPass@" + Date.now().toString().slice(-4);

    const email = partnerInfo.accountInfo?.email!;

    await authenticationService.resetPasswordWithoutToken(
      { username: email, password: tempPassword },
      undefined,
      "5",
    );

    await authenticationService.confirmEmailWithoutToken(email, undefined, "5");

    const emailOfPartner = partnerInfo.accountInfo?.email!;

    expect(emailOfPartner).toBeDefined();

    const searchResponse =
      await adminService.getCustomerByEmail(emailOfPartner);

    const customerEmail = searchResponse.body.entities[0];

    expect(customerEmail).toBeFalsy();
  });

  test("TC46 For Payment Options = Member Portal Consumer, the Owner of the Partner/Consultant can only log in to the Partner Portal.", async ({
    apiClient,
    authenticationService,
  }, testInfo) => {
    testInfo.skip(
      !process.env.API_BASE_URL && !process.env.BASE_URL,
      "API_BASE_URL is not configured",
    );
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");

    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );

    const partnerInfo = await DataFactory.partnerBuilder()
      .withIsPublic(true)
      .withWhoPay(1)
      .build();

    await adminService.createPartner(partnerInfo);

    const email = partnerInfo.accountInfo?.email!;

    const tempPassword = "TempPass@" + Date.now().toString().slice(-4);

    await authenticationService.resetPasswordWithoutToken(
      { username: email, password: tempPassword },
      undefined,
      "5",
    );

    await authenticationService.confirmEmailWithoutToken(email, undefined, "5");

    const partnerToLogin = await authenticationService.getAuthToken(
      email,
      tempPassword,
      "5",
    );

    expect(partnerToLogin).toBeDefined();

    const searchResponse = await adminService.getCustomerByEmail(email);

    const customerEmail = searchResponse.body.entities[0];

    expect(customerEmail).toBeFalsy();
  });

  test("TC47 For Businesses under a Partner with Payment Options = Member Portal Consumer, the Business Owner cannot log in to the Member Portal.", async ({
    apiClient,
    authenticationService,
    memberPortalService,
  }, testInfo) => {
    testInfo.skip(
      !process.env.API_BASE_URL && !process.env.BASE_URL,
      "API_BASE_URL is not configured",
    );
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");

    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );

    const partnerInfo = await DataFactory.partnerBuilder()
      .withIsPublic(true)
      .withWhoPay(1)
      .build();

    const partnerResponse = await adminService.createPartner(partnerInfo);

    const email = partnerInfo.accountInfo?.email!;

    if (partnerResponse.status == 200) {
      const tempPassword = "TempPass@" + Date.now().toString().slice(-4);

      const resetPassword =
        await authenticationService.resetPasswordWithoutToken(
          { username: email, password: tempPassword },
          undefined,
          "5",
        );

      if (resetPassword) {
      }
    }
  });
});
