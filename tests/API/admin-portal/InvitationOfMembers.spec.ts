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
import delay from "src/utilities/delay";

test.describe("Partner management", () => {
  test("TC57 In the Admin Portal, the admin can invite members to a team from the Details page of any account.", async ({
    apiClient,
    authenticationService,
    adminPortalService,
    partnerPortalService,
    onboardingFlow,
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

    // Create department id to send
    const departmentID = await testData.getDepartmentId(
      process.env.DEPARTMENT_NAME,
    );
    const paymentProductName: string = plans[0];

    const tempPassword = "Password@123";

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

    delay(60000);

    const email = partnerInfo.accountInfo?.email!;
    // Create invited member info
    const customerWithMember = await new CustomerBuilder().withMember().build();

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

    await partnerPortalService.createBusiness(
      partner,
      "Team",
      masterPlanId,
      undefined,
      customerWithMember.members,
      partnerToken,
    );
    const businessList =
      await partnerPortalService.getBusinessList(partnerToken);

    const businessId = businessList.entities[0].id;

    expect(businessId).toBeDefined();
    expect(typeof businessId).toBe("string");

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

    const invitedEmail = customerWithMember.members[0].email;

    await onboardingFlow.acceptInvitation(invitedEmail);

    const invitedMemberToken = await authenticationService.getAuthToken(
      invitedEmail,
      tempPassword,
      "4",
    );

    // API VERIFICATION: GET Payment/subscription/me
    const paymentSubscriptionResp =
      await memberPortalService.getPaymentSubscription(invitedMemberToken);

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

  test("TC62 Verify that an account can belong to one or multiple teams.", async ({
    apiClient,
    authenticationService,
    adminPortalService,
    partnerPortalService,
    onboardingFlow,
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

    const tempPassword = "Password@123";
    const testData = new TestDataProvider(adminPortalService);
    const paymentProductName: string = plans[0];

    // Create department id
    const departmentID = await testData.getDepartmentId(
      process.env.DEPARTMENT_NAME,
    );

    const masterPlan: any = await testData.filterMasterPlanBasedName(
      departmentID,
      paymentProductName,
    );
    const masterPlanId = masterPlan.masterPlanId;

    const productTypesAndNamesToSend =
      await testData.getProductTypesBasedDepartmentId(departmentID);

    // Create member to invite
    const customerWithMember = await new CustomerBuilder().withMember().build();

    // Create partner info
    const partnerInfo = await DataFactory.partnerBuilder()
      .withIsPublic(true)
      .withWhoPay(0)
      .withBankTransfer(true)
      .withDepartment(departmentID)
      .withFilterProductTypes(productTypesAndNamesToSend)
      .withPlanId(masterPlanId)
      .build();

    const partner = await adminService.createPartner(partnerInfo);

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

    for (let i = 0; i < 2; i++) {
      const businessName = `${partnerInfo.accountInfo?.firstName}_${i}`;

      // Create business
      await partnerPortalService.createBusiness(
        partner,
        businessName,
        masterPlanId,
        undefined,
        customerWithMember.members,
        partnerToken,
      );

      const businessList =
        await partnerPortalService.getBusinessList(partnerToken);

      const businessId = businessList.entities[0].id;

      expect(businessId).toBeDefined();
      expect(typeof businessId).toBe("string");

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

      const invitedEmail = customerWithMember.members[0].email;

      await onboardingFlow.acceptInvitation(invitedEmail);

      const invitedMember = await authenticationService.getAuthToken(
        invitedEmail,
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
      expect((paymentSubscriptionResp as any).main.name).toContain(
        paymentProductName,
      );
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
