# Test Suite — Admin Portal: Plan Auto-Renew, Upgrade & Renewal (B2C Smoke)

> **Source**: `docs/automation-docs/Smoke test - B2C_Latest.csv`, rows 71–84
> **Portal**: Admin Portal → Customer Management → account Details
> **Scope**: **UI / E2E only.** Every case below is specified as a browser-driven end-to-end journey. No step asserts an HTTP response body. There are no API specs for this area at all, so nothing is lost by that restriction — but it does mean every plan verification has to be read off the screen — the plan *name* now can be (see blocker 6), the subscription/renewal *dates* still cannot.
> **Tags**: `@regression_UI`, `@customer_management`

## Test Data Reference

| Key | Value | Source |
|---|---|---|
| Admin login | `process.env.ADMIN_USERNAME` / `ADMIN_PASSWORD` against `ADMIN_PORTAL_BASE_URL` | `loginPage.login()` |
| Customer payload | `DataFactory.customerBuilder().withDepartmentName(process.env.DEPARTMENT_NAME!).withBankStranfer(true).withCompanySize(plans[0]).withBankStranferToUpgradePlan(true).build()` | `tests/UI/admin-portal/customer-management.spec.ts` (TC71) |
| Current plan | `.withCompanySize(plans[0])` — `plans[0]` = `ASO Essentials` on QA. The plan tier is carried on `company.companySize` | `src/data-factory/customer-builder.ts` |
| Target upgrade plan | `plans[1]` = `ASO Expert` on QA (any higher index works) | `customer-management.spec.ts` (TC71) |
| Upgrade guard | `upgradePlan()` **throws** `"The current plan is maximun so it is impossible to upgrade"` if `companySize` contains `500+` — never seed a `500+` customer for an upgrade test | `src/ui/pages/admin-portal/customer-management-page.ts:116` |
| Bank Transfer at upgrade time | `.withBankStranferToUpgradePlan(true)` → toggles Bank Transfer in the modal, then clicks **Upgrade Now**. `false` → clicks **Request Payment** instead | `customer-management-page.ts:151-157` |
| Upgrade Plan modal buttons | `//button[contains(text(),'Upgrade to')]`, `//button[contains(text(),'Upgrade Now')]`, `//button[contains(text(),'Request Payment')]` | `src/ui/pages/admin-portal/locators/customer-management/upgrade-plan-modal.ts` |
| Bank Transfer toggle (modal) | `//span[contains(text(),'Bank Transfer')]/parent::label/following-sibling::div//span` | same file |
| Plan option (modal) | `//p[contains(text(),'planValue')]` — `planValue` is replaced with the target plan name | same file |
| Account lookup | The Details button is located by the customer's **phone number** (`detailButton` with `phoneNumberValue` replaced), then `.nth(2)` is clicked | `customer-management-page.ts:128-135` |
| Activation | `authFlow.activateAndChangePassIndividualCustomer(email, "Member", "Password@123")` | `src/ui/flows/auth.flow.ts` |
| Plans (QA) | `plans[0]`–`plans[3]` = `ASO Essentials`, `ASO Expert`, `ASO Enterprise`, `ASO Ultimate` | `src/constant/department.data.qa.ts` |
| Plans (UAT) | `1 - 100 Employees`, `101 - 250 Employees`, `251 - 500 Employees`, `500+ Employees & HR Consultants` | `src/constant/department.data.uat.ts` |
| Valid Stripe test card | `4242 4242 4242 4242`, `12/34`, `123`, `Test User`, `123 Test St`, `Test City` | `validCardInfo` |
| Plan read-back (UI) | ✅ Current plan only: `CustomerDetailModalLocator.subscriptionPlan` reads the Customer Details modal → Subscription section (`License Infomation` → `Billing Info` → `Subscription plan`). Asserted via `OnboardingFlow.verifySubscriptionPlanOfCustomer(customer, expectedPlan)`, which reloads (the upgrade leaves the stale Details modal open), reopens `Details`, then asserts. ⚠ Start/end date, renewal date and Member-Portal read-back still have no locator — see blocker 6. | `src/ui/pages/admin-portal/locators/customer-management/customer-detail-modal.ts`, `src/ui/flows/onboarding.flow.ts` |

