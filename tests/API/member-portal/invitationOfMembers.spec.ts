import { test, expect } from "src/fixtures";
import { AdminPortalService } from "src/api/services/admin-portal.services";
import { InviteMemberPayload } from "src/api/services/member-portal.services";
import { DataFactory, CustomerBuilder } from "src/data-factory";
import { TestDataProvider } from "src/test-data";
import { ProductInfo } from "src/objects/iproduct";
import { plans } from "src/constant/static-data";
import { Partner, UserInfo } from "src/objects";
import delay from "src/utilities/delay";

test.describe("Invite members to a team", () => {
  test("TC54 Verify that a user can invite members to a team in the Member Portal-Organization tab.", async ({
    apiClient,
    authenticationService,
    adminPortalService,
    memberPortalService,
    partnerPortalService,
    accountActivation,
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
    let departmentID = await testData.getDepartmentId(
      process.env.DEPARTMENT_NAME,
    );

    const paymentProductName: string = plans[4];

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
          role: 3,
        },
      ],
    };
    //***********************************************//
    //API Step: Create partner
    const partnerResponse = await adminService.createPartner(partnerInfo);

    delay(20000);

    const tempPassword = "Password@123";

    const email = partnerInfo.accountInfo?.email!;

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

    //API Step: Create business
    await partnerPortalService.createBusiness(
      partnerResponse,
      "teamName",
      masterPlanId,
      undefined,
      undefined,
      partnerToken,
    );

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

    await memberPortalService.inviteMember(token, invitePayload);
    const invitedEmail = invitePayload.recipients[0].email;

    await accountActivation.acceptInvitation(invitedEmail);

    const invitedEmailToken = await authenticationService.getAuthToken(
      invitedEmail,
      tempPassword,
      "4",
    );

    const paymentSubscriptionResp =
      await memberPortalService.getPaymentSubscription(invitedEmailToken);

    expect(paymentSubscriptionResp).toBeDefined();
    expect(typeof paymentSubscriptionResp).toBe("object");
    expect((paymentSubscriptionResp as any).main).toBeDefined();
    expect((paymentSubscriptionResp as any).handbookBuilder).toBeDefined();
    expect((paymentSubscriptionResp as any).lms).toBeDefined();
    expect((paymentSubscriptionResp as any).main.name).toContain(
      paymentProductName,
    );
    expect((paymentSubscriptionResp as any).main).toHaveProperty("productType");
    expect((paymentSubscriptionResp as any).main).toHaveProperty("quantity");
    expect((paymentSubscriptionResp as any).main).toHaveProperty("productType");
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
    expect((paymentSubscriptionResp as any).main).toHaveProperty("isCanceled");
    expect((paymentSubscriptionResp as any).main).toHaveProperty(
      "isPaymentLate",
    );
    expect((paymentSubscriptionResp as any).main).toHaveProperty(
      "cancelAtPeriodEnd",
    );
    expect((paymentSubscriptionResp as any).main).toHaveProperty("canceledBy");
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
      paymentProductName,
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
    expect((paymentSubscriptionResp as any).lms.name).toContain(
      paymentProductName,
    );
    expect((paymentSubscriptionResp as any).lms).toHaveProperty("productType");
    expect((paymentSubscriptionResp as any).lms).toHaveProperty("quantity");
    expect((paymentSubscriptionResp as any).lms).toHaveProperty("price");
    expect((paymentSubscriptionResp as any).lms).toHaveProperty(
      "remainingDays",
    );
    expect((paymentSubscriptionResp as any).lms).toHaveProperty("planId");
    expect((paymentSubscriptionResp as any).lms).toHaveProperty("currentPlan");
  });

  test("TC55 In the Member Portal, only the Owner and Admin of a team can invite members to that team.", async ({
    apiClient,
    authenticationService,
    adminPortalService,
    partnerPortalService,
    memberPortalService,
    accountActivation,
  }, testInfo) => {
    // Skip if base url not configured
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

    // Create department id
    const departmentID = await testData.getDepartmentId(
      process.env.DEPARTMENT_NAME,
    );

    const masterPlan: any = await testData.filterMasterPlanBasedName(
      departmentID,
      paymentProductName,
    );

    const masterPlanId = masterPlan.masterPlanId;

    const productTypesAndNamesToSend: ProductInfo[] =
      await testData.getProductTypesBasedDepartmentId(departmentID);

    const tempPassword = "Password@123";

    // Create partner info
    const partnerInfo = await DataFactory.partnerBuilder()
      .withIsPublic(true)
      .withWhoPay(0)
      .withBankTransfer(true)
      .withDepartment(departmentID)
      .withFilterProductTypes(productTypesAndNamesToSend)
      .withPlanId(masterPlanId)
      .build();

    // Create partner (Owner)
    const owner = await adminService.createPartner(partnerInfo);

    delay(20000);

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

    // Create customer with member
    const customerWithMember = await new CustomerBuilder().withMember().build();

    const invitedAdminEmail = customerWithMember.members[0].email;

    // Create business
    await partnerPortalService.createBusiness(
      owner,
      "TeamName",
      masterPlanId,
      undefined,
      customerWithMember.members,
      partnerToken,
    );

    // Invite members payload
    const adminPayload = {
      recipients: [
        {
          email: invitedAdminEmail,
          firstName: customerWithMember.members[0].firstName ?? "",
          lastName: customerWithMember.members[0].lastName ?? "",
          phoneNumber: customerWithMember.members[0].phoneNumber ?? "",
          jobTitle: customerWithMember.members[0].jobTitle ?? "",
          role: 2,
        },
      ],
    };

    const tokenOwner = await authenticationService.getAuthToken(
      email,
      tempPassword,
    );

    const inviteAdminResponse = await memberPortalService.inviteMember(
      tokenOwner,
      adminPayload,
    );

    expect(inviteAdminResponse).toBeDefined();

    const adminEmail = adminPayload.recipients[0].email;

    await accountActivation.acceptInvitation(adminEmail);

    const adminToken = await authenticationService.getAuthToken(
      adminEmail,
      tempPassword,
      "4",
    );

    const paymentSubscriptionResp =
      await memberPortalService.getPaymentSubscription(adminToken);

    expect(paymentSubscriptionResp).toBeDefined();
    expect(typeof paymentSubscriptionResp).toBe("object");
    expect((paymentSubscriptionResp as any).main).toBeDefined();
    expect((paymentSubscriptionResp as any).handbookBuilder).toBeDefined();
    expect((paymentSubscriptionResp as any).lms).toBeDefined();
    expect((paymentSubscriptionResp as any).main.name).toContain(
      paymentProductName,
    );
    expect((paymentSubscriptionResp as any).main).toHaveProperty("productType");
    expect((paymentSubscriptionResp as any).main).toHaveProperty("quantity");
    expect((paymentSubscriptionResp as any).main).toHaveProperty("productType");
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
    expect((paymentSubscriptionResp as any).main).toHaveProperty("isCanceled");
    expect((paymentSubscriptionResp as any).main).toHaveProperty(
      "isPaymentLate",
    );
    expect((paymentSubscriptionResp as any).main).toHaveProperty(
      "cancelAtPeriodEnd",
    );
    expect((paymentSubscriptionResp as any).main).toHaveProperty("canceledBy");
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
      paymentProductName,
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
    expect((paymentSubscriptionResp as any).lms.name).toContain(
      paymentProductName,
    );
    expect((paymentSubscriptionResp as any).lms).toHaveProperty("productType");
    expect((paymentSubscriptionResp as any).lms).toHaveProperty("quantity");
    expect((paymentSubscriptionResp as any).lms).toHaveProperty("price");
    expect((paymentSubscriptionResp as any).lms).toHaveProperty(
      "remainingDays",
    );
    expect((paymentSubscriptionResp as any).lms).toHaveProperty("planId");
    expect((paymentSubscriptionResp as any).lms).toHaveProperty("currentPlan");

    // Invite members payload
    const userEmail = "vinhle@yopmail.com";

    const userPayload = {
      recipients: [
        {
          email: userEmail,
          firstName: "Vinh",
          lastName: "Le",
          phoneNumber: "+11701813628",
          jobTitle: "User",
          role: 3,
        },
      ],
    };

    const tokenAdmin = await authenticationService.getAuthToken(
      email,
      tempPassword,
    );

    const inviteUserResponse = await memberPortalService.inviteMember(
      tokenAdmin,
      userPayload,
    );

    expect(inviteUserResponse).toBeDefined();

    await accountActivation.acceptInvitation(userEmail);

    const userToken = await authenticationService.getAuthToken(
      userEmail,
      tempPassword,
      "4",
    );

    const userPaymentSubscriptionResp =
      await memberPortalService.getPaymentSubscription(userToken);

    expect(userPaymentSubscriptionResp).toBeDefined();
    expect(typeof userPaymentSubscriptionResp).toBe("object");
    expect((userPaymentSubscriptionResp as any).main).toBeDefined();
    expect((userPaymentSubscriptionResp as any).handbookBuilder).toBeDefined();
    expect((userPaymentSubscriptionResp as any).lms).toBeDefined();
    expect((userPaymentSubscriptionResp as any).main.name).toContain(
      paymentProductName,
    );
    expect((userPaymentSubscriptionResp as any).main).toHaveProperty(
      "productType",
    );
    expect((userPaymentSubscriptionResp as any).main).toHaveProperty(
      "quantity",
    );
    expect((userPaymentSubscriptionResp as any).main).toHaveProperty(
      "productType",
    );
    expect((userPaymentSubscriptionResp as any).main).toHaveProperty("price");
    expect((userPaymentSubscriptionResp as any).main).toHaveProperty(
      "discount",
    );
    expect((userPaymentSubscriptionResp as any).main).toHaveProperty(
      "startDate",
    );
    expect((userPaymentSubscriptionResp as any).main).toHaveProperty("endDate");
    expect((userPaymentSubscriptionResp as any).main).toHaveProperty(
      "contractStartDate",
    );
    expect((userPaymentSubscriptionResp as any).main).toHaveProperty(
      "contractEndDate",
    );
    expect((userPaymentSubscriptionResp as any).main).toHaveProperty(
      "remainingDays",
    );
    expect((userPaymentSubscriptionResp as any).main).toHaveProperty("planId");
    expect((userPaymentSubscriptionResp as any).main).toHaveProperty("isTrial");
    expect((userPaymentSubscriptionResp as any).main).toHaveProperty(
      "isCanceled",
    );
    expect((userPaymentSubscriptionResp as any).main).toHaveProperty(
      "isPaymentLate",
    );
    expect((userPaymentSubscriptionResp as any).main).toHaveProperty(
      "cancelAtPeriodEnd",
    );
    expect((userPaymentSubscriptionResp as any).main).toHaveProperty(
      "canceledBy",
    );
    expect((userPaymentSubscriptionResp as any).main).toHaveProperty(
      "canceledDate",
    );
    expect((userPaymentSubscriptionResp as any).main).toHaveProperty(
      "cancellationReason",
    );
    expect((userPaymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
      "name",
    );
    expect((userPaymentSubscriptionResp as any).handbookBuilder.name).toContain(
      paymentProductName,
    );
    expect((userPaymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
      "productType",
    );
    expect((userPaymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
      "quantity",
    );
    expect((userPaymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
      "price",
    );
    expect((userPaymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
      "discount",
    );
    expect((userPaymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
      "startDate",
    );
    expect((userPaymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
      "endDate",
    );
    expect((userPaymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
      "contractStartDate",
    );
    expect((userPaymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
      "contractEndDate",
    );
    expect((userPaymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
      "remainingDays",
    );
    expect((userPaymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
      "isTrial",
    );
    expect((userPaymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
      "isCanceled",
    );
    expect((userPaymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
      "isPaymentLate",
    );
    expect((userPaymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
      "cancelAtPeriodEnd",
    );
    expect((userPaymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
      "canceledBy",
    );
    expect((userPaymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
      "canceledDate",
    );
    expect((userPaymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
      "cancellationReason",
    );
    expect((userPaymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
      "planId",
    );
    expect((userPaymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
      "currentPlan",
    );
    expect((userPaymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
      "rootPlan",
    );
    expect((userPaymentSubscriptionResp as any).lms).toHaveProperty("name");
    expect((userPaymentSubscriptionResp as any).lms.name).toContain(
      paymentProductName,
    );
    expect((userPaymentSubscriptionResp as any).lms).toHaveProperty(
      "productType",
    );
    expect((userPaymentSubscriptionResp as any).lms).toHaveProperty("quantity");
    expect((userPaymentSubscriptionResp as any).lms).toHaveProperty("price");
    expect((userPaymentSubscriptionResp as any).lms).toHaveProperty(
      "remainingDays",
    );
    expect((userPaymentSubscriptionResp as any).lms).toHaveProperty("planId");
    expect((userPaymentSubscriptionResp as any).lms).toHaveProperty(
      "currentPlan",
    );
  });
});
