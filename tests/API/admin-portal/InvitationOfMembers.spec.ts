import { test, expect } from "src/fixtures";
import { AdminPortalService } from "src/api/services/admin-portal.services";
import { DataFactory } from "src/data-factory";
import { TestDataProvider } from "src/test-data";
import { ProductInfo } from "src/objects/iproduct";
import { DataGenerate } from "src/utilities";
import { PartnerFactory } from "src/data-factory/partner-factory";

test.describe("Partner managerment", () => {
  test("TC57 In the Admin Portal, the admin can invite members to a team from the Details page of any account.", async ({
    apiClient,
    authenticationService,
    adminPortalService,
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

    //Create department id to send
    let departmentID = await testData.getDepartmentId("BiginHR");

    //Get all product types of a department (departmentID)
    const productTypeAndNames: ProductInfo[] =
      await testData.getProductTypes(departmentID);
    const productTypesAndNamesToSend: ProductInfo[] =
      DataGenerate.generateProductType(productTypeAndNames);
    //Create partner info
    const partnerInfo = await DataFactory.partnerBuilder()
      .withIsPublic(true)
      .withWhoPay(0)
      .withBankTransfer(false)
      .withDepartment(departmentID)
      .build();
    //Create partner
    const partnerResponse = await adminService.createPartner(partnerInfo);

    if (partnerResponse.status == 200) {
      //create invited member infor
      const invitedMember = await DataGenerate.generateInvitedMember(
        partnerResponse.data,
        1,
      );
      //Call API to create a new member to a team
      const successfullyInvitedMember: boolean =
        await adminPortalService.inviteMembers(invitedMember);

      expect(successfullyInvitedMember).toBe(true);
    }
  });
  test("TC62 Verify that an account can belong to one or multiple teams.", async ({
    apiClient,
    authenticationService,
    adminPortalService,
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

      const paymentProductName: string = plans[1];

    const testData = new TestDataProvider(adminPortalService);

    //Create department id to send
    let departmentID = await testData.getDepartmentId("BiginHR");

    const masterPlan: any = await testData.filterMasterPlanBasedName(
      departmentID,
      paymentProductName,
    );
    const masterPlanId = masterPlan.masterPlanId;

    const productTypesAndNamesToSend: ProductInfo[] =
      await testData.getProductTypesBasedDepartmentId(departmentID);
    //Create partner info
    const partnerInfo = await DataFactory.partnerBuilder()
      .withIsPublic(true)
      .withWhoPay(0)
      .withBankTransfer(true)
      .withDepartment(departmentID)
      .withFilterProductTypes(productTypesAndNamesToSend)
      .withPlanId(masterPlanId)
      .build();
      //Create partner
      const partnerResponse = await adminService.createPartner(partnerInfo);
      if (partnerResponse.status == 200) {
        const invitedMember:
        //create invited member infor
        invitedMember.id = partnerResponse.data;
        //Call API to invite a new member to a team
        const successfullyInvitedMember: boolean =
          await adminPortalService.inviteMembers(invitedMember);

        expect(successfullyInvitedMember).toBe(true);
      }
    }
  });
});
