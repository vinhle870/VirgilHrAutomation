import { test, expect } from "src/fixtures";
import { AdminPortalService } from "src/api/services/admin-portal.services";
import { InviteMemberPayload } from "src/api/services/member-portal.services";
import { DataFactory, CustomerBuilder } from "src/data-factory";
import { TestDataProvider } from "src/test-data";
import { ProductInfo } from "src/objects/iproduct";
import { DataGenerate } from "src/utilities";
import { plans } from "src/constant/static-data";

test.describe("Partner management", () => {
  test("TC63: API- POST /Partner/Manage/Partner/Business: Return 200-OK and correct Response", async ({
    apiClient,
    authenticationService,
    adminPortalService,
    partnerPortalService,
    memberPortalService,
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
    let departmentID = await testData.getDepartmentId("BiginHR");

    //Choose a plan = "50 - 100 Employees"
    const paymentProductName: string = plans[1];

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
    const customerWithMember = await new CustomerBuilder()
      .forMemberPortal()
      .build();

    //*************Pre-condition ****************  //
    //*********API Step: Create partner
    const partnerResponse = await adminService.createPartner(partnerInfo);

    if (partnerResponse) {
      const tempPassword = "TempPass@" + Date.now().toString().slice(-4);

      const email = partnerInfo.accountInfo?.email!;

      const resetPartner =
        await authenticationService.resetPasswordWithoutToken(
          { username: email, password: tempPassword },
          undefined,
          "5",
        );

      if (resetPartner) {
        await authenticationService.confirmEmailWithoutToken(
          email,
          undefined,
          "5", //Partner Portal
        );

        //API Step: Get auth token from Partner
        const partnerToken = await authenticationService.getAuthToken(
          email,
          tempPassword,
          "5", //Partner Portal
        );

        //API Step: Get partner payment products list
        const partnerPlansList =
          await partnerPortalService.getPartnerPlansList(partnerToken);

        const planItem = await testData.filterPartnerPlanBasedName(
          partnerPlansList,
          paymentProductName,
        );

        //*************End of Pre-condition **************** //

        //*************API Step: Create business

        const business = await partnerPortalService.createBusiness(
          partnerResponse,
          customerWithMember.company.companyName!,
          planItem.id,
          undefined,
          undefined,
          partnerToken,
        );
        expect(business).toBeDefined();
        expect(typeof business).toBe("boolean");
        expect(business).toBe(true);

        //API Step: Get business list
        const businessList =
          await partnerPortalService.getBusinessList(partnerToken);

        expect(businessList).toBeDefined();
        expect(typeof businessList).toBe("object");
        expect(businessList.entities).toBeDefined();
        expect(typeof businessList.entities).toBe("array");
        expect(businessList.entities.length).toBeGreaterThan(0);
        expect(businessList.entities[0].id).toBeDefined();
        expect(typeof businessList.entities[0].id).toBe("string");
      }
    }
  });

  test("TC64: API- POST /Partner/Manage/Partner/Business with added members: Return 200-OK and correct Response", async ({
    apiClient,
    authenticationService,
    adminPortalService,
    partnerPortalService,
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
    let departmentID = await testData.getDepartmentId("BiginHR");

    //Choose a plan = "50 - 100 Employees"
    const paymentProductName: string = plans[1];

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
    const customerWithMember = await new CustomerBuilder()
      .forMemberPortal()
      .withMember({ role: 3 }) // User role
      .build();

    //*************Pre-condition ****************  //
    //*********API Step: Create partner
    const partnerResponse = await adminService.createPartner(partnerInfo);

    if (partnerResponse) {
      const tempPassword = "TempPass@" + Date.now().toString().slice(-4);

      const email = partnerInfo.accountInfo?.email!;

      const resetPartner =
        await authenticationService.resetPasswordWithoutToken(
          { username: email, password: tempPassword },
          undefined,
          "5",
        );

      if (resetPartner) {
        const confirmEmailResponse =
          await authenticationService.confirmEmailWithoutToken(
            email,
            undefined,
            "5", //Partner Portal
          );

        if (!confirmEmailResponse) {
          throw new Error("Failed to confirm email");
        }
        expect(confirmEmailResponse).toBe(true);

        //API Step: Get auth token from Partner
        const partnerToken = await authenticationService.getAuthToken(
          email,
          tempPassword,
          "5", //Partner Portal
        );

        //API Step: Get partner payment products list
        const partnerPlansList =
          await partnerPortalService.getPartnerPlansList(partnerToken);
        const planItem = await testData.filterPartnerPlanBasedName(
          partnerPlansList,
          paymentProductName,
        );

        //*************End of Pre-condition **************** //

        //*************API Step: Create business

        const business = await partnerPortalService.createBusiness(
          partnerResponse,
          customerWithMember.company.companyName!,
          planItem.id,
          undefined,
          customerWithMember.members,
          partnerToken,
        );
        expect(business).toBeDefined();
        expect(typeof business).toBe("boolean");
        expect(business).toBe(true);

        //API Step: Get business list
        const businessList =
          await partnerPortalService.getBusinessList(partnerToken);

        expect(businessList).toBeDefined();
        expect(typeof businessList).toBe("object");
        expect(businessList.entities).toBeDefined();
        expect(typeof businessList.entities).toBe("object");
        expect(businessList.entities.length).toBeGreaterThan(0);
        expect(businessList.entities[0].id).toBeDefined();
        expect(typeof businessList.entities[0].id).toBe("string");

        //API Step: Get team members list
        const teamMembersList = await partnerPortalService.getTeamMembersList(
          businessList.entities[0].id,
          partnerToken,
        );
        expect(teamMembersList).toBeDefined();
        expect(typeof teamMembersList).toBe("object");
        expect(teamMembersList.total).toBeDefined();
        expect(typeof teamMembersList.total).toBe("number");
        expect(teamMembersList.total).toEqual(
          customerWithMember.members.length + 1,
        ); // +1 for the partner who created the business
        expect(teamMembersList.entities).toBeDefined();
        expect(typeof teamMembersList.entities).toBe("object");
        expect(teamMembersList.entities[1].email).toBeDefined();
        expect(typeof teamMembersList.entities[1].email).toBe("string");
        expect(teamMembersList.entities[1].email).toBe(
          customerWithMember.members[0].email,
        );
      }
    }
  });

  test("TC65: API- POST Partner/Manage/Partner/Business/Invite: Return 200-OK and correct Response", async ({
    apiClient,
    authenticationService,
    adminPortalService,
    partnerPortalService,
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
    let departmentID = await testData.getDepartmentId("BiginHR");

    //Choose a plan = "50 - 100 Employees"
    const paymentProductName: string = plans[1];

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
    const customerWithMember = await new CustomerBuilder()
      .forMemberPortal()
      .withMember({ role: 3 }) // User role
      .build();

    //*************Pre-condition ****************  //
    //*********API Step: Create partner
    const partnerResponse = await adminService.createPartner(partnerInfo);

    if (partnerResponse) {
      const tempPassword = "TempPass@" + Date.now().toString().slice(-4);

      const email = partnerInfo.accountInfo?.email!;

      const resetPartner =
        await authenticationService.resetPasswordWithoutToken(
          { username: email, password: tempPassword },
          undefined,
          "5",
        );

      if (resetPartner) {
        await authenticationService.confirmEmailWithoutToken(
          email,
          undefined,
          "5", //Partner Portal
        );

        //API Step: Get auth token from Partner
        const partnerToken = await authenticationService.getAuthToken(
          email,
          tempPassword,
          "5", //Partner Portal
        );

        //API Step: Get partner payment products list
        const partnerPlansList =
          await partnerPortalService.getPartnerPlansList(partnerToken);
        const planItem = await testData.filterPartnerPlanBasedName(
          partnerPlansList,
          paymentProductName,
        );

        //*************API Step: Create business
        const business = await partnerPortalService.createBusiness(
          partnerResponse,
          customerWithMember.company.companyName!,
          planItem.id,
          undefined,
          undefined,
          partnerToken,
        );

        //API Step: Get business list
        const businessList =
          await partnerPortalService.getBusinessList(partnerToken);

        const businessId = businessList.entities[0].id;

        //*************End of Pre-condition **************** //

        //*************API Step: Invite members to a business
        const inviteMemberResponse = await partnerPortalService.inviteMember(
          businessId,
          customerWithMember.members,
          partnerToken,
        );
        expect(inviteMemberResponse).toBeDefined();
        expect(typeof inviteMemberResponse).toBe("boolean");
        expect(inviteMemberResponse).toBe(true);

        //API Step: Get team members list
        const teamMembersList = await partnerPortalService.getTeamMembersList(
          businessList.entities[0].id,
          partnerToken,
        );
        expect(teamMembersList).toBeDefined();
        expect(typeof teamMembersList).toBe("object");
        expect(teamMembersList.total).toBeDefined();
        expect(typeof teamMembersList.total).toBe("number");
        expect(teamMembersList.total).toEqual(
          customerWithMember.members.length + 1,
        ); // +1 for the partner who created the business
        expect(teamMembersList.entities).toBeDefined();
        expect(typeof teamMembersList.entities).toBe("object");
        expect(teamMembersList.entities[1].email).toBeDefined();
        expect(typeof teamMembersList.entities[1].email).toBe("string");
        expect(teamMembersList.entities[1].email).toBe(
          customerWithMember.members[0].email,
        );
      }
    }
  });

  test("TC67: API- POST /Partner/Manage/Partner/Business with WhoPay=1 (Customer): 1st invited Member = Owner", async ({
    apiClient,
    authenticationService,
    adminPortalService,
    partnerPortalService,
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
    let departmentID = await testData.getDepartmentId("BiginHR");

    //Choose a plan = "50 - 100 Employees"
    const paymentProductName: string = plans[1];

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
      .withWhoPay(1) // Customer
      .withBankTransfer(true)
      .withDepartment(departmentID)
      .withFilterProductTypes(productTypesAndNamesToSend)
      .withPlanId(masterPlanId)
      .build();

    // Generate member data for invite payload
    const customerWithMember = await new CustomerBuilder()
      .forMemberPortal()
      .withMember({ role: 3 }) // User role
      .build();

    //*************Pre-condition ****************  //
    //*********API Step: Create partner
    const partnerResponse = await adminService.createPartner(partnerInfo);

    if (partnerResponse) {
      const tempPassword = "TempPass@" + Date.now().toString().slice(-4);

      const email = partnerInfo.accountInfo?.email!;

      const resetPartner =
        await authenticationService.resetPasswordWithoutToken(
          { username: email, password: tempPassword },
          undefined,
          "5",
        );

      if (resetPartner) {
        const confirmEmailResponse =
          await authenticationService.confirmEmailWithoutToken(
            email,
            undefined,
            "5", //Partner Portal
          );

        if (!confirmEmailResponse) {
          throw new Error("Failed to confirm email");
        }
        expect(confirmEmailResponse).toBe(true);

        //API Step: Get auth token from Partner
        const partnerToken = await authenticationService.getAuthToken(
          email,
          tempPassword,
          "5", //Partner Portal
        );

        //API Step: Get partner payment products list
        const partnerPlansList =
          await partnerPortalService.getPartnerPlansList(partnerToken);
        const planItem = await testData.filterPartnerPlanBasedName(
          partnerPlansList,
          paymentProductName,
        );

        //*************End of Pre-condition **************** //

        //*************API Step: Create business

        const business = await partnerPortalService.createBusiness(
          partnerResponse,
          customerWithMember.company.companyName!,
          planItem.id,
          undefined,
          customerWithMember.members,
          partnerToken,
        );
        expect(business).toBeDefined();
        expect(typeof business).toBe("boolean");
        expect(business).toBe(true);

        //API Step: Get business list
        const businessList =
          await partnerPortalService.getBusinessList(partnerToken);

        expect(businessList).toBeDefined();
        expect(typeof businessList).toBe("object");
        expect(businessList.entities).toBeDefined();
        expect(typeof businessList.entities).toBe("object");
        expect(businessList.entities.length).toBeGreaterThan(0);
        expect(businessList.entities[0].id).toBeDefined();
        expect(typeof businessList.entities[0].id).toBe("string");

        //API Step: Get team members list
        const teamMembersList = await partnerPortalService.getTeamMembersList(
          businessList.entities[0].id,
          partnerToken,
        );
        expect(teamMembersList).toBeDefined();
        expect(typeof teamMembersList).toBe("object");
        expect(teamMembersList.total).toBeDefined();
        expect(typeof teamMembersList.total).toBe("number");
        expect(teamMembersList.total).toEqual(
          customerWithMember.members.length,
        ); // +1 for the partner who created the business
        expect(teamMembersList.entities).toBeDefined();
        expect(typeof teamMembersList.entities).toBe("object");
        expect(teamMembersList.entities[0].email).toBeDefined();
        expect(typeof teamMembersList.entities[0].email).toBe("string");
        expect(teamMembersList.entities[0].email).toBe(
          customerWithMember.members[0].email,
        );
      }
    }
  });
});
