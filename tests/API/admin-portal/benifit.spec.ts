import { test, expect } from "src/fixtures";
import { AdminPortalService } from "src/api/services/admin-portal.services";
import { DataFactory } from "src/data-factory";
import Comparison from "src/utilities/compare";
import { localHR } from "src/constant/static-data";
import { ProductInfo } from "src/objects/IProduct";
import { DataGenerate } from "src/utilities";

test.describe("Partner managerment", () => {
  test("TC37 Verify that when creating a new Partner, the admin can allow certain benefits to appear in the Member Portal.", async ({
    apiClient,
    authenticationService,
    adminPortalService,
    memberPortalService,
    planPage,
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
    //Create department id to send
    let departmentID =
      await DataFactory.generateDepartmentID(adminPortalService);
    //If departmentID is id of localhr, get another id which is not id of localhr
    while (departmentID == localHR) {
      departmentID = await DataFactory.generateDepartmentID(adminPortalService);
    }
    //Get department domain
    const partnerDomain = DataFactory.generatePartnerDomain();
    //Get all product types of a department (departmentID)
    const productTypeAndNames: ProductInfo[] =
      await DataFactory.generateProductTypesAndNames(adminPortalService);
    //Filter some product types from productTypeAndNames to send
    const productTypesAndNamesToSend: ProductInfo[] =
      await DataGenerate.generateProductType(productTypeAndNames);
    //Create partner info
    const partnerInfo = await DataFactory.generatePartnerInfo(0, adminService, {
      isPublic: true,
      departmentId: departmentID,
      feFilterProductTypes: productTypesAndNamesToSend.map(
        (p) => p.productType,
      ),
      whoPay: 0,
    });
    //Create partner
    const partnerResponse = await adminService.createPartner(partnerInfo);

    if (partnerResponse.status == 200) {
      const tempPassword = "TempPass@" + Date.now().toString().slice(-4);

      const email = partnerInfo.getAccountInfo()?.email!;

      const resetPartner =
        await authenticationService.resetPasswordWithoutToken(
          { username: email, password: tempPassword },
          undefined,
          "5",
        );

      const resetCustomer =
        await authenticationService.resetPasswordWithoutToken(
          { username: email, password: tempPassword },
          undefined,
          "4",
        );

      const token = await authenticationService.getAuthToken(
        email,
        tempPassword,
        "4",
      );
      //Create partner domain
      const partnerURL = `https://${email.split("@")[0]}.${partnerDomain}`;

      if (resetPartner) {
        await authenticationService.confirmEmailWithoutToken(
          email,
          undefined,
          "5",
        );
        //Choose a plan to buy among sent product types
        const selectedPlan: ProductInfo = DataGenerate.chooseAProductType(
          productTypesAndNamesToSend,
        );
        //By a selected plan
        await planPage.buyPlanWithoutDiving(
          partnerURL,
          email,
          tempPassword,
          selectedPlan.productName,
          partnerDomain,
        );

        if (resetCustomer) {
          await authenticationService.confirmEmailWithoutToken(
            email,
            undefined,
            "4",
          );
        }
        //Get benifits in member portal after partner bought the selected plan successfully
        const benifitResponse: any =
          await memberPortalService.getBenifit<object>(email, token);
        //Get benifit imformation of selected plan in adminportal
        const boughtPlan: any = await adminPortalService.getPlan(
          apiClient,
          benifitResponse.main.name,
          departmentID,
        );

        Comparison.comparePlan(benifitResponse, boughtPlan);
      }
    }
  });
  test("TC38 Verify that the admin can specify which plans a Partner can use for its Businesses via the Product Type field.", async ({
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
    //Create department id to send
    const departmentID =
      await DataFactory.generateDepartmentID(adminPortalService);
    //Get all product types of a department (departmentID)
    const productTypeAndNames: ProductInfo[] =
      await DataFactory.generateProductTypesAndNames(adminPortalService);
    //Filter some product types from productTypeAndNames to send
    const productTypesAndNamesToSend: ProductInfo[] =
      await DataGenerate.generateProductType(productTypeAndNames);
    //Create partner info
    const partnerInfo = await DataFactory.generatePartnerInfo(0, adminService, {
      isPublic: true,
      departmentId: departmentID,
      feFilterProductTypes: productTypesAndNamesToSend.map(
        (p) => p.productType, //Send a lot of plans
      ),
      whoPay: 0,
    });
    //Create a new partner
    const partnerResponse = await adminService.createPartner(partnerInfo);

    expect(partnerResponse.status).toBe(200);
  });
});
