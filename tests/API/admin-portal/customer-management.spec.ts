import { test, expect } from "src/fixtures";
import { AdminPortalService } from "src/api/services/admin-portal.services";
import { DataFactory } from "src/data-factory";
import { I500EmployeesPlan } from "src/objects/I500EmployeesPlan";
import { PlatinumPlan } from "src/data-factory/platinum-data-generator";
import { TestDataProvider } from "src/test-data";
import { CustomerInfo } from "src/objects";
import { MemberPortalService } from "src/api/services";

test.describe("Partner management", () => {
  test("TC56 Verify that the admin can invite members to a team in the Admin Portal - Customer Management.", async ({
    apiClient,
    authenticationService,
    adminPortalService,
    yopmailPage,
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

    const departmentID = await testData.getDepartmentId("BiginHR");

    const customerDataName = "Individual 01";
    const customerDataEmail = "Individual01@yopmail.com";

    // Build consumer data
    const consumerData = await DataFactory.customerBuilder()
      .forAdminPortal()
      .withEmail(customerDataEmail)
      .withCompanyName(customerDataName)
      .withDepartment(departmentID)
      .withMembers(1)
      .build();

    // Check if customer already exists
    let searchedCustomer =
      await adminPortalService.searchCustomerByEmail(customerDataEmail);

    // Create a new customer if consumerData has been not existed yet
    if (searchedCustomer.entities.length === 0) {
      const resp = await adminService.createCustomer(consumerData);

      const plan: I500EmployeesPlan = PlatinumPlan.generatePlatinumPlan(
        resp.id,
        resp.email,
      );

      await adminPortalService.UpgradePlatinum(plan);

      searchedCustomer = await adminPortalService.searchCustomerByEmail(
        consumerData.accountInfo.email,
      );
    }

    const teamId = searchedCustomer?.entities?.[0]?.consumers?.teamIds?.[0];

    let memberData: CustomerInfo[] = [];
    //  Invite employees
    for (let i = 0; i < consumerData.members.length; i++) {
      const member = await DataFactory.customerBuilder()
        .forMemberPortal()
        .withCompanyName(consumerData.company.companyName!)
        .withDepartment(departmentID)
        .withEmail(consumerData.members[i].email)
        .build();

      memberData.push(member);
    }

    const inviteResponse = await adminPortalService.inviteTeamMember(
      teamId,
      consumerData.members,
    );

    expect(inviteResponse).toBe(true);

    for (let i = 0; i < memberData.length; i++)
      await yopmailPage.acceptInvitation(memberData[i].accountInfo.email);
  });

  test("Invite members from a customer with plan of 500+ in member portal", async ({
    apiClient,
    authenticationService,
    adminPortalService,
    memberPortalService,
    yopmailPage,
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

    const departmentID = await testData.getDepartmentId("BiginHR");

    const customerDataName = "Vinh Le";
    const customerDataEmail = "vinhlepartner225001@yopmail.com";
    let email = customerDataEmail;
    // Build consumer data
    const consumerData = await DataFactory.customerBuilder()
      .forAdminPortal()
      .withEmail(customerDataEmail)
      .withCompanyName(customerDataName)
      .withDepartment(departmentID)
      .withMembers(2)
      .build();

    // Check if customer already exists
    let searchedCustomer =
      await adminPortalService.searchCustomerByEmail(customerDataEmail);

    if (searchedCustomer.entities.length === 0) {
      const resp = await adminService.createCustomer(consumerData);

      const plan: I500EmployeesPlan = PlatinumPlan.generatePlatinumPlan(
        resp.id,
        resp.email,
      );

      email = resp.email;

      await adminPortalService.UpgradePlatinum(plan);

      await authenticationService.resetPasswordWithoutToken(
        { username: email, password: tempPassword },
        undefined,
        "4",
      );

      await authenticationService.confirmEmailWithoutToken(
        email,
        undefined,
        "4",
      );
    }
    const memberToken = await authenticationService.getAuthToken(
      email,
      tempPassword,
      "4",
    );

    let memberData: CustomerInfo[] = [];
    //  Invite employees
    for (let i = 0; i < consumerData.members.length; i++) {
      const member = await DataFactory.customerBuilder()
        .forMemberPortal()
        .withCompanyName(consumerData.company.companyName!)
        .withDepartment(departmentID)
        .withEmail(consumerData.members[i].email)
        .build();

      memberData.push(member);
    }
    const inviteResponse =
      await memberPortalService.inviteTeamMemberFromAnOwnerCustomer(
        memberToken,
        consumerData.members,
      );

    expect(inviteResponse).toBe(true);

    for (let i = 0; i < memberData.length; i++)
      await yopmailPage.acceptInvitation(memberData[i].accountInfo.email);
  });
});
