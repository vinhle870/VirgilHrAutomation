import { test, expect } from "src/fixtures";
import { AdminPortalService } from "src/api/services/admin-portal.services";
import { InviteMemberPayload } from "src/api/services/member-portal.services";
import { DataFactory, CustomerBuilder } from "src/data-factory";
import { TestDataProvider } from "src/test-data";
import { ProductInfo } from "src/objects/iproduct";
import { DataGenerate } from "src/utilities";
import { plans } from "src/constant/static-data";
import { UserInfo } from "src/objects";

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

    const paymentProductName: string = plans[1];

    //Get all product types of a department (departmentID):
    // It is required for scenario Bank Transfer is True
    const productTypesAndNamesToSend: ProductInfo[] =
      await testData.getProductTypesBasedDepartmentId(departmentID);

    const masterPlan: any = await testData.filterMasterPlanBasedName(
      departmentID,
      paymentProductName,
    );

    const masterPlanId = masterPlan.masterPlanId;

    //Create partner info using PartnerBuilder
    const partnerInfo = await DataFactory.partnerBuilder()
      .withIsPublic(true)
      .withWhoPay(0)
      .withBankTransfer(true)
      .withDepartment(departmentID)
      .withFilterProductTypes(productTypesAndNamesToSend)
      .withPlanId(masterPlanId)
      .build();

    // Generate member data for invite payload
    const customerWithMember = await new CustomerBuilder().withMember().build();

    const member = customerWithMember.members[0];

    const invitePayload: InviteMemberPayload = {
      recipients: [
        {
          email: member.email,
          firstName: member.firstName,
          lastName: member.lastName,
          phoneNumber: member.phoneNumber,
          jobTitle: member.jobTitle,
          role: 2,
        },
      ],
    };
    //***********************************************//
    //API Step: Create partner
    const partnerResponse = await adminService.createPartner(partnerInfo);

    const tempPassword = "TempPass@" + Date.now().toString().slice(-4);

    const email = partnerInfo.accountInfo?.email!;

    const resetPartner = await authenticationService.resetPasswordWithoutToken(
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

      //API Step: Create business
      const business = await adminPortalService.createBussiness(
        "teamName",
        partnerResponse,
        masterPlanId,
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
        );
        expect(inviteMemberResponse).toBeDefined();
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
    const paymentProductName: string = plans[1];

    const testData = new TestDataProvider(adminPortalService);

    //Create department id to send
    let departmentID = await testData.getDepartmentId("BiginHR");

    const masterPlan: any = await testData.filterMasterPlanBasedName(
      departmentID,
      paymentProductName,
    );
    const masterPlanId = masterPlan.masterPlanId;

    const productTypesAndNamesToSend: ProductInfo[] =
      await testData.getProductTypesBasedDepartmentId(departmentID);
    //Create partner info
    const partnerInfo = await DataFactory.partnerBuilder()
      .withIsPublic(true)
      .withWhoPay(0)
      .withBankTransfer(true)
      .withDepartment(departmentID)
      .withFilterProductTypes(productTypesAndNamesToSend)
      .withPlanId(masterPlanId)
      .build();
    //Create partner
    const partnerResponse = await adminService.createPartner(partnerInfo);

    const tempPassword = "TempPass@" + Date.now().toString().slice(-4);

    const email = partnerInfo.accountInfo?.email!;

    const resetPartner = await authenticationService.resetPasswordWithoutToken(
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
        partnerInfo.accountInfo?.firstName!,
        partnerResponse,
        masterPlanId,
        partnerToken,
      );

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
      // Generate member data for invite payload
      const customerWithMember = await new CustomerBuilder()
        .withMember()
        .build();

      const member = customerWithMember.members[0];

      const invitePayload: InviteMemberPayload = {
        recipients: [
          {
            email: member.email,
            firstName: member.firstName,
            lastName: member.lastName,
            phoneNumber: member.phoneNumber,
            jobTitle: member.jobTitle,
            role: 2,
          },
        ],
      };

      const inviteMemberResponse = await memberPortalService.inviteMember(
        token,
        invitePayload,
      );

      expect(inviteMemberResponse).toBe(true);
    }
  });
});
