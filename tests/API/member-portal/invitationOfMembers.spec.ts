import { test, expect } from "src/fixtures";
import { AdminPortalService } from "src/api/services/admin-portal.services";
import { DataFactory } from "src/data-factory";
import Comparison from "src/utilities/compare";
import { localHR } from "src/constant/static-data";
import { ProductInfo } from "src/objects/IProduct";
import { DataGenerate } from "src/utilities";
import { IInviteMember } from "src/objects/iInviteMember";
import { Partner } from "src/objects/ipartner";
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
    let departmentID = await PartnerFactory.generatePartnerID(
      adminPortalService,
      "BiginHR",
    );

    const partnerDomain =
      await PartnerFactory.getDepartmentDomain(departmentID);
    //Get all product types of a department (departmentID)
    const productTypeAndNames: ProductInfo[] =
      await DataFactory.generateProductTypesAndNames(
        adminPortalService,
        departmentID,
      );
    const productTypesAndNamesToSend: ProductInfo[] =
      DataGenerate.generateProductType(productTypeAndNames);
    //Create partner info
    const partnerInfo = await DataFactory.generatePartnerInfo(0, adminService, {
      isPublic: true,
      whoPay: 0,
      bankTransfer: false,
      departmentId: departmentID,
      restriction: {
        feFilterProductTypes: productTypesAndNamesToSend.map(
          (p) => p.productType,
        ),
      },
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

        const partnerURL = `https://${email.split("@")[0]}.${partnerDomain}`;

        //Buy selected plan
        await planPage.buyPlanWithoutDiving(
          partnerURL,
          email,
          tempPassword,
          productTypesAndNamesToSend[0].productName,
          partnerDomain,
        );
        //Create business
        const business = await adminPortalService.createBussiness(
          "teamName",
          partnerResponse.data,
          productTypesAndNamesToSend[0].planId,
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
          const memberEmail = await DataGenerate.createEmail();
          //Create member info
          const member: IInviteMember = {
            recipients: [
              {
                email: memberEmail,
                firstName: partnerInfo.getAccountInfo()?.firstName!,
                jobTitle: "Test",
                lastName: partnerInfo.getAccountInfo()?.lastName!,
                phoneNumber: partnerInfo.getAccountInfo()?.phoneNumber!,
                role: 3,
              },
            ],
          };

          const inviteMemberResponse = memberPortalService.inviteMember(
            token,
            member,
            partnerInfo.getIPartnerInfo()?.name!,
          );
          expect((await inviteMemberResponse).status).toBe(200);
        }
      }
    }
  });
});
