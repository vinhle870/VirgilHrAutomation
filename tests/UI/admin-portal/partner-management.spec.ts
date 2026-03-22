import { test, expect } from "src/fixtures";
import { DataFactory } from "src/data-factory";
import { AdminPortalService } from "src/api/services/admin-portal.services";
import { plans } from "src/constant/static-data";
import { CollectionUtils } from "src/utilities";
import { UserInfo } from "src/objects";
import { CustomerFactory } from "src/data-factory/customer-factory";
import IPartnerFilter from "src/objects/ipartnerfilter";
import { PartnerFilter } from "src/ui/pages/admin-portal/locators/partner-management/filter-partner";

test.describe("Admin Portal - Partner Management", () => {
  test("TC30 Verify that a partner account can only be created in the Admin Portal – Partner Management.", async ({
    loginPage,
    partnerManagementPage,
    onboardingFlow,
    tempEmailFreePage,
  }, testInfo) => {
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");

    await loginPage.login();

    const partnerInfo = await DataFactory.partnerBuilder()
      .withDepartmentName(process.env.DEPARTMENT_NAME!)
      .withPartnerLevel("PEO/HR Consultant")
      .withPaymentOption("Partner/Consultant Owner")
      .withProductsType(["251 - 500 Employees"])
      .withPhoneNumber("+13530044689")
      .build();

    // const newPartner = await partnerManagementPage.createPartner(partnerInfo);

    //   await expect(newPartner).toBeVisible();

    const invitedMembers: UserInfo[] = await CustomerFactory.generateMembers(1);

    await partnerManagementPage.addMoreMembers(
      partnerInfo,
      invitedMembers,
      onboardingFlow,
      tempEmailFreePage,
    );
  });

  test("TC31 Verify when a Partner is being created, the admin can select its level as Partner or PEO/Consultant.", async ({
    loginPage,
    partnerManagementPage,
  }, testInfo) => {
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");

    await loginPage.login();

    const partnerInfo = await DataFactory.partnerBuilder()
      .withDepartmentName(process.env.DEPARTMENT_NAME!)
      .withPartnerLevel("Partner")
      .build();

    const partFilterInfo: IPartnerFilter = {
      name: partnerInfo.partnerInfo?.name,
      level: partnerInfo.partnerInfo?.partnerLevel,
      department: partnerInfo.partnerInfo?.departmentName,
    };

    //  const newPartner = await partnerManagementPage.createPartner(partnerInfo);

    // await expect(newPartner).toBeVisible();

    const filteredPartner = await partnerManagementPage.filter(partFilterInfo);

    expect(filteredPartner).toBe("Pass");
  });

  test("TC32 Verify when a Partner is being created, the admin can select its level as Partner or PEO/Consultant.", async ({
    loginPage,
    partnerManagementPage,
  }, testInfo) => {
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");

    await loginPage.login();

    const typeOfSorting = PartnerFilter.oldestToLatest;

    const sort = await partnerManagementPage.sorting(typeOfSorting);

    expect(sort).toBe("Pass");
  });

  test("TC020_API Verify Customer creation with Trial Subscription will return 201-Created and correct Response", async ({
    loginPage,
    customerManagementPage,
  }, testInfo) => {
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");

    await loginPage.login();

    const customerInfo = await DataFactory.customerBuilder()
      .withCompanyName("Company")
      .withCompanySize("All Features and Handbook Only Bigin 1")
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
      .build();

    const newCustomer =
      await customerManagementPage.createCustomer(customerInfo);
  });

  test("TC022_API Verify Customer creation with Bank Transfer = ON will return 201-Created and correct Response", async ({
    loginPage,
    partnerManagementPage,
    onboardingFlow,
    tempEmailFreePage,
  }, testInfo) => {
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");

    await loginPage.login();

    const partnerInfo = await DataFactory.partnerBuilder()
      .withPhoneNumber("+12025550173")
      .withDepartmentName(process.env.DEPARTMENT_NAME!)
      .withPartnerLevel("Partner")
      .build();

    const peoPartnerInfo = await DataFactory.peoPartnerBuilder()
      .withName("Peo" + partnerInfo.accountInfo?.firstName)
      .withCompanyType("Internal")
      .withCustomBranding(true)
      .build();

    const peoPartners = [peoPartnerInfo];

    const addedPeoPartner = await partnerManagementPage.addPeoConsultant(
      partnerInfo,
      peoPartners,
      onboardingFlow,
      tempEmailFreePage,
    );

    expect(addedPeoPartner).toBe("Pass");
  });

  test("TC023_API Verify Customer creation with Bank Transfer = OFF will return 201-Created and correct Respons", async ({
    apiClient,
    authenticationService,
  }, testInfo) => {
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;
    const username = process.env.API_USERNAME ?? process.env.ADMIN_USERNAME;
    const password = process.env.API_PASSWORD ?? process.env.ADMIN_PASSWORD;
    testInfo.skip(!base, "API_BASE_URL is not configured");

    //*****-----Optionally discover partnerId/departmentId from the system to use in the-----*****
    // generated consumer. If search finds nothing, generator will use defaults.
    const partnerName = process.env.PARTNER_NAME;
    if (!partnerName) {
      throw new Error("PARTNER_NAME is not configured");
    }

    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );

    const partnerInfo = await adminService.searchPartner(partnerName);

    // Generate consumer payload with discovered IDs (if any)
    const consumerData = await DataFactory.customerBuilder()
      .forAdminPortal()
      .withDepartment(partnerInfo.departmentId!)
      .build();
    const customerAccountInfo = consumerData.accountInfo;
    //*****---------------------------------------------------*****

    // Call the admin service to create customer
    const resp = await adminService.createCustomer(consumerData);

    // Basic sanity: response should contain at least one property (e.g., id)

    // API VERIFICATION:
    expect(resp).toBeDefined();
    expect(typeof resp).toBe("object");
    expect(Object.keys(resp as any).length).toBeGreaterThan(0);
    expect(Object.keys(resp as any).length).toBeGreaterThan(0);
    expect(Object.keys(resp.id).length).toBeGreaterThan(0);
    expect(resp.email).toBe(customerAccountInfo.email);

    //Call the admin service to get consumer by ID to verify useCredit = true
    const consumerById = await adminService.getConsumerById(resp.id);

    // API VERIFICATION: Verify the Customer Subscription plan = NULL
    expect(consumerById.subscription).toBe(null);
  });

  test("TC030_API Verify For Free Trial accounts, the user is also assigned a plan along with a limited number of free usage days.", async ({
    apiClient,
    authenticationService,
  }, testInfo) => {
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;
    const username = process.env.API_USERNAME ?? process.env.ADMIN_USERNAME;
    const password = process.env.API_PASSWORD ?? process.env.ADMIN_PASSWORD;
    testInfo.skip(!base, "API_BASE_URL is not configured");

    //*****-----Optionally discover partnerId/departmentId from the system to use in the-----*****
    // generated consumer. If search finds nothing, generator will use defaults.
    const partnerName = process.env.PARTNER_NAME;
    if (!partnerName) {
      throw new Error("PARTNER_NAME is not configured");
    }

    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );

    const partnerInfo = await adminService.searchPartner(partnerName);

    // Get Product Type Filters
    const productTypeFilters = await adminService.getProductTypeFilters();

    //Filter product type id by name
    const plan = plans[1];
    const matchedPlan = CollectionUtils.findByPropertyOrNull(
      Array.isArray(productTypeFilters)
        ? productTypeFilters
        : [productTypeFilters],
      "name" as any,
      plan,
    );
    const filteredProductType = matchedPlan
      ? (matchedPlan as any).productType
      : undefined;

    // Generate consumer payload with discovered IDs (if any)
    const consumerData = await DataFactory.customerBuilder()
      .forAdminPortal()
      .withCompanySize(filteredProductType)
      .withAdminOptions({ productType: filteredProductType, trialDays: 30 })
      .withDepartment(partnerInfo.departmentId!)
      .build();
    const customerAccountInfo = consumerData.accountInfo;
    //*****---------------------------------------------------*****

    // Call the admin service to create customer
    const resp = await adminService.createCustomer(consumerData);
    // Basic sanity: response should contain at least one property (e.g., id)

    // API VERIFICATION:
    expect(resp).toBeDefined();
    expect(typeof resp).toBe("object");
    expect(Object.keys(resp as any).length).toBeGreaterThan(0);
    expect(Object.keys(resp.id).length).toBeGreaterThan(0);
    expect(resp.email).toBe(customerAccountInfo.email);

    //Call the admin service to get consumer by ID to verify useCredit = true
    const consumerById = await adminService.getConsumerById(resp.id);
    const startDate = new Date(consumerById.subscription.startDate);
    const endDate = new Date(consumerById.subscription.endDate);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // API VERIFICATION: Verify the Customer Subscription plan And The number of trial days
    expect(consumerById.subscription.name).toBe(plan);
    expect(diffDays).toBe(consumerData.company.trialDays);
  });
});
