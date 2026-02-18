import { test, expect } from "src/fixtures";
import { AdminPortalService } from "src/api/services/admin-portal.services";
import { InviteMemberPayload } from "src/api/services/member-portal.services";
import { DataFactory, CustomerBuilder } from "src/data-factory";
import { TestDataProvider } from "src/test-data";
import { ProductInfo } from "src/objects/iproduct";
import { DataGenerate } from "src/utilities";

test.describe("Partner management", () => {
  test("TC54 Verify that a user can invite members to a team in the Member Portal-Organization tab.", async ({
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
    //***************Pre-requisites: Prepare data for the test*******************************// 
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");

    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );
    const testData = new TestDataProvider(adminPortalService);

    //Create department id to send
    let departmentID = await testData.getDepartmentId("BiginHR");

    const partnerDomain = await testData.getDepartmentDomain(departmentID);
    
    //Get all product types of a department (departmentID)
    const productTypeAndNames: ProductInfo[] =
    
    await testData.getProductTypes(departmentID);
    
    const productTypesAndNamesToSend: ProductInfo[] =
    
    DataGenerate.generateProductType(productTypeAndNames);
    
    //Create partner info using PartnerBuilder
    const partnerInfo = await DataFactory.partnerBuilder()
      .withIsPublic(true)
      .withWhoPay(0)
      .withBankTransfer(false)
      .withDepartment(departmentID)
      .withFilterProductTypes(productTypesAndNamesToSend)
      .build();
    
      // Generate member data for invite payload
      const customerWithMember = await new CustomerBuilder()
      .withMember()
      .build();

    const member = customerWithMember.members[0];

    const invitePayload: InviteMemberPayload = {
      recipients: [{
        email: member.email,
        firstName: member.firstName,
        lastName: member.lastName,
        phoneNumber: member.phoneNumber,
        jobTitle: member.jobTitle,
        role: 3,
      }],
    };
    //***********************************************// 
//API Step: Create partner
    const partnerResponse = await adminService.createPartner(partnerInfo);

    if (partnerResponse.status == 200) {
      const tempPassword = "TempPass@" + Date.now().toString().slice(-4);

      const email = partnerInfo.accountInfo?.email!;

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

        //UI Step: Buy selected plan
        await planPage.buyPlanWithoutDiving(
          partnerURL,
          email,
          tempPassword,
          productTypesAndNamesToSend[0].productName,
          partnerDomain,
        );
        //API Step: Create business
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
//API Step: Get auth token
          const token = await authenticationService.getAuthToken(
            email,
            tempPassword,
            "4",
          );
          //API Step: Invite members to a team in the Member Portal-Organization tab.
          const partnerName = partnerInfo.partnerInfo?.name;
          expect(partnerName).toBeDefined();

          const inviteMemberResponse = await memberPortalService.inviteMember(
            token,
            invitePayload,
            partnerName!,
          );
          expect(inviteMemberResponse).toBeDefined();
          expect(typeof inviteMemberResponse).toBe("object");

          
        }
      }
    }
  });
});
