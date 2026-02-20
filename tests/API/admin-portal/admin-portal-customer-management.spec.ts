import { test, expect } from "src/fixtures";
import { DataFactory, CustomerBuilder } from "src/data-factory";
import { AdminPortalService } from "src/api/services/admin-portal.services";
import { plans, validCardInfo } from "src/constant/static-data";
import { DataHandling } from "src/data-handling/data-handling";

test.describe("Admin Portal - Customer Management", () => {
  test("TC017_API Verify that new customer can be Added under PartnerID return 201-Created and correct Response", async ({
    apiClient,
    authenticationService,
  }, testInfo) => {
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;
    const username = process.env.API_USERNAME ?? process.env.ADMIN_USERNAME;
    const password = process.env.API_PASSWORD ?? process.env.ADMIN_PASSWORD;
    testInfo.skip(!base, "API_BASE_URL is not configured");

    //*****-----Optionally discover partnerId/departmentId from the system to use in the-----*****
    // generated consumer. If search finds nothing, generator will use defaults.
    const partnerName = "VinhPartner002";

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
  });

  test("TC018_API Verify Customer creation under a HR System (Partner) will return 201-Created and correct Response", async ({
    apiClient,
    authenticationService,
  }, testInfo) => {
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;
    const username = process.env.API_USERNAME ?? process.env.ADMIN_USERNAME;
    const password = process.env.API_PASSWORD ?? process.env.ADMIN_PASSWORD;
    testInfo.skip(!base, "API_BASE_URL is not configured");

    //*****-----Optionally discover partnerId/departmentId from the system to use in the-----*****
    // generated consumer. If search finds nothing, generator will use defaults.
    const partnerName = "VinhPartner002";

    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );

    const partnerInfo = await adminService.searchPartner(partnerName);

    // Get Product Type Filters
    const productTypeFilters = await adminService.getProductTypeFilters();

    //Filter product type id by name
    const filteredProductType =
      await DataHandling.filterProductTypeFiltersByName(
        productTypeFilters,
        plans[1],
      );

    // Generate consumer payload with discovered IDs (if any)
    const consumerData = await DataFactory.customerBuilder()
      .forAdminPortal()
      .withCompanySize(filteredProductType)
      .withAdminOptions({ trialDays: 30 })
      .withPartner(partnerInfo.partnerId!)
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
    expect(resp.team.name).toBe(consumerData.company.companyName);
  });

  test("TC020_API Verify Customer creation with Trial Subscription will return 201-Created and correct Response", async ({
    apiClient,
    authenticationService,
  }, testInfo) => {
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;
    const username = process.env.API_USERNAME ?? process.env.ADMIN_USERNAME;
    const password = process.env.API_PASSWORD ?? process.env.ADMIN_PASSWORD;
    testInfo.skip(!base, "API_BASE_URL is not configured");

    //*****-----Optionally discover partnerId/departmentId from the system to use in the-----*****
    // generated consumer. If search finds nothing, generator will use defaults.
    const partnerName = "VinhPartner002";

    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );

    const partnerInfo = await adminService.searchPartner(partnerName);

    // Get Product Type Filters
    const productTypeFilters = await adminService.getProductTypeFilters();

    //Filter product type id by name
    const filteredProductType =
      await DataHandling.filterProductTypeFiltersByName(
        productTypeFilters,
        plans[1],
      );

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
  });

  test("TC022_API Verify Customer creation with Bank Transfer = ON will return 201-Created and correct Response", async ({
    apiClient,
    authenticationService,
  }, testInfo) => {
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;
    const username = process.env.API_USERNAME ?? process.env.ADMIN_USERNAME;
    const password = process.env.API_PASSWORD ?? process.env.ADMIN_PASSWORD;
    testInfo.skip(!base, "API_BASE_URL is not configured");

    //*****-----Optionally discover partnerId/departmentId from the system to use in the-----*****
    // generated consumer. If search finds nothing, generator will use defaults.
    const partnerName = "VinhPartner002";

    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );

    const partnerInfo = await adminService.searchPartner(partnerName);

    // Get Product Type Filters
    const productTypeFilters = await adminService.getProductTypeFilters();

    //Filter product type id by name
    const plan = plans[2];
    const filteredProductType =
      await DataHandling.filterProductTypeFiltersByName(
        productTypeFilters,
        plan,
      );

    // Generate consumer payload with discovered IDs (if any)
    const consumerData = await DataFactory.customerBuilder()
      .forAdminPortal()
      .withCompanySize(filteredProductType)
      .withAdminOptions({
        productType: filteredProductType,
        billingcycle: 1,
        useCredit: true,
      })
      .withDepartment(partnerInfo.departmentId!)
      .build();
    const customerAccountInfo = consumerData.accountInfo;
    //*****---------------------------------------------------*****

    // Call the admin service to create customer
    const resp = await adminService.createCustomer(consumerData);
    // Basic sanity: response should contain at least one property (e.g., id)

    // API VERIFICATION - Verify the Response:
    expect(resp).toBeDefined();
    expect(typeof resp).toBe("object");
    expect(Object.keys(resp as any).length).toBeGreaterThan(0);
    expect(Object.keys(resp.id).length).toBeGreaterThan(0);
    expect(resp.email).toBe(customerAccountInfo.email);
    expect(resp.team.name).toBe(consumerData.company.companyName);

    //Call the admin service to get consumer by ID to verify useCredit = true
    const consumerById = await adminService.getConsumerById(resp.id);

    // API VERIFICATION: Verify the Customer Subscription plan
    expect(consumerById.subscription.name).toBe(plan);
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
    const partnerName = "VinhPartner002";

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
    const partnerName = "VinhPartner002";

    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );

    const partnerInfo = await adminService.searchPartner(partnerName);

    // Get Product Type Filters
    const productTypeFilters = await adminService.getProductTypeFilters();

    //Filter product type id by name
    const plan = plans[1];
    const filteredProductType =
      await DataHandling.filterProductTypeFiltersByName(
        productTypeFilters,
        plan,
      );

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
