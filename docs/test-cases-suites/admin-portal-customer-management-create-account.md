# Test Suite — Admin Portal: Customer Management (Create Account) (B2C Smoke)

> **Source**: `docs/automation-docs/Smoke test - B2C_Latest.csv`, rows 17–29
> **Portal**: Admin Portal → Customer Management
> **Scope**: **UI / E2E only.** Every case below is specified as a browser-driven end-to-end journey — navigate, click, type, read what the user sees. No step asserts an HTTP response body. API specs covering some of these rows exist under `tests/API/admin-portal/` but are out of scope for this document and are **not** counted as coverage here.
> **Tags**: `@regression_UI`, `@customer_management`

## Test Data Reference

| Key | Value | Source |
|---|---|---|
| Admin login | `loginPage.login()` — reads `ADMIN_USERNAME` / `ADMIN_PASSWORD` and `ADMIN_PORTAL_BASE_URL` | never hardcode credentials |
| Navigation | Left menu → `Management` → `Customer Management` (`CommonAdminPortalLocator.managementCategory` → `.customerManagement`) | `src/ui/pages/admin-portal/locators/common/common.locator.ts` |
| Customer payload | `DataFactory.customerBuilder().withDepartmentName(process.env.DEPARTMENT_NAME!).withBankStranfer(true).withCompanySize(plans[0]).build()` | `tests/UI/admin-portal/customer-management.spec.ts` |
| Department | `process.env.DEPARTMENT_NAME` (`VirgilHR` on QA/UAT) | `profile/.env.*` |
| Create-customer entry point | `Create new` button → `//button[contains(text(),'Create new')]` | `CommonCustomerLocator.createNewCustomerButton` |
| Modal title | `Add New Customer` | `CreateNewCustomerModalLocator.createButton` |
| Modal fields | First Name, Last Name, Email, Company Name, Job Title, Contact Number, Department, **Subscription Type**, Bank Transfer, Company Size, Pay Yearly, User Type (External/Internal), Business Type (Business/Consultant), Industry, Total Number of Employees, State(s), Content Availability | `src/ui/pages/admin-portal/locators/customer-management/new-customer-modal.ts` |
| Company Name value | Automation fills `<firstName> + "Company"` | `CustomerManagementPage.fillFormToCreateCustomer` |
| Subscription Type options | `Official Subscription` and `Free Trial` — Free Trial is selected via `selectRadio("Free Trial")` when `customer.freeTrial === true` | `new-customer-modal.ts`, `customer-management-page.ts:52` |
| Bank Transfer toggle | Clicked via `CreateNewPartnerModalLocator.bankTransfer` — see the ⚠ locator defect below | `customer-management-page.ts:55` |
| Company Size (= plan tier) | Only filled when Bank Transfer is ON: `.withCompanySize(plans[0])` | `customer-management-page.ts:56-58` |
| Billing cycle | `Pay Yearly` toggle is clicked only when `payYearly === false` (i.e. switch to monthly) | `customer-management-page.ts:60` |
| Content Availability | `United States` (default) or `Canada` | `customer-management-page.ts:99-100` |
| Submit | `Add New Customer` button, then `Confirm & Create` — the confirm step appears **only** when Bank Transfer is ON | `customer-management-page.ts:102-104` |
| Created-customer assertion | `onboardingFlow.verifyCustomerVisible(customerInfo)` — finds the customer's email text in the list, reloading once on failure | `src/ui/flows/onboarding.flow.ts:56-67` |
| Row → Details | Details button located by the customer's **phone number**: `//span[contains(text(),'<phone>')]/ancestor::td/following-sibling::td//button[contains(text(),'Details')]`, then `.nth(2)` | `CommonCustomerLocator.detailButton` |
| Detail actions | `View details` and `Upgrade Plan` buttons | `CustomerDetailModalLocator` |
| Plans (QA) | `plans[0]`–`plans[3]` = `ASO Essentials`, `ASO Expert`, `ASO Enterprise`, `ASO Ultimate` | `src/constant/department.data.qa.ts` |
| Plans (UAT) | `1 - 100 Employees`, `101 - 250 Employees`, `251 - 500 Employees`, `500+ Employees & HR Consultants` | `src/constant/department.data.uat.ts` |
| Credential email subject | `"HR Compliance: Your User Portal Credentials"` (QA) / `"VirgilHR - Your User Portal Credentials"` (UAT) | `getEmailSubjectByDepartment().CUSTOMER_ACC_ACTIVATE` |
| First-login activation | `authFlow.activateAndChangePassIndividualCustomer(email, "Member", "Password@123")` — opens the credential email, logs in with the temp password, then sets `Password@123` | `src/ui/flows/auth.flow.ts` |
| Change-password screen | URL contains `change-password` | `src/ui/flows/auth.flow.ts` |
| Select Plan screen | `onboardingFlow.validatePlanVisible()` | `src/ui/pages/partner-portal/flows/partnerportal.onboarding.flow.ts` |
| Buy a plan | `purchaseFlow.selectPlanBeforePurchase("", email, plan)` then `purchaseFlow.submitSubscriptionPayment()` | `src/ui/flows/purchase.flow.ts` |
| Home page assertion | `onboardingFlow.redirectToHomePage()` — waits for the `Home` heading | `src/ui/flows/onboarding.flow.ts:99` |
| Valid Stripe test card | `4242 4242 4242 4242`, `12/34`, `123`, `Test User`, `123 Test St`, `Test City` | `validCardInfo` |

