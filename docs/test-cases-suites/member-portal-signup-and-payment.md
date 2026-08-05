# Test Suite — Member Portal: Sign Up & Payment (B2C Smoke)

> **Source**: `docs/automation-docs/Smoke test - B2C_Latest.csv`, rows 1–16
> **Portal**: Member Portal
> **Scope**: **UI / E2E only.** Every case below is specified as a browser-driven end-to-end journey — navigate, click, type, read what the user sees. No step asserts an HTTP response body. API specs covering some of these rows exist under `tests/API/member-portal/` but are out of scope for this document and are **not** counted as coverage here.
> **Tags**: `@regression_UI`, `@member_portal`

## Test Data Reference

| Key | Value | Source |
|---|---|---|
| Sign-up password | `Password@123` | Convention used across all existing specs |
| Industry | `Accommodation` (code `ACCOMMODATION`) | `validIndustry` in `src/constant/static-data.ts` |
| Country | `United States` (code `US`) | `validCountry` in `src/constant/static-data.ts` |
| Plans (QA, department `VirgilHR`) | `ASO Essentials`, `ASO Expert`, `ASO Enterprise`, `ASO Ultimate` | `getPlansForDepartment()` via `src/constant/department.data.qa.ts` — use `plans[0]` unless a test needs a specific tier |
| Plans (UAT, department `VirgilHR`) | `1 - 100 Employees`, `101 - 250 Employees`, `251 - 500 Employees`, `500+ Employees & HR Consultants` | `src/constant/department.data.uat.ts` |
| Valid Stripe test card | `4242 4242 4242 4242`, exp `12/34`, CVC `123`, holder `Test User`, address `123 Test St`, city `Test City` | `validCardInfo` in `src/constant/static-data.ts` |
| Invalid Stripe test card | `4242 4242 4242 0000` (same exp/CVC/holder/address as above) → expect error text `Your card was declined.` | `inValidCardInfo` in `src/constant/static-data.ts` |
| Confirmation email subject | `Verify your email address` | `AuthFlow.activateSignedUpCustomer` |
| Partner activation email subject | `getEmailSubjectByDepartment().PARTNER_ACC_ACTIVATE` (`"HR Compliance - Partner Credential"` on QA) | `src/constant/department-data.ts` |
| Mailbox | Resolved from `MAILBOX_URL` — `AuthFlow.getCredentialsFromEmail` supports `yopmail` or `beeinbox` only | Root `.env` currently sets `beeinbox.com`; CI's `profile/.env.qa`/`.env.uat` set `tempemailfree.com`, which is **not** one of the two supported providers — flag to whoever owns CI env config, this would throw `Unsupported mailbox` if that credential-retrieval path is hit in a CI run |

---

### TC01 — Verify that the user can create a new account by clicking the Sign Up button.

**Priority**: High · **Status**: ✅ Automated — `tests/UI/member-portal/member-portal-signup-and-validation_TC01_TC02_TC03_TC04_TC05.spec.ts`

**Precondition**: User is on the Member Portal Sign Up page, no account yet.

| # | Step | Expected Result |
|---|---|---|
| 1 | Click the "Sign Up" button | Sign-up form is displayed |
| 2 | Fill the form with a fresh `DataFactory.customerBuilder().withPassword("Password@123").build()` payload and submit | Account is created |

---

### TC02 — Verify that the user can fill in all required information on the Sign Up screen.

**Priority**: Medium · **Status**: ✅ Automated (same file as TC01)

**Precondition**: User is on the Member Portal Sign Up page.

| # | Step | Expected Result |
|---|---|---|
| 1 | Click "Sign Up" | Form displayed |
| 2 | Fill all required fields (first/last name, email, password, company name, industry `Accommodation`, country `United States`) | All fields accept input |
| 3 | Submit | Account created successfully |

---

### TC03 — Verify that the email address is unique.

**Priority**: High · **Status**: ✅ Automated (same file)

**Precondition**: An account already exists with a known email (from a prior successful sign-up in this test).

