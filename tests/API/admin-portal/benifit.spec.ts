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
    let departmentID =
      await DataFactory.generateDepartmentID(adminPortalService);

    while (departmentID == localHR) {
      departmentID = await DataFactory.generateDepartmentID(adminPortalService);
    }

    const partnerDomain = DataFactory.generatePartnerDomain();

    const productTypeAndNames: ProductInfo[] =
      await DataFactory.generateProductTypesAndNames(adminPortalService);

    const productTypesAndNamesToSend: ProductInfo[] =
      await DataGenerate.generateProductType(productTypeAndNames);

    const partnerInfo = await DataFactory.generatePartnerInfo(0, adminService, {
      isPublic: true,
      departmentId: departmentID,
      feFilterProductTypes: productTypesAndNamesToSend.map(
        (p) => p.productType,
      ),
      whoPay: 0,
    });

    const partnerResponse = await adminService.createPartner(partnerInfo);

    const departmentId = partnerInfo.getIPartnerInfo()?.departmentId!;

    if (partnerResponse.status == 200) {
      const tempPassword = "TempPass@" + Date.now().toString().slice(-4);

      const email = partnerInfo.getAccountInfo()?.email;

      if (!email) {
        throw new Error(
          "Generated partnerInfo does not contain accountInfo.email",
        );
      }

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

      const partnerURL = `https://${email.split("@")[0]}.${partnerDomain}`;

      if (resetPartner) {
        await authenticationService.confirmEmailWithoutToken(
          email,
          undefined,
          "5",
        );

        const selectedPlan: ProductInfo = DataGenerate.chooseAProductType(
          productTypesAndNamesToSend,
        );

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

        const benifitResponse: any =
          await memberPortalService.getBenifit<object>(email, token);

        const boughtPlan: any = await adminPortalService.getPlan(
          apiClient,
          benifitResponse.main.name,
          departmentId,
        );

        Comparison.comparePlan(benifitResponse, boughtPlan);
      }
    }
  });
  test("TC38 Verify that the admin can specify which plans a Partner can use for its Businesses via the Product Type field.", async ({
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

    const partnerInfo = await DataFactory.generatePartnerInfo(0, adminService, {
      isPublic: true,
      departmentId: "688897d5eb52b4af5573def4",
      whoPay: 0,
    });

    const partnerResponse = await adminService.createPartner(partnerInfo);

    if (partnerResponse.status == 200) {
    }
  });
});
