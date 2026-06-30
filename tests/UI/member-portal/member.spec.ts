import { test } from "src/fixtures";
import { DataFactory } from "src/data-factory";
import { CustomerFactory } from "src/data-factory/customer-factory";
import UserInfo from "src/objects/user-info";
import { getEmailSubjectByDepartment, getPlansForDepartment } from "src/constant/department-data";
import { Partner } from "src/objects";
import { plans } from "src/constant/static-data";

test.describe("E2E -> Member portal", { tag: "@regression_UI" }, () => {
  test(
    "TC01",
    {
      tag: "@Verify that the user can create a new account by clicking the Sign Up button.",
    },
    async ({ onboardingFlow, authFlow }) => {
      const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();

      await test.step("Fill form to sign up", async () => {
        await onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo!);
      });

      await test.step("Confirm email", async () => {
        await authFlow.activateSignedUpCustomer(customerInfo!.accountInfo.email!);
      });

      await test.step("Verify the signed up customer login successfully", async () => {
        await onboardingFlow.verifyURL("register-success");
      });
    },
  );

  test(
    "TC02",
    {
      tag: "@Verify that the user can fill in all required information on the Sign Up screen.",
    },
    async ({ onboardingFlow, authFlow }) => {
      const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();

      await test.step("Fill form to sign up", async () => {
        await onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo!);
      });

      await test.step("Confirm email", async () => {
        await authFlow.activateSignedUpCustomer(customerInfo!.accountInfo.email!);
      });

      await test.step("Verify the signed up customer login successfully", async () => {
        await onboardingFlow.verifyURL("register-success");
      });
    },
  );

  test(
    "TC03",
    {
      tag: "@Verify that the email address is unique.",
    },
    async ({ onboardingFlow, authFlow }) => {
      const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();

      await test.step("Fill form to sign up", async () => {
        await onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo!);
      });

      await test.step("Confirm email", async () => {
        await authFlow.activateSignedUpCustomer(customerInfo!.accountInfo.email!);
      });

      const duplicateCustomerInfo = await DataFactory.customerBuilder().withEmail(customerInfo!.accountInfo.email!).withPassword("Password@123").build();

      await test.step("Verify duplicated email", async () => {
        await onboardingFlow.verifyDuplicatedEmailWhenSignUpCustomer(duplicateCustomerInfo);
      });
    },
  );

  test(
    "TC04",
    {
      tag: "@Verify that all fields on the Sign Up screen are required (except for the HR System field).",
    },
    async ({ onboardingFlow, authFlow }) => {
      const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();

      await test.step("Verify inputs are required", async () => {
        await onboardingFlow.verifyFillingFormIsRequired(customerInfo!);
      });

      await test.step("Activate account", async () => {
        await authFlow.activateSignedUpCustomer(customerInfo!.accountInfo.email!);
      });

      await test.step("Verify the signed up customer login successfully", async () => {
        await onboardingFlow.verifyURL("register-success");
      });
    },
  );

  test(
    "TC05",
    {
      tag: "@Verify that after filling in all information and signing up, the user receives a confirmation email.",
    },
    async ({ onboardingFlow, authFlow }) => {
      const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();

      await test.step("Fill form to sign up", async () => {
        await onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo!);
      });

      await test.step("Verify recieve one confirmation email", async () => {
        await authFlow.validateReceivedOneEmailForCreatingCustomer(customerInfo!.accountInfo.email!);
      });
    },
  );

  test(
    "TC06",
    {
      tag: "@Verify that the confirmation email is only valid for 24 hours.",
    },
    async ({ onboardingFlow, authFlow }) => {
      const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();

      await test.step("Fill form to sign up", async () => {
        await onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo!);
      });

      await test.step("Verify email is only valid for 24 hours", async () => {
        await authFlow.validateTimeLimitedEmailForCreatingCustomer(customerInfo.accountInfo.email);
      });
    },
  );

  test(
    "TC07",
    {
      tag: "@Verify that after confirming the email, the user is redirected to the Select Plan screen.",
    },
    async ({ onboardingFlow, authFlow }) => {
      const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();

      await test.step("Fill form to sign up", async () => {
        await onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo!);
      });

      await test.step("Confirm email", async () => {
        await authFlow.activateSignedUpCustomer(customerInfo!.accountInfo.email!);
      });

      await test.step("Verify user is redirected to Select Plan screen", async () => {
        await onboardingFlow.verifyURL("register-success");
      });
    },
  );

  test(
    "TC08",
    {
      tag: "@On the Select Plan screen, the user can choose any available plan from the list.",
    },
    async ({ onboardingFlow, authFlow, purchaseFlow }) => {
      const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();
      const plans = getPlansForDepartment();

      await test.step("Fill form to sign up", async () => {
        await onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo!);
      });

      await test.step("Confirm email", async () => {
        await authFlow.activateSignedUpCustomer(customerInfo!.accountInfo.email!);
      });

      await test.step("Select a plan from the list", async () => {
        await purchaseFlow.selectPlanBeforePurchase("", customerInfo!.accountInfo.email!, plans[0]);
      });

      await test.step("Buy the selected plan", async () => {
        await purchaseFlow.submitSubscriptionPayment();
      });

      await test.step("Verify redirect to home page", async () => {
        await onboardingFlow.redirectToHomePage();
      });
    },
  );

  test(
    "TC09",
    {
      tag: ["@retry", "@After selecting a plan, the user can choose to pay annually or monthly, and apply a discount code."],
    },
    async ({ onboardingFlow, authFlow, purchaseFlow }) => {
      const plans = getPlansForDepartment();

      for (let i = 0; i <= 1; i++) {
        const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();

        await test.step(`Fill form to sign up`, async () => {
          await onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo!);
        });

        await test.step(`Confirm email`, async () => {
          await authFlow.activateSignedUpCustomer(customerInfo!.accountInfo.email!);
        });

        await test.step(`Select a plan from the list and buy plan - ${i === 0 ? "monthly" : "annually"}`, async () => {
          await purchaseFlow.selectPlanBeforePurchase("", customerInfo!.accountInfo.email!, plans[0], i === 0);
          await purchaseFlow.submitSubscriptionPayment();
        });

        await test.step(`Verify buy plan successfully - ${i === 0 ? "monthly" : "annually"}`, async () => {
          await onboardingFlow.redirectToHomePage();
        });
      }
    },
  );

  test(
    "TC10",
    {
      tag: "@After confirming the payment, the user is redirected to Stripe for checkout.",
    },
    async ({ onboardingFlow, authFlow, purchaseFlow }) => {
      const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();
      const plans = getPlansForDepartment();

      await test.step("Fill form to sign up", async () => {
        await onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo!);
      });

      await test.step("Confirm email", async () => {
        await authFlow.activateSignedUpCustomer(customerInfo!.accountInfo.email!);
      });

      await test.step("Select a plan and confirm payment", async () => {
        await purchaseFlow.selectPlanBeforePurchase("", customerInfo!.accountInfo.email!, plans[0]);
      });

      await test.step("Verify redirect to Stripe checkout", async () => {
        await purchaseFlow.verifyStripePaymentFormCorrectDisplay();
      });
    },
  );

  test(
    "TC11",
    {
      tag: "@On Stripe, the user enters card information and other related details.",
    },
    async ({ onboardingFlow, authFlow, purchaseFlow }) => {
      const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();
      const plans = getPlansForDepartment();

      await test.step("Fill form to sign up", async () => {
        await onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo!);
      });

      await test.step("Confirm email", async () => {
        await authFlow.activateSignedUpCustomer(customerInfo!.accountInfo.email!);
      });

      await test.step("Select a plan and confirm payment", async () => {
        await purchaseFlow.selectPlanBeforePurchase("", customerInfo!.accountInfo.email!, plans[0]);
        await purchaseFlow.submitSubscriptionPayment();
      });

      await test.step("Verify redirect to home page after payment", async () => {
        await onboardingFlow.redirectToHomePage();
      });
    },
  );

  test(
    "TC12",
    {
      tag: ["@retry", "@Verify that only valid cards can be processed for payment."],
    },
    async ({ onboardingFlow, authFlow, purchaseFlow }) => {
      const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();
      const plans = getPlansForDepartment();

      await test.step("Fill form to sign up", async () => {
        await onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo!);
      });

      await test.step("Confirm email", async () => {
        await authFlow.activateSignedUpCustomer(customerInfo!.accountInfo.email!);
      });

      await test.step("Select a plan and confirm payment", async () => {
        await purchaseFlow.selectPlanBeforePurchase("", customerInfo!.accountInfo.email!, plans[0]);
      });

      await test.step("Enter invalid card and verify error", async () => {
        await purchaseFlow.submitInvalidCardPayment();
        await purchaseFlow.verifyCardPaymentError();
      });

      await test.step("Enter valid card and verify payment success", async () => {
        await purchaseFlow.retryWithValidCard();
        await onboardingFlow.redirectToHomePage();
      });
    },
  );

  test(
    "TC13",
    {
      tag: ["@retry", "@Verify that all invalid cards are declined."],
    },
    async ({ onboardingFlow, authFlow, purchaseFlow }) => {
      const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();
      const plans = getPlansForDepartment();

      await test.step("Fill form to sign up", async () => {
        await onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo!);
      });

      await test.step("Confirm email", async () => {
        await authFlow.activateSignedUpCustomer(customerInfo!.accountInfo.email!);
      });

      await test.step("Select a plan and confirm payment", async () => {
        await purchaseFlow.selectPlanBeforePurchase("", customerInfo!.accountInfo.email!, plans[0]);
      });

      await test.step("Enter invalid card and verify error", async () => {
        await purchaseFlow.submitInvalidCardPayment();
        await purchaseFlow.verifyCardPaymentError();
      });
    },
  );

  test(
    "TC14",
    {
      tag: ["@retry", "@Verify that after a successful payment, the system automatically redirects the user to the Virgil homepage."],
    },
    async ({ onboardingFlow, authFlow, purchaseFlow }) => {
      const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();
      const plans = getPlansForDepartment();

      await test.step("Fill form to sign up", async () => {
        await onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo!);
      });

      await test.step("Confirm email", async () => {
        await authFlow.activateSignedUpCustomer(customerInfo!.accountInfo.email!);
      });

      await test.step("Select a plan and submit payment", async () => {
        await purchaseFlow.selectPlanBeforePurchase("", customerInfo!.accountInfo.email!, plans[0]);
        await purchaseFlow.submitSubscriptionPayment();
      });

      await test.step("Verify redirect to Virgil homepage after successful payment", async () => {
        await onboardingFlow.redirectToHomePage();
      });
    },
  );

  test(
    "TC16",
    {
      tag: ["@retry", "@Verify that new member portal user can be signed up under an existing partner."],
    },
    async ({ loginPage, onboardingFlow, authFlow }) => {
      await test.step("Login to Admin portal", async () => {
        await loginPage.login();
      });

      const partnerInfo = await DataFactory.partnerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withPaymentOption("Member Portal Consumer")
        .withProductsType([plans[0]])
        .withBankTransfer(false)
        .withIsPublic(false)
        .build();

      await test.step("Create a new partner", async () => {
        await onboardingFlow.createPartnerAndAddPeoInAdminPortal(partnerInfo!);
      });

      const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();

      await test.step("Sign up new member under partner", async () => {
        let partnerCredential = await authFlow.getCredentialsFromEmail(partnerInfo.accountInfo?.email!, getEmailSubjectByDepartment().CUSTOMER_ACC_ACTIVATE);

        await onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo!, partnerInfo!.partnerInfo!.name, partnerCredential.loginUrl);
      });

      await test.step("Confirm email", async () => {
        await authFlow.activateSignedUpCustomer(customerInfo!.accountInfo.email!);
      });

      await test.step("Verify user is redirected to Select Plan screen", async () => {
        await onboardingFlow.verifyURL("register-success");
      });
    },
  );

  test(
    "TC54",
    {
      tag: ["@retry", "@Verify that a user can invite members to a team in the Member Portal – Organization tab."],
    },
    async ({ loginPage, onboardingFlow, authFlow, purchaseFlow }) => {
      const customerInfo = await DataFactory.customerBuilder().withPassword("Password@123").build();

      await test.step("Fill form to sign up", async () => {
        await onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo!);
      });

      await test.step("Confirm email", async () => {
        await authFlow.activateSignedUpCustomer(customerInfo!.accountInfo.email!);
      });

      await test.step("Select plan and submit payment", async () => {
        await purchaseFlow.selectPlanBeforePurchase("", customerInfo!.accountInfo.email!, plans[0]);
        await purchaseFlow.submitSubscriptionPayment();
      });

      await test.step("Verify redirect to home page", async () => {
        await onboardingFlow.redirectToHomePage();
      });

      const members: UserInfo[] = await CustomerFactory.generateMembers(2, "User");
      await test.step("Invite members via Organization tab", async () => {
        await loginPage.login();
        await onboardingFlow.inviteMemberInCusManagement(customerInfo!, members);
      });

      await test.step("Verify invited members accept and join team successfully", async () => {
        for (const member of members) {
          await authFlow.acceptInviteAndJoinTeamByCustomer(member.email, "Password@123");
          await onboardingFlow.redirectToHomePage();
        }
      });
    },
  );
});
