import { test, expect } from "src/fixtures";
import { AdminPortalService } from "src/api/services/admin-portal.services";
import { DataFactory } from "src/data-factory";
import { ProductInfo } from "src/objects/IProduct";
import { DataGenerate } from "src/utilities";
import { IInviteMember } from "src/objects/iInviteMember";
import { PartnerFactory } from "src/data-factory/partner-factory";

test.describe("Partner managerment", () => {
  test("TC54 Verify that a user can invite members to a team in the Member Portal – Organization tab.", async ({
    apiClient,
    authenticationService,
    adminPortalService,
    memberPortalService,
    planPage,
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
    //Create department id to send
    let departmentID = await PartnerFactory.getPartnerID(
      adminPortalService,
      "BiginHR",
    );
    const masterPlanId = await adminPortalService.getMasterPlanID(departmentID);
    const productTypeAndNames: ProductInfo[] =
      await DataFactory.generateProductTypesAndNames(
        adminPortalService,
        departmentID,
      );
    //Create partner info
    const partnerInfo = await DataFactory.generatePartnerInfo(0, adminService, {
      isPublic: true,
      whoPay: 0,
      bankTransfer: true,
      departmentId: departmentID,
      restriction: {
        feFilterProductTypes: productTypeAndNames.map((p) => p.productType),
      },
      planId: masterPlanId,
    });
    //Create partner
    const partnerResponse = await adminService.createPartner(partnerInfo);

    if (partnerResponse.status == 200) {
      const tempPassword = "TempPass@" + Date.now().toString().slice(-4);

      const email = partnerInfo.getAccountInfo()?.email!;

      const resetPartner =
        await authenticationService.resetPasswordWithoutToken(
          { username: email, password: tempPassword },
          undefined,
          "5",
        );

      if (resetPartner) {
        await authenticationService.confirmEmailWithoutToken(
          email,
          undefined,
          "5",
        );
        const partnerToken = await authenticationService.getAuthToken(
          email,
          tempPassword,
          "5",
        );
        //Create business
        const business = await adminPortalService.createBussiness(
          "teamName",
          partnerResponse.data,
          masterPlanId,
          partnerToken,
        );

        if (business.status == 200) {
          await authenticationService.resetPasswordWithoutToken(
            { username: email, password: tempPassword },
            undefined,
            "4",
          );

          const token = await authenticationService.getAuthToken(
            email,
            tempPassword,
            "4",
          );
          //Create member email to invite
          const memberEmail = await DataGenerate.generateYopMail();
          //Create admin member info
          const member: IInviteMember = {
            recipients: [
              {
                email: memberEmail,
                firstName: partnerInfo.getAccountInfo()?.firstName!,
                jobTitle: "Test",
                lastName: partnerInfo.getAccountInfo()?.lastName!,
                phoneNumber: partnerInfo.getAccountInfo()?.phoneNumber!,
                role: 1,
              },
            ],
          };

          const inviteMemberResponse = await memberPortalService.inviteMember(
            token,
            member,
            partnerInfo.getIPartnerInfo()?.name!,
          );

          expect(inviteMemberResponse.status).toBe(200);
        }
      }
    }
  });
  test("TC55 In the Member Portal, only the Owner and Admin of a team can invite members to that team.", async ({
    apiClient,
    authenticationService,
    adminPortalService,
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
    //Create department id to send
    let departmentID = await PartnerFactory.getPartnerID(
      adminPortalService,
      "BiginHR",
    );
    const masterPlanId = await adminPortalService.getMasterPlanID(departmentID);
    const productTypeAndNames: ProductInfo[] =
      await DataFactory.generateProductTypesAndNames(
        adminPortalService,
        departmentID,
      );
    //Create partner info
    const partnerInfo = await DataFactory.generatePartnerInfo(0, adminService, {
      isPublic: true,
      whoPay: 0,
      bankTransfer: true,
      departmentId: departmentID,
      restriction: {
        feFilterProductTypes: productTypeAndNames.map((p) => p.productType),
      },
      planId: masterPlanId,
    });
    //Create partner
    const partnerResponse = await adminService.createPartner(partnerInfo);

    if (partnerResponse.status == 200) {
      const tempPassword = "TempPass@" + Date.now().toString().slice(-4);

      const email = partnerInfo.getAccountInfo()?.email!;

      const resetPartner =
        await authenticationService.resetPasswordWithoutToken(
          { username: email, password: tempPassword },
          undefined,
          "5",
        );

      if (resetPartner) {
        await authenticationService.confirmEmailWithoutToken(
          email,
          undefined,
          "5",
        );
        const partnerToken = await authenticationService.getAuthToken(
          email,
          tempPassword,
          "5",
        );
        //Create business
        const business = await adminPortalService.createBussiness(
          "teamName",
          partnerResponse.data,
          masterPlanId,
          partnerToken,
        );

        if (business.status == 200) {
          await authenticationService.resetPasswordWithoutToken(
            { username: email, password: tempPassword },
            undefined,
            "4",
          );

          const token = await authenticationService.getAuthToken(
            email,
            tempPassword,
            "4",
          );
          //Create member email to invite
          const memberEmail = await DataGenerate.generateYopMail();
          //Create admin member info
          const member: IInviteMember = {
            recipients: [
              {
                email: memberEmail,
                firstName: partnerInfo.getAccountInfo()?.firstName!,
                jobTitle: "Test",
                lastName: partnerInfo.getAccountInfo()?.lastName!,
                phoneNumber: partnerInfo.getAccountInfo()?.phoneNumber!,
                role: 1,
              },
            ],
          };

          const inviteMemberResponse = await memberPortalService.inviteMember(
            token,
            member,
            partnerInfo.getIPartnerInfo()?.name!,
          );

          expect(inviteMemberResponse.status).toBe(200);

          await authenticationService.confirmEmailWithoutToken(
            memberEmail,
            undefined,
            "4",
          );

          await authenticationService.resetPasswordWithoutToken(
            { username: memberEmail, password: tempPassword },
            undefined,
            "4",
          );
        }
      }
    }
  });
});
