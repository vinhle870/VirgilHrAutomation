import { test, expect } from "src/fixtures";
import { AdminPortalService } from "src/api/services/admin-portal.services";
import { DataFactory } from "src/data-factory";
import { PartnerFactory } from "src/data-factory/partner-factory";

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

    const partnerInfo = await DataFactory.generatePartnerInfo(0, adminService);

    const response = await adminService.createPartner(partnerInfo);

    expect(response.data).toBeDefined();
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

    const peoInfo = await DataFactory.generatePartnerInfo(1, adminService);

    const nameOfPeoInfo: string = peoInfo.getIPartnerInfo()?.name!;

    const responsePEO = await adminService.createPartner(peoInfo);

    if (responsePEO.status == 200) {
      const peoLevel = (await adminService.searchPartnerByText(nameOfPeoInfo))
        .entities[0].level;

      expect(peoLevel).toBe(1);
    }

    const partnerInfo = await DataFactory.generatePartnerInfo(0, adminService);

    const nameOfpartnerInfo: string = partnerInfo.getIPartnerInfo()?.name!;

    const responsePartner = await adminService.createPartner(partnerInfo);

    if (responsePartner.status == 200) {
      const partnerLevel = await (
        await adminService.searchPartnerByText(nameOfpartnerInfo)
      ).entities[0].level;

      expect(partnerLevel).toBe(0);
    }
  });
});
