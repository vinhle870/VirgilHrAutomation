import { test, expect } from "src/fixtures";
import { AdminPortalService } from "src/api/services/admin-portal.services";
import { DataFactory } from "src/data-factory";
import { I500EmployeesPlan } from "src/objects/I500EmployeesPlan";
import { PlatinumPlan } from "src/data-factory/platinum-data-generator";
import { TestDataProvider } from "src/test-data";
import { CustomerInfo } from "src/objects";
import { plans } from "src/constant/static-data";

test.describe("Partner management", () => {
  test("TC56 Verify that the admin can invite members to a team in the Admin Portal - Customer Management.", async ({
    apiClient,
    authenticationService,
    adminPortalService,
    yopmailPage,
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
    const testData = new TestDataProvider(adminPortalService);

    const tempPassword = "Password@123";
    let planName = plans[4];
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

      planName = plan.restriction.name;
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

    for (let i = 0; i < memberData.length; i++) {
      await yopmailPage.acceptInvitation(memberData[i].accountInfo.email);
      const invitedMember = await authenticationService.getAuthToken(
        memberData[i].accountInfo.email,
        tempPassword,
        "4",
      );

      // API VERIFICATION: GET Payment/subscription/me
      const paymentSubscriptionResp =
        await memberPortalService.getPaymentSubscription(invitedMember);

      expect(paymentSubscriptionResp).toBeDefined();
      expect(typeof paymentSubscriptionResp).toBe("object");
      expect((paymentSubscriptionResp as any).main).toBeDefined();
      expect((paymentSubscriptionResp as any).handbookBuilder).toBeDefined();
      expect((paymentSubscriptionResp as any).lms).toBeDefined();
      expect((paymentSubscriptionResp as any).main.name).toContain(planName);
      expect((paymentSubscriptionResp as any).main).toHaveProperty(
        "productType",
      );
      expect((paymentSubscriptionResp as any).main).toHaveProperty("quantity");
      expect((paymentSubscriptionResp as any).main).toHaveProperty(
        "productType",
      );
      expect((paymentSubscriptionResp as any).main).toHaveProperty("price");
      expect((paymentSubscriptionResp as any).main).toHaveProperty("discount");
      expect((paymentSubscriptionResp as any).main).toHaveProperty("startDate");
      expect((paymentSubscriptionResp as any).main).toHaveProperty("endDate");
      expect((paymentSubscriptionResp as any).main).toHaveProperty(
        "contractStartDate",
      );
      expect((paymentSubscriptionResp as any).main).toHaveProperty(
        "contractEndDate",
      );
      expect((paymentSubscriptionResp as any).main).toHaveProperty(
        "remainingDays",
      );
      expect((paymentSubscriptionResp as any).main).toHaveProperty("planId");
      expect((paymentSubscriptionResp as any).main).toHaveProperty("isTrial");
      expect((paymentSubscriptionResp as any).main).toHaveProperty(
        "isCanceled",
      );
      expect((paymentSubscriptionResp as any).main).toHaveProperty(
        "isPaymentLate",
      );
      expect((paymentSubscriptionResp as any).main).toHaveProperty(
        "cancelAtPeriodEnd",
      );
      expect((paymentSubscriptionResp as any).main).toHaveProperty(
        "canceledBy",
      );
      expect((paymentSubscriptionResp as any).main).toHaveProperty(
        "canceledDate",
      );
      expect((paymentSubscriptionResp as any).main).toHaveProperty(
        "cancellationReason",
      );
      expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
        "name",
      );
      expect((paymentSubscriptionResp as any).handbookBuilder.name).toContain(
        planName,
      );
      expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
        "productType",
      );
      expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
        "quantity",
      );
      expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
        "price",
      );
      expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
        "discount",
      );
      expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
        "startDate",
      );
      expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
        "endDate",
      );
      expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
        "contractStartDate",
      );
      expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
        "contractEndDate",
      );
      expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
        "remainingDays",
      );
      expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
        "isTrial",
      );
      expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
        "isCanceled",
      );
      expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
        "isPaymentLate",
      );
      expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
        "cancelAtPeriodEnd",
      );
      expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
        "canceledBy",
      );
      expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
        "canceledDate",
      );
      expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
        "cancellationReason",
      );
      expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
        "planId",
      );
      expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
        "currentPlan",
      );
      expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
        "rootPlan",
      );
      expect((paymentSubscriptionResp as any).lms).toHaveProperty("name");
      expect((paymentSubscriptionResp as any).lms.name).toContain(planName);
      expect((paymentSubscriptionResp as any).lms).toHaveProperty(
        "productType",
      );
      expect((paymentSubscriptionResp as any).lms).toHaveProperty("quantity");
      expect((paymentSubscriptionResp as any).lms).toHaveProperty("price");
      expect((paymentSubscriptionResp as any).lms).toHaveProperty(
        "remainingDays",
      );
      expect((paymentSubscriptionResp as any).lms).toHaveProperty("planId");
      expect((paymentSubscriptionResp as any).lms).toHaveProperty(
        "currentPlan",
      );
    }
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

    const customerDataName = "vinhle2262026";
    const customerDataEmail = "vinhle2262026@yopmail.com";
    //vinhlepartner225001@yopmail.com
    let email = customerDataEmail;
    // Build consumer data
    const consumerData = await DataFactory.customerBuilder()
      .forAdminPortal()
      .withEmail(customerDataEmail)
      .withCompanyName(customerDataName)
      .withDepartment(departmentID)
      .withMembers(1)
      .build();

    let planName = plans[4];
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

      planName = plan.restriction.name;
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

    for (let i = 0; i < memberData.length; i++) {
      await yopmailPage.acceptInvitation(memberData[i].accountInfo.email);

      const invitedMember = await authenticationService.getAuthToken(
        memberData[i].accountInfo.email,
        tempPassword,
        "4",
      );

      // API VERIFICATION: GET Payment/subscription/me
      const paymentSubscriptionResp =
        await memberPortalService.getPaymentSubscription(invitedMember);

      expect(paymentSubscriptionResp).toBeDefined();
      expect(typeof paymentSubscriptionResp).toBe("object");
      expect((paymentSubscriptionResp as any).main).toBeDefined();
      expect((paymentSubscriptionResp as any).handbookBuilder).toBeDefined();
      expect((paymentSubscriptionResp as any).lms).toBeDefined();
      expect((paymentSubscriptionResp as any).main.name).toContain(planName);
      expect((paymentSubscriptionResp as any).main).toHaveProperty(
        "productType",
      );
      expect((paymentSubscriptionResp as any).main).toHaveProperty("quantity");
      expect((paymentSubscriptionResp as any).main).toHaveProperty(
        "productType",
      );
      expect((paymentSubscriptionResp as any).main).toHaveProperty("price");
      expect((paymentSubscriptionResp as any).main).toHaveProperty("discount");
      expect((paymentSubscriptionResp as any).main).toHaveProperty("startDate");
      expect((paymentSubscriptionResp as any).main).toHaveProperty("endDate");
      expect((paymentSubscriptionResp as any).main).toHaveProperty(
        "contractStartDate",
      );
      expect((paymentSubscriptionResp as any).main).toHaveProperty(
        "contractEndDate",
      );
      expect((paymentSubscriptionResp as any).main).toHaveProperty(
        "remainingDays",
      );
      expect((paymentSubscriptionResp as any).main).toHaveProperty("planId");
      expect((paymentSubscriptionResp as any).main).toHaveProperty("isTrial");
      expect((paymentSubscriptionResp as any).main).toHaveProperty(
        "isCanceled",
      );
      expect((paymentSubscriptionResp as any).main).toHaveProperty(
        "isPaymentLate",
      );
      expect((paymentSubscriptionResp as any).main).toHaveProperty(
        "cancelAtPeriodEnd",
      );
      expect((paymentSubscriptionResp as any).main).toHaveProperty(
        "canceledBy",
      );
      expect((paymentSubscriptionResp as any).main).toHaveProperty(
        "canceledDate",
      );
      expect((paymentSubscriptionResp as any).main).toHaveProperty(
        "cancellationReason",
      );
      expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
        "name",
      );
      expect((paymentSubscriptionResp as any).handbookBuilder.name).toContain(
        planName,
      );
      expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
        "productType",
      );
      expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
        "quantity",
      );
      expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
        "price",
      );
      expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
        "discount",
      );
      expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
        "startDate",
      );
      expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
        "endDate",
      );
      expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
        "contractStartDate",
      );
      expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
        "contractEndDate",
      );
      expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
        "remainingDays",
      );
      expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
        "isTrial",
      );
      expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
        "isCanceled",
      );
      expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
        "isPaymentLate",
      );
      expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
        "cancelAtPeriodEnd",
      );
      expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
        "canceledBy",
      );
      expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
        "canceledDate",
      );
      expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
        "cancellationReason",
      );
      expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
        "planId",
      );
      expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
        "currentPlan",
      );
      expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
        "rootPlan",
      );
      expect((paymentSubscriptionResp as any).lms).toHaveProperty("name");
      expect((paymentSubscriptionResp as any).lms.name).toContain(planName);
      expect((paymentSubscriptionResp as any).lms).toHaveProperty(
        "productType",
      );
      expect((paymentSubscriptionResp as any).lms).toHaveProperty("quantity");
      expect((paymentSubscriptionResp as any).lms).toHaveProperty("price");
      expect((paymentSubscriptionResp as any).lms).toHaveProperty(
        "remainingDays",
      );
      expect((paymentSubscriptionResp as any).lms).toHaveProperty("planId");
      expect((paymentSubscriptionResp as any).lms).toHaveProperty(
        "currentPlan",
      );
    }
  });
});