| # | Step | Expected Result |
|---|---|---|
| 1 | Sign up again using `DataFactory.customerBuilder().withEmail(<existing email>).withPassword("Password@123").build()` | System rejects the sign-up |
| 2 | Observe the error message | "An account with this email id already exists" is shown |

---

### TC04 — Verify that all fields on the Sign Up screen are required (except for the HR System field).

**Priority**: Medium · **Status**: ✅ Automated (same file)

**Precondition**: User is on the Member Portal Sign Up page.

| # | Step | Expected Result |
|---|---|---|
| 1 | Submit the form leaving each required field blank in turn (name, email, password, company name, industry, country) | A validation error is shown per blank required field |
| 2 | Submit with only the HR System field blank, all others filled | Form submits successfully — HR System is optional |

---

### TC05 — Verify that after filling in all information and signing up, the user receives a confirmation email.

**Priority**: High · **Status**: ✅ Automated (same file)

**Precondition**: User has just signed up successfully.

| # | Step | Expected Result |
|---|---|---|
| 1 | Check the account's mailbox | Exactly one confirmation email ("Verify your email address") has been received |

---

### TC06 — Verify that the confirmation email is only valid for 24 hours.

**Priority**: Low · **Status**: ✅ Automated — `tests/UI/member-portal/member-portal-plan-selection-and-checkout_TC06_TC07_TC08_TC09_TC10.spec.ts`

⚠ **Data note**: automation validates the email's stated wording (e.g. "expires in 24 hours"), NOT actual link expiry — genuinely waiting 24h in a smoke test is impractical. If real expiry behavior needs coverage, that requires either a backend-clock hook or an accepted 24h-delayed job, neither of which exists today.

**Precondition**: User has just signed up.

| # | Step | Expected Result |
|---|---|---|
| 1 | Check the mailbox and inspect the confirmation email content | Email states the link is valid for 24 hours |

---

### TC07 — Verify that after confirming the email, the user is redirected to the Select Plan screen.

**Priority**: Medium · **Status**: ✅ Automated (same file)

**Precondition**: User has signed up and has a confirmation email pending.

| # | Step | Expected Result |
|---|---|---|
| 1 | Open the confirmation link from the mailbox | User is redirected; URL contains `register-success` |

---

### TC08 — On the Select Plan screen, the user can choose any available plan from the list.

**Priority**: High · **Status**: ✅ Automated (same file)

**Precondition**: User has confirmed their email and reached the Select Plan screen.

| # | Step | Expected Result |
|---|---|---|
| 1 | Select a plan (e.g. `plans[0]` = "ASO Essentials" on QA) | Plan is selected |
| 2 | Complete payment with the valid test card | User is redirected to the homepage |

---

### TC09 — After selecting a plan, the user can choose to pay annually or monthly, and apply a discount code.

**Priority**: Medium · **Status**: ✅ Automated (same file, tag `@TC09`) — the test loops both billing cycles

⚠ **Assertion gap**: the discount-code half of the case (step 3) is not covered and cannot be — see the blocker below.

**Precondition**: User has confirmed their email and reached the Select Plan screen.

| # | Step | Expected Result |
|---|---|---|
| 1 | Select a plan with the monthly option (`expiration = false`) | Monthly billing selected, payment succeeds |
| 2 | Repeat with the annual option (`expiration = true`) | Annual billing selected, payment succeeds |
| 3 | Apply a discount/coupon code before payment | **⚠ BLOCKED — no discount/coupon code field, flow, or test data exists anywhere in this codebase.** Confirm with product/QA whether the Buy Plan screen currently exposes a coupon field and obtain a valid QA/UAT test code before automating this step. |

---

### TC10 — After confirming the payment, the user is redirected to Stripe for checkout.

**Priority**: High · **Status**: ✅ Automated (same file)

**Precondition**: User has selected a plan.

| # | Step | Expected Result |
|---|---|---|
| 1 | Confirm the plan selection | Stripe payment form is displayed with card number, CVC, holder, address, and city fields visible |

---

### TC11 — On Stripe, the user enters card information and other related details.

