import { test, expect } from "src/fixtures";
import { AdminPortalService } from "src/api/services/admin-portal.services";
import { DataFactory, CustomerBuilder } from "src/data-factory";
import { TestDataProvider } from "src/test-data";
import { ProductInfo } from "src/objects/iproduct";
import { plans } from "src/constant/static-data";
import delay from "src/utilities/delay";
import { CustomerInfo, Partner } from "src/objects";

test.describe(
  "Partner management",
  {
    tag: ["@API", "@Partner Portal", "@Business", "@Invite", "@regression_API"],
  },
  () => {
    test(
      "TC63: API- POST /Partner/Manage/Partner/Business: Return 200-OK and correct Response",
      {
        tag: ["@TC63", "@API", "@Partner Portal", "@Business", "@Create Business"],
      },
      async ({ apiClient, authenticationService, adminPortalService, partnerPortalService }) => {
        //***************Pre-requisites: Prepare data for the test*******************************//
        let departmentID: string = "";
        let productTypesAndNamesToSend: ProductInfo[] = new Array<ProductInfo>();
        let masterPlanId: string = "";
        const adminService = await AdminPortalService.create(apiClient, authenticationService);
        const testData = new TestDataProvider(adminPortalService);
        //Choose a plan = "50 - 100 Employees"
        const paymentProductName: string = plans[1];
        await test.step("Pre-condition: Prepare data for the test: DepartmentID,masterPlan from ProductName = 50 - 100 Employees", async () => {
          //Create department id to send
          departmentID = await testData.getDepartmentId(process.env.DEPARTMENT_NAME);

          //Get all product types of a department (departmentID):
          // It is required for scenario Bank Transfer is True
          productTypesAndNamesToSend = await testData.getProductTypesBasedDepartmentId(departmentID);

          const masterPlan: any = await testData.filterMasterPlanBasedName(departmentID, paymentProductName);

          masterPlanId = masterPlan.masterPlanId;
        });

        //Create partner info using PartnerBuilder
        const partnerInfo = await test.step("Pre-condition: Create partner info using PartnerBuilder", async () => {
          return await DataFactory.partnerBuilder()
            .withIsPublic(true)
            .withWhoPay(0)
            .withBankTransfer(true)
            .withDepartment(departmentID)
            .withFilterProductTypes(productTypesAndNamesToSend)
            .withPlanId(masterPlanId)
            .build();
        });

        let customerWithMember = await test.step("Pre-condition: Generate member data for invite payload", async () => {
          return await new CustomerBuilder().forMemberPortal().build();
        });

        const partnerId = await test.step("Steps: Create partner", async () => {
          return await adminService.createPartner(partnerInfo);
        });

        const partnerToken = await test.step("Steps: Get auth token from Partner", async () => {
          delay(30000);
          const tempPassword = "TempPass@" + Date.now().toString().slice(-4);

          const email = partnerInfo.accountInfo?.email!;

          const resetPassResp = await authenticationService.resetPasswordWithoutToken({ username: email, password: tempPassword }, undefined, "5");

          await authenticationService.confirmEmailWithoutToken(
            email,
            undefined,
            "5", //Partner Portal
          );

          //API Step: Get auth token from Partner
          return await authenticationService.getAuthToken(
            email,
            tempPassword,
            "5", //Partner Portal
          );
        });

        //*************End of Pre-condition **************** //
        await test.step("Steps: Create business", async () => {
          //API Step: Get partner payment products list
          const partnerPlansList = await partnerPortalService.getPartnerPlansList(partnerToken);

          const planItem = await testData.filterPartnerPlanBasedName(partnerPlansList, paymentProductName);

          //*************API Step: Create business

          const business = await partnerPortalService.createBusiness(partnerId, customerWithMember.company.companyName!, planItem.id, undefined, undefined, partnerToken);
          expect(business).toBeDefined();
          expect(typeof business).toBe("boolean");
          expect(business).toBe(true);
        });
        //API Step: Get business list
        await test.step("Steps: Get business list", async () => {
          const businessList = await partnerPortalService.getBusinessList(partnerToken);

          expect(businessList).toBeDefined();
          expect(typeof businessList).toBe("object");
          expect(businessList.entities).toBeDefined();
          expect(typeof businessList.entities).toBe("object");
          expect(businessList.entities.length).toBeGreaterThan(0);
          expect(businessList.entities[0].id).toBeDefined();
          expect(typeof businessList.entities[0].id).toBe("string");
        });
      },
    );

    test(
      "TC64: API- POST /Partner/Manage/Partner/Business with added members: Return 200-OK and correct Response",
      {
        tag: ["@TC64", "@API", "@Partner Portal", "@Business", "@Members"],
      },
      async ({ apiClient, authenticationService, adminPortalService, partnerPortalService, onboardingFlow }) => {
        //***************Pre-requisites: Prepare data for the test*******************************//
        const adminService = await AdminPortalService.create(apiClient, authenticationService);
        const testData = new TestDataProvider(adminPortalService);
        //Choose a plan = "50 - 100 Employees"
        const paymentProductName: string = plans[1];

        let preConditionData = await test.step("Pre-condition: Prepare data for the test", async () => {
          //Create department id to send
          let departmentID = await testData.getDepartmentId(process.env.DEPARTMENT_NAME);

          //Get all product types of a department (departmentID):
          // It is required for scenario Bank Transfer is True
          const productTypesAndNamesToSend: ProductInfo[] = await testData.getProductTypesBasedDepartmentId(departmentID);

          const masterPlan: any = await testData.filterMasterPlanBasedName(departmentID, paymentProductName);

          const masterPlanId = masterPlan.masterPlanId;

          return {
            departmentID,
            productTypesAndNamesToSend,
            masterPlanId,
          };
        });
        //Create partner info using PartnerBuilder
        const partnerInfo = await test.step("Pre-condition: Create partner info using PartnerBuilder", async () => {
          return await DataFactory.partnerBuilder()
            .withIsPublic(true)
            .withWhoPay(0)
            .withBankTransfer(true)
            .withDepartment(preConditionData.departmentID)
            .withFilterProductTypes(preConditionData.productTypesAndNamesToSend)
            .withPlanId(preConditionData.masterPlanId)
            .build();
        });

        let customerWithMember = await test.step("Pre-condition: Generate member data for invite payload", async () => {
          // Generate member data for invite payload
          return await new CustomerBuilder()
            .forMemberPortal()
            .withMember({ role: 3 }) // User role
            .build();
        });

        //*************Pre-condition ****************  //
        //*********API Step: Create partner
        const partnerId = await test.step("CALL API -> create partner", async () => {
          return await adminService.createPartner(partnerInfo);

          delay(30000);
        });

        const partnerToken = await test.step("CALL API -> get auth token from Partner", async () => {
          const tempPassword = "Password@123";

          const email = partnerInfo.accountInfo?.email!;

          await authenticationService.resetPasswordWithoutToken({ username: email, password: tempPassword }, undefined, "5");

          const confirmEmailResponse = await authenticationService.confirmEmailWithoutToken(
            email,
            undefined,
            "5", //Partner Portal
          );

          expect(confirmEmailResponse).toBe(true);

          //API Step: Get auth token from Partner
          return await authenticationService.getAuthToken(
            email,
            tempPassword,
            "5", //Partner Portal
          );
        });

        const invitedEmail = customerWithMember.members[0].email;

        //await onboardingFlow.acceptInvitation(invitedEmail);
        const { partnerPlansList, planItem } = await test.step("Pre-condition: Get partner plans list and resolve plan item", async () => {
          const partnerPlansList = await partnerPortalService.getPartnerPlansList(partnerToken);

          const planItem = await testData.filterPartnerPlanBasedName(partnerPlansList, paymentProductName);

          return { partnerPlansList, planItem };
        });

        //*************End of Pre-condition **************** //

        //*************API Step: Create business
        await test.step("Verified CALL API -> create business is successful", async () => {
          const business = await partnerPortalService.createBusiness(partnerId, customerWithMember.company.companyName!, planItem.id, undefined, customerWithMember.members, partnerToken);
          expect(business).toBeDefined();
          expect(typeof business).toBe("boolean");
          expect(business).toBe(true);
        });

        const businessList = await test.step("Verified CALL API -> get business list is successful", async () => {
          return await partnerPortalService.getBusinessList(partnerToken);
        });

        await test.step("Verified business list is correct", async () => {
          //Verify businessList
          expect(businessList).toBeDefined();
          expect(typeof businessList).toBe("object");
          expect(businessList.entities).toBeDefined();
          expect(typeof businessList.entities).toBe("object");
          expect(businessList.entities.length).toBeGreaterThan(0);
          expect(businessList.entities[0].id).toBeDefined();
          expect(typeof businessList.entities[0].id).toBe("string");
        });

        await test.step("Verified CALL API -> get team members list reflects invited members", async () => {
          const teamMembersList = await partnerPortalService.getTeamMembersList(businessList.entities[0].id, partnerToken);
          expect(teamMembersList).toBeDefined();
          expect(typeof teamMembersList).toBe("object");
          expect(teamMembersList.total).toBeDefined();
          expect(typeof teamMembersList.total).toBe("number");
          expect(teamMembersList.total).toEqual(customerWithMember.members.length + 1); // +1 for the partner who created the business
          expect(teamMembersList.entities).toBeDefined();
          expect(typeof teamMembersList.entities).toBe("object");
          expect(teamMembersList.entities[1].email).toBeDefined();
          expect(typeof teamMembersList.entities[1].email).toBe("string");
          expect(teamMembersList.entities[1].email).toBe(customerWithMember.members[0].email);
        });
      },
    );

    test(
      "TC65: API- POST Partner/Manage/Partner/Business/Invite: Return 200-OK and correct Response",
      {
        tag: ["@TC65", "@API", "@Partner Portal", "@Business", "@Invite"],
      },
      async ({ apiClient, authenticationService, adminPortalService, partnerPortalService }) => {
        //***************Pre-requisites: Prepare data for the test*******************************//

        const adminService = await AdminPortalService.create(apiClient, authenticationService);
        const testData = new TestDataProvider(adminPortalService);

        const paymentProductName: string = plans[1];

        const preConditionData = await test.step("Pre-condition: Prepare department, products, and master plan", async () => {
          const departmentID = await testData.getDepartmentId(process.env.DEPARTMENT_NAME);

          const productTypesAndNamesToSend: ProductInfo[] = await testData.getProductTypesBasedDepartmentId(departmentID);

          const masterPlan: any = await testData.filterMasterPlanBasedName(departmentID, paymentProductName);

          return {
            departmentID,
            productTypesAndNamesToSend,
            masterPlanId: masterPlan.masterPlanId,
          };
        });

        const partnerInfo = await test.step("Pre-condition: Create partner info using PartnerBuilder", async () => {
          return await DataFactory.partnerBuilder()
            .withIsPublic(true)
            .withWhoPay(0)
            .withBankTransfer(true)
            .withDepartment(preConditionData.departmentID)
            .withFilterProductTypes(preConditionData.productTypesAndNamesToSend)
            .withPlanId(preConditionData.masterPlanId)
            .build();
        });

        const customerWithMember = await test.step("Pre-condition: Generate member data for invite payload", async () => {
          return await new CustomerBuilder()
            .forMemberPortal()
            .withMember({ role: 3 }) // User role
            .build();
        });

        const partnerResponse = await test.step("Steps: Create partner", async () => {
          return await adminService.createPartner(partnerInfo);
        });

        const partnerToken = await test.step("Steps: Activate partner account and get auth token", async () => {
          delay(30000);

          const tempPassword = "Password@123";
          const email = partnerInfo.accountInfo?.email!;

          await authenticationService.resetPasswordWithoutToken({ username: email, password: tempPassword }, undefined, "5");

          await authenticationService.confirmEmailWithoutToken(
            email,
            undefined,
            "5", //Partner Portal
          );

          return await authenticationService.getAuthToken(
            email,
            tempPassword,
            "5", //Partner Portal
          );
        });

        const { planItem } = await test.step("Pre-condition: Get partner plans list and resolve plan item", async () => {
          const partnerPlansList = await partnerPortalService.getPartnerPlansList(partnerToken);
          const planItem = await testData.filterPartnerPlanBasedName(partnerPlansList, paymentProductName);
          return { planItem };
        });

        await test.step("Steps: Create business", async () => {
          await partnerPortalService.createBusiness(partnerResponse, customerWithMember.company.companyName!, planItem.id, undefined, undefined, partnerToken);
        });

        const businessList = await test.step("Steps: Get business list", async () => {
          return await partnerPortalService.getBusinessList(partnerToken);
        });

        const businessId = businessList.entities[0].id;

        await test.step("Steps: Invite members to business", async () => {
          const inviteMemberResponse = await partnerPortalService.inviteMember(businessId, customerWithMember.members, partnerToken);
          expect(inviteMemberResponse).toBeDefined();
          expect(typeof inviteMemberResponse).toBe("boolean");
          expect(inviteMemberResponse).toBe(true);
        });

        await test.step("Verified CALL API -> get team members list reflects invited members", async () => {
          const teamMembersList = await partnerPortalService.getTeamMembersList(businessList.entities[0].id, partnerToken);
          expect(teamMembersList).toBeDefined();
          expect(typeof teamMembersList).toBe("object");
          expect(teamMembersList.total).toBeDefined();
          expect(typeof teamMembersList.total).toBe("number");
          expect(teamMembersList.total).toEqual(customerWithMember.members.length + 1); // +1 for the partner who created the business
          expect(teamMembersList.entities).toBeDefined();
          expect(typeof teamMembersList.entities).toBe("object");
          expect(teamMembersList.entities[1].email).toBeDefined();
          expect(typeof teamMembersList.entities[1].email).toBe("string");
          expect(teamMembersList.entities[1].email).toBe(customerWithMember.members[0].email);
        });
      },
    );

    test(
      "TC67: API- POST /Partner/Manage/Partner/Business with WhoPay=1 (Customer): 1st invited Member = Owner",
      {
        tag: ["@TC67", "@API", "@Partner Portal", "@Business", "@WhoPay", "@Owner"],
      },
      async ({ apiClient, authenticationService, adminPortalService, partnerPortalService }, testInfo) => {
        testInfo.skip(true, "FAILED: BUG: invite member for Customer under Partner with Payment Options = Member Portal Consumer");
        //***************Pre-requisites: Prepare data for the test*******************************//

        const adminService = await AdminPortalService.create(apiClient, authenticationService);
        const testData = new TestDataProvider(adminPortalService);

        const paymentProductName: string = plans[1];

        const preConditionData = await test.step("Pre-condition: Prepare department, products, and master plan", async () => {
          const departmentID = await testData.getDepartmentId(process.env.DEPARTMENT_NAME);

          const productTypesAndNamesToSend: ProductInfo[] = await testData.getProductTypesBasedDepartmentId(departmentID);

          const masterPlan: any = await testData.filterMasterPlanBasedName(departmentID, paymentProductName);

          return {
            departmentID,
            productTypesAndNamesToSend,
            masterPlanId: masterPlan.masterPlanId,
          };
        });

        const partnerInfo = await test.step("Pre-condition: Create partner info using PartnerBuilder (WhoPay=Customer)", async () => {
          return await DataFactory.partnerBuilder()
            .withIsPublic(true)
            .withWhoPay(1) // Customer
            .withBankTransfer(true)
            .withDepartment(preConditionData.departmentID)
            .withFilterProductTypes(preConditionData.productTypesAndNamesToSend)
            .withPlanId(preConditionData.masterPlanId)
            .build();
        });

        const customerWithMember = await test.step("Pre-condition: Generate member data for invite payload", async () => {
          return await DataFactory.customerBuilder()
            .forMemberPortal()
            .withMember({ role: 3 }) // User role
            .build();
        });

        const partnerResponse = await test.step("Steps: Create partner", async () => {
          return await adminService.createPartner(partnerInfo);
        });

        delay(30000);

        if (partnerResponse) {
          const partnerToken = await test.step("Steps: Activate partner account and get auth token", async () => {
            const tempPassword = "TempPass@" + Date.now().toString().slice(-4);
            const email = partnerInfo.accountInfo?.email!;

            await authenticationService.resetPasswordWithoutToken({ username: email, password: tempPassword }, undefined, "5");

            const confirmEmailResponse = await authenticationService.confirmEmailWithoutToken(
              email,
              undefined,
              "5", //Partner Portal
            );

            if (!confirmEmailResponse) {
              throw new Error("Failed to confirm email");
            }
            expect(confirmEmailResponse).toBe(true);

            return await authenticationService.getAuthToken(
              email,
              tempPassword,
              "5", //Partner Portal
            );
          });

          const { planItem } = await test.step("Pre-condition: Get partner plans list and resolve plan item", async () => {
            const partnerPlansList = await partnerPortalService.getPartnerPlansList(partnerToken);
            const planItem = await testData.filterPartnerPlanBasedName(partnerPlansList, paymentProductName);
            return { planItem };
          });

          await test.step("Steps: Create business with invited members", async () => {
            const business = await partnerPortalService.createBusiness(partnerResponse, customerWithMember.company.companyName!, planItem.id, undefined, customerWithMember.members, partnerToken);
            expect(business).toBeDefined();
            expect(typeof business).toBe("boolean");
            expect(business).toBe(true);
          });

          const businessList = await test.step("Steps: Get business list", async () => {
            return await partnerPortalService.getBusinessList(partnerToken);
          });

          await test.step("Verified business list response", async () => {
            expect(businessList).toBeDefined();
            expect(typeof businessList).toBe("object");
            expect(businessList.entities).toBeDefined();
            expect(typeof businessList.entities).toBe("object");
            expect(businessList.entities.length).toBeGreaterThan(0);
            expect(businessList.entities[0].id).toBeDefined();
            expect(typeof businessList.entities[0].id).toBe("string");
          });

          await test.step("Verified team members list (first invited member is owner)", async () => {
            const teamMembersList = await partnerPortalService.getTeamMembersList(businessList.entities[0].id, partnerToken);
            expect(teamMembersList).toBeDefined();
            expect(typeof teamMembersList).toBe("object");
            expect(teamMembersList.total).toBeDefined();
            expect(typeof teamMembersList.total).toBe("number");
            expect(teamMembersList.total).toEqual(customerWithMember.members.length);
            expect(teamMembersList.entities).toBeDefined();
            expect(typeof teamMembersList.entities).toBe("object");
            expect(teamMembersList.entities[0].email).toBeDefined();
            expect(typeof teamMembersList.entities[0].email).toBe("string");
            expect(teamMembersList.entities[0].email).toBe(customerWithMember.members[0].email);
          });
        }
      },
    );
  },
);