---

## Convention — mailbox steps

**Do not automate the mailbox as a UI journey.** Where a case needs an account activated from its credential email, call the existing flow method and assume the email was sent:

```ts
await authFlow.activateAndChangePassIndividualCustomer(email, "Member", "Password@123");
```

That single call reads the credential email (`CUSTOMER_ACC_ACTIVATE` subject), fills the login form with the system-generated password, and changes the password — see `src/ui/flows/auth.flow.ts:123`. No step should describe opening a mailbox, locating a message, or clicking a link inside it.

The only cases that assert anything *about* an email are **TC23** and **TC24**, whose subject is the email itself. Everywhere else the mailbox is plumbing, and a failure there surfaces as this call throwing.

## ⚠ Blockers that apply to this whole suite

0. **No UI spec owns any of TC17–TC29.** There are eleven UI spec files in `tests/UI/**`; none contains a test titled or tagged for these rows. The create-customer journey *does* run — but only as setup for TC56 and TC71 in `tests/UI/admin-portal/customer-management.spec.ts`. This suite is the largest coverage hole in the whole B2C smoke set, and most of its machinery already exists (marked ♻ per case).
1. **No builder setter exists for `freeTrial`.** `CustomerInfo.freeTrial` is declared in `src/objects/customer.ts:10` (default `false`) and `fillFormToCreateCustomer` reads it to pick the Free Trial radio — but `CustomerBuilder` has **no** `withFreeTrial(...)` method. The Free Trial branch of the create-customer form is therefore **unreachable from a UI test today**. Add the setter before automating TC19 or TC29.
2. **`CreateNewCustomerModalLocator.bankTranfer` is a broken XPath.** It ends in `//span]` — an unbalanced bracket that throws on evaluation. Production code sidesteps it by borrowing `CreateNewPartnerModalLocator.bankTransfer` from the *partner* modal. Fix or delete the dead locator so nobody re-introduces it.
3. **Nothing in the repo reads a customer's subscription back from the Admin Portal UI.** There are no locators for the plan name, start/end date, or trial duration inside the `View details` view. Every case below that needs "verify the assigned plan" or "verify the trial length" requires those locators to be added first — this is the single biggest thing standing between this suite and full UI coverage.
4. **The plan-benefit notification email subject is undefined.** Only three subjects exist in this codebase (`JOIN_TEAM`, `PARTNER_ACC_ACTIVATE`, `CUSTOMER_ACC_ACTIVATE`). TC23 cannot be automated until product/QA supplies the real subject line and it is added to `src/constant/department.data.qa.ts` + `.uat.ts`.

