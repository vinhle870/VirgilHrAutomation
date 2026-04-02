import { test, expect } from "src/fixtures";
import { DataFactory, PersonDataGenerator } from "src/data-factory";
import { AdminPortalService } from "src/api/services/admin-portal.services";
import { plans } from "src/constant/static-data";
import { CollectionUtils } from "src/utilities";
import { UserInfo } from "src/objects";
import { CustomerFactory } from "src/data-factory/customer-factory";
import IPartnerFilter from "src/objects/ipartnerfilter";
import { PartnerFilter } from "src/ui/pages/admin-portal/locators/partner-management/filter-partner";
import delay from "src/utilities/delay";

test.describe("E2E -> Admin Portal -> Partner Management", () => {
  test("TC30 Verify that a partner account can only be created in the Admin Portal – Partner Management.", async ({
    loginPage,
    partnerManagementPage,
  }, testInfo) => {
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");

    await loginPage.login();

    const partnerInfo = await DataFactory.partnerBuilder()
      .withDepartmentName(process.env.DEPARTMENT_NAME!)
      .withPaymentOption("Partner/Consultant Owner")
      .withProductsType([process.env.PLAN!])
      .build();

    const newPartner = await partnerManagementPage.createPartner(partnerInfo);

    await expect(newPartner).toBeVisible();
  });

  test("TC31 Verify when a Partner is being created, the admin can select its level as Partner or PEO/Consultant.", async ({
    loginPage,
    partnerManagementPage,
  }, testInfo) => {
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");

    await loginPage.login();

    const partnerInfo = await DataFactory.partnerBuilder()
      .withDepartmentName(process.env.DEPARTMENT_NAME!)
      .withPaymentOption("Partner/Consultant Owner")
      .withProductsType([process.env.PLAN!])
      .withPartnerLevel("PEO/HR Consultant")
      .build();

    const newPartner = await partnerManagementPage.createPartner(partnerInfo);

    await expect(newPartner).toBeVisible();
  });

  test("TC32 Verify that a Partner is at a higher level than a PEO/Consultant, meaning one Partner can contain one or multiple PEOs/Consultants.", async ({
    loginPage,
    partnerManagementPage,
    onboardingFlow,
    tempEmailFreePage,
  }, testInfo) => {
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");

    await loginPage.login();

    const partnerInfo = await DataFactory.partnerBuilder()
      .withDepartmentName(process.env.DEPARTMENT_NAME!)
      .withPaymentOption("Partner/Consultant Owner")
      .withProductsType([process.env.PLAN!])
      .withPartnerLevel("Partner")
      .build();

    const newPartner = await partnerManagementPage.createPartner(partnerInfo);

    await expect(newPartner).toBeVisible();

    const peoPartnerInfo = await DataFactory.peoPartnerBuilder()
      .withName("Peo" + partnerInfo.accountInfo?.firstName)
      .withCompanyType("Internal")
      .withCustomBranding(true)
      .build();

    const peoPartners = [peoPartnerInfo];

    const addedPeoPartner = await partnerManagementPage.addPeoConsultant(
      partnerInfo,
      peoPartners,
      onboardingFlow,
      tempEmailFreePage,
    );

    expect(addedPeoPartner).toBe("Pass");
  });

  test("TC33 When creating a new Partner, the admin can choose to assign a sub-domain to that Partner, or not.", async ({
    loginPage,
    partnerManagementPage,
  }, testInfo) => {
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");

    await loginPage.login();

    const partnerInfo = await DataFactory.partnerBuilder()
      .withDepartmentName(process.env.DEPARTMENT_NAME!)
      .withPaymentOption("Partner/Consultant Owner")
      .withProductsType([process.env.PLAN!])
      .withPartnerLevel("Partner")
      .withSubDomain("")
      .build();

    const newPartner = await partnerManagementPage.createPartner(partnerInfo);

    await expect(newPartner).toBeVisible();
  });

  test("TC34 For Payment Options, the admin can select either Partner/Consultant Owner or Member Portal Consumer.", async ({
    loginPage,
    partnerManagementPage,
  }, testInfo) => {
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");

    await loginPage.login();

    let paymentOption;

    for (let i = 0; i < 2; i++) {
      if (i === 0) paymentOption = "Partner/Consultant Owner";
      else paymentOption = "Member Portal Consumer";

      const partnerInfo = await DataFactory.partnerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withPaymentOption(paymentOption!)
        .withProductsType([process.env.PLAN!])
        .withPartnerLevel("Partner")
        .build();

      const newPartner = await partnerManagementPage.createPartner(
        partnerInfo,
        i,
      );

      await expect(newPartner).toBeVisible();
    }
  });

  test("TC35 With Payment Options = Partner/Consultant Owner, the user will make payments in the Partner Portal, and the Partner account will be the owner of all Businesses.", async ({
    loginPage,
    partnerManagementPage,
    onboardingFlow,
    tempEmailFreePage,
    purchaseFlow,
  }, testInfo) => {
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");

    await loginPage.login();

    const partnerInfo = await DataFactory.partnerBuilder()
      .withDepartmentName(process.env.DEPARTMENT_NAME!)
      .withPaymentOption("Partner/Consultant Owner")
      .withProductsType([process.env.PLAN!])
      .withPartnerLevel("Partner")
      .withBankTransfer(false)
      .build();

    const newPartner = await partnerManagementPage.createPartner(partnerInfo);

    await expect(newPartner).toBeVisible();

    const newPage = await onboardingFlow.buyPlanInPartnerPortal(
      tempEmailFreePage,
      purchaseFlow,
      partnerInfo,
      true,
    );

    const owner = await onboardingFlow.createBusiness(newPage, partnerInfo);

    await expect(owner).toBeVisible();
  });

  test("TC36 With Payment Options = Member Portal Consumer, the user does not handle payments, and each Business will have its own owner.", async ({
    loginPage,
    partnerManagementPage,
    onboardingFlow,
    tempEmailFreePage,
  }, testInfo) => {
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");

    await loginPage.login();

    const partnerInfo = await DataFactory.partnerBuilder()
      .withDepartmentName(process.env.DEPARTMENT_NAME!)
      .withPaymentOption("Member Portal Consumer")
      .withProductsType([process.env.PLAN!])
      .withPartnerLevel("Partner")
      .withBankTransfer(false)
      .withEmail("QATest_Shyanne434@polandcampus.edu.pl ")
      .build();

    const newPartner = await partnerManagementPage.createPartner(partnerInfo);

    await expect(newPartner).toBeVisible();

    const newPage = await onboardingFlow.credential(
      tempEmailFreePage,
      partnerInfo.accountInfo?.email!,
      true,
    );

    const ownerAccount = await PersonDataGenerator.generate();

    const owner = await onboardingFlow.createBusiness(
      newPage,
      partnerInfo,
      ownerAccount,
    );

    await expect(owner).toBeVisible();
  });

  test("Invite members in partner management", async ({
    loginPage,
    partnerManagementPage,
    onboardingFlow,
    tempEmailFreePage,
  }, testInfo) => {
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");

    await loginPage.login();

    const partnerInfo = await DataFactory.partnerBuilder()
      .withDepartmentName(process.env.DEPARTMENT_NAME!)
      .withPartnerLevel("PEO/HR Consultant")
      .withPaymentOption("Partner/Consultant Owner")
      .withProductsType(["251 - 500 Employees"])
      .withPhoneNumber("+13530044689")
      .build();

    // const newPartner = await partnerManagementPage.createPartner(partnerInfo);

    //   await expect(newPartner).toBeVisible();

    const invitedMembers: UserInfo[] = await CustomerFactory.generateMembers(1);

    await partnerManagementPage.addMoreMembers(
      partnerInfo,
      invitedMembers,
      onboardingFlow,
      tempEmailFreePage,
    );
  });

  test("Filter partner in partner management", async ({
    loginPage,
    partnerManagementPage,
  }, testInfo) => {
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");

    await loginPage.login();

    const partnerInfo = await DataFactory.partnerBuilder()
      .withDepartmentName(process.env.DEPARTMENT_NAME!)
      .withPartnerLevel("Partner")
      .build();

    const partFilterInfo: IPartnerFilter = {
      name: partnerInfo.partnerInfo?.name,
      level: partnerInfo.partnerInfo?.partnerLevel,
      department: partnerInfo.partnerInfo?.departmentName,
    };

    //  const newPartner = await partnerManagementPage.createPartner(partnerInfo);

    // await expect(newPartner).toBeVisible();

    const filteredPartner = await partnerManagementPage.filter(partFilterInfo);

    expect(filteredPartner).toBe("Pass");
  });

  test("Sort in partner management ", async ({
    loginPage,
    partnerManagementPage,
  }, testInfo) => {
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");

    await loginPage.login();

    const typeOfSorting = PartnerFilter.oldestToLatest;

    const sort = await partnerManagementPage.sorting(typeOfSorting);

    expect(sort).toBe("Pass");
  });

  test("Create a new customer", async ({
    loginPage,
    customerManagementPage,
  }, testInfo) => {
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");

    await loginPage.login();

    const customerInfo = await DataFactory.customerBuilder()
      .withCompanyName("Company")
      .withCompanySize(process.env.PLAN!)
      .forAdminPortal()
      .withTotalEmployees(3)
      .withStatesEmployee(["Alaska", "Arizona"])
      .withStatesEmployeeInfo([
        { state: "Alaska", number: 1 },
        { state: "Arizona", number: 2 },
      ])
      .withDepartmentName(process.env.DEPARTMENT_NAME!)
      .withBankStranfer(true)
      .withPayYearly(false)
      .withConsultant(false)
      .withStateOfCustomer("Alaska")
      .withIndustry([{ value: "Administrative and Support Services" }])
      .build();

    const newCustomer =
      await customerManagementPage.createCustomer(customerInfo);
  });

  test("Add peo in partner management", async ({
    loginPage,
    partnerManagementPage,
    onboardingFlow,
    tempEmailFreePage,
  }, testInfo) => {
    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;

    testInfo.skip(!base, "API_BASE_URL is not configured");

    await loginPage.login();

    const partnerInfo = await DataFactory.partnerBuilder()
      .withPhoneNumber("+12025550173")
      .withDepartmentName(process.env.DEPARTMENT_NAME!)
      .withPartnerLevel("Partner")
      .build();

    const peoPartnerInfo = await DataFactory.peoPartnerBuilder()
      .withName("Peo" + partnerInfo.accountInfo?.firstName)
      .withCompanyType("Internal")
      .withCustomBranding(true)
      .build();

    const peoPartners = [peoPartnerInfo];

    const addedPeoPartner = await partnerManagementPage.addPeoConsultant(
      partnerInfo,
      peoPartners,
      onboardingFlow,
      tempEmailFreePage,
    );

    expect(addedPeoPartner).toBe("Pass");
  });

  test("Upgrade a new plan in customer management", async ({
    loginPage,
    customerManagementPage,
  }) => {
    await loginPage.login();

    const customerInfo = await DataFactory.customerBuilder()
      .withCompanyName("Company")
      .withCompanySize(process.env.PLAN!)
      .forAdminPortal()
      .withTotalEmployees(3)
      .withStatesEmployee(["Alaska", "Arizona"])
      .withStatesEmployeeInfo([
        { state: "Alaska", number: 1 },
        { state: "Arizona", number: 2 },
      ])
      .withDepartmentName(process.env.DEPARTMENT_NAME!)
      .withPhoneNumber("+84912345678")
      .withBankStranfer(true)
      .withPayYearly(false)
      .withConsultant(false)
      .withInternal(true)
      .withStateOfCustomer("Alaska")
      .withIndustry([{ value: "Administrative and Support Services" }])
      .withBankStranferToUpgradePlan(true)
      .build();

    await customerManagementPage.upgradePlan(
      customerInfo,
      process.env.PLAN_TO_UPGRADE!,
    );
  });
});
