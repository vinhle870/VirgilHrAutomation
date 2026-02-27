import { test, expect } from "src/fixtures";
import {
  AdminPortalService,
  InviteMemberWithId,
} from "src/api/services/admin-portal.services";
import { CustomerBuilder, DataFactory } from "src/data-factory";
import { TestDataProvider } from "src/test-data";
import { ProductInfo } from "src/objects/iproduct";
import { plans } from "src/constant/static-data";
import { UserInfo } from "src/objects";

test.describe("Partner management", () => {
  test("TC57 In the Admin Portal, the admin can invite members to a team from the Details page of any account.", async ({
    apiClient,
    authenticationService,
    adminPortalService,
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

    const testData = new TestDataProvider(adminPortalService);

    // Create department id to send
    const departmentID = await testData.getDepartmentId("BiginHR");
    const paymentProductName: string = plans[1];

    const masterPlan: any = await testData.filterMasterPlanBasedName(
      departmentID,
      paymentProductName,
    );
    const masterPlanId = masterPlan.masterPlanId;
    // Get all product types of a department
    const productTypesAndNamesToSend: ProductInfo[] =
      await testData.getProductTypesBasedDepartmentId(departmentID);
    // Create partner info
    const partnerInfo = await DataFactory.partnerBuilder()
      .withIsPublic(true)
      .withWhoPay(0)
      .withBankTransfer(true)
      .withFilterProductTypes(productTypesAndNamesToSend)
      .withDepartment(departmentID)
      .withPlanId(masterPlanId)
      .build();
    // Create partner
    const partner = await adminService.createPartner(partnerInfo);
    // Create invited member info
    const customerWithMember = await new CustomerBuilder().withMember().build();

    const member = customerWithMember.members[0];

    const invitePayload: InviteMemberWithId = {
      id: partner,
      recipients: [
        {
          email: member.email,
          firstName: member.firstName,
          lastName: member.lastName,
          phoneNumber: member.phoneNumber,
          jobTitle: member.jobTitle,
          role: 3,
          partnerConsumerType: 1,
          consultantRole: 3,
        },
      ],
    };

    // Call API to create a new member to a team
    const successfullyInvitedMember =
      await adminPortalService.inviteMembers(invitePayload);

    expect(successfullyInvitedMember).toBe(true);
  });

  test("TC62 Verify that an account can belong to one or multiple teams.", async ({
    apiClient,
    authenticationService,
    adminPortalService,
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
    const tempPassword = "Password@123";

    const testData = new TestDataProvider(adminPortalService);

    const paymentProductName: string = plans[1];

    // Create department id to send
    const departmentID = await testData.getDepartmentId("BiginHR");

    const masterPlan: any = await testData.filterMasterPlanBasedName(
      departmentID,
      paymentProductName,
    );
    const masterPlanId = masterPlan.masterPlanId;

    const productTypesAndNamesToSend: ProductInfo[] =
      await testData.getProductTypesBasedDepartmentId(departmentID);
    //Create a member to invite
    const customerWithMember = await new CustomerBuilder().withMember().build();

    const member = customerWithMember.members[0];

    // Create partner info
    const partnerInfo = await DataFactory.partnerBuilder()
      .withIsPublic(true)
      .withWhoPay(0)
      .withBankTransfer(true)
      .withDepartment(departmentID)
      .withFilterProductTypes(productTypesAndNamesToSend)
      .withPlanId(masterPlanId)
      .build();
    // Create partner
    const partner = await adminService.createPartner(partnerInfo);
    // Create invited member info
    const invitePayload: UserInfo = {
      email: member.email,
      firstName: member.firstName,
      lastName: member.lastName,
      phoneNumber: member.phoneNumber,
      jobTitle: member.jobTitle,
      role: 3,
    };
    const email = partnerInfo.accountInfo?.email ?? "";

    await authenticationService.resetPasswordWithoutToken(
      { username: email, password: tempPassword },
      undefined,
      "5",
    );

    await authenticationService.confirmEmailWithoutToken(email, undefined, "5");

    const partnerToken = await authenticationService.getAuthToken(
      email,
      tempPassword,
      "5",
    );

    for (let i = 0; i < 2; i++) {
      //create buniness
      await partnerPortalService.createBusiness(
        partner,
        `${partnerInfo.accountInfo?.firstName}${i}`,
        masterPlanId,
        undefined,
        customerWithMember.members,
        partnerToken,
      );

      //API Step: Get business list
      const businessList =
        await partnerPortalService.getBusinessList(partnerToken);
      const businessId = businessList.entities[0].id;

      // Call API to create a new member to a team
      await partnerPortalService.inviteMember(
        businessId,
        customerWithMember.members,
        partnerToken,
      );

      expect(businessList).toBeDefined();
      expect(typeof businessList).toBe("object");
      expect(businessList.entities).toBeDefined();
      expect(typeof businessList.entities).toBe("object");
      expect(businessList.entities.length).toBeGreaterThan(0);
      expect(businessList.entities[0].id).toBeDefined();
      expect(typeof businessList.entities[0].id).toBe("string");

      //API Step: Get team members list
      const teamMembersList = await partnerPortalService.getTeamMembersList(
        businessList.entities[0].id,
        partnerToken,
      );
      expect(teamMembersList).toBeDefined();
      expect(typeof teamMembersList).toBe("object");
      expect(teamMembersList.total).toBeDefined();
      expect(typeof teamMembersList.total).toBe("number");
      expect(teamMembersList.total).toEqual(
        customerWithMember.members.length + 1,
      ); // +1 for the partner who created the business
      expect(teamMembersList.entities).toBeDefined();
      expect(typeof teamMembersList.entities).toBe("object");
      expect(teamMembersList.entities[1].email).toBeDefined();
      expect(typeof teamMembersList.entities[1].email).toBe("string");
      expect(teamMembersList.entities[1].email).toBe(
        customerWithMember.members[0].email,
      );
    }
  });
});