---

### TC17 — Verify that the admin can create a new member account in Customer Management by clicking the Create New button.

**Priority**: High · **Status**: ✅ Automated — `tests/UI/admin-portal/admin-portal-customer-creation-and-credentials_TC17_TC20_TC22_TC24_TC25.spec.ts` (tag `@TC17`) · **Last run: ✅ passed** (2026-08-05, UAT, 44s)

**Precondition**: Admin is logged in to the Admin Portal.

| # | Step | Expected Result |
|---|---|---|
| 1 | Left menu → `Management` → `Customer Management` | Customer Management list is displayed |
| 2 | Click `Create new` | The `Add New Customer` modal opens |
| 3 | Fill the required fields with a `customerBuilder()` payload and submit (`Add New Customer`, then `Confirm & Create` when Bank Transfer is ON) | Modal closes without a validation error |
| 4 | Verify the new customer in the list (`verifyCustomerVisible`) | The customer's email is visible in the Customer Management list |

---

### TC18 — In the New Customer modal, the admin fills in the customer-related information.

**Priority**: Medium · **Status**: ❌ Not automated — no UI spec owns TC18

> ♻ **Reusable setup**: `fillFormToCreateCustomer` already fills every field in the modal. What is missing is a test that owns the case and asserts the values were *saved* (step 5).

**Precondition**: Admin is on Customer Management with the `Add New Customer` modal open.

| # | Step | Expected Result |
|---|---|---|
| 1 | Fill First Name, Last Name, Email, Company Name, Job Title, Contact Number | All text fields accept input |
| 2 | Select Department = `VirgilHR` from the dropdown | Department is selected |
| 3 | Select Industry (`Accommodation`), Total Number of Employees, State(s), and Content Availability (`United States`) | All selections are accepted |
| 4 | Submit the form | Customer is created and appears in the list by email |
| 5 | Open the customer's row → `Details` → `View details` and compare the saved values against what was entered | ⚠ **Not automated — no locators exist for the read-only detail view** (blocker 3). Add them to turn this from a "the form accepts input" case into a real save-and-verify case. |

---

### TC19 — In the New Customer modal, the admin can specify whether the account is a paid account or a free trial account.

**Priority**: Medium · **Status**: ❌ Not automated

⚠ **BLOCKED — `withFreeTrial(...)` does not exist** (blocker 1). The UI has the radio group (`Subscription Type` → `Official Subscription` / `Free Trial`) and `fillFormToCreateCustomer` already handles it, but no test can set the flag.

**Precondition**: Admin is on Customer Management with the `Add New Customer` modal open.

| # | Step | Expected Result |
|---|---|---|
| 1 | Locate the `Subscription Type` field | Both options are offered: `Official Subscription` and `Free Trial` |
| 2 | Select `Official Subscription`, complete the form, and submit | Customer is created as a paid account |
| 3 | Create a second customer selecting `Free Trial` and submit | Customer is created as a free-trial account |
| 4 | Open each customer's `View details` and compare their subscription type | ⚠ Requires the detail-view locators (blocker 3) |

---

### TC20 — In the New Customer modal, the admin can enable or disable Bank Transfer.

**Priority**: Medium · **Status**: ✅ Automated (same file, tag `@TC20`) · **Last run: ✅ passed** (2026-08-05, UAT, 72s)

> Covers both branches, and additionally asserts the plan chosen with Bank Transfer ON was actually assigned (`verifySubscriptionPlanOfCustomer`). Needs `dismissOpenModals()` between the plan check and the second creation — the Details modal otherwise blocks the left-menu click.

**Precondition**: Admin is on Customer Management with the `Add New Customer` modal open.

