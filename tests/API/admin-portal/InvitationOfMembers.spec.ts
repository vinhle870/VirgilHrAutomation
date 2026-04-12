import { test, expect } from "src/fixtures";
import { AdminPortalService } from "src/api/services/admin-portal.services";
import { CustomerBuilder, DataFactory } from "src/data-factory";
import { TestDataProvider } from "src/test-data";
import { ProductInfo } from "src/objects/iproduct";
import { plans } from "src/constant/static-data";
import delay from "src/utilities/delay";
import { Partner } from "src/objects";

test.describe(
  "Partner management",
  {
    tag: ["@API", "@Admin Portal", "@Invitation", "@Partner"],
  },
  () => {
    test("TC57 In the Admin Portal, the admin can invite members to a team from the Details page of any account.",
      {
        tag: [
          "@TC57",
          "@API",
          "@Admin Portal",
          "@Invitation",
          "@Partner",
          "@Boarding",
        ],
      },
      async ({
        apiClient,
        authenticationService,
        adminPortalService,
        partnerPortalService,
        onboardingFlow,
        memberPortalService,
        tempEmailFreePage,
      }) => {
        const paymentProductName: string = plans[0];
        const tempPassword = "Password@123";

        const adminService = await AdminPortalService.create(
          apiClient,
          authenticationService,
        );

        let partner: Awaited<ReturnType<typeof adminService.createPartner>>;
        let masterPlanId: string;
        let customerWithMember: Awaited<
          ReturnType<CustomerBuilder["build"]>
        >;
        let partnerInfo: Partner;
        let partnerEmail: string;
        let partnerToken: string;
        let businessId: string;
        let businessList: Awaited<
          ReturnType<typeof partnerPortalService.getBusinessList>
        >;

        await test.step(
          "Pre-condition: Genereate partner, activate account",
          async () => {
            const testData = new TestDataProvider(adminPortalService);

            const departmentID = await testData.getDepartmentId(
              process.env.DEPARTMENT_NAME,
            );

            const masterPlan: any = await testData.filterMasterPlanBasedName(
              departmentID,
              paymentProductName,
            );
            masterPlanId = masterPlan.masterPlanId;

            const productTypesAndNamesToSend: ProductInfo[] =
              await testData.getProductTypesBasedDepartmentId(departmentID);

            partnerInfo = await DataFactory.partnerBuilder()
              .withIsPublic(false)
              .withWhoPay(0)
              .withBankTransfer(true)
              .withFilterProductTypes(productTypesAndNamesToSend)
              .withDepartment(departmentID)
              .withPlanId(masterPlanId)
              .build();
          });

        await test.step(
          "Pre-condition: Call API /Manage/Organization/Partner -> Create partner and delay 30 seconds to wait for the partner to be created",
          async () => {
            partner = await adminService.createPartner(partnerInfo);
            delay(30000);
            partnerEmail = partnerInfo.accountInfo?.email!;

          })

        await test.step(
          "Pre-condition: CALL API /Partner/Manage/Partner/Business -> Add business with partner token",
          async () => {
            customerWithMember = await new CustomerBuilder().withMember().build();

            await authenticationService.resetPasswordWithoutToken(
              { username: partnerEmail, password: tempPassword },
              undefined,
              "5",
            );

            await authenticationService.confirmEmailWithoutToken(
              partnerEmail,
              undefined,
              "5",
            );

            partnerToken = await authenticationService.getAuthToken(
              partnerEmail,
              tempPassword,
              "5",
            );

            const business = await partnerPortalService.createBusiness(
              partner,
              "Team",
              masterPlanId,
              undefined,
              customerWithMember.members,
              partnerToken,
            );
            expect(business).toBeDefined();
          })

        await test.step("Call API /Partner/Manage/Partner/Business -> Verify created Business Data is available", async () => {
          businessList =
            await partnerPortalService.getBusinessList(partnerToken);

          businessId = businessList.entities[0].id;

          expect(businessId).toBeDefined();
          expect(typeof businessId).toBe("string");
        });

        await test.step(
          "Partner Portal: Invite member to business",
          async () => {
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
          },
        );

        await test.step(
          "Onboarding: Accept invitation and verify GET Payment/subscription/me", async () => {
            const invitedEmail = customerWithMember.members[0].email;

            const username = invitedEmail.split("@")[0];

            await onboardingFlow.acceptInvitation(tempEmailFreePage, username);

            const invitedMemberToken = await authenticationService.getAuthToken(
              invitedEmail,
              tempPassword,
              "4",
            );

            const paymentSubscriptionResp = await memberPortalService.getPaymentSubscription(invitedMemberToken);

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
      });

    test("TC62 Verify that an account can belong to one or multiple teams.",
      {
        tag: [
          "@TC62",
          "@API",
          "@Admin Portal",
          "@Invitation",
          "@Partner",
          "@Boarding",
        ],
      },
      async ({
        apiClient,
        authenticationService,
        adminPortalService,
        partnerPortalService,
        onboardingFlow,
        memberPortalService,
        tempEmailFreePage,
      }) => {
        const tempPassword = "Password@123";
        const paymentProductName: string = plans[0];

        const adminService = await AdminPortalService.create(
          apiClient,
          authenticationService,
        );

        let masterPlanId: string;
        let productTypesAndNamesToSend: ProductInfo[];
        let customerWithMember: Awaited<
          ReturnType<CustomerBuilder["build"]>
        >;
        let partnerInfo: Awaited<
          ReturnType<ReturnType<typeof DataFactory.partnerBuilder>["build"]>
        >;
        let partner: Awaited<ReturnType<typeof adminService.createPartner>>;
        let email: string;
        let partnerToken: string;

        await test.step(
          "Pre-condition: Create partner, invitee payload, activate partner, obtain token",
          async () => {
            const testData = new TestDataProvider(adminPortalService);

            const departmentID = await testData.getDepartmentId(
              process.env.DEPARTMENT_NAME,
            );

            const masterPlan: any = await testData.filterMasterPlanBasedName(
              departmentID,
              paymentProductName,
            );
            masterPlanId = masterPlan.masterPlanId;

            productTypesAndNamesToSend =
              await testData.getProductTypesBasedDepartmentId(departmentID);

            customerWithMember = await new CustomerBuilder().withMember().build();

            partnerInfo = await DataFactory.partnerBuilder()
              .withIsPublic(false)
              .withWhoPay(0)
              .withBankTransfer(true)
              .withDepartment(departmentID)
              .withFilterProductTypes(productTypesAndNamesToSend)
              .withPlanId(masterPlanId)
              .build();

            partner = await adminService.createPartner(partnerInfo);

            delay(20000);

            email = partnerInfo.accountInfo?.email ?? "";

            await authenticationService.resetPasswordWithoutToken(
              { username: email, password: tempPassword },
              undefined,
              "5",
            );

            await authenticationService.confirmEmailWithoutToken(
              email,
              undefined,
              "5",
            );

            partnerToken = await authenticationService.getAuthToken(
              email,
              tempPassword,
              "5",
            );
          },
        );

        await test.step(
          "For each team: create business, invite member, accept invitation, verify GET Payment/subscription/me",
          async () => {
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

              const username = invitedEmail.split("@")[0];

              await onboardingFlow.acceptInvitation(tempEmailFreePage, username);

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
                paymentProductName
              );
              expect((paymentSubscriptionResp as any).main).toHaveProperty(
                "productType"
              );
              expect((paymentSubscriptionResp as any).main).toHaveProperty("quantity");
              expect((paymentSubscriptionResp as any).main).toHaveProperty(
                "productType"
              );
              expect((paymentSubscriptionResp as any).main).toHaveProperty("price");
              expect((paymentSubscriptionResp as any).main).toHaveProperty("discount");
              expect((paymentSubscriptionResp as any).main).toHaveProperty("startDate");
              expect((paymentSubscriptionResp as any).main).toHaveProperty("endDate");
              expect((paymentSubscriptionResp as any).main).toHaveProperty(
                "contractStartDate"
              );
              expect((paymentSubscriptionResp as any).main).toHaveProperty(
                "contractEndDate"
              );
              expect((paymentSubscriptionResp as any).main).toHaveProperty(
                "remainingDays"
              );
              expect((paymentSubscriptionResp as any).main).toHaveProperty("planId");
              expect((paymentSubscriptionResp as any).main).toHaveProperty("isTrial");
              expect((paymentSubscriptionResp as any).main).toHaveProperty(
                "isCanceled"
              );
              expect((paymentSubscriptionResp as any).main).toHaveProperty(
                "isPaymentLate"
              );
              expect((paymentSubscriptionResp as any).main).toHaveProperty(
                "cancelAtPeriodEnd"
              );
              expect((paymentSubscriptionResp as any).main).toHaveProperty(
                "canceledBy"
              );
              expect((paymentSubscriptionResp as any).main).toHaveProperty(
                "canceledDate"
              );
              expect((paymentSubscriptionResp as any).main).toHaveProperty(
                "cancellationReason"
              );
              expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
                "name"
              );
              expect((paymentSubscriptionResp as any).handbookBuilder.name).toContain(
                paymentProductName
              );
              expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
                "productType"
              );
              expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
                "quantity"
              );
              expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
                "price"
              );
              expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
                "discount"
              );
              expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
                "startDate"
              );
              expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
                "endDate"
              );
              expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
                "contractStartDate"
              );
              expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
                "contractEndDate"
              );
              expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
                "remainingDays"
              );
              expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
                "isTrial"
              );
              expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
                "isCanceled"
              );
              expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
                "isPaymentLate"
              );
              expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
                "cancelAtPeriodEnd"
              );
              expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
                "canceledBy"
              );
              expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
                "canceledDate"
              );
              expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
                "cancellationReason"
              );
              expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
                "planId"
              );
              expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
                "currentPlan"
              );
              expect((paymentSubscriptionResp as any).handbookBuilder).toHaveProperty(
                "rootPlan"
              );
              expect((paymentSubscriptionResp as any).lms).toHaveProperty("name");
              expect((paymentSubscriptionResp as any).lms.name).toContain(
                paymentProductName,
              );
              expect((paymentSubscriptionResp as any).lms).toHaveProperty(
                "productType"
              );
              expect((paymentSubscriptionResp as any).lms).toHaveProperty("quantity");
              expect((paymentSubscriptionResp as any).lms).toHaveProperty("price");
              expect((paymentSubscriptionResp as any).lms).toHaveProperty(
                "remainingDays"
              );
              expect((paymentSubscriptionResp as any).lms).toHaveProperty("planId");
              expect((paymentSubscriptionResp as any).lms).toHaveProperty("currentPlan");
            }
          },
        );
      });
  });
