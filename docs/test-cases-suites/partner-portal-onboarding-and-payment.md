# Test Suite — Partner Portal: Onboarding & Payment (B2C Smoke)

> **Source**: `docs/automation-docs/Smoke test - B2C_Latest.csv`, rows 48–53
> **Portal**: Partner Portal (set up from the Admin Portal)
> **Scope**: **UI / E2E only.** Every case below is specified as a browser-driven end-to-end journey. No step asserts an HTTP response body. There are no API specs for these rows, so nothing is lost by that restriction.
> **Tags**: `@regression_UI`, `@partner_portal`

## Test Data Reference

| Key | Value | Source |
|---|---|---|
| Admin login | `process.env.ADMIN_USERNAME` / `ADMIN_PASSWORD` against `ADMIN_PORTAL_BASE_URL` | `loginPage.login()` |
| Partner Portal URL | `partnerPage.getURL()` (from `PARTNER_PORTAL_BASE_URL`) | `src/ui/pages/partner-portal` |
| Department | `process.env.DEPARTMENT_NAME` (`VirgilHR` on QA/UAT) | `profile/.env.*` |
| Partner payload | `DataFactory.partnerBuilder().withDepartmentName(process.env.DEPARTMENT_NAME!).withPaymentOption(...).withProductsType([plans[0]]).withBankTransfer(...).build()` | `src/data-factory/partner-builder.ts` |
| Plans (QA) | `plans[0]`–`plans[3]` = `ASO Essentials`, `ASO Expert`, `ASO Enterprise`, `ASO Ultimate` | `src/constant/department.data.qa.ts` |
| Plans (UAT) | `1 - 100 Employees`, `101 - 250 Employees`, `251 - 500 Employees`, `500+ Employees & HR Consultants` | `src/constant/department.data.uat.ts` |
| Partner credential email | `"HR Compliance - Partner Credential"` (QA) | `getEmailSubjectByDepartment().PARTNER_ACC_ACTIVATE` |
| First-login activation | `authFlow.activateAndChangePassIndividualCustomer(email, "Partner portal", "Password@123")` — reads the temp password from the credential email, logs in, then changes to `Password@123` | `src/ui/flows/auth.flow.ts` |
| Valid Stripe test card | `4242 4242 4242 4242`, `12/34`, `123`, `Test User`, `123 Test St`, `Test City` | `validCardInfo` |
| Buy plan (Partner Portal) | `purchaseFlow.buyPlanInPartnerPortal(partnerInfo)` — end-to-end select-plan + pay | `src/ui/flows/purchase.flow.ts` |
| Select plan only | `purchaseFlow.selectPlanBeforePurchase("", email, plan)` then `purchaseFlow.submitSubscriptionPayment()` | `src/ui/flows/purchase.flow.ts` |
| Stripe form check | `purchaseFlow.verifyStripePaymentFormCorrectDisplay()` | `src/ui/flows/purchase.flow.ts` |
| Home page check | `onboardingFlow.redirectToHomePage()` — waits for the home title to become visible | `src/ui/flows/onboarding.flow.ts` |
| Business Owner payload | `PersonDataGenerator.generate({ emailDomain: "ussteel.xyz" })` | Existing partner-portal specs |

⚠ **Note on `withIsPublic`**: unlike the Admin-Portal partner specs, the TC48–TC53 specs do **not** set `.withIsPublic(false)`. Test partners created by this suite may therefore land in the public partner list on QA/UAT. Add `.withIsPublic(false)` for consistency unless a public partner is deliberately required.

---

### TC48 — Verify that after the first login, the system requires the partner user to change the system-generated password to a personal password.

**Priority**: Medium · **Status**: ✅ Automated — `tests/UI/partner-portal/partner-portal-onboarding-payment_TC48_TC49_TC50_TC51_TC52.spec.ts`

**Precondition**: Admin is logged in. Partner created with `paymentOption = "Partner/Consultant Owner"`, `bankTransfer = true`, `productsType = [plans[0]]`.

| # | Step | Expected Result |
|---|---|---|
| 1 | Create the partner and verify it is visible in Partner Management | Partner appears by email |
| 2 | Read the credential email, log in to the Partner Portal with the system-generated password | System redirects to the change-password screen (URL contains `change-password`) |
| 3 | Set the personal password `Password@123` | Password is accepted |
| 4 | Verify the landing page | Partner Portal home page loads |

---

### TC49 — Verify that after a successful login, the partner user proceeds to make a payment through Stripe when Payment Options = Partner/Consultant Owner and Bank Transfer = OFF.

**Priority**: High · **Status**: ✅ Automated (same file)

**Precondition**: Partner created with `paymentOption = "Partner/Consultant Owner"`, `bankTransfer = false`, `productsType = [plans[0]]`.

| # | Step | Expected Result |
|---|---|---|
| 1 | Create the partner and verify it is visible | Partner created |
| 2 | Activate the partner (`"Partner portal"`, `Password@123`) | Reaches the Partner Portal |
| 3 | Select the plan `partnerInfo.partnerInfo.productsType[0]` (= `plans[0]`) | Select Plan screen accepts the choice and proceeds to Stripe |
| 4 | Verify the Stripe payment form (`verifyStripePaymentFormCorrectDisplay`) | Card number, expiry, CVC, holder, address and city fields are all displayed |
| 5 | Submit payment with the valid test card | Payment succeeds |
| 6 | Verify the landing page | Partner Portal home page loads |