| # | Step | Expected Result |
|---|---|---|
| 1 | Toggle Bank Transfer **ON** | The Company Size (plan) and Pay Yearly fields become available |
| 2 | Select Company Size = `plans[0]`, submit, and click `Confirm & Create` | Customer is created with a pre-assigned plan |
| 3 | Create a second customer leaving Bank Transfer **OFF** | Customer is created; no Company Size step and **no** `Confirm & Create` dialog appears — the form submits in one click |

> The differing submit path (confirm dialog only when Bank Transfer is ON) is itself a good observable assertion for this case — it needs no new locators.

---

### TC21 — When Bank Transfer = ON, the user is assigned a plan and does not need to make a payment through Stripe.

**Priority**: High · **Status**: ❌ Not automated — no UI spec owns TC21

> ♻ **Reusable setup**: TC56/TC71 already create a Bank-Transfer-ON customer and activate it via `activateAndChangePassIndividualCustomer(email, "Member", "Password@123")`. The "lands on Home, never sees Stripe" outcome is what still needs asserting.

**Precondition**: Admin created a customer with Bank Transfer ON and Company Size = `plans[0]`.

| # | Step | Expected Result |
|---|---|---|
| 1 | `await authFlow.activateAndChangePassIndividualCustomer(customerInfo.accountInfo.email, "Member", "Password@123")` | Account activates and the password is changed |
| 2 | `await onboardingFlow.redirectToHomePage()` | Member Portal **Home** page — the Select Plan screen and the Stripe checkout are never shown |
| 3 | Log back in as admin and assert the pre-assigned plan: `await onboardingFlow.verifySubscriptionPlanOfCustomer(customerInfo, plans[0])` | The Customer Details modal → Subscription section shows `plans[0]` |

---

### TC22 — When Bank Transfer = OFF, the user selects a plan on the Select Plan screen and must complete the payment through Stripe.

**Priority**: High · **Status**: ✅ Automated (same file, tag `@TC22`) · **Last run: ✅ passed** (2026-08-05, UAT, 107s)

**Precondition**: Admin created a customer with Bank Transfer OFF.

| # | Step | Expected Result |
|---|---|---|
| 1 | `await authFlow.activateAndChangePassIndividualCustomer(customerInfo.accountInfo.email, "Member", "Password@123")` | Account activates and the password is changed |
| 2 | `await onboardingFlow.validatePlanVisible()` | The **Select Plan** screen is displayed — no plan was pre-assigned |
| 3 | `await purchaseFlow.selectPlanBeforePurchase("", customerInfo.accountInfo.email, plans[0])` | Stripe checkout opens |
| 4 | `await purchaseFlow.submitSubscriptionPayment()` | Payment succeeds with the valid test card |
| 5 | `await onboardingFlow.redirectToHomePage()` | Member Portal Home page loads |

> Fully automatable today — every step maps to an existing flow method. TC42 in `admin-portal-bank-transfer-and-credentials_TC40_TC41_TC42_TC43_TC44.spec.ts` is the same sequence for a partner and can be transposed almost line for line.

---

### TC23 — When Bank Transfer = ON, the user receives two emails after the account is successfully created: a credential email and a plan benefit notification email.

**Priority**: Medium · **Status**: ❌ Not automated

⚠ **BLOCKED — the plan-benefit notification email's subject line is unknown** (blocker 4). `EmailServicePage.validateReceivedTwoEmails()` exists and is used for the *partner* two-email case (TC43), but it takes a `Partner` object and checks the two partner subjects, so it cannot be reused here.

**Precondition**: Admin created a customer with Bank Transfer ON.

| # | Step | Expected Result |
|---|---|---|
| 1 | Open the new customer's mailbox | Two emails are listed |
| 2 | Verify the first | Subject = `"HR Compliance: Your User Portal Credentials"` |
| 3 | Verify the second | Subject = the plan-benefit notification (⚠ unknown) |

---

### TC24 — When Bank Transfer = OFF, the user receives one email after the account is successfully created: the credential email.

**Priority**: Medium · **Status**: ✅ Automated (same file, tag `@TC24`) · **Last run: ❌ FAILED** (2026-08-05, UAT — failed on two consecutive runs, so consistent rather than flaky)

