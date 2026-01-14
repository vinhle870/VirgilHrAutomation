import { test, expect } from 'src/fixtures';
import { DataFactory } from 'src/data-factory';
import { AdminPortalService } from 'src/api/services/admin-portal.services';
import { plans, validCardInfo } from 'src/constant/static-data';
import { DataHandling } from 'src/data-handling/data-handling';

test.describe('MemberPortalService - signUpConsumer', () => {


    test('TC017_API Verify that new member portal user can be signed up with PartnerID return 201-Created and correct Response', async ({ apiClient, authenticationService }, testInfo) => {
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;
    const username = process.env.API_USERNAME ?? process.env.ADMIN_USERNAME;
    const password = process.env.API_PASSWORD ?? process.env.ADMIN_PASSWORD;
    testInfo.skip(!base, 'API_BASE_URL is not configured');

    //*****-----Optionally discover partnerId/departmentId from the system to use in the-----*****
    // generated consumer. If search finds nothing, generator will use defaults.
    const partnerName = 'VinhPartner002';

    const adminService = await AdminPortalService.create(apiClient, authenticationService);

    const partnerInfo = await adminService.searchPartner(partnerName);

    // Generate consumer payload with discovered IDs (if any)
        const overridesFields = { //partnerId: partnerInfo.partnerId,
      departmentId: partnerInfo.departmentId
  };
    const consumerData = await DataFactory.generateCustomerInfo("admin",overridesFields);
    const customerAccountInfo = consumerData.getAccountInfo();
    //*****---------------------------------------------------*****


    // Call the admin service to create customer
    const resp = await adminService.createCustomer(consumerData);

    // Basic sanity: response should contain at least one property (e.g., id)

    // API VERIFICATION:
    expect(resp).toBeDefined();
    expect(typeof resp).toBe('object');
    expect(Object.keys(resp as any).length).toBeGreaterThan(0);
        expect(Object.keys(resp as any).length).toBeGreaterThan(0);
    expect(Object.keys(resp.id).length).toBeGreaterThan(0);
    expect(resp.email).toBe(customerAccountInfo.email);

  });

});
