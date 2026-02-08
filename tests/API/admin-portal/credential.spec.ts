import { test, expect } from "src/fixtures";
import { AdminPortalService } from "src/api/services/admin-portal.services";
import { DataFactory } from "src/data-factory";
import { ApiLoginResponse } from "src/objects/responselogin";

test.describe("Partner managerment", () => {
  test("TC44 For Payment Options = Partner/Consultant Owner, the Owner account can log in to both the Member Portal and the Partner Portal.", async ({
    apiClient,
    authenticationService,
    memberPortalService,
    partnerPortalService,
  }, testInfo) => {
    testInfo.skip(
      !process.env.API_BASE_URL && !process.env.BASE_URL,
      "API_BASE_URL is not configured",
    );
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");

    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );

    const partnerInfo = await DataFactory.generatePartnerInfo(0, adminService, {
      isPublic: true,
      whoPay: 0,
    });

    const partnerResponse = await adminService.createPartner(partnerInfo);

    if (partnerResponse.status == 200) {
      const tempPassword = "TempPass@" + Date.now().toString().slice(-4);

      const email = partnerInfo.getAccountInfo()?.email;

      if (!email) {
        throw new Error(
          "Generated partnerInfo does not contain accountInfo.email",
        );
      }

      const resetPartner =
        await authenticationService.resetPasswordWithoutToken(
          { username: email, password: tempPassword },
          undefined,
          "5",
        );

      const resetCustomer =
        await authenticationService.resetPasswordWithoutToken(
          { username: email, password: tempPassword },
          undefined,
          "4",
        );

      const name = partnerInfo.getIPartnerInfo()?.name!;

      if (resetPartner) {
        await authenticationService.confirmEmailWithoutToken(
          email,
          undefined,
          "5",
        );

        const response: ApiLoginResponse<string> =
          await partnerPortalService.loginPartner(email, tempPassword, name);

        expect(response.status).toBe(200);
      }

      if (resetCustomer) {
        await authenticationService.confirmEmailWithoutToken(
          email,
          undefined,
          "4",
        );

        const response: ApiLoginResponse<string> =
          await memberPortalService.loginMember(email, tempPassword, name);

        expect(response.status).toBe(200);
      }
    }
  });

  test("TC45 With Payment Options = Member Portal Consumer, after successfully creating a Partner account, the user receives one credential email — for the Partner Portal.", async ({
    apiClient,
    authenticationService,
  }, testInfo) => {
    testInfo.skip(
      !process.env.API_BASE_URL && !process.env.BASE_URL,
      "API_BASE_URL is not configured",
    );
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");

    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );

    const partnerInfo = await DataFactory.generatePartnerInfo(0, adminService, {
      isPublic: true,
      whoPay: 1,
    });

    const partnerResponse = await adminService.createPartner(partnerInfo);

    if (partnerResponse.status == 200) {
      const tempPassword = "TempPass@" + Date.now().toString().slice(-4);

      const email = partnerInfo.getAccountInfo()?.email;

      if (!email) {
        throw new Error(
          "Generated partnerInfo does not contain accountInfo.email",
        );
      }

      const resetPassword =
        await authenticationService.resetPasswordWithoutToken(
          { username: email, password: tempPassword },
          undefined,
          "5",
        );

      if (resetPassword) {
        await authenticationService.confirmEmailWithoutToken(
          email,
          undefined,
          "5",
        );

        const emailOfPartner = partnerInfo.getAccountInfo()?.email!;

        expect(emailOfPartner).toBeDefined();

        const searchResponse =
          await adminService.getCustomerIdByEmail(emailOfPartner);

        const customerEmail = searchResponse.body.entities[0];

        expect(customerEmail).toBeFalsy();
      }
    }
  });

  test("TC46 For Payment Options = Member Portal Consumer, the Owner of the Partner/Consultant can only log in to the Partner Portal.", async ({
    apiClient,
    authenticationService,
    partnerPortalService,
  }, testInfo) => {
    testInfo.skip(
      !process.env.API_BASE_URL && !process.env.BASE_URL,
      "API_BASE_URL is not configured",
    );
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");

    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );

    const partnerInfo = await DataFactory.generatePartnerInfo(0, adminService, {
      isPublic: true,
      whoPay: 1,
    });

    const partnerResponse = await adminService.createPartner(partnerInfo);

    const name = partnerInfo.getIPartnerInfo()?.name!;
    const email = partnerInfo.getAccountInfo()?.email!;

    if (partnerResponse.status == 200) {
      const tempPassword = "TempPass@" + Date.now().toString().slice(-4);

      if (!email) {
        throw new Error(
          "Generated partnerInfo does not contain accountInfo.email",
        );
      }

      const resetPassword =
        await authenticationService.resetPasswordWithoutToken(
          { username: email, password: tempPassword },
          undefined,
          "5",
        );

      if (resetPassword) {
        await authenticationService.confirmEmailWithoutToken(
          email,
          undefined,
          "5",
        );

        const response: ApiLoginResponse<string> =
          await partnerPortalService.loginPartner(email, tempPassword, name);

        expect(response.status).toBe(200);

        const searchResponse = await adminService.getCustomerIdByEmail(email);

        const customerEmail = searchResponse.body.entities[0];

        expect(customerEmail).toBeFalsy();
      }
    }
  });

  test("TC47 For Businesses under a Partner with Payment Options = Member Portal Consumer, the Business Owner cannot log in to the Member Portal.", async ({
    apiClient,
    authenticationService,
    memberPortalService,
  }, testInfo) => {
    testInfo.skip(
      !process.env.API_BASE_URL && !process.env.BASE_URL,
      "API_BASE_URL is not configured",
    );
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");

    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );

    const partnerInfo = await DataFactory.generatePartnerInfo(0, adminService, {
      isPublic: true,
      whoPay: 1,
    });

    const partnerResponse = await adminService.createPartner(partnerInfo);

    const name = partnerInfo.getIPartnerInfo()?.name!;
    const email = partnerInfo.getAccountInfo()?.email!;

    if (partnerResponse.status == 200) {
      const tempPassword = "TempPass@" + Date.now().toString().slice(-4);

      if (!email) {
        throw new Error(
          "Generated partnerInfo does not contain accountInfo.email",
        );
      }

      const resetPassword =
        await authenticationService.resetPasswordWithoutToken(
          { username: email, password: tempPassword },
          undefined,
          "5",
        );

      if (resetPassword) {
        await authenticationService.confirmEmailWithoutToken(
          email,
          undefined,
          "5",
        );

        const response: ApiLoginResponse<string> =
          await memberPortalService.loginMember(email, tempPassword, name);

        expect(response.body).toBe("Not_Found");
      }
    }
  });
});