⚠ **Open issue**: `validateReceivedOneEmailForCreatingCustomer` times out after 20s (`UI_ELEMENT_TIMEOUT_MS`) waiting for the beeinbox subject row for `"VirgilHR - Your User Portal Credentials"`. The email *does* arrive — **TC25 reads that same email successfully** via `getCredentialsFromEmail`, and TC58 passes with the same helper because the invitation email lands faster. The credential email simply exceeds the single 20s attach-wait. Options: switch step 4 to `getCredentialsFromEmail`, add refresh-polling to the mailbox helper, or skip until TC23's subject is known. See the tracker's open-issue section.

**Precondition**: Admin created a customer with Bank Transfer OFF.

| # | Step | Expected Result |
|---|---|---|
| 1 | Open the new customer's mailbox | Exactly **one** email is listed |
| 2 | Verify its subject | `"HR Compliance: Your User Portal Credentials"` — no plan-benefit email |

⚠ **To automate**: needs a customer-flavoured counterpart to `validateReceivedOneEmail(partnerInfo)`, which currently accepts only a `Partner`. Note this case is *not* blocked on the unknown TC23 subject — asserting a mailbox contains exactly one message with a known subject does not require knowing the subject of the message that must be absent.

---

### TC25 — Verify that the user can successfully log in using the credentials provided in the credential email.

**Priority**: High · **Status**: ✅ Automated (same file, tag `@TC25`) · **Last run: ✅ passed** (2026-08-05, UAT, 77s)

**Precondition**: Admin created a customer successfully. **Assume the credential email was sent.**

| # | Step | Expected Result |
|---|---|---|
| 1 | `await authFlow.activateAndChangePassIndividualCustomer(customerInfo.accountInfo.email, "Member", "Password@123")` | The call retrieves the credentials, submits them, and completes the password change — login was accepted rather than rejected |
| 2 | `await onboardingFlow.redirectToHomePage()` | Member Portal Home page loads, confirming a working session |

---

### TC26 — For accounts that use a system-generated password for the first login, the system will require the user to change it to a personal password.

**Priority**: Medium · **Status**: ✅ Automated — `tests/UI/admin-portal/admin-portal-customer-first-login-and-payment_TC26_TC27_TC28.spec.ts` (tag `@TC26`) · **Last run: ✅ passed** (2026-08-05, UAT, 81s)

**Precondition**: Admin created a customer; the user has never logged in. **Assume the credential email was sent** — do not walk the mailbox UI (see the note above).

| # | Step | Expected Result |
|---|---|---|
| 1 | `await authFlow.activateAndChangePassIndividualCustomer(customerInfo.accountInfo.email, "Member", "Password@123")` | The flow reaches the change-password screen with the system-generated password, sets `Password@123`, and the session proceeds |
| 2 | Assert the change-password screen was required: `await onboardingFlow.verifyURL("change-password")` | URL contains `change-password` — the step was mandatory, not skipped |

⚠ **Assertion note**: step 2 must run *inside* the login sequence to be meaningful, but `activateAndChangePassIndividualCustomer` performs login **and** password change in one call, so by the time it returns the screen is gone. Either split the flow into `login` + `changePassword` for this test, or add a `verifyChangePasswordRequired` variant to `AuthFlow`. Without that, the case can only prove the sequence completed — not that the change was compulsory.

---

### TC27 — When Bank Transfer = ON, after changing the password, the user is redirected directly to the Homepage with the pre-assigned plan.

**Priority**: High · **Status**: ✅ Automated (same file as TC26, tag `@TC27`) · **Last run: ✅ passed** (2026-08-05, UAT, 90s)

**Precondition**: Customer created with Bank Transfer ON and Company Size = `plans[0]`; first login pending. **Assume the credential email was sent.**