**Priority**: Medium · **Status**: ✅ Automated — `tests/UI/member-portal/member-portal-payment-card-and-partner-signup_TC11_TC12_TC14_TC16.spec.ts`

**Precondition**: User has reached the Stripe payment form.

| # | Step | Expected Result |
|---|---|---|
| 1 | Fill card number `4242 4242 4242 4242`, expiry `12/34`, CVC `123`, holder `Test User`, address `123 Test St`, city `Test City` | Payment succeeds and user is redirected home |

---

### TC12 — Verify that only valid cards can be processed for payment.

**Priority**: High · **Status**: ✅ Automated (same file)

**Precondition**: User has reached the Stripe payment form.

| # | Step | Expected Result |
|---|---|---|
| 1 | Submit card `4242 4242 4242 0000` (invalid) with the same exp/CVC/holder/address | Error message `Your card was declined.` is shown |
| 2 | Retry with the valid card `4242 4242 4242 4242` | Payment succeeds |

---

### TC13 — Verify that all invalid cards are declined.

**Priority**: Medium · **Status**: ❌ Not automated as a distinct case — overlaps with TC12's single invalid-card assertion

⚠ **Data gap**: only one "invalid" card pattern (`4242 4242 4242 0000`) exists in this codebase. Stripe's own test-card matrix has distinct numbers for different decline reasons (e.g. `4000000000000002` generic decline, `4000000000009995` insufficient funds, `4000000000000069` expired card). Confirm with QA whether "all invalid cards" means broader coverage of that matrix, and which specific reasons are in scope, before automating this as a separate test case.

**Precondition**: User has reached the Stripe payment form.

| # | Step | Expected Result |
|---|---|---|
| 1 | Submit each card variant from the agreed decline-reason matrix | Each is declined with an appropriate error message |

---

### TC14 — Verify that after a successful payment, the system automatically redirects the user to the Virgil homepage.

**Priority**: High · **Status**: ✅ Automated (same file as TC11/TC12)

**Precondition**: User has submitted a valid payment.

| # | Step | Expected Result |
|---|---|---|
| 1 | Complete payment with the valid test card | User lands on the Virgil homepage |

---

### TC15 — Verify that after a successful payment, the user is granted access to Virgil according to the benefits included in the selected plan.

**Priority**: High · **Status**: ❌ Not automated in the UI

⚠ **BLOCKED — no benefit-to-UI mapping exists.** Nothing in this repo records which visible element corresponds to which plan benefit, so there is nothing to assert against after payment. Obtain from product/QA: for each plan (`ASO Essentials` → `ASO Ultimate` on QA), the list of included benefits and the Member Portal element each one unlocks (tile, menu item, page, or usage limit). Only then can this case be written as a UI test.

**Precondition**: User has completed payment for a specific plan (the state TC14 reaches).

| # | Step | Expected Result |
|---|---|---|
| 1 | Log in to the Member Portal as the paying user | Home page loads |
| 2 | Inspect each area that the purchased plan is supposed to unlock | Every benefit included in the plan is visible and usable (⚠ element list unknown) |
| 3 | Inspect an area belonging to a **higher** plan the user did not buy | It is absent, locked, or prompts an upgrade (⚠ expected treatment unspecified — confirm with product/QA) |

---

### TC16 — Verify that new member portal user can be signed up under an existing partner.

**Priority**: High · **Status**: ✅ Automated — `tests/UI/member-portal/member-portal-payment-card-and-partner-signup_TC11_TC12_TC14_TC16.spec.ts` (same file as TC11)

**Precondition**: An active partner account exists with Payment Option = `Member Portal Consumer` (`DataFactory.partnerBuilder().withPaymentOption("Member Portal Consumer").build()`).

| # | Step | Expected Result |
|---|---|---|
| 1 | Retrieve the partner's activation email (subject = `PARTNER_ACC_ACTIVATE`) and its login URL | Credential email received |
| 2 | Open the Member Portal sign-up page via that partner's URL (`loginUrl.replace("partner", "member")`) and provide the partner name | Sign-up form pre-associates the new user with the partner |
| 3 | Submit the sign-up | User account is created under the partner; redirected to `register-success` |
