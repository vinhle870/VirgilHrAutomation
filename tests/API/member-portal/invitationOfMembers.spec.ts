import { test, expect } from "src/fixtures";
import { AdminPortalService } from "src/api/services/admin-portal.services";
import { InviteMemberPayload } from "src/api/services/member-portal.services";
import { DataFactory, CustomerBuilder } from "src/data-factory";
import { TestDataProvider } from "src/test-data";
import { ProductInfo } from "src/objects/iproduct";
import { plans } from "src/constant/static-data";
import { AuthFlow } from "src/ui/flows";

test.describe(
  "Invite members to a team",
  {
    tag: ["@API", "@Member Portal", "@Invite Members", "@Organization", "@TC54", "@TC55", "@regression_API"],
  },
  () => {
    test(
      "TC54 Verify that a user can invite members to a team in the Member Portal-Organization tab.",
      {
        tag: ["@TC54", "@API", "@Member Portal", "@Invite Members", "@Organization"],
      },
      async ({ apiClient, authenticationService, adminPortalService, memberPortalService, partnerPortalService, authFlow }) => {
        //***************Pre-requisites: Prepare data for the test*******************************//

        const adminService = await AdminPortalService.create(apiClient, authenticationService);

        let departmentID: string;
        let paymentProductName: string;
        let productTypesAndNamesToSend: ProductInfo[];
        let masterPlanId: string;
        let partnerInfo!: Awaited<ReturnType<ReturnType<typeof DataFactory.partnerBuilder>["build"]>>;
        let customerWithMember: Awaited<ReturnType<CustomerBuilder["build"]>>;
        let invitePayload: InviteMemberPayload;

        await test.step("1 - Pre-condition: Department, plan, partner payload, and invite payload", async () => {
          const testData = new TestDataProvider(adminPortalService);

          departmentID = await testData.getDepartmentId(process.env.DEPARTMENT_NAME);

          paymentProductName = plans[4];

          productTypesAndNamesToSend = await testData.getProductTypesBasedDepartmentId(departmentID);

          const masterPlan: any = await testData.filterMasterPlanBasedName(departmentID, paymentProductName);

          masterPlanId = masterPlan.masterPlanId;

          partnerInfo = await DataFactory.partnerBuilder()
            .withIsPublic(true)
            .withWhoPay(0)
            .withBankTransfer(true)
            .withDepartment(departmentID)
            .withFilterProductTypes(productTypesAndNamesToSend)
            .withPlanId(masterPlanId)
            .build();

          customerWithMember = await new CustomerBuilder().withMember().build();

          const member = customerWithMember.members[0];

          invitePayload = {
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
        });

        const tempPassword = "Password@123";
        let partnerResponse!: Awaited<ReturnType<typeof adminService.createPartner>>;
        let email: string;
        let partnerToken: string;
        let token: string;

        await test.step("2 - Create partner, business, and obtain Member Portal token", async () => {
          partnerResponse = await adminService.createPartner(partnerInfo);


          email = partnerInfo.accountInfo?.email!;

          await authenticationService.resetPasswordWithoutToken({ username: email, password: tempPassword }, undefined, "5");

          await authenticationService.confirmEmailWithoutToken(email, undefined, "5");
          partnerToken = await authenticationService.getAuthToken(email, tempPassword, "5");

          await partnerPortalService.createBusiness(partnerResponse, "teamName", masterPlanId, undefined, undefined, partnerToken);

          await authenticationService.resetPasswordWithoutToken({ username: email, password: tempPassword }, undefined, "4");
          token = await authenticationService.getAuthToken(email, tempPassword, "4");
        });

        await test.step("3 - Member Portal: Invite member (Organization tab)", async () => {
          const partnerName = partnerInfo.partnerInfo?.name;
          expect(partnerName).toBeDefined();

          await memberPortalService.inviteMember(token, invitePayload);
        });

        await test.step("4 - Onboarding: Accept invitation and verify GET Payment/subscription/me", async () => {
          const invitedEmail = invitePayload.recipients[0].email;

          await authFlow.activateCustomerAccount(invitedEmail, tempPassword);

          const invitedEmailToken = await authenticationService.getAuthToken(invitedEmail, tempPassword, "4");

          const paymentSubscriptionResp = await memberPortalService.getPaymentSubscription(invitedEmailToken);

          expect(paymentSubscriptionResp).toBeDefined();
          expect(typeof paymentSubscriptionResp).toBe("object");
          expect((paymentSubscriptionResp as any).main).toBeDefined();
          expect((paymentSubscriptionResp as any).handbookBuilder).toBeDefined();
          expect((paymentSubscriptionResp as any).lms).toBeDefined();
          expect((paymentSubscriptionResp as any).main.name).toContain(paymentProductName);
          expect((paymentSubscriptionResp as any).main).toHaveProperty("productType");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("quantity");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("productType");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("price");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("discount");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("startDate");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("endDate");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("contractStartDate");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("contractEndDate");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("remainingDays");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("planId");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("isTrial");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("isCanceled");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("isPaymentLate");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("cancelAtPeriodEnd");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("canceledBy");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("canceledDate");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("cancellationReason");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("name");
          expect((paymentSubscriptionResp as any).handbookBuilder.name).toContain(paymentProductName);
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("productType");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("quantity");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("price");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("discount");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("startDate");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("endDate");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("contractStartDate");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("contractEndDate");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("remainingDays");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("isTrial");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("isCanceled");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("isPaymentLate");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("cancelAtPeriodEnd");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("canceledBy");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("canceledDate");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("cancellationReason");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("planId");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("currentPlan");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("rootPlan");
          expect((paymentSubscriptionResp as any).lms).toHaveProperty("name");
          expect((paymentSubscriptionResp as any).lms.name).toContain(paymentProductName);
          expect((paymentSubscriptionResp as any).lms).toHaveProperty("productType");
          expect((paymentSubscriptionResp as any).lms).toHaveProperty("quantity");
          expect((paymentSubscriptionResp as any).lms).toHaveProperty("price");
          expect((paymentSubscriptionResp as any).lms).toHaveProperty("remainingDays");
          expect((paymentSubscriptionResp as any).lms).toHaveProperty("planId");
          expect((paymentSubscriptionResp as any).lms).toHaveProperty("currentPlan");
        });
      },
    );

    test(
      "TC55 In the Member Portal, only the Owner and Admin of a team can invite members to that team.",
      {
        tag: ["@TC55", "@API", "@Member Portal", "@Invite Members", "@Owner Admin"],
      },
      async ({ apiClient, authenticationService, adminPortalService, partnerPortalService, memberPortalService, authFlow }) => {
        const adminService = await AdminPortalService.create(apiClient, authenticationService);

        const paymentProductName: string = plans[1];
        const tempPassword = "Password@123";

        let departmentID: string;
        let masterPlanId: string;
        let productTypesAndNamesToSend: ProductInfo[];
        let partnerInfo!: Awaited<ReturnType<ReturnType<typeof DataFactory.partnerBuilder>["build"]>>;
        let owner!: Awaited<ReturnType<typeof adminService.createPartner>>;
        let email: string;
        let partnerToken: string;
        let customerWithMember: Awaited<ReturnType<CustomerBuilder["build"]>>;
        let invitedAdminEmail: string;
        let adminPayload!: {
          recipients: Array<{
            email: string;
            firstName: string;
            lastName: string;
            phoneNumber: string;
            jobTitle: string;
            role: number;
          }>;
        };

        await test.step("1 - Pre-condition: Partner, business, and admin invite payload", async () => {
          const testData = new TestDataProvider(adminPortalService);

          departmentID = await testData.getDepartmentId(process.env.DEPARTMENT_NAME);

          const masterPlan: any = await testData.filterMasterPlanBasedName(departmentID, paymentProductName);

          masterPlanId = masterPlan.masterPlanId;

          productTypesAndNamesToSend = await testData.getProductTypesBasedDepartmentId(departmentID);

          partnerInfo = await DataFactory.partnerBuilder()
            .withIsPublic(true)
            .withWhoPay(0)
            .withBankTransfer(true)
            .withDepartment(departmentID)
            .withFilterProductTypes(productTypesAndNamesToSend)
            .withPlanId(masterPlanId)
            .build();

          owner = await adminService.createPartner(partnerInfo);


          email = partnerInfo.accountInfo?.email ?? "";

          await authenticationService.resetPasswordWithoutToken({ username: email, password: tempPassword }, undefined, "5");

          await authenticationService.confirmEmailWithoutToken(email, undefined, "5");

          partnerToken = await authenticationService.getAuthToken(email, tempPassword, "5");

          customerWithMember = await new CustomerBuilder().withMember().build();

          invitedAdminEmail = customerWithMember.members[0].email;

          await partnerPortalService.createBusiness(owner, "TeamName", masterPlanId, undefined, customerWithMember.members, partnerToken);

          adminPayload = {
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
        });

        await test.step("2 - Owner invites Admin: accept invitation and verify subscription", async () => {
          const tokenOwner = await authenticationService.getAuthToken(email, tempPassword);

          const inviteAdminResponse = await memberPortalService.inviteMember(tokenOwner, adminPayload);

          expect(inviteAdminResponse).toBeDefined();

          const adminEmail = adminPayload.recipients[0].email;

          await authFlow.activateCustomerAccount(adminEmail, tempPassword);

          const adminToken = await authenticationService.getAuthToken(adminEmail, tempPassword, "4");

          const paymentSubscriptionResp = await memberPortalService.getPaymentSubscription(adminToken);

          expect(paymentSubscriptionResp).toBeDefined();
          expect(typeof paymentSubscriptionResp).toBe("object");
          expect((paymentSubscriptionResp as any).main).toBeDefined();
          expect((paymentSubscriptionResp as any).handbookBuilder).toBeDefined();
          expect((paymentSubscriptionResp as any).lms).toBeDefined();
          expect((paymentSubscriptionResp as any).main.name).toContain(paymentProductName);
          expect((paymentSubscriptionResp as any).main).toHaveProperty("productType");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("quantity");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("productType");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("price");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("discount");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("startDate");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("endDate");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("contractStartDate");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("contractEndDate");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("remainingDays");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("planId");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("isTrial");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("isCanceled");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("isPaymentLate");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("cancelAtPeriodEnd");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("canceledBy");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("canceledDate");
          expect((paymentSubscriptionResp as any).main).toHaveProperty("cancellationReason");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("name");
          expect((paymentSubscriptionResp as any).handbookBuilder.name).toContain(paymentProductName);
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("productType");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("quantity");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("price");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("discount");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("startDate");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("endDate");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("contractStartDate");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("contractEndDate");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("remainingDays");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("isTrial");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("isCanceled");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("isPaymentLate");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("cancelAtPeriodEnd");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("canceledBy");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("canceledDate");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("cancellationReason");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("planId");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("currentPlan");
          expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty("rootPlan");
          expect((paymentSubscriptionResp as any).lms).toHaveProperty("name");
          expect((paymentSubscriptionResp as any).lms.name).toContain(paymentProductName);
          expect((paymentSubscriptionResp as any).lms).toHaveProperty("productType");
          expect((paymentSubscriptionResp as any).lms).toHaveProperty("quantity");
          expect((paymentSubscriptionResp as any).lms).toHaveProperty("price");
          expect((paymentSubscriptionResp as any).lms).toHaveProperty("remainingDays");
          expect((paymentSubscriptionResp as any).lms).toHaveProperty("planId");
          expect((paymentSubscriptionResp as any).lms).toHaveProperty("currentPlan");
        });

        await test.step("3 - Admin invites User: accept invitation and verify subscription", async () => {
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

          const tokenAdmin = await authenticationService.getAuthToken(email, tempPassword);

          const inviteUserResponse = await memberPortalService.inviteMember(tokenAdmin, userPayload);

          expect(inviteUserResponse).toBeDefined();

          await authFlow.activateCustomerAccount(userEmail, tempPassword);

          const userToken = await authenticationService.getAuthToken(userEmail, tempPassword, "4");

          const userPaymentSubscriptionResp = await memberPortalService.getPaymentSubscription(userToken);

          expect(userPaymentSubscriptionResp).toBeDefined();
          expect(typeof userPaymentSubscriptionResp).toBe("object");
          expect((userPaymentSubscriptionResp as any).main).toBeDefined();
          expect((userPaymentSubscriptionResp as any).handbookBuilder).toBeDefined();
          expect((userPaymentSubscriptionResp as any).lms).toBeDefined();
          expect((userPaymentSubscriptionResp as any).main.name).toContain(paymentProductName);
          expect((userPaymentSubscriptionResp as any).main).toHaveProperty("productType");
          expect((userPaymentSubscriptionResp as any).main).toHaveProperty("quantity");
          expect((userPaymentSubscriptionResp as any).main).toHaveProperty("productType");
          expect((userPaymentSubscriptionResp as any).main).toHaveProperty("price");
          expect((userPaymentSubscriptionResp as any).main).toHaveProperty("discount");
          expect((userPaymentSubscriptionResp as any).main).toHaveProperty("startDate");
          expect((userPaymentSubscriptionResp as any).main).toHaveProperty("endDate");
          expect((userPaymentSubscriptionResp as any).main).toHaveProperty("contractStartDate");
          expect((userPaymentSubscriptionResp as any).main).toHaveProperty("contractEndDate");
          expect((userPaymentSubscriptionResp as any).main).toHaveProperty("remainingDays");
          expect((userPaymentSubscriptionResp as any).main).toHaveProperty("planId");
          expect((userPaymentSubscriptionResp as any).main).toHaveProperty("isTrial");
          expect((userPaymentSubscriptionResp as any).main).toHaveProperty("isCanceled");
          expect((userPaymentSubscriptionResp as any).main).toHaveProperty("isPaymentLate");
          expect((userPaymentSubscriptionResp as any).main).toHaveProperty("cancelAtPeriodEnd");
          expect((userPaymentSubscriptionResp as any).main).toHaveProperty("canceledBy");
          expect((userPaymentSubscriptionResp as any).main).toHaveProperty("canceledDate");
          expect((userPaymentSubscriptionResp as any).main).toHaveProperty("cancellationReason");
          expect((userPaymentSubscriptionResp as any).handbookBuilder).toHaveProperty("name");
          expect((userPaymentSubscriptionResp as any).handbookBuilder.name).toContain(paymentProductName);
          expect((userPaymentSubscriptionResp as any).handbookBuilder).toHaveProperty("productType");
          expect((userPaymentSubscriptionResp as any).handbookBuilder).toHaveProperty("quantity");
          expect((userPaymentSubscriptionResp as any).handbookBuilder).toHaveProperty("price");
          expect((userPaymentSubscriptionResp as any).handbookBuilder).toHaveProperty("discount");
          expect((userPaymentSubscriptionResp as any).handbookBuilder).toHaveProperty("startDate");
          expect((userPaymentSubscriptionResp as any).handbookBuilder).toHaveProperty("endDate");
          expect((userPaymentSubscriptionResp as any).handbookBuilder).toHaveProperty("contractStartDate");
          expect((userPaymentSubscriptionResp as any).handbookBuilder).toHaveProperty("contractEndDate");
          expect((userPaymentSubscriptionResp as any).handbookBuilder).toHaveProperty("remainingDays");
          expect((userPaymentSubscriptionResp as any).handbookBuilder).toHaveProperty("isTrial");
          expect((userPaymentSubscriptionResp as any).handbookBuilder).toHaveProperty("isCanceled");
          expect((userPaymentSubscriptionResp as any).handbookBuilder).toHaveProperty("isPaymentLate");
          expect((userPaymentSubscriptionResp as any).handbookBuilder).toHaveProperty("cancelAtPeriodEnd");
          expect((userPaymentSubscriptionResp as any).handbookBuilder).toHaveProperty("canceledBy");
          expect((userPaymentSubscriptionResp as any).handbookBuilder).toHaveProperty("canceledDate");
          expect((userPaymentSubscriptionResp as any).handbookBuilder).toHaveProperty("cancellationReason");
          expect((userPaymentSubscriptionResp as any).handbookBuilder).toHaveProperty("planId");
          expect((userPaymentSubscriptionResp as any).handbookBuilder).toHaveProperty("currentPlan");
          expect((userPaymentSubscriptionResp as any).handbookBuilder).toHaveProperty("rootPlan");
          expect((userPaymentSubscriptionResp as any).lms).toHaveProperty("name");
          expect((userPaymentSubscriptionResp as any).lms.name).toContain(paymentProductName);
          expect((userPaymentSubscriptionResp as any).lms).toHaveProperty("productType");
          expect((userPaymentSubscriptionResp as any).lms).toHaveProperty("quantity");
          expect((userPaymentSubscriptionResp as any).lms).toHaveProperty("price");
          expect((userPaymentSubscriptionResp as any).lms).toHaveProperty("remainingDays");
          expect((userPaymentSubscriptionResp as any).lms).toHaveProperty("planId");
          expect((userPaymentSubscriptionResp as any).lms).toHaveProperty("currentPlan");
        });
      },
    );
  },
);
