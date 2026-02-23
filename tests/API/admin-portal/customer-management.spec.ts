import { test, expect } from "src/fixtures";
import { AdminPortalService } from "src/api/services/admin-portal.services";
import { DataFactory } from "src/data-factory";
import { plans } from "src/constant/static-data";
import { I500EmployeesPlan } from "src/objects/I500EmployeesPlan";
import { PlatinumPlan } from "src/data-factory/platinum-data-generator";
import delay from "src/utilities/delay";

test.describe("Partner management", () => {
  test("TC56 Verify that the admin can invite members to a team in the Admin Portal - Customer Management.", async ({
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
    // Build consumer data
    const consumerData = await DataFactory.customerBuilder()
      .forAdminPortal()
      .withDepartment("688897d5eb52b4af5573def4") // TODO: call API to get department id
      .withMembers(10)
      .build();
    // Check if customer already exists
    let searchedCustomer = await adminPortalService.getCustomerByEmail(
      consumerData.accountInfo.email,
    );

    const tempPassword = "Password@123";

    let teamID;
    if (searchedCustomer.teams.length == 0) {
      const resp = await adminService.createCustomer(consumerData);

      const plan: I500EmployeesPlan = PlatinumPlan.generatePlatinumPlan(
        resp.id,
        resp.email,
      );

      await adminPortalService.UpgradePlatinum(plan);

      searchedCustomer = await adminPortalService.getCustomerByEmail(
        consumerData.accountInfo.email,
      );

      teamID = searchedCustomer.teams[0].id;

      await authenticationService.resetPasswordWithoutToken(
        { username: consumerData.accountInfo.email, password: tempPassword },
        undefined,
        "4",
      );

      await authenticationService.confirmEmailWithoutToken(
        consumerData.accountInfo.email,
        undefined,
        "4",
      );

      const consumerToken = await authenticationService.getAuthToken(
        consumerData.accountInfo.email,
        tempPassword,
        "4",
      );
    }

    const inviteResponse = await adminPortalService.inviteTeamMember(
      teamID,
      consumerData.members,
    );
    expect(inviteResponse).toBe(true);

    // Invite 500+ employees
    for (let i = 0; i < consumerData.members.length; i++) {
      const memberData = await DataFactory.customerBuilder()
        .forMemberPortal()
        .withCompanyName(consumerData.company.companyName!)
        .withDepartment("688897d5eb52b4af5573def4") // TODO: call API to get department id
        .withEmail(consumerData.members[i].email)
        .build();

      await memberPortalService.signUpConsumer(memberData);

      await authenticationService.resetPasswordWithoutToken(
        { username: memberData.accountInfo.email, password: tempPassword },
        undefined,
        "4",
      );

      await authenticationService.confirmEmailWithoutToken(
        memberData.accountInfo.email,
        undefined,
        "4",
      );

      const partnerToken = await authenticationService.getAuthToken(
        memberData.accountInfo.email,
        tempPassword,
        "4",
      );

      const planOfMember =
        await memberPortalService.getCurrentSubscribedPlan(partnerToken);
    }
  });
});
