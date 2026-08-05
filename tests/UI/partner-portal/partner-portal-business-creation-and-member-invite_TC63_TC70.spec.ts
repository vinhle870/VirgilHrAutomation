import { test } from "src/fixtures";
import { DataFactory, PersonDataGenerator } from "src/data-factory";
import { CustomerFactory } from "src/data-factory/customer-factory";
import UserInfo from "src/objects/user-info";
import { plans } from "src/constant/static-data";

test.describe("E2E -> Partner Portal -> Clients", { tag: ["@regression_UI", "@partner_portal"] }, () => {
  test(
    "TC63 Verify that the Partner Owner/Admin can create a new Business in the Clients page – Business tab.",
    {
      tag: "@TC63",
    },
    async ({ loginPage, onboardingFlow, authFlow }) => {
      await test.step("1 - Login to Admin portal", async () => {
        await loginPage.login();
      });

      const partnerInfo = await DataFactory.partnerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withPaymentOption("Partner/Consultant Owner")
        .withProductsType([plans[0]])
        .withBankTransfer(true)
        .withIsPublic(false)
        .build();

      await test.step("2 - Create a new Partner", async () => {
        await onboardingFlow.createPartnerAndAddPeoInAdminPortal(partnerInfo);
      });

      await test.step("3 - Verify the Partner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo);
      });

      await test.step("4 - Activate the Partner Owner and log in to the Partner Portal", async () => {
        await authFlow.activateAndChangePassIndividualCustomer(partnerInfo.accountInfo!.email, "Partner portal", "Password@123");
      });

      await test.step("5 - Create a new Business from the Clients page - Business tab", async () => {
        await onboardingFlow.createBusinessFromPartnerPortal(partnerInfo);
      });

      await test.step("6 - Verify the Business is created with an Owner assigned", async () => {
        await onboardingFlow.verifyOwnerVisible();
      });
    },
  );

  test(
    "TC70 Verify that the Owner/Admin of a Business can invite members from the Member Portal.",
    {
      tag: "@TC70",
    },
    async ({ loginPage, onboardingFlow, authFlow }) => {
      test.setTimeout(600000);

      await test.step("1 - Login to Admin portal", async () => {
        await loginPage.login();
      });

      // Payment options = Member Portal Consumer so the Business gets its OWN owner,
      // which is the account that must be able to invite from the Member Portal.
      const partnerInfo = await DataFactory.partnerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withPaymentOption("Member Portal Consumer")
        .withProductsType([plans[0]])
        .withBankTransfer(true)
        .withIsPublic(false)
        .build();

      await test.step("2 - Create a Partner with Payment options = Member Portal Consumer", async () => {
        await onboardingFlow.createPartnerAndAddPeoInAdminPortal(partnerInfo);
      });

      await test.step("3 - Verify the Partner is created successfully", async () => {
        await onboardingFlow.verifyPartnerVisible(partnerInfo);
      });

      const businessOwner = await PersonDataGenerator.generate({ emailDomain: "ussteel.xyz" });

      await test.step("4 - Activate the Partner and create a Business with its own Owner", async () => {
        await authFlow.activateAndChangePassIndividualCustomer(partnerInfo.accountInfo!.email, "Partner portal", "Password@123");

        await onboardingFlow.createBusinessFromPartnerPortal(partnerInfo, businessOwner);
      });

      await test.step("5 - Verify the Business Owner is assigned", async () => {
        await onboardingFlow.verifyOwnerVisible();
      });

      await test.step("6 - Activate the Business Owner and log in to the Member Portal", async () => {
        await authFlow.activateAndChangePassIndividualCustomer(businessOwner.email!, "Consumer", "Password@123");

        await onboardingFlow.redirectToHomePage();
      });

      const invitedMembers: UserInfo[] = await CustomerFactory.generateMembers(1, "User");

      await test.step("7 - The Business Owner invites a member from the Organization tab", async () => {
        await onboardingFlow.inviteMemberInOrganizationTabMemberPortal(invitedMembers);
      });

      await test.step("8 - Verify the invited member accepts and joins the Business team", async () => {
        await authFlow.acceptInviteAndJoinTeamByCustomer(invitedMembers[0].email, "Password@123");

        await onboardingFlow.redirectToHomePage();
      });
    },
  );
});