---

## ⚠ Read this before automating anything in this suite

**Only the Upgrade Plan path exists in this codebase. The Auto-Renew Plan feature is entirely absent, and 13 of these 14 cases have zero automation.**

| Concern | State of the repo |
|---|---|
| Upgrade Plan | ✅ Modelled — `CustomerManagementPage.upgradePlan()` + `UpgradePlanModalLocator` (5 locators) |
| Auto-Renew Plan | ❌ **Nothing.** No page object, no locator, no flow method, no API service call. A repo-wide search for `autoRenew` / `Auto-Renew` / `Renew` returns only `nextRenewDate` inside plan-response *type* definitions (`src/objects/i500EmployeesPlan.ts`) and the platinum data generator — never a UI or action. |
| Cancel scheduled renewal | ❌ Nothing |
| Renewal on expiry (no Auto-Renew) | ❌ Nothing |

**Blocking data gaps that apply to the whole Auto-Renew group (TC74–TC78, TC83):**

1. **No way to reach a renewal event inside a test.** Renewal fires when a subscription expires. Nothing in this repo can shorten, fast-forward, or force a subscription period, and QA smoke tests cannot wait out a real billing cycle. Automating TC75, TC76, TC77 and TC83 requires **one** of: a backend/admin hook to set an expiry date, a test-only "force renew" endpoint, or an agreed manual-only classification. Ask product/engineering which exists.
2. **The Auto-Renew Plan modal is undocumented.** Which fields it exposes (benefit editing, price editing, effective date, cancel control), what the buttons are called, and what confirmation it shows are all unknown. Locators cannot be written from the CSV alone.
3. **"Modify the plan's benefits and price" (TC74) has no data contract.** No benefit-editing or price-editing test data exists anywhere in the repo. The editable fields, their valid ranges, and the currency/format must be supplied.
4. ~~**"Official account" (TC75) is undefined.**~~ **Resolved from the UI**: the `Add New Customer` modal's `Subscription Type` field offers exactly `Official Subscription` and `Free Trial` (`CreateNewCustomerModalLocator.officialSubscription` / `.freeTrial`), so an "official account" is one created with `Official Subscription`. Worth a one-line confirmation from QA, but no longer blocking. Note the *other* half of that gap still bites: `CustomerBuilder` has no `withFreeTrial(...)` setter, so a test cannot create the Free Trial contrast case (see `admin-portal-customer-management-create-account.md`, blocker 1).
5. **Payment-method validity at renewal (TC77) needs Stripe fixtures.** Only one "invalid" card (`4242 4242 4242 0000`) exists, and it fails at *entry* time — not the same as a stored payment method that is valid at setup and invalid at renewal. A Stripe test scenario for a failing stored card is required.
6. **Plan name read-back now exists; dates still do not.** ✅ The current plan is readable from the Admin Portal Customer Details modal → Subscription section via `CustomerDetailModalLocator.subscriptionPlan` (`//span[text()='Subscription plan']/parent::label/following-sibling::p`), asserted through `OnboardingFlow.verifySubscriptionPlanOfCustomer(customer, expectedPlan)` — TC71 uses it. ⚠ Still missing: locators for the subscription start/end date, the renewal date, and any Member-Portal-side plan read-back, so TC73, TC79 and TC81 remain only partly verifiable.

**Recommendation**: automate TC72, TC80 and TC84 now (reachable with existing locators), reuse `verifySubscriptionPlanOfCustomer` for the plan-name half of TC73, TC79 and TC81 and add the date read-back locators for the rest, and hold TC74–TC78 and TC82–TC83 as manual until items 1–5 are resolved.

---

### TC71 — Verify that the admin can auto-renew or upgrade a team's (Owner account's) plan in Customer Management.