| # | Step | Expected Result |
|---|---|---|
| 1 | `await authFlow.activateAndChangePassIndividualCustomer(customerInfo.accountInfo.email, "Member", "Password@123")` | First login and password change complete |
| 2 | `await onboardingFlow.redirectToHomePage()` | Member Portal **Home** page loads directly — no Select Plan screen in between |
| 3 | Log back in as admin and assert the assigned plan: `await onboardingFlow.verifySubscriptionPlanOfCustomer(customerInfo, plans[0])` | The Customer Details modal → Subscription section shows `plans[0]` — the plan the admin pre-assigned |

> ✅ Step 3 became writable when `CustomerDetailModalLocator.subscriptionPlan` and `verifySubscriptionPlanOfCustomer` were added (TC71 already uses them). A Member-Portal-side plan read-back would be stronger — it would prove the *user* sees the plan — but the Admin-Portal read-back is sufficient for this case's wording.

---

### TC28 — When Bank Transfer = OFF, after changing the password, the user is redirected to the Select Plan screen to choose and purchase a plan.

**Priority**: High · **Status**: ✅ Automated (same file as TC26, tag `@TC28`) · **Last run: ✅ passed** (2026-08-05, UAT, 120s)

**Precondition**: Customer created with Bank Transfer OFF; first login pending. **Assume the credential email was sent.**

| # | Step | Expected Result |
|---|---|---|
| 1 | `await authFlow.activateAndChangePassIndividualCustomer(customerInfo.accountInfo.email, "Member", "Password@123")` | First login and password change complete |
| 2 | `await onboardingFlow.validatePlanVisible()` | The **Select Plan** screen is displayed — no plan was pre-assigned |
| 3 | `await purchaseFlow.selectPlanBeforePurchase("", customerInfo.accountInfo.email, plans[0])` then `await purchaseFlow.submitSubscriptionPayment()` | Stripe checkout completes with the valid test card |
| 4 | `await onboardingFlow.redirectToHomePage()` | Member Portal Home page loads |

> TC22 and TC28 describe the same journey from different entry points (TC22 starts at account creation, TC28 starts at the password change). Consider merging them into one UI test with both assertions, and confirm with QA which ID to keep.

---

### TC29 — For Free Trial accounts, the user is also assigned a plan along with a limited number of free usage days.

**Priority**: Medium · **Status**: ❌ Not automated in the UI

⚠ **BLOCKED — two gaps**: (a) `withFreeTrial(...)` does not exist, so the Free Trial radio cannot be selected from a test (blocker 1); (b) **no UI locator for the trial duration exists** — the `Add New Customer` modal has no trial-days input, and nothing reads a remaining-days value back from either portal. Confirm with product/QA whether the trial length is admin-configurable in this modal or fixed server-side (the API path uses `trialDays: 30`), and capture the locator for wherever the remaining days are displayed.
>
> The **plan** half of this case is no longer blocked — `verifySubscriptionPlanOfCustomer` can assert it (step 2). Only the "limited number of free usage days" half is stuck.

> The CSV numbers this row 29. The API spec covering it is tagged `@TC030`, which also collides with the partner-management `@TC030`. When the UI case is written, tag it `@TC29` and fix the API collision separately.

**Precondition**: Admin is on Customer Management with the `Add New Customer` modal open. **Assume the credential email is sent** when the account is activated in step 3.

| # | Step | Expected Result |
|---|---|---|
| 1 | Select `Subscription Type` = `Free Trial`, complete the form, and submit | Customer is created as a free-trial account (⚠ needs `withFreeTrial(...)`) |
| 2 | `await onboardingFlow.verifySubscriptionPlanOfCustomer(customerInfo, plans[0])` | The Customer Details modal → Subscription section shows the assigned plan |
| 3 | `await authFlow.activateAndChangePassIndividualCustomer(customerInfo.accountInfo.email, "Member", "Password@123")` then `await onboardingFlow.redirectToHomePage()` | The trial account activates and reaches the Member Portal Home page |
| 4 | Read the remaining free trial days | The trial length matches what was configured (⚠ **locator missing** — this is the blocked half) |
