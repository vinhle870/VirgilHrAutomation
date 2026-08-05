import { test } from "src/fixtures";
import { DataFactory, PersonDataGenerator } from "src/data-factory";
import { plans } from "src/constant/static-data";

test.describe("E2E -> Admin Portal -> Partner Management", { tag: ["@regression_UI", "@partner_portal"] }, () => {
  test(
    "TC53: Verify that when Payment Options = Member Portal Consumer, the partner account is the Owner of the Partner Team, while each Business has its own Owner.",
    {
      tag: "@TC53",
    },
    async ({ loginPage, authFlow, onboardingFlow }) => {
      await test.step("1 - Login to Admin portal", async () => {
        await loginPage.login();
      });

      const partnerInfo = await DataFactory.partnerBuilder().withDepartmentName(process.env.DEPARTMENT_NAME!).withPaymentOption("Member Portal Consumer").withProductsType([plans[0]]).build();

      await test.step("2 - Create a new partner", async () => {
        await onboardingFlow.createPartnerAndAddPeoInAdminPortal(partnerInfo);
      });

      await test.step("3 - Verify newPartner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo);
      });

      await test.step("4 - Activate the partner", async () => {
        await authFlow.activateAndChangePassIndividualCustomer(partnerInfo!.accountInfo?.email!, "Partner portal", "Password@123");
      });

      await test.step("5 - Create a new business", async () => {
        const ownerAccount = await PersonDataGenerator.generate({ emailDomain: "ussteel.xyz" });

        await onboardingFlow.createBusinessFromPartnerPortal(partnerInfo!, ownerAccount);
      });

      await test.step("6 - Verify each Business has its own Owner.", async () => {
        await onboardingFlow.verifyOwnerVisible();
      });

      await test.step("7 - Verify the partner account is the Owner of the Partner Team", async () => {
        await onboardingFlow.verifyOwnerRoleInUserPage(partnerInfo!);
      });
    },
  );
});