**Priority**: High · **Status**: ✅ Automated — `tests/UI/admin-portal/customer-management.spec.ts` (tag `@TC71`)

⚠ **Coverage gap**: the test covers the **Upgrade** half only. The Auto-Renew half cannot be covered — that feature is absent from the repo (see the suite note). The upgrade result is now asserted (step 6).

**Precondition**: Admin is logged in. A customer exists, created from Customer Management with `bankStranfer = true`, `companySize = plans[0]`, `bankStranferToUpgradePlan = true`, and has been activated (`"Member"`, `Password@123`).

| # | Step | Expected Result |
|---|---|---|
| 1 | Create the customer from the Customer Management page and verify it is visible | Customer appears by email |
| 2 | Activate the customer and change the password to `Password@123` | Customer can log in to the Member Portal |
| 3 | Log back in as admin, open the customer's Details page, and open the plan modal | Upgrade Plan modal is displayed |
| 4 | Select `plans[1]` (`ASO Expert`) and click "Upgrade to …" | Plan selection accepted |
| 5 | Toggle Bank Transfer ON and click "Upgrade Now" | Upgrade is applied |
| 6 | Reopen the customer's `Details` modal and read the plan in the Subscription section | ✅ **Asserted** — `verifySubscriptionPlanOfCustomer(customerInfo, plans[1])` reloads (the upgrade leaves the stale Details modal open), reopens `Details`, and asserts `Billing Info` → `Subscription plan` contains `plans[1]` |
| 7 | Repeat via the Auto-Renew Plan control | ⚠ **BLOCKED** — feature not modelled (see the suite note) |

---

### TC72 — Verify that only the Owner of a team can have their plan auto-renewed or upgraded.

**Priority**: High · **Status**: ✅ Automated — `tests/UI/admin-portal/admin-portal-plan-upgrade-eligibility_TC72_TC80_TC84.spec.ts` (tag `@TC72`) · **Last run: ✅ passed** (2026-08-05, UAT, 152s)

> Asserts both directions: `verifyUpgradePlanAvailable(owner)` as the positive control and `verifyUpgradePlanNotAvailable(invitedMember)` as the negative. The auto-renew half of the case title remains 🚫 — that feature is not modelled.

**Precondition**: A team exists whose Owner has a plan, plus at least one Admin-role and one User-role member (created via `CustomerFactory.generateMembers(1, "Admin" | "User")` and invited per TC56).

| # | Step | Expected Result |
|---|---|---|
| 1 | Open the **Owner** account's Details page in Customer Management | The plan/Upgrade control is available |
| 2 | Open an **Admin**-role member's Details page | No plan/Upgrade control is offered |
| 3 | Open a **User**-role member's Details page | No plan/Upgrade control is offered |

⚠ **Automatable with existing machinery** — the negative assertion needs a new "plan control is not visible" check on `CustomerManagementPage`, but the setup (create customer → invite Admin and User members) is fully covered by TC56's steps.

---

### TC73 — Verify that after performing an auto-renew or upgrade, the team's plan is successfully renewed or upgraded.

**Priority**: High · **Status**: ❌ Not automated

**Precondition**: As TC71.

| # | Step | Expected Result |
|---|---|---|
| 1 | Upgrade the team's plan from `plans[0]` to `plans[1]` | Upgrade completes |
| 2 | Read the team's active plan — in the Admin Portal Customer Details modal, and again after logging in to the Member Portal as the Owner | Both show `plans[1]`. Admin side is covered by `verifySubscriptionPlanOfCustomer`; ⚠ the Member Portal read-back still has no locator (blocker 6) |
| 3 | Perform an auto-renew and verify the renewed plan | ⚠ **BLOCKED** — Auto-Renew feature not modelled, and there is no way to trigger a renewal event (see the suite note, items 1–2) |

> Step 2 is exactly the assertion missing from TC71. Implement it once and both cases benefit; TC73 may then be redundant with TC71 for the upgrade half — confirm with QA whether to merge.

---

### TC74 — Verify that the Auto-Renew Plan function allows the admin to modify the plan's benefits and price when the plan is renewed.

