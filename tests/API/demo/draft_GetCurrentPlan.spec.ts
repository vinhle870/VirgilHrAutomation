import { test, expect } from 'src/fixtures';
import { DataFactory } from 'src/data-factory';
import { AdminPortalService } from 'src/api/services/admin-portal.services';

test.describe('MemberPortalService - signUpConsumer', () => {
  test('creates a new consumer successfully', async ({ apiClient, memberPortalService, authenticationService, planPage }, testInfo) => {
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;
    const username = process.env.API_USERNAME ?? process.env.ADMIN_USERNAME;
    const password = process.env.API_PASSWORD ?? process.env.ADMIN_PASSWORD;
    testInfo.skip(!base, 'API_BASE_URL is not configured');


    //Refresh token after plan subscription (in case it changed)
    const newToken = await authenticationService.getAuthToken('VinhYopmail4253@yopmail.com', 'TempPass@5139', "4");

    // API VERIFICATION:
    // PreviewPlan  API call to get current user's plan
    const planDetailsResp = await memberPortalService.getCurrentSubscribedPlan(newToken);
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
    //expect((planDetailsResp as any).departmentId).toBe(partnerInfo.departmentId);
    const planName = "Under 50 Employees test";
    expect((planDetailsResp as any).name).toBe(planName);
  });
});
