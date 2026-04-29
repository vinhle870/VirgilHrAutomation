import { test, expect } from "src/fixtures";
import { AdminPortalService } from "src/api/services/admin-portal.services";
import { DataFactory } from "src/data-factory";
import { TestDataProvider } from "src/test-data";
import { CollectionUtils } from "src/utilities";
import { ProductInfo } from "src/objects/iproduct";
import Comparison from "src/utilities/compare";
import { plans } from "src/constant/static-data";
import delay from "src/utilities/delay";
import { CustomerInfo } from "src/objects";

test.describe(
  "Partner Integration",
  {
    tag: ["@API", "@Partner Integration", "@Consumer"],
  },
  () => {
  test("PI_001_API POST /client/consumer: Return 201-Created and correct Response",
    {
      tag: [
        "@PI_001",
        "@API",
        "@Partner Integration",
        "@Consumer",
        "@Create Consumer",
      ],
    },
    async ({
    apiClient,
    authenticationService,
    memberPortalService,
    partnerIntegrationService,
  }, testInfo) => {

    //*************Pre-requisites: TURN ON API SERVICES *************//
    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );
    const testData = new TestDataProvider(adminService);
    const departmentID = await testData.getDepartmentId(process.env.DEPARTMENT_NAME);
    
    //*************PRE-CONDITION #1: BUILD CONSUMER DATA************//
    
    let consumerData!: CustomerInfo;
    const tempPassword = "TempPass@" + Date.now().toString().slice(-4);
    await test.step("Pre-condition: Build consumer payload", async () => {
       
       consumerData = await DataFactory.customerBuilder()
      .forMemberPortal()
      .withDepartment(departmentID)
      .build();
    });

    const token = await authenticationService.getAuthTokenWithApiCredentials({
      apiKey: process.env.PARTNER_API_KEY ?? "",
      apiSecret: process.env.PARTNER_API_SECRET ?? "",
    });

    //*************PRE-CONDITION #2: GET CLIENT PLANS LIST************//
    await test.step("Pre-condition: Get client plans list", async () => {
      const getClientPlansListResponse:any = await partnerIntegrationService.getClientPlansList(token);
    });

    //*************STEPS #2: RESET PASSWORD AND CONFIRM EMAIL************//
    await test.step("Steps: Reset password and confirm email", async () => {  
    const resetResp = await authenticationService.resetPasswordWithoutToken(
      { username: (consumerData as any).email, password: tempPassword },
      undefined,
      "4",
    );

    //Activate the user account if needed (depends on system settings)
    await authenticationService.confirmEmailWithoutToken(
      (consumerData as any).email,
      undefined,
      "4",
    );
  });


    //****------------------------------------------------------------------------------------------------*****

    // STEP #4: GET PLANS: GET Payment/products
    let plansResp!: object;
    await test.step("Steps: Get plans list With Consumer Token", async () => {

      const consumerToken = await authenticationService.getAuthToken(
        (consumerData as any).email,
        tempPassword,
        "4",
      );
     plansResp = await memberPortalService.getPlansList(
      consumerData.company.departmentId!,
      consumerToken,
    );
  });
    //*************POST-Condition: Verify the Response************//
    await test.step("Post-condition: Verify the response", async () => {
    expect(plansResp).toBeDefined();
    expect(typeof plansResp).toBe("object");
    expect(Array.isArray(plansResp as any)).toBeTruthy();
    expect(Object.keys(plansResp as any).length).toEqual(6);
  });
  });

  
});