---

### TC50 — After a successful payment, the partner user is redirected to the Partner Homepage.

**Priority**: High · **Status**: ✅ Automated (same file)

**Precondition**: Partner created with `paymentOption = "Partner/Consultant Owner"`, `bankTransfer = false`, `productsType = [plans[0]]`.

| # | Step | Expected Result |
|---|---|---|
| 1 | Create the partner and verify it is visible | Partner created |
| 2 | Activate the partner (`"Partner portal"`, `Password@123`) | Password changed |
| 3 | Buy the plan (`buyPlanInPartnerPortal`) with the valid test card | Payment succeeds |
| 4 | Verify the landing page | Partner Portal home page loads |

> Overlaps heavily with TC49 — TC49 additionally asserts the Stripe form contents, TC50 uses the one-call `buyPlanInPartnerPortal` helper. Keep both only if QA wants the Stripe-form assertion isolated; otherwise TC50 is redundant.

---

### TC51 — Verify that for other payment configurations, the partner user is not required to make any payment through Stripe.

**Priority**: High · **Status**: ✅ Automated (same file, tag `@TC51`)

⚠ **Coverage gap**: the test covers only one configuration — Partner/Consultant Owner + Bank Transfer = ON. See the matrix below for what "other payment configurations" leaves untested.

**Precondition**: Partner created with `paymentOption = "Partner/Consultant Owner"`, `bankTransfer = true`, `productsType = [plans[0]]`.

| # | Step | Expected Result |
|---|---|---|
| 1 | Create the partner and verify it is visible | Partner created |
| 2 | Activate the partner (`"Partner portal"`, `Password@123`) | Password changed |
| 3 | Verify the landing page | Partner Portal home page loads directly — no Select Plan screen, no Stripe |

⚠ **Data gap — "other payment configurations" is undefined**: the CSV does not enumerate them. Given the two dimensions in this product (Payment Option × Bank Transfer), the four combinations are:

| Payment Option | Bank Transfer | Stripe payment required in Partner Portal? | Covered by |
|---|---|---|---|
| Partner/Consultant Owner | OFF | Yes | TC49 / TC50 |
| Partner/Consultant Owner | ON | No | **TC51 (this case)** |
| Member Portal Consumer | ON | No | TC36, TC45, TC46 |
| Member Portal Consumer | OFF | ⚠ **Unknown — untested and unspecified** | *nothing* |

Confirm with product/QA what is expected for Member Portal Consumer + Bank Transfer = OFF (does the Partner still skip payment, and does the Business Owner pay in the Member Portal instead?) before extending this case.

---

### TC52 — Verify that when Payment Options = Partner/Consultant Owner, the partner account is both the Owner of the Partner Team and the Owner of all Businesses under it.

**Priority**: High · **Status**: ✅ Automated (same file)

**Precondition**: Partner created with `paymentOption = "Partner/Consultant Owner"`, `bankTransfer = true`, `productsType = [plans[0]]`.

| # | Step | Expected Result |
|---|---|---|
| 1 | Create the partner and verify it is visible | Partner created |
| 2 | Activate the partner (`"Partner portal"`, `Password@123`) | Reaches the Partner Portal |
| 3 | Create a Business, passing a generated person (`emailDomain: "ussteel.xyz"`) as an invited member | Business is created |
| 4 | Verify the Owner label on the Business (`verifyOwnerVisible`) | The **Partner** account is the Business Owner — the invited person is not |
| 5 | Verify the Owner role on the Users page (`verifyOwnerRoleInUserPage(partnerInfo)`) | The Partner account holds the Owner role on the Partner Team |

⚠ **Data note**: automation creates exactly **one** Business. "Owner of *all* Businesses" is not fully proven. Extend step 3 to create ≥2 Businesses if QA needs that literal assertion.

---

### TC53 — Verify that when Payment Options = Member Portal Consumer, the partner account is the Owner of the Partner Team, while each Business has its own Owner.

**Priority**: High · **Status**: ✅ Automated — `tests/UI/partner-portal/partner-portal-business-ownership-member-consumer_TC53.spec.ts`

**Precondition**: Partner created with `paymentOption = "Member Portal Consumer"`, `productsType = [plans[0]]`.

| # | Step | Expected Result |
|---|---|---|
| 1 | Create the partner and verify it is visible | Partner created |
| 2 | Activate the partner (`"Partner portal"`, `Password@123`) | Reaches the Partner Portal |
| 3 | Create a Business supplying a generated owner (`emailDomain: "ussteel.xyz"`) | Business is created |
| 4 | Verify the Owner label on the Business (`verifyOwnerVisible`) | The Business has its **own** Owner — the generated person, not the Partner |
| 5 | Verify the Owner role on the Users page (`verifyOwnerRoleInUserPage(partnerInfo)`) | The Partner account still holds the Owner role on the Partner Team |

⚠ **Data note**: `verifyOwnerVisible()` only asserts that an "Owner" label is present on the Business — it does **not** assert *which* email holds it. TC52 and TC53 therefore share the same assertion despite expecting opposite owners. To make these cases genuinely distinguishing, the assertion needs to compare the Owner cell against a specific email (the partner's for TC52, the generated person's for TC53). Flagging as a real coverage weakness, not a data gap.
