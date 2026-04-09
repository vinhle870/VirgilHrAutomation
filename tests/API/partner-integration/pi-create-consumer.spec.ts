import { test, expect } from "src/fixtures";
import { AdminPortalService } from "src/api/services/admin-portal.services";
import { DataFactory } from "src/data-factory";
import { TestDataProvider } from "src/test-data";
import { CollectionUtils } from "src/utilities";
import { ProductInfo } from "src/objects/iproduct";
import Comparison from "src/utilities/compare";
import { plans } from "src/constant/static-data";
import delay from "src/utilities/delay";

test.describe("Partner Integration", () => {
  test("PI_001_API POST /client/consumer: Return 201-Created and correct Response", async ({
    apiClient,
    authenticationService,
    memberPortalService,
    partnerIntegrationService,
  }, testInfo) => {
    testInfo.skip(
      !process.env.API_BASE_URL && !process.env.BASE_URL,
      "API_BASE_URL is not configured",
    );

    //*************Pre-requisites: TURN ON API SERVICES *************//
    const adminService = await AdminPortalService.create(
      apiClient,
      authenticationService,
    );
    const testData = new TestDataProvider(adminService);
    const departmentID = await testData.getDepartmentId(process.env.DEPARTMENT_NAME);
    
    //*************PRE-CONDITION #1: BUILD CONSUMER DATA************//
    const tempPassword = "TempPass@" + Date.now().toString().slice(-4);
    const consumerData = await DataFactory.customerBuilder()
    .forMemberPortal()
    .withDepartment(departmentID)
    .build();

    const token = await authenticationService.getAuthTokenWithApiCredentials({
      apiKey: process.env.PARTNER_API_KEY ?? "",
      apiSecret: process.env.PARTNER_API_SECRET ?? "",
    });

    //*************PRE-CONDITION #2: GET CLIENT PLANS LIST************//
    const getClientPlansListResponse:any = await partnerIntegrationService.getClientPlansList(token);


       //*************STEPS #1: CREATE CONSUMER************//
    const createConsumerResponse = await partnerIntegrationService.createConsumer(consumerData,getClientPlansListResponse[0].id, token);

    if(!createConsumerResponse) {
      testInfo.fail(false, "Failed to create consumer");
    }

    //*************POST-Condition: Verify the Response************//
    expect(createConsumerResponse).toBeDefined();
    expect(typeof createConsumerResponse).toBe("object");
    expect(Object.keys(createConsumerResponse as any).length).toBeGreaterThan(0);


    //*************STEPS #2: RESET PASSWORD AND CONFIRM EMAIL************//
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

    //*************STEPS #3: GET AUTH TOKEN************//
       // Finally, attempt to obtain an auth token for the new consumer using
    // the Authentication service.
    const consumerToken = await authenticationService.getAuthToken(
      (consumerData as any).email,
      tempPassword,
      "4",
    );

    //****------------------------------------------------------------------------------------------------*****

    // STEP #4: GET PLANS: GET Payment/products
    const plansResp = await memberPortalService.getPlansList(
      consumerData.company.departmentId!,
      consumerToken,
    );

    //*************POST-Condition: Verify the Response************//
    expect(plansResp).toBeDefined();
    expect(typeof plansResp).toBe("object");
    expect(Array.isArray(plansResp as any)).toBeTruthy();
    expect(Object.keys(plansResp as any).length).toEqual(6);

  });

  
});
