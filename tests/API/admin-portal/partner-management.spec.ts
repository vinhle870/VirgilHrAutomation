import { test, expect } from "src/fixtures";
import { AdminPortalService } from "src/api/services/admin-portal.services";

test.describe("Partner managerment", () => {
  test("TC030_API Verify that a partner account can only be created in the Admin Portal – Partner Management.", async ({
    apiClient,
    authenticationService,
  }, testInfo) => {
    testInfo.skip(
      !process.env.API_BASE_URL && !process.env.BASE_URL,
      "API_BASE_URL is not configured"
    );
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");

    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService
    );

    const partnerInfor = await adminService.createPartner();

    expect(partnerInfor.status).toBe(200);
    expect(partnerInfor.data).toBeDefined();
  });

  test("TC31 Verify when a Partner is being created, the admin can select its level as Partner or PEO/Consultant.", async ({
    apiClient,
    authenticationService,
  }, testInfo) => {
    testInfo.skip(
      !process.env.API_BASE_URL && !process.env.BASE_URL,
      "API_BASE_URL is not configured"
    );
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");

    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService
    );
    const peo = await adminService.searchPartnerByText("vinhle12004");

    const peoLevel = peo.entities[0].level;

    expect(peoLevel).toBe(1);

    const partner = await adminService.searchPartnerByText(
      "TestPartner_1767286016160"
    );

    const partnerLevel = partner.entities[0].level;

    expect(partnerLevel).toBe(0);
  });

  test("TC32 Verify that a Partner is at a higher level than a PEO/Consultant, meaning one Partner can contain one or multiple PEOs/Consultants.", async ({
    apiClient,
    authenticationService,
  }, testInfo) => {
    testInfo.skip(
      !process.env.API_BASE_URL && !process.env.BASE_URL,
      "API_BASE_URL is not configured"
    );
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");

    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService
    );

    const consultant = await adminService.searchPartnerHavingPEO();
    console.log("Consultant result:", consultant);

    expect(consultant.consultants[0].level).toBe(1);
  });
});
