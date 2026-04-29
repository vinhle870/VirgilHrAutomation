import { test, expect } from "src/fixtures";
import { AdminPortalService } from "src/api/services/admin-portal.services";
import { DataFactory } from "src/data-factory";
import { I500EmployeesPlan } from "src/objects/i500EmployeesPlan";
import { PlatinumPlan } from "src/data-factory/platinum-data-generator";
import { TestDataProvider } from "src/test-data";
import { CustomerInfo } from "src/objects";
import { plans } from "src/constant/static-data";
import { DataGenerate } from "src/utilities";

test.describe(
  "Partner management",
  {
    tag: [
      "@API",
      "@Admin Portal",
      "@Customer Management",
      "@Invite Members",
    ],
  },
  () => {
    test("TC56 Verify that the admin can invite members to a team in the Admin Portal - Customer Management.",
      {
        tag: [
          "@TC56",
          "@API",
          "@Admin Portal",
          "@Customer Management",
          "@Invite Members",
          "@Boarding",
        ],
      },
      async ({
        apiClient,
        authenticationService,
        adminPortalService,
        onboardingFlow,
        memberPortalService,
        tempEmailFreePage,
      }) => {
        const tempPassword = "Password@123";
        let planName = plans[4];
        let consumerData: CustomerInfo;
        let searchedCustomer: Awaited<
          ReturnType<typeof adminPortalService.searchCustomerByEmail>
        >;
        let teamId: string | undefined;
        let memberData: CustomerInfo[];
        let departmentID: string;

        await test.step(
          "Pre-condition: Ensure customer exists with Platinum plan and resolve team",
          async () => {
            const adminService = await AdminPortalService.create(
              apiClient,
              authenticationService,
            );
            const testData = new TestDataProvider(adminPortalService);

            departmentID = await testData.getDepartmentId(
              process.env.DEPARTMENT_NAME,
            );

            const customerDataName = await DataGenerate.generateCompanyName();
            const customerDataEmail = await DataGenerate.generateEmail();

            consumerData = await DataFactory.customerBuilder()
              .forAdminPortal()
              .withEmail(customerDataEmail)
              .withCompanyName(customerDataName)
              .withDepartment(departmentID)
              .withMembers(1)
              .build();

            searchedCustomer =
              await adminPortalService.searchCustomerByEmail(customerDataEmail);

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

            teamId = searchedCustomer?.entities?.[0]?.consumers?.teamIds?.[0];

            memberData = await Promise.all(
              consumerData.members.map((m) =>
                DataFactory.customerBuilder()
                  .forMemberPortal()
                  .withCompanyName(consumerData.company.companyName!)
                  .withDepartment(departmentID)
                  .withEmail(m.email)
                  .build(),
              ),
            );
          },
        );

        await test.step("Admin Portal: Invite team members", async () => {
          expect(teamId).toBeDefined();
          const inviteResponse = await adminPortalService.inviteTeamMember(
            teamId as string,
            consumerData.members,
          );

          expect(inviteResponse).toBe(true);
        });

        await test.step(
          "Onboarding: Accept invitation and verify GET Payment/subscription/me",
          async () => {
            for (let i = 0; i < memberData.length; i++) {
              const email = consumerData.members[i].email;

              const username = email.split("@")[0];

              await onboardingFlow.acceptInvitation(tempEmailFreePage, username);

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
              expect((paymentSubscriptionResp as any).main).toHaveProperty("contractEndDate",);
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
          },
        );
      });

    test("Support Manual testing LML feature with large customer >500 - Invite members from a customer with plan of 500+ in member portal",
      {
        tag: [
          "@TC500+",
          "@API",
          "@Admin Portal",
          "@Customer Management",
          "@Invite Members",
          "@Boarding",
          "@500+ Plan",
        ],
      },
      async ({
        apiClient,
        authenticationService,
        adminPortalService,
        memberPortalService,
        onboardingFlow,
        tempEmailFreePage,
      }) => {
        const tempPassword = "Password@123";
        const customerDataName = "vinhle32006";
        const customerDataEmail = "vinhle32006@yopmail.com";

        let email = customerDataEmail;
        let consumerData: CustomerInfo;
        let planName = plans[4];
        let searchedCustomer: Awaited<
          ReturnType<typeof adminPortalService.searchCustomerByEmail>
        >;
        let memberToken: string;

        await test.step(
          "Pre-condition: Ensure 500+ customer exists and obtain owner token",
          async () => {
            const adminService = await AdminPortalService.create(
              apiClient,
              authenticationService,
            );

            const testData = new TestDataProvider(adminPortalService);

            const departmentID = await testData.getDepartmentId(
              process.env.DEPARTMENT_NAME,
            );

            consumerData = await DataFactory.customerBuilder()
              .forAdminPortal()
              .withEmail(customerDataEmail)
              .withCompanyName(customerDataName)
              .withDepartment(departmentID)
              .withMembers(1)
              .build();

            searchedCustomer =
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
            memberToken = await authenticationService.getAuthToken(
              email,
              tempPassword,
              "4",
            );
          },
        );

        await test.step(
          "Member Portal: Invite team members from owner customer",
          async () => {
            const inviteResponse =
              await memberPortalService.inviteTeamMemberFromAnOwnerCustomer(
                memberToken,
                consumerData.members,
              );

            expect(inviteResponse).toBe(true);
          },
        );

        await test.step(
          "Onboarding: Accept invitation and verify GET Payment/subscription/me",
          async () => {
            for (let i = 0; i < consumerData.members.length; i++) {
              const email = consumerData.members[i].email;

              const username = email.split("@")[0];

              await onboardingFlow.acceptInvitation(tempEmailFreePage, username);

              const invitedMember = await authenticationService.getAuthToken(
                consumerData.members[i].email,
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
          },
        );
      });

    test("TC60 Verify that after confirming the password, the user is added as a team member with the role assigned during the invitation.",
      {
        tag: [
          "@TC60",
          "@API",
          "@Admin Portal",
          "@Customer Management",
          "@Invite Members",
          "@Boarding",
        ],
      },
      async ({
        apiClient,
        authenticationService,
        adminPortalService,
        memberPortalService,
        onboardingFlow,
        tempEmailFreePage,
      }) => {
        const tempPassword = "Password@123";
        const customerDataName = "testingvinhlevinhle32006";
        const customerDataEmail = "testingvinhle32006@polandcampus.edu.pl";

        let email = customerDataEmail;
        let consumerData: CustomerInfo;
        let planName = plans[4];
        let searchedCustomer: Awaited<
          ReturnType<typeof adminPortalService.searchCustomerByEmail>
        >;
        let consumerId: string;
        let memberToken: string;

        await test.step(
          "Pre-condition: Ensure customer exists, resolve consumer id, assign invite roles, obtain owner token",
          async () => {
            const adminService = await AdminPortalService.create(
              apiClient,
              authenticationService,
            );

            const testData = new TestDataProvider(adminPortalService);

            const departmentID = await testData.getDepartmentId(
              process.env.DEPARTMENT_NAME,
            );

            consumerData = await DataFactory.customerBuilder()
              .forAdminPortal()
              .withEmail(customerDataEmail)
              .withCompanyName(customerDataName)
              .withDepartment(departmentID)
              .withMembers(1)
              .build();

            searchedCustomer =
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

              searchedCustomer =
                await adminPortalService.searchCustomerByEmail(customerDataEmail);
            }

            consumerId = searchedCustomer.entities[0].consumerObjectId;

            memberToken = await authenticationService.getAuthToken(
              email,
              tempPassword,
              "4",
            );

            for (let i = 0; i < consumerData.members.length; i++) {
              if (i === 0) consumerData.members[i].role = 1;
              else if (i === 1) consumerData.members[i].role = 2;
              else consumerData.members[i].role = 3;
            }
          },
        );

        await test.step(
          "Member Portal: Invite team members with assigned roles",
          async () => {
            const inviteResponse =
              await memberPortalService.inviteTeamMemberFromAnOwnerCustomer(
                memberToken,
                consumerData.members,
              );

            expect(inviteResponse).toBe(true);
          },
        );

        await test.step(
          "Verify: Accept invitation and assert member roles via Admin Portal",
          async () => {
            const customerInfo = await adminPortalService.getCustomer(consumerId);

            for (let i = 0; i < consumerData.members.length; i++) {
              const memberEmail = consumerData.members[i].email;

              const username = memberEmail.split("@")[0];

              await onboardingFlow.acceptInvitation(tempEmailFreePage, username);

              const member = await adminPortalService.getMemberInfo(
                customerInfo,
                memberEmail,
              );

              expect(member.role).toBe(i + 1);
            }
          },
        );
      });
  });
