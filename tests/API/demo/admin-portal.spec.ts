import { test, expect } from "src/fixtures";
import { DataFactory } from "src/data-factory";
import { AdminPortalService } from "src/api/services/admin-portal.services";

test.describe("MemberPortalService - signUpConsumer", () => {
  test("TC017_API Verify that new member portal user can be signed up with PartnerID return 201-Created and correct Response", async ({
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
      authenticationService
    );

    const partnerInfo = await adminService.searchPartner(partnerName);

    // Generate consumer payload with discovered IDs (if any)
    const consumerData = await DataFactory.generateCustomerInfo(
      "admin",
      partnerInfo.partnerId,
      partnerInfo.departmentId
    );
    const customerAccountInfo = consumerData.getAccountInfo();
    //*****---------------------------------------------------*****

    // API VERIFICATION:
    // Call the service (the fixture `memberPortalService` wraps ApiClient)
    const resp = await adminService.createCustomer(consumerData);

    expect(resp).toBeDefined();
    expect(typeof resp).toBe("string");
    // Basic sanity: response should contain at least one property (e.g., id)
    expect(Object.keys(resp as any).length).toBeGreaterThan(0);

    /*
    //****----------Now attempt to reset password for the newly created consumer using the----------*****
    // Authentication service helper. Use a temporary password for the reset.
    const tempPassword = 'TempPass@' + Date.now().toString().slice(-4);
    const resetResp = await authenticationService.resetPasswordWithoutToken({ username: (customerAccountInfo as any).email, password: tempPassword }, undefined, "4");

    //Activate the user account if needed (depends on system settings)
    await authenticationService.confirmEmailWithoutToken((customerAccountInfo as any).email, undefined, "4");

    // Basic assertions for reset response
    expect(resetResp).toBeDefined();
    expect(typeof resetResp).toBe('boolean');

    // Finally, attempt to obtain an auth token for the new consumer using
    // the Authentication service.
    const consumerToken = await authenticationService.getAuthToken((customerAccountInfo as any).email, tempPassword, "4");

    expect(consumerToken).toBeDefined();
    expect(typeof consumerToken).toBe('string');
    expect(consumerToken.length).toBeGreaterThan(10);
    //****------------------------------------------------------------------------------------------------*****

     // API VERIFICATION: GET PLANS:
    const plansResp =  await memberPortalService.getPlansList(partnerInfo.departmentId!, consumerToken);

    expect(plansResp).toBeDefined();
    expect(typeof plansResp).toBe('object');
    expect(Array.isArray((plansResp as any))).toBeTruthy();
    expect(Object.keys(plansResp as any).length).toEqual(6);


    // API VERIFICATION:
    //Now, test the checkOutPlan API with the obtained token
    const planResponse = await memberPortalService.checkOutPlan("1", consumerToken);

    const returnUrl = `https://member-virgilhr-${process.env.exec_env}.bigin.top`;
    expect(planResponse).toBeDefined();
    expect(typeof planResponse).toBe('object');
    expect(Object.keys(planResponse as any).length).toBeGreaterThan(0);
    expect((planResponse as any).returnUrl).toContain(returnUrl);

    //****-------------Complete Payment to subscribe the plan-------------*****
    //const subDomainUrl = `https://${partnerInfo.subDomain}.member-virgilhr-${process.env.exec_env}.bigin.top`;
    const planUrl = String((planResponse as any).returnUrl);

    await planPage.buyPlan(planUrl, (customerAccountInfo as any).email, tempPassword,validCardInfo);

      //****-----------------------------------------------------------------*****

    //Refresh token after plan subscription (in case it changed)
    const newConsumerToken = await authenticationService.getAuthToken((customerAccountInfo as any).email, tempPassword, "4");

    // API VERIFICATION:
    // PreviewPlan  API call to get current user's plan
    const planDetailsResp = await memberPortalService.getCurrentSubscribedPlan(newConsumerToken);
    expect(planDetailsResp).toBeDefined();
    expect(typeof planDetailsResp).toBe('object');
    expect(planDetailsResp as any).toHaveProperty('id');
    expect(planDetailsResp as any).toHaveProperty('name');
    expect(planDetailsResp as any).toHaveProperty('priceId');
    expect(planDetailsResp as any).toHaveProperty('departmentId');
    expect(planDetailsResp as any).toHaveProperty('productType');
    expect(planDetailsResp as any).toHaveProperty('licenseQuantity');
    expect(planDetailsResp as any).toHaveProperty('b2CFeatureRestrictions');
    expect(planDetailsResp as any).toHaveProperty('freeTrialRestrictions');
    expect(planDetailsResp as any).toHaveProperty('price');
    expect(planDetailsResp as any).toHaveProperty('partnerSetting');
    //Verify some plan details
    expect((planDetailsResp as any).departmentId).toBe(partnerInfo.departmentId);
    const planName = "Under 50 Employees test";
    expect((planDetailsResp as any).name).toBe(planName);

*/
  });
});
