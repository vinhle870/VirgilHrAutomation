import { test } from "src/fixtures";
import { DataFactory } from "src/data-factory";
import { getEmailSubjectByDepartment, getPlansForDepartment } from "src/constant/department-data";
import { plans } from "src/constant/static-data";

test.describe("E2E -> Member portal", { tag: ["@regression_UI", "@member_portal"] }, () => {
  test(
    "TC11: Verify that on Stripe, the user can enter card information and other related details.",
    {
      tag: "@TC11",
    },
    async ({ onboardingFlow, authFlow, purchaseFlow }) => {
      const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();
      const plans = getPlansForDepartment();

      await test.step("1 - Fill form to sign up", async () => {
        await onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo!);
      });

      await test.step("2 - Confirm email", async () => {
        await authFlow.activateSignedUpCustomer(customerInfo!.accountInfo.email!);
      });

      await test.step("3 - Select a plan and confirm payment", async () => {
        await purchaseFlow.selectPlanBeforePurchase("", customerInfo!.accountInfo.email!, plans[0]);
        await purchaseFlow.submitSubscriptionPayment();
      });

      await test.step("4 - Verify redirect to home page after payment", async () => {
        await onboardingFlow.redirectToHomePage();
      });
    },
  );

  test(
    "TC12: Verify that only valid cards can be processed for payment.",
    {
      tag: "@TC12",
    },
    async ({ onboardingFlow, authFlow, purchaseFlow }) => {
      const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();
      const plans = getPlansForDepartment();

      await test.step("1 - Fill form to sign up", async () => {
        await onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo!);
      });

      await test.step("2 - Confirm email", async () => {
        await authFlow.activateSignedUpCustomer(customerInfo!.accountInfo.email!);
      });

      await test.step("3 - Select a plan and confirm payment", async () => {
        await purchaseFlow.selectPlanBeforePurchase("", customerInfo!.accountInfo.email!, plans[0]);
      });

      await test.step("4 - Enter invalid card info", async () => {
        await purchaseFlow.submitInvalidCardPayment();
      });

      await test.step("5 - Verify validation message on the Tripe Payment screen", async () => {
        await purchaseFlow.verifyCardPaymentError("Your card was declined.");
      });

      await test.step("6 - Enter valid card and verify payment success", async () => {
        await purchaseFlow.retryWithValidCard();
        await onboardingFlow.redirectToHomePage();
      });
    },
  );

  test(
    "TC14: Verify that after a successful payment, the system automatically redirects the user to the Virgil homepage.",
    {
      tag: "@TC14",
    },
    async ({ onboardingFlow, authFlow, purchaseFlow }) => {
      const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();
      const plans = getPlansForDepartment();

      await test.step("1 - Fill form to sign up", async () => {
        await onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo!);
      });

      await test.step("2 - Confirm email", async () => {
        await authFlow.activateSignedUpCustomer(customerInfo!.accountInfo.email!);
      });

      await test.step("3 - Select a plan and submit payment", async () => {
        await purchaseFlow.selectPlanBeforePurchase("", customerInfo!.accountInfo.email!, plans[0]);
        await purchaseFlow.submitSubscriptionPayment();
      });

      await test.step("4 - Verify redirect to Virgil homepage after successful payment", async () => {
        await onboardingFlow.redirectToHomePage();
      });
    },
  );

  test(
    "TC16: Verify that new member portal user can be signed up under an existing partner.",
    {
      tag: ["@TC16"],
    },
    async ({ loginPage, onboardingFlow, authFlow }) => {
      await test.step("1 - Login to Admin portal", async () => {
        await loginPage.login();
      });

      const partnerInfo = await DataFactory.partnerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withPaymentOption("Member Portal Consumer")
        .withProductsType([plans[0]])
        .withBankTransfer(false)
        .withIsPublic(false)
        .build();

      await test.step("2 - Create a new partner", async () => {
        await onboardingFlow.createPartnerAndAddPeoInAdminPortal(partnerInfo!);
      });

      const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();

      await test.step("3 - Sign up new member under partner", async () => {
        const partnerCredential = await authFlow.getCredentialsFromEmail(partnerInfo.accountInfo?.email!, getEmailSubjectByDepartment().PARTNER_ACC_ACTIVATE);

        await onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo!, partnerInfo!.partnerInfo!.name, partnerCredential.loginUrl.replace("partner", "member"));
      });

      await test.step("4 - Confirm email", async () => {
        await authFlow.activateSignedUpCustomerUnderAPartner(customerInfo!.accountInfo.email!);
      });

      await test.step("5 - Verify user is redirected to Select Plan screen", async () => {
        await onboardingFlow.verifyURL("register-success");
      });
    },
  );
});
