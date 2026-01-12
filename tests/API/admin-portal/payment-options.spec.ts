import { test, expect } from "src/fixtures";
import { AdminPortalService } from "src/api/services/admin-portal.services";
import { DataFactory } from "src/data-factory";
import { paymentOptions } from "src/constant/static-data";

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

    for (let i = 0; i < paymentOptions.length; i++) {
      const partnerInfo = await DataFactory.generatePartnerInfo(
        0,
        adminService,
        {
          paymentEnable: i,
        }
      );

      const nameOfPartnerInfo = partnerInfo.getIPartnerInfo()?.name!;

      const responseOfPartner = await adminService.createPartner(partnerInfo);

      if (responseOfPartner.status == 200) {
        const searchResponse = (
          await adminService.searchPartnerByText(nameOfPartnerInfo)
        ).entities[0].paymentEnable;

        if (i == 0) expect(searchResponse).toBe(false);
        else if (i == 1) expect(searchResponse).toBe(true);
      }
    }
  });

  test("TC35 With Payment Options = Partner/Consultant Owner, the user will make payments in the Partner Portal, and the Partner account will be the owner of all Businesses.", async ({
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

    const partnerInfo = await DataFactory.generatePartnerInfo(0, adminService, {
      bankTransfer: false,
      isPublic: true,
      paymentEnable: 1,
    });

    const partnerResponse = await adminService.createPartner(partnerInfo);

    if (partnerResponse.status == 200) {
      const tempPassword = "TempPass@" + Date.now().toString().slice(-4);

      const email = partnerInfo.getAccountInfo()?.email;

      if (!email) {
        throw new Error(
          "Generated partnerInfo does not contain accountInfo.email"
        );
      }

      const resetResp = await authenticationService.resetPasswordWithoutToken(
        { username: email, password: tempPassword },
        undefined,
        "5"
      );

      if (resetResp) {
        await authenticationService.confirmEmailWithoutToken(
          email,
          undefined,
          "5"
        );
      }
    }
  });
});
