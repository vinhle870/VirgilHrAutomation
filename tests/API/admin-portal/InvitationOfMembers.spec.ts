import { test, expect } from "src/fixtures";
import {
  AdminPortalService,
  InviteMemberWithId,
} from "src/api/services/admin-portal.services";
import { CustomerBuilder, DataFactory } from "src/data-factory";
import { TestDataProvider } from "src/test-data";
import { ProductInfo } from "src/objects/iproduct";
import { plans } from "src/constant/static-data";
import { InviteMemberPayload } from "src/api/services";

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
    for (let i = 0; i < 2; i++) {
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
    }
  });
});
