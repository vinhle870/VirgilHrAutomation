import { test, expect } from 'src/fixtures';
import { AdminPortalService } from 'src/api/services/admin-portal.services';

test.describe('AdminPortalService (with Authentication) - searchPartnerByText', () => {
  test('uses Authentication service to obtain token and returns partners', async ({ apiClient, authenticationService }, testInfo) => {

    const username = process.env.API_USERNAME ?? process.env.ADMIN_USERNAME;
    const password = process.env.API_PASSWORD ?? process.env.ADMIN_PASSWORD;

    // Skip if no base URL or no credentials are available

    testInfo.skip(!username || !password, 'API_USERNAME / API_PASSWORD are not configured');

    const adminService = await AdminPortalService.create(apiClient, authenticationService);

    const query = 'VinhPartner002';

    const resp = await adminService.searchPartnerByText(query);

    expect(resp).toBeDefined();
    expect(typeof resp.total).toBe('number');
    expect(Array.isArray(resp.entities)).toBeTruthy();

    if (resp.entities.length > 0) {
      const first = resp.entities[0];
      expect(first.id).toBeTruthy();
      expect(first.departmentId).toBeDefined();
    }
  });
});
