import { test, expect } from "src/fixtures";
import { AdminPortalService } from "src/api/services/admin-portal.services";
import { CustomerBuilder, DataFactory } from "src/data-factory";
import { AdminPortalDataProvider, TestDataProvider } from "src/test-data";
import { DataGenerate } from "src/utilities";
import { ProductInfo } from "src/objects/iproduct";
import Comparison from "src/utilities/compare";
import { plans } from "src/constant/static-data";
import { I500EmployeesPlan } from "src/objects/I500EmployeesPlan";
import { PlatinumPlan } from "src/data-factory/platinum-data-generator";
import { InviteMemberPayload, MemberPortalService } from "src/api/services";
import { UserInfo } from "src/objects";
import delay from "src/utilities/delay";

test.describe("Partner managerment", () => {
  test("TC56 Verify that the admin can invite members to a team in the Admin Portal – Customer Management.", async ({
    apiClient,
    authenticationService,
    adminPortalService,
    memberPortalService,
  }, testInfo) => {
    testInfo.skip(
      !process.env.API_BASE_URL && !process.env.BASE_URL,
      "API_BASE_URL is not configured",
    );
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");
    const partnerName = process.env.PARTNER_NAME;

    //Create adminservice
    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );

    const partnerInfo = await adminService.searchPartner(partnerName!);

    // Generate consumer payload with discovered IDs (if any)
    const consumerData = await DataFactory.customerBuilder()
      .forAdminPortal()
      .withDepartment(partnerInfo.departmentId!)
      .build();
    const customerAccountInfo = consumerData.accountInfo;

    const resp = await adminService.createCustomer(consumerData);

    expect(resp).toBeDefined();
    expect(typeof resp).toBe("object");
    expect(Object.keys(resp as any).length).toBeGreaterThan(0);
    expect(Object.keys(resp.id).length).toBeGreaterThan(0);
    expect(resp.email).toBe(customerAccountInfo.email);

    const plan: I500EmployeesPlan = PlatinumPlan.generatePlatinumPlan(
      resp.id,
      resp.email,
    );

    const upgradePlan = await adminPortalService.UpgradePlatinum(plan);

    expect(upgradePlan).toBe(true);

    const tempPassword = "Password@123";

    const testData = new TestDataProvider(adminPortalService);

    const teamID = await adminPortalService.getTeamIDsFromCustomerManagemt(
      resp.id,
    );

    const paymentProductName: string = plans[1];

    // Create department id to send
    const departmentID = await testData.getDepartmentId("BiginHR");

    const masterPlan: any = await testData.filterMasterPlanBasedName(
      departmentID,
      paymentProductName,
    );
    const masterPlanId = masterPlan.masterPlanId;

    const productTypesAndNamesToSend: ProductInfo[] =
      await testData.getProductTypesBasedDepartmentId(departmentID);
    //Invite 500+ employees
    for (let i = 0; i < 10; i++) {
      // Create partner info
      const partnerInfo = await DataFactory.partnerBuilder()
        .withIsPublic(true)
        .withWhoPay(0)
        .withBankTransfer(true)
        .withDepartment(departmentID)
        .withFilterProductTypes(productTypesAndNamesToSend)
        .withPlanId(masterPlanId)
        .build();

      //wait for creating a new member
      delay(3000);
      // Create partner
      await adminService.createPartner(partnerInfo);

      const email = partnerInfo.accountInfo?.email;

      const userInfo: UserInfo = {
        email: email!,
        firstName: partnerInfo.accountInfo?.firstName!,
        lastName: partnerInfo.accountInfo?.lastName!,
        phoneNumber: partnerInfo.accountInfo?.phoneNumber!,
        jobTitle: partnerInfo.accountInfo?.jobTitle!,
        role: 3,
      };

      const payload: InviteMemberPayload = {
        id: teamID,
        recipients: [userInfo],
      };

      const inviteResponse =
        await adminPortalService.inviteMemberViaCustomer(payload);

      await authenticationService.resetPasswordWithoutToken(
        { username: email!, password: tempPassword },
        undefined,
        "5",
      );

      await authenticationService.confirmEmailWithoutToken(
        email!,
        undefined,
        "5",
      );

      await authenticationService.getAuthToken(email!, tempPassword, "5");

      await authenticationService.resetPasswordWithoutToken(
        { username: email!, password: tempPassword },
        undefined,
        "4",
      );

      await authenticationService.confirmEmailWithoutToken(
        email!,
        undefined,
        "4",
      );

      const memberToken = await authenticationService.getAuthToken(
        email!,
        tempPassword,
        "4",
      );

      const sucessfullyLogin =
        await memberPortalService.acceptInvitationFromCustomerMagement(
          teamID,
          memberToken,
        );

      expect(sucessfullyLogin).toBeDefined();
      expect(typeof sucessfullyLogin).toBe("object");
      expect(inviteResponse).toBeDefined();
      expect(inviteResponse).toBe(true);

      delay(3000);
    }
  });
});
