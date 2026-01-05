import { test, expect } from "src/fixtures";
import { AdminPortalService } from "src/api/services/admin-portal.services";
import { DataFactory } from "src/data-factory";

test.describe("Partner managerment", () => {
  test("TC034_API For Payment Options, the admin can select either Partner/Consultant Owner or Member Portal Consumer.", async ({
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
    const partnerInfoWithMemberPortalConsumer =
      await DataFactory.generatePartnerInfo(0, {
        paymentEnable: 0,
      });

    const nameOfPartnerInfoWithMemberPortalConsumer =
      partnerInfoWithMemberPortalConsumer.getIPartnerInfo()?.name!;

    const responseOfPartnerInfoWithMemberPortalConsumer =
      await adminService.createPartner(partnerInfoWithMemberPortalConsumer);

    if (responseOfPartnerInfoWithMemberPortalConsumer.status == 200) {
      const searchResponseWithMemberPortalConsumer = (
        await adminService.searchPartnerByText(
          nameOfPartnerInfoWithMemberPortalConsumer
        )
      ).entities[0].paymentEnable;

      expect(searchResponseWithMemberPortalConsumer).toBe(false);
    }

    const partnerInfoWithPartnerConsultantOwner =
      await DataFactory.generatePartnerInfo(0, {
        paymentEnable: 1,
      });

    const nameOfPartnerInfoWithPartnerConsultantOwner =
      partnerInfoWithPartnerConsultantOwner.getIPartnerInfo()?.name!;

    const responseOfPartnerInfoWithPartnerConsultantOwner =
      await adminService.createPartner(partnerInfoWithPartnerConsultantOwner);

    if (responseOfPartnerInfoWithPartnerConsultantOwner.status == 200) {
      const searchResponseWithPartnerConsultantOwner = (
        await adminService.searchPartnerByText(
          nameOfPartnerInfoWithPartnerConsultantOwner
        )
      ).entities[0].paymentEnable;

      expect(searchResponseWithPartnerConsultantOwner).toBe(true);
    }
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
    const peoInfo = await DataFactory.generatePartnerInfo(1);

    const nameOfPeoInfo: string = peoInfo.getIPartnerInfo()?.name!;

    const responsePEO = await adminService.createPartner(peoInfo);

    if (responsePEO.status == 200) {
      const peoLevel = (await adminService.searchPartnerByText(nameOfPeoInfo))
        .entities[0].level;

      expect(peoLevel).toBe(1);
    }

    const partnerInfo = await DataFactory.generatePartnerInfo(0);

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