**Priority**: High · **Status**: ❌ Not automated

⚠ **BLOCKED — feature absent and no data contract.** Requires the Auto-Renew modal's field inventory *and* the benefit/price test data (suite note, items 2–3).

**Precondition**: Admin is on an Owner account's Details page with an active subscription.

| # | Step | Expected Result |
|---|---|---|
| 1 | Open the Auto-Renew Plan control | Auto-Renew configuration is displayed |
| 2 | Modify the plan's benefits and price for the next term | Changes are accepted and saved |
| 3 | Verify the saved configuration | The pending renewal reflects the modified benefits and price |

---

### TC75 — Verify that for official accounts, the Auto-Renew Plan does not change the plan immediately, but only when the account's current subscription expires.

**Priority**: High · **Status**: ❌ Not automated

⚠ **BLOCKED — three unknowns**: the definition of "official account" (suite note item 4), the Auto-Renew UI (item 2), and any way to reach expiry (item 1).

**Precondition**: An "official" Owner account with an active, unexpired subscription.

> ✅ **"Official account" is resolvable from the UI after all** — the `Add New Customer` modal's `Subscription Type` field offers exactly two options, `Official Subscription` and `Free Trial` (`CreateNewCustomerModalLocator.officialSubscription` / `.freeTrial`). "Official account" almost certainly means a customer created with `Official Subscription`. Confirm the reading with product/QA, but treat blocker 4 as effectively answered.

| # | Step | Expected Result |
|---|---|---|
| 1 | Configure Auto-Renew with a different plan/benefits | Configuration saved |
| 2 | Immediately verify the account's active plan | Plan is **unchanged** — still the current subscription |
| 3 | Advance to (or wait for) the subscription's expiry | The new configuration takes effect at expiry, not before |

> Step 2 alone is automatable the moment the Auto-Renew UI is modelled, and is the more valuable half — it catches premature application without needing an expiry hook. Consider splitting this case.

---

### TC76 — Verify that after renewal, all accounts using the Auto-Renew Plan function are renewed according to the predefined benefits and pricing setup.

**Priority**: High · **Status**: ❌ Not automated

⚠ **BLOCKED** — same as TC75, and additionally this is a *batch* assertion across multiple accounts, which needs the expiry hook (item 1) plus a defined account set.

**Precondition**: Several Owner accounts configured with Auto-Renew and known benefit/price setups.

| # | Step | Expected Result |
|---|---|---|
| 1 | Let (or force) all those subscriptions reach expiry | Renewals execute |
| 2 | For each account, verify the renewed plan | Benefits and price match the predefined Auto-Renew setup for that account |

---

### TC77 — Verify that the Auto-Renew Plan only works when the payment method is valid at the time of renewal.

**Priority**: High · **Status**: ❌ Not automated

⚠ **BLOCKED — needs a Stripe fixture for a stored card that fails at charge time** (suite note item 5), plus the expiry hook and Auto-Renew UI.

**Precondition**: An Owner account with Auto-Renew configured.

| # | Step | Expected Result |
|---|---|---|
| 1 | With a valid stored payment method, let the subscription renew | Renewal succeeds and the new plan applies |
| 2 | With an invalid/expired stored payment method, let the subscription renew | Renewal does **not** apply; the failure is surfaced (⚠ the expected failure state — error banner, email, subscription status value — is unspecified; obtain from product/QA) |

---

### TC78 — Verify that the admin can cancel a scheduled renewal before the plan renewal is executed.

**Priority**: Medium · **Status**: ❌ Not automated

⚠ **BLOCKED** — the cancel control is not modelled and its location/label is unknown (suite note item 2).

**Precondition**: An Owner account with a scheduled Auto-Renew that has not yet executed.

