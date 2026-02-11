import { test, expect } from "src/fixtures";
import { AdminPortalService } from "src/api/services/admin-portal.services";
import { DataFactory } from "src/data-factory";
import { localHR, paymentOptions } from "src/constant/static-data";
import { DataGenerate } from "src/utilities";
import { ProductInfo } from "src/objects/IProduct";
import Comparison from "src/utilities/compare";

test.describe("Partner managerment", () => {
  test("TC030_API Verify that a partner account can only be created in the Admin Portal – Partner Management.", async ({
    apiClient,
    authenticationService,
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

    const partnerInfo = await DataFactory.generatePartnerInfo(0, adminService);

    const response = await adminService.createPartner(partnerInfo);

    expect(response.data).toBeDefined();
  });

  test("TC31 Verify when a Partner is being created, the admin can select its level as Partner or PEO/Consultant.", async ({
    apiClient,
    authenticationService,
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

    const peoInfo = await DataFactory.generatePartnerInfo(1, adminService);

    const nameOfPeoInfo: string = peoInfo.getIPartnerInfo()?.name!;

    const responsePEO = await adminService.createPartner(peoInfo);

    if (responsePEO.status == 200) {
      const peoLevel = (await adminService.searchPartnerByText(nameOfPeoInfo))
        .entities[0].level;

      expect(peoLevel).toBe(1);
    }

    const partnerInfo = await DataFactory.generatePartnerInfo(0, adminService);

    const nameOfpartnerInfo: string = partnerInfo.getIPartnerInfo()?.name!;

    const responsePartner = await adminService.createPartner(partnerInfo);

    if (responsePartner.status == 200) {
      const partnerLevel = await (
        await adminService.searchPartnerByText(nameOfpartnerInfo)
      ).entities[0].level;

      expect(partnerLevel).toBe(0);
    }
  });
  test("TC034_API For Payment Options, the admin can select either Partner/Consultant Owner or Member Portal Consumer.", async ({
    apiClient,
    authenticationService,
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

    for (let i = 0; i < paymentOptions.length; i++) {
      const partnerInfo = await DataFactory.generatePartnerInfo(
        0,
        adminService,
        {
          paymentEnable: i,
        },
      );

      const nameOfPartnerInfo = partnerInfo.getIPartnerInfo()?.name!;

      const responseOfPartner = await adminService.createPartner(partnerInfo);

      if (responseOfPartner.status == 200) {
        const searchResponse = (
          await adminService.searchPartnerByText(nameOfPartnerInfo)
        ).entities[0].paymentEnable;

        if (i == 0) expect(searchResponse).toBe(false);
        else if (i == 1) expect(searchResponse).toBe(true);
      }
    }
  });

  test("TC35 With Payment Options = Partner/Consultant Owner, the user will make payments in the Partner Portal, and the Partner account will be the owner of all Businesses.", async ({
    apiClient,
    authenticationService,
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
      whoPay: 0,
    });

    const partnerResponse = await adminService.createPartner(partnerInfo);

    if (partnerResponse.status == 200) {
      const tempPassword = "TempPass@" + Date.now().toString().slice(-4);

      const email = partnerInfo.getAccountInfo()?.email;

      if (!email) {
        throw new Error(
          "Generated partnerInfo does not contain accountInfo.email",
        );
      }

      const resetResp = await authenticationService.resetPasswordWithoutToken(
        { username: email, password: tempPassword },
        undefined,
        "5",
      );

      if (resetResp) {
        await authenticationService.confirmEmailWithoutToken(
          email,
          undefined,
          "5",
        );

        const emailOfPartner = partnerInfo.getAccountInfo()?.email!;

        const searchResponse =
          await adminService.getCustomerIdByEmail(emailOfPartner);

        const customerId = searchResponse.body.entities[0].consumerObjectId;

        const customerRole = await adminService.getRoleOfCustomer(customerId);

        expect(customerRole.body.role).toBe(0);
      }
    }
  });
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
    test.describe.configure({ retries: 5 });

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
  test("TC44 For Payment Options = Partner/Consultant Owner, the Owner account can log in to both the Member Portal and the Partner Portal.", async ({
    apiClient,
    authenticationService,
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
      whoPay: 0,
    });

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

      if (resetPartner) {
        const partnerResponse =
          await authenticationService.confirmEmailWithoutToken(
            email,
            undefined,
            "5",
          );

        if (partnerResponse) {
          const partnerToLogin = await authenticationService.getAuthToken(
            email,
            tempPassword,
            "5",
          );

          expect(partnerToLogin).toBeDefined();
        }
      }

      if (resetCustomer) {
        const memberResponse =
          await authenticationService.confirmEmailWithoutToken(
            email,
            undefined,
            "4",
          );

        if (memberResponse) {
          const memberToLogin = await authenticationService.getAuthToken(
            email,
            tempPassword,
            "4",
          );

          expect(memberToLogin).toBeDefined();
        }
      }
    }
  });

  test("TC45 With Payment Options = Member Portal Consumer, after successfully creating a Partner account, the user receives one credential email — for the Partner Portal.", async ({
    apiClient,
    authenticationService,
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
      whoPay: 1,
    });

    const partnerResponse = await adminService.createPartner(partnerInfo);

    if (partnerResponse.status == 200) {
      const tempPassword = "TempPass@" + Date.now().toString().slice(-4);

      const email = partnerInfo.getAccountInfo()?.email!;

      const resetPassword =
        await authenticationService.resetPasswordWithoutToken(
          { username: email, password: tempPassword },
          undefined,
          "5",
        );

      if (resetPassword) {
        await authenticationService.confirmEmailWithoutToken(
          email,
          undefined,
          "5",
        );

        const emailOfPartner = partnerInfo.getAccountInfo()?.email!;

        expect(emailOfPartner).toBeDefined();

        const searchResponse =
          await adminService.getCustomerIdByEmail(emailOfPartner);

        const customerEmail = searchResponse.body.entities[0];

        expect(customerEmail).toBeFalsy();
      }
    }
  });

  test("TC46 For Payment Options = Member Portal Consumer, the Owner of the Partner/Consultant can only log in to the Partner Portal.", async ({
    apiClient,
    authenticationService,
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
      whoPay: 1,
    });

    const partnerResponse = await adminService.createPartner(partnerInfo);

    const email = partnerInfo.getAccountInfo()?.email!;

    if (partnerResponse.status == 200) {
      const tempPassword = "TempPass@" + Date.now().toString().slice(-4);

      const resetPassword =
        await authenticationService.resetPasswordWithoutToken(
          { username: email, password: tempPassword },
          undefined,
          "5",
        );

      if (resetPassword) {
        const partnerResponse =
          await authenticationService.confirmEmailWithoutToken(
            email,
            undefined,
            "5",
          );

        if (partnerResponse) {
          const partnerToLogin = await authenticationService.getAuthToken(
            email,
            tempPassword,
            "5",
          );

          expect(partnerToLogin).toBeDefined();
        }

        const searchResponse = await adminService.getCustomerIdByEmail(email);

        const customerEmail = searchResponse.body.entities[0];

        expect(customerEmail).toBeFalsy();
      }
    }
  });

  test("TC47 For Businesses under a Partner with Payment Options = Member Portal Consumer, the Business Owner cannot log in to the Member Portal.", async ({
    apiClient,
    authenticationService,
    memberPortalService,
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
      whoPay: 1,
    });

    const partnerResponse = await adminService.createPartner(partnerInfo);

    const email = partnerInfo.getAccountInfo()?.email!;

    if (partnerResponse.status == 200) {
      const tempPassword = "TempPass@" + Date.now().toString().slice(-4);

      const resetPassword =
        await authenticationService.resetPasswordWithoutToken(
          { username: email, password: tempPassword },
          undefined,
          "5",
        );

      if (resetPassword) {
      }
    }
  });
});