| # | Step | Expected Result |
|---|---|---|
| 1 | Open the account's Details page and cancel the scheduled renewal | Cancellation is confirmed |
| 2 | Verify the account's pending state | No scheduled renewal remains |
| 3 | Let the subscription reach expiry | The plan is **not** changed by the cancelled schedule (falls back to TC83's default behaviour) |

> Steps 1–2 become automatable as soon as the Auto-Renew UI is modelled; only step 3 needs the expiry hook.

---

### TC79 — Verify that the Upgrade Plan function allows the admin to upgrade an account to a higher plan than its current one.

**Priority**: High · **Status**: ❌ Not automated — no UI spec owns TC79

> ♻ **Reusable setup**: TC71 already performs the upgrade mechanism (`plans[0]` → `plans[1]`) via `upgradePlanForCustomer`. Missing: an owning test, the resulting-plan assertion, and the lower/equal-plan direction (steps 3–4).

**Precondition**: An activated Owner account on `plans[0]`.

| # | Step | Expected Result |
|---|---|---|
| 1 | Open the account's Details page → Upgrade Plan modal | Modal lists selectable plans |
| 2 | Select a **higher** plan (`plans[1]`) and confirm | Upgrade succeeds; the account's plan becomes `plans[1]` |
| 3 | Reopen the modal and check whether a **lower** plan (`plans[0]`) is offered | ⚠ **Unspecified — the CSV says "higher plan" but never states what happens with an equal or lower plan.** Today `upgradePlan()` throws `"The upgraded plan does not exist"` if the target isn't visible, which suggests lower plans are simply absent from the list — but that is inference, not a documented rule. Confirm with product/QA. |
| 4 | Attempt an upgrade on an account already on the top plan (`500+ …`) | Not possible — note that automation cannot even reach the UI here: `upgradePlan()` throws `"The current plan is maximun so it is impossible to upgrade"` client-side before navigating. A UI-level assertion needs a different helper. |

---

### TC80 — Verify that using the Upgrade Plan function allows toggling the Bank Transfer option.

**Priority**: Medium · **Status**: ✅ Automated (same file as TC72, tag `@TC80`) · **Last run: ✅ passed** (2026-08-05, UAT, 219s)

> Both branches asserted by outcome, not just by click: Bank Transfer **ON** → plan becomes `plans[1]` immediately; **OFF** → `Request Payment` is used and the plan stays on `plans[0]`. That second assertion also covers TC82's step 2.

**Precondition**: An activated Owner account on `plans[0]`.

| # | Step | Expected Result |
|---|---|---|
| 1 | Upgrade with `bankStranferToUpgradePlan = true` | Bank Transfer toggle is clicked, then the **Upgrade Now** button is used |
| 2 | Upgrade a second account with `bankStranferToUpgradePlan = false` | Bank Transfer is left off, and the **Request Payment** button is used instead |

> Fully automatable today — both branches already exist in `CustomerManagementPage.upgradePlan()`; only a second test case with the flag set to `false` is missing.

---

### TC81 — When Bank Transfer = ON, the user does not need to make a payment through Stripe, and the plan upgrade is applied immediately.

**Priority**: High · **Status**: ❌ Not automated — no UI spec owns TC81

> ♻ **Reusable setup**: TC71 performs this exact path (Bank Transfer ON → `Upgrade Now`), but asserts neither the immediate effect nor the absence of a payment request.

**Precondition**: An activated Owner account on `plans[0]`, upgraded with Bank Transfer ON.

| # | Step | Expected Result |
|---|---|---|
| 1 | Upgrade the account to `plans[1]` with Bank Transfer ON ("Upgrade Now") | Upgrade is submitted |
| 2 | Verify the account's plan straight away | Plan is **already** `plans[1]` — applied immediately, no pending state |
| 3 | Check the customer's mailbox | No payment-request email is sent |
| 4 | Log in as the customer | Home page loads — no Stripe screen |

⚠ **Data gap for step 3**: no email subject constant exists for a payment-request email (only `JOIN_TEAM`, `PARTNER_ACC_ACTIVATE`, `CUSTOMER_ACC_ACTIVATE` are defined). The step-3 negative check needs that subject to be meaningful — see TC82.

---

### TC82 — When Bank Transfer = OFF, the user receives an email to complete the payment through Stripe. Once the payment is completed, the plan is immediately upgraded.

**Priority**: High · **Status**: ❌ Not automated

⚠ **BLOCKED — missing test data**: the payment-request email's subject line is not defined anywhere in this codebase. `src/constant/department.data.qa.ts` / `.uat.ts` define only three subjects (`JOIN_TEAM`, `PARTNER_ACC_ACTIVATE`, `CUSTOMER_ACC_ACTIVATE`). Obtain the exact subject from product/QA and add it to both files before automating. The upgrade action itself is ready — `upgradePlan()` already clicks **Request Payment** when `bankStranferToUpgradePlan` is `false`.

**Precondition**: An activated Owner account on `plans[0]`.

| # | Step | Expected Result |
|---|---|---|
| 1 | Upgrade the account to `plans[1]` with Bank Transfer OFF ("Request Payment") | Request is submitted |
| 2 | Verify the account's plan | Plan is **still** `plans[0]` — the upgrade is pending payment |
| 3 | Check the customer's mailbox | A payment-request email is received (⚠ subject unknown) containing a link to complete payment via Stripe |
| 4 | Open the link and pay with the valid test card | Payment succeeds |
| 5 | Verify the account's plan | Plan is now `plans[1]`, applied immediately |

---

### TC83 — For accounts not using the Auto-Renew Plan function, the plan will be renewed on the subscription's expiration date with the same plan and current configuration at that time.

**Priority**: High · **Status**: ❌ Not automated

⚠ **BLOCKED** — requires reaching an expiry event (suite note item 1). Nothing else about this case is unclear; it is purely unreachable in a smoke test today.

**Precondition**: An Owner account with an active subscription and **no** Auto-Renew configuration.

| # | Step | Expected Result |
|---|---|---|
| 1 | Note the account's current plan and configuration | Baseline captured |
| 2 | Advance to (or wait for) the subscription's expiration date | Renewal executes automatically |
| 3 | Verify the renewed subscription | Same plan, same configuration as at expiry — nothing changed |

---

### TC84 — Verify that the Auto-Renew, Upgrade, and Renewal functions are only applicable to accounts that are not linked to any Partner/Consultant.

**Priority**: Medium · **Status**: ✅ Automated (same file as TC72, tag `@TC84`) · **Last run: ✅ passed** (2026-08-05, UAT, 137s)

> Uses route (b) from the precondition below — a Business created from the Partner Portal, whose owner is Partner-linked by construction. The run confirms `clickDetailButton` does locate that Business owner by phone number in Customer Management. The Auto-Renew third of the case title remains 🚫.

**Precondition**: Two Owner accounts —
> - **standalone**: created from Customer Management as in TC71;
> - **Partner-linked**: created through a UI route. Two exist: (a) sign up on the Member Portal selecting a Partner in the `HR System` field, the flow TC16 already automates; or (b) create a Business from the Partner Portal, whose Owner is partner-linked by construction — the state TC47 already reaches. Route (b) is the cheaper setup since it stops at the Admin Portal without needing a Stripe payment.
>
> Note the `Add New Customer` modal has **no partner field** — `customerBuilder().withPartner(partnerId)` targets the API payload only, so it cannot be used to build this precondition in a UI test.

| # | Step | Expected Result |
|---|---|---|
| 1 | Open the **standalone** Owner account's row → `Details` | The `Upgrade Plan` button is present |
| 2 | Open the **Partner-linked** Owner account's row → `Details` | The `Upgrade Plan` button is **absent** — plan changes for Partner-linked accounts happen through the Partner, not here |
| 3 | Repeat both for the Auto-Renew control | ⚠ **BLOCKED** — Auto-Renew is not modelled (suite note) |

⚠ **Automatable for the Upgrade half today** — the assertion is just "the `Upgrade Plan` button is not visible" using the existing `CustomerDetailModalLocator.customerDetailButton` locator, which is the same negative check TC72 needs. Write one helper, use it in both cases.
