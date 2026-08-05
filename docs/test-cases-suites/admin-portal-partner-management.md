# Test Suite — Admin Portal: Partner Management (B2C Smoke)

> **Source**: `docs/automation-docs/Smoke test - B2C_Latest.csv`, rows 30–47
> **Portal**: Admin Portal → Partner Management
> **Scope**: **UI / E2E only.** Every case below is specified as a browser-driven end-to-end journey. No step asserts an HTTP response body, a database value, or an internal numeric code. Where the CSV's intent was previously only provable through an API call, the case states the **UI-visible** equivalent and flags what is missing. API specs exist under `tests/API/admin-portal/` but are out of scope and are **not** counted as coverage here.
> **Tags**: `@regression_UI`, `@partner_management`

## Test Data Reference

| Key | Value | Source |
|---|---|---|
| Admin login | `loginPage.login()` — reads `ADMIN_USERNAME` / `ADMIN_PASSWORD` and `ADMIN_PORTAL_BASE_URL` | never hardcode credentials |
| Navigation | Left menu → `Management` → `Partner Management` (`partnerManagementPage.accessToManagementPage("Partner")`) | `src/ui/pages/admin-portal/partner-management-page.ts` |
| Partner payload | `DataFactory.partnerBuilder().withDepartmentName(process.env.DEPARTMENT_NAME!).withPaymentOption(...).withProductsType([plans[0]]).withBankTransfer(...).withIsPublic(false).build()` | `src/data-factory/partner-builder.ts` |
| Create-partner entry point | `New Partner` button → `//button[text()=' New Partner ']` | `CommonPartnerLocator.createNewPartnerButton` |
| Modal fields (UI labels) | Department, **Partner Level**, Name, Subdomain, **Payment options**, Is Public, **Products Type**, Email, First Name, Last Name, Job title, Contact Number, **Bank Transfer**, Plan, Billing Cycle, Internal | `src/ui/pages/admin-portal/locators/partner-management/locator/new-partner.ts` |
| Payment options (UI values) | `Partner/Consultant Owner` · `Member Portal Consumer` — passed to `.withPaymentOption(...)`. `createBusinessFromPartnerPortal` **throws** for any other string. | `src/ui/flows/onboarding.flow.ts:39-41` |
| Submit | `Create` button, then `Confirm & Create` | `CreateNewPartnerModalLocator.createPartnerButton` / `.confirmButton` |
| Created-partner assertion | `onboardingFlow.verifyPartnerVisible(partnerInfo)` — finds the partner's email text in the list | `src/ui/flows/onboarding.flow.ts:50` |
| Row → Details | `//tr[td//*[contains(text(),'<phone>')]]//button[normalize-space()='Details']` | `CommonPartnerLocator.detailButton` |
| Detail-page actions | `Add Team`, `Add More Member(s)`, `Add PEO/Consultant` | `DetailOfPartnerLocator` |
| Filter panel | `Search name`, `All level`, `Department`, `Apply` — **the UI way to verify a partner's level** | `PartnerFilterLocator` |
| PEO payload | `DataFactory.peoPartnerBuilder().withName("Peo" + <firstName>).withCompanyType("Internal").withCustomBranding(true).build()` | `admin-portal-create-partner-basics_*.spec.ts` (TC32) |
| PEO modal fields | Name, Email, First Name, Last Name, Contact Number, Job title, `Custom Branding`, `Custom Benefits Plans`, External/Internal, Back Url, Back Text | `PeoConsultantAdditionLocator` |
| Plans / Products Type (QA) | `plans[0]`–`plans[3]` = `ASO Essentials`, `ASO Expert`, `ASO Enterprise`, `ASO Ultimate` | `src/constant/department.data.qa.ts` |
| Plans / Products Type (UAT) | `1 - 100 Employees`, `101 - 250 Employees`, `251 - 500 Employees`, `500+ Employees & HR Consultants` | `src/constant/department.data.uat.ts` |
| Sub-domain | `.withSubDomain("")` = none; `test<random 1–9999>` = assigned | `api-partner-management-create-and-level_*.spec.ts` (value pattern only) |
| Partner credential email | `"HR Compliance - Partner Credential"` (QA) | `getEmailSubjectByDepartment().PARTNER_ACC_ACTIVATE` |
| Member credential email | `"HR Compliance: Your User Portal Credentials"` (QA) | `getEmailSubjectByDepartment().CUSTOMER_ACC_ACTIVATE` |
| First-login activation | `authFlow.activateAndChangePassIndividualCustomer(email, "Partner portal" \| "Member" \| "Consumer", "Password@123")` | `src/ui/flows/auth.flow.ts` |
| Business Owner payload | `PersonDataGenerator.generate({ emailDomain: "chinasteel.xyz" })` (or `"ussteel.xyz"`) | existing partner specs |
| Owner-role assertion (by email) | `ClientPartnerPortalLocators.role` = `//p[text()='<email>']/ancestor::td/following-sibling::td/div[text()='Owner']` — used by `verifyOwnerRoleInUserPage` | `src/ui/pages/partner-portal/locators/client.ts` |
| Owner-label assertion (generic) | `verifyOwnerVisible()` → `//div[text()='Owner']` — does **not** identify whose | `src/ui/flows/onboarding.flow.ts:48` |
| Select Plan screen | `onboardingFlow.validatePlanVisible()` | `partnerportal.onboarding.flow.ts` |
| Buy plan | `purchaseFlow.buyPlanInPartnerPortal(partnerInfo)`, or `selectPlanBeforePurchase(...)` + `submitSubscriptionPayment()` | `src/ui/flows/purchase.flow.ts` |
| Home page assertion | `onboardingFlow.redirectToHomePage()` — waits for the `Home` heading | `src/ui/flows/onboarding.flow.ts:99` |
| Valid Stripe test card | `4242 4242 4242 4242`, `12/34`, `123`, `Test User`, `123 Test St`, `Test City` | `validCardInfo` |
| Duplicate-email error | Page body contains `Email is existed` | `verifyDuplicatedEmailWhenCreatingPartner` |
| Login-rejected assertion | `onboardingFlow.validateAccountNotExist()` | `partnerportal.onboarding.flow.ts` |

---

## ⚠ Notes that apply to this whole suite

1. **Tag defect — TC45 and TC46 are tagged `@45` / `@46`**, missing the `TC` prefix every other case uses. `--grep @TC45` matches nothing. Fix in `admin-portal-member-consumer-access_TC45_TC46_TC47.spec.ts`.
2. **All eighteen cases have an owning UI test — but many stop at creation.** Several end with `verifyPartnerVisible` — proof the partner exists, not proof the *specific setting under test* was saved. Those are marked ⚠ **Assertion gap** under their case; the automation exists and runs, the assertion is just weaker than the case title claims. The Filter panel (`Search name` / `All level` / `Department` → `Apply`) and the partner Details page are the UI surfaces that would turn these into real assertions; neither is currently used for verification anywhere.
3. **No locators exist for reading a partner's saved settings** (Payment options, Products Type, Bank Transfer state, Subdomain) back from the Details page. Adding them unblocks the ⚠ half of TC33, TC34, TC38 and TC40 at once.
4. **`src/ui/pages/admin-portal/locators/common/admin-home.ts` and `admin-leftmenu.ts` are not VirgilHR locators** — they use OrangeHRM `oxd-*` classes and widget names ("Time at Work", "Buzz Latest Posts") from an unrelated demo app. Do not reference them when writing these tests; they should be deleted.

---

### TC30 — Verify that a partner account can only be created in the Admin Portal – Partner Management.

**Priority**: High · **Status**: ✅ Automated — `tests/UI/admin-portal/admin-portal-create-partner-basics_TC30_TC31_TC32_TC33_TC34.spec.ts` (tag `@TC30`)

⚠ **Assertion gap**: the test proves creation works *here*; nothing proves it is impossible elsewhere (step 4).

**Precondition**: Admin is logged in to the Admin Portal.

| # | Step | Expected Result |
|---|---|---|
| 1 | Left menu → `Management` → `Partner Management` | Partner Management list is displayed with a `New Partner` button |
| 2 | Create a partner (`Payment options` = `Partner/Consultant Owner`, `Is Public` off, `Products Type` = `plans[0]`) and submit (`Create` → `Confirm & Create`) | Modal closes without a validation error |
| 3 | Verify the partner in the list (`verifyPartnerVisible`) | The partner's email is visible in the Partner Management list |
| 4 | Log in to the **Partner Portal** and the **Member Portal** and look for any partner-creation entry point | ⚠ **Not automated.** The "only" in this case is unproven. Confirm with QA whether a negative check is wanted; if so, name the screens to inspect so a "no `New Partner` control is present" assertion can be written. |

---

### TC31 — When a Partner is created, the admin can select its level as Partner or PEO/Consultant.

**Priority**: High · **Status**: ✅ Automated (same file, tag `@TC31_UI`)

⚠ **Assertion gap**: the test creates a partner but **never touches or verifies the `Partner Level` field** — the case's own subject is unexercised (steps 1, 4–5).

**Precondition**: Admin is on the Partner Management page.

| # | Step | Expected Result |
|---|---|---|
| 1 | Click `New Partner` and open the `Partner Level` dropdown | Both levels are offered: `Partner` and `PEO/Consultant` |
| 2 | Select `Partner`, complete the form, and submit | Partner is created |
| 3 | Select `PEO/Consultant` for a second partner and submit | PEO/Consultant is created |
| 4 | Open the Filter panel, set `All level` = `Partner`, click `Apply` | Only the Partner-level account is listed |
| 5 | Repeat the filter with `All level` = `PEO/Consultant` | Only the PEO/Consultant account is listed |

⚠ **Data gap — the exact `Partner Level` option labels are unconfirmed.** The builder exposes `.withLevel(0 | 1)` (a numeric API value) and the UI has `CreateNewPartnerModalLocator.partnerLevel`, but no test has ever selected from it, so the visible option text is unrecorded. Capture the two label strings, then steps 4–5 make this case fully automatable with the existing Filter locators.

---

### TC32 — Verify that a Partner is at a higher level than a PEO/Consultant, meaning one Partner can contain one or multiple PEOs/Consultants.

**Priority**: Medium · **Status**: ✅ Automated (same file)

**Precondition**: Admin is on the Partner Management page.

| # | Step | Expected Result |
|---|---|---|
| 1 | Create a Partner (`Payment options` = `Partner/Consultant Owner`, Bank Transfer ON) and verify it is visible | Partner appears by email |
| 2 | Activate the Partner from its credential email (`"Partner portal"`, `Password@123`) | Partner can log in to the Partner Portal |
| 3 | Log back in as admin, open the Partner's row → `Details` → `Add PEO/Consultant`, and create a PEO (`Custom Branding` on, User Type `Internal`) | PEO is added under that Partner |
| 4 | Activate the PEO (`"Partner portal"`, `Password@123`) | PEO reaches the Partner Portal home page as its own account under the parent Partner |
| 5 | Add a **second** PEO under the same Partner | ⚠ **Not automated — only one PEO is created today**, so "one or multiple" is unproven. Loop step 3 twice and assert both appear on the Partner's Details page. |

---

### TC33 — When creating a new Partner, the admin can choose to assign a sub-domain to that Partner, or not.

**Priority**: Medium · **Status**: ✅ Automated (same file, tag `@TC33_UI`)

⚠ **Assertion gap**: only the **empty** sub-domain branch runs, and the saved value is never read back (steps 2–3).

**Precondition**: Admin is on the Partner Management page.

| # | Step | Expected Result |
|---|---|---|
| 1 | Create a partner leaving `Subdomain` blank | Partner is created — the field is optional |
| 2 | Create a second partner with `Subdomain` = `test<random 1–9999>` | Partner is created |
| 3 | Open each partner's `Details` and read the Subdomain field | ⚠ **Not automated — no locator reads the saved Subdomain back** (suite note 3). Today the test's own step is labelled "Verify the domain is empty" but actually only calls `verifyPartnerVisible`, which checks the email. |

---

### TC34 — For Payment Options, the admin can select either Partner/Consultant Owner or Member Portal Consumer.

**Priority**: High · **Status**: ✅ Automated (same file, tag `@TC34`) — the test loops both Payment Options

⚠ **Assertion gap**: a partner is created for each option, but which option was saved is never verified (step 4).

**Precondition**: Admin is on the Partner Management page.

| # | Step | Expected Result |
|---|---|---|
| 1 | Click `New Partner` and open the `Payment options` dropdown | Both options are offered: `Partner/Consultant Owner` and `Member Portal Consumer` |
| 2 | Create a partner with `Partner/Consultant Owner` | Partner is created and visible by email |
| 3 | Create a partner with `Member Portal Consumer` | Partner is created and visible by email |
| 4 | Open each partner's `Details` and read the Payment options field | ⚠ **Not automated — no read-back locator** (suite note 3) |

> The **observable consequences** of each option *are* covered elsewhere and are the stronger assertions: TC35/TC43/TC44 for `Partner/Consultant Owner`, TC36/TC45/TC46/TC47 for `Member Portal Consumer`.

---

### TC35 — With Payment Options = Partner/Consultant Owner, the user will make payments in the Partner Portal, and the Partner account will be the owner of all Businesses.

**Priority**: High · **Status**: ✅ Automated — `tests/UI/admin-portal/admin-portal-partner-payment-and-business_TC35_TC36_TC37_TC38_TC39.spec.ts` (`test.setTimeout(120000)`)

**Precondition**: Admin is logged in. Partner created with `Payment options` = `Partner/Consultant Owner`, Bank Transfer OFF, `Is Public` off, `Products Type` = `plans[0]`.

| # | Step | Expected Result |
|---|---|---|
| 1 | Create the partner and verify it is visible | Partner appears by email |
| 2 | Activate the partner (`"Partner portal"`, `Password@123`) | Partner reaches the Partner Portal |
| 3 | Buy the plan **in the Partner Portal** (`buyPlanInPartnerPortal`) with the valid test card | Stripe checkout completes inside the Partner Portal — payment is the *partner's* responsibility |
| 4 | Clients page → Business tab → create a new Business | Business is created |
| 5 | Read the Owner cell on the Business | The **Partner** account is shown as Owner |

⚠ **Assertion weakness**: step 5 uses `verifyOwnerVisible()`, which only checks that an `Owner` label exists — not whose it is. The email-parameterised pattern already exists (`ClientPartnerPortalLocators.role`, used by `verifyOwnerRoleInUserPage`); reuse that shape against the Business table so TC35 and TC36 stop sharing an identical assertion for opposite expectations.

⚠ **Known instability (app-side, not test-code)**: this test has failed intermittently during step 4 at two different points — `//span[text()='View']` timing out (~128s) and `(//div[text()='New'])[2]` resolving but staying hidden. Both are inside `createBusinessFromPartnerPortal`. Re-run with a trace before treating a failure here as a regression.

---

### TC36 — With Payment Options = Member Portal Consumer, the user does not handle payments, and each Business will have its own owner.

**Priority**: High · **Status**: ✅ Automated (same file)

**Precondition**: Admin is logged in. Partner created with `Payment options` = `Member Portal Consumer`, `Is Public` off, `Products Type` = `plans[0]`.

| # | Step | Expected Result |
|---|---|---|
| 1 | Create the partner and verify it is visible | Partner appears by email |
| 2 | Activate the partner (`"Partner portal"`, `Password@123`) | Partner reaches the Partner Portal **without** any Select Plan or Stripe screen |
| 3 | Create a Business, entering a separate person (`PersonDataGenerator.generate({ emailDomain: "chinasteel.xyz" })`) in the Business form | Business is created |
| 4 | Read the Owner cell on the Business | The Business's **own** Owner is shown — not the Partner (⚠ same identity-assertion weakness as TC35, step 5) |

---

### TC37 — Verify that when creating a new Partner, the admin can allow certain benefits to appear in the Member Portal.

**Priority**: Medium · **Status**: ✅ Automated (same file, tag `@TC37`)

⚠ **Assertion gap**: the test creates the partner, activates it on both portals, then asserts only that the Member Portal **Home page loads** — which benefits appear is never checked (step 3).

**Precondition**: Admin is logged in. Partner created with Bank Transfer ON and a specific `Products Type` / `Plan`.

| # | Step | Expected Result |
|---|---|---|
| 1 | Create the partner with the chosen plan and verify it is visible | Partner created |
| 2 | Activate the partner for the Partner Portal, then for the Member Portal (`"Member"`, `Password@123`) | Both logins succeed |
| 3 | Open the Member Portal and inspect the benefits/modules on display | ⚠ **BLOCKED — no benefit-to-UI mapping exists.** Nothing in this repo records which visible element corresponds to which plan benefit, so there is nothing to assert against. Obtain from product/QA: for each plan, the list of benefits and the Member Portal element (tile, menu item, page) each one unlocks. |

> Related UI surface worth noting: the `Add PEO/Consultant` modal has a `Custom Benefits Plans` toggle (`PeoConsultantAdditionLocator.customBenefitsPlan`) that no test uses. Confirm with QA whether it belongs to this case's scope.

---

### TC38 — Verify that the admin can specify which plans a Partner can use for its Businesses via the Product Type field.

**Priority**: Medium · **Status**: ✅ Automated (same file, tag `@TC38`)

⚠ **Assertion gap**: a `Products Type` value is entered, but neither the saved value nor its downstream effect on a Business's plan list is verified (step 3).

**Precondition**: Admin is on the Partner Management page.

| # | Step | Expected Result |
|---|---|---|
| 1 | Create a partner with `Products Type` = `plans[0]` only | Partner is created and visible by email |
| 2 | Activate the partner and open the Partner Portal | Partner reaches the Partner Portal |
| 3 | Start creating a Business and open its plan selector | Only `plans[0]` is offered — the plans excluded from `Products Type` are absent |

> Step 3 is the assertion that actually gives this case value, and it is pure UI. It needs a locator for the Business-creation plan list, which does not exist yet (`BusinessLocator` covers team name, member fields, and Add/View buttons only).

---

### TC39 — Verify that the Partner email must be unique (no duplicates allowed).

**Priority**: High · **Status**: ✅ Automated (same file)

**Precondition**: Admin is on the Partner Management page.

| # | Step | Expected Result |
|---|---|---|
| 1 | Create a partner and verify it is visible | Partner created |
| 2 | Click `New Partner` again and submit the form using the **same** email | Creation is rejected |
| 3 | Read the error on the page | Page body contains `Email is existed` |

---

### TC40 — Verify that the admin can enable Bank Transfer for a new Partner.

**Priority**: High · **Status**: ✅ Automated — `tests/UI/admin-portal/admin-portal-bank-transfer-and-credentials_TC40_TC41_TC42_TC43_TC44.spec.ts` (tag `@TC40`)

⚠ **Assertion gap**: the test builds the partner **without** an explicit `.withBankTransfer(true)`, so it relies on the builder default and never exercises the toggle the case is named for.

**Precondition**: Admin is on the Partner Management page.

| # | Step | Expected Result |
|---|---|---|
| 1 | Click `New Partner` and toggle `Bank Transfer` ON (`CreateNewPartnerModalLocator.bankTransfer`) | Toggle switches on; the `Plan` and `Billing Cycle` fields become relevant |
| 2 | Complete the form and submit (`Create` → `Confirm & Create`) | Partner is created and visible by email |
| 3 | Open the partner's `Details` and read the Bank Transfer state | ⚠ **Not automated — no read-back locator** (suite note 3) |

> The behavioural proof that Bank Transfer was really enabled is TC41 (partner lands on Home with no Stripe). Add `.withBankTransfer(true)` explicitly here regardless, so the case name matches what it does.

---

### TC41 — When Bank Transfer = ON, the Partner user is assigned a plan and does not need to make a payment through Stripe.

**Priority**: High · **Status**: ✅ Automated (same file)

**Precondition**: Partner created with Bank Transfer ON, `Payment options` = `Partner/Consultant Owner`, `Products Type` = `plans[0]`.

| # | Step | Expected Result |
|---|---|---|
| 1 | Create the partner and verify it is visible | Partner created |
| 2 | Activate the partner from the credential email (`"Partner portal"`, `Password@123`) | Password change completes |
| 3 | Observe the landing page (`redirectToHomePage`) | Partner Portal **Home** page loads directly — the Select Plan screen and Stripe checkout are never shown |

---

### TC42 — When Bank Transfer = OFF, the Partner user is not pre-assigned a plan, but instead selects a plan via the Select Plan screen and pays through Stripe.

**Priority**: High · **Status**: ✅ Automated (same file)

**Precondition**: Partner created with Bank Transfer OFF, `Payment options` = `Partner/Consultant Owner`, `Products Type` = `plans[0]`.

| # | Step | Expected Result |
|---|---|---|
| 1 | Create the partner and verify it is visible | Partner created |
| 2 | Activate the partner (`"Partner portal"`, `Password@123`) | Password change completes |
| 3 | Observe the landing screen (`validatePlanVisible`) | The **Select Plan** screen is displayed — no plan was pre-assigned |
| 4 | Select `plans[0]` and submit payment with the valid test card | Stripe checkout completes |
| 5 | Verify the landing page | Partner Portal Home page loads |

---

### TC43 — With Payment Options = Partner/Consultant Owner, after successfully creating a Partner account, the user receives two credential emails — one for the Partner Portal and one for the Member Portal.

**Priority**: Medium · **Status**: ✅ Automated (same file)

**Precondition**: Partner created with `Payment options` = `Partner/Consultant Owner`, Bank Transfer OFF.

| # | Step | Expected Result |
|---|---|---|
| 1 | Create the partner and verify it is visible | Partner created |
| 2 | Open the partner's mailbox (`validateReceivedTwoEmails`) | Two credential emails are present: `"HR Compliance - Partner Credential"` (Partner Portal) and `"HR Compliance: Your User Portal Credentials"` (Member Portal) |

---

### TC44 — For Payment Options = Partner/Consultant Owner, the Owner account can log in to both the Member Portal and the Partner Portal.

**Priority**: High · **Status**: ✅ Automated (same file)

**Precondition**: Partner created with `Payment options` = `Partner/Consultant Owner`, Bank Transfer ON.

| # | Step | Expected Result |
|---|---|---|
| 1 | Create the partner and verify it is visible | Partner created |
| 2 | Activate and log in via the **Partner Portal** credential email (`"Partner portal"`, `Password@123`) | Partner Portal Home page loads |
| 3 | Activate and log in via the **Member Portal** credential email (`"Member"`, `Password@123`) | Member Portal Home page loads |

---

### TC45 — With Payment Options = Member Portal Consumer, after successfully creating a Partner account, the user receives one credential email — for the Partner Portal.

**Priority**: Medium · **Status**: ✅ Automated — `tests/UI/admin-portal/admin-portal-member-consumer-access_TC45_TC46_TC47.spec.ts` (⚠ tagged `@45`, not `@TC45` — see suite note 1)

**Precondition**: Partner created with `Payment options` = `Member Portal Consumer`, Bank Transfer ON.

| # | Step | Expected Result |
|---|---|---|
| 1 | Create the partner and verify it is visible | Partner created |
| 2 | Open the partner's mailbox (`validateReceivedOneEmail`) | Exactly one credential email: `"HR Compliance - Partner Credential"`. No Member Portal credential email. |

---

### TC46 — For Payment Options = Member Portal Consumer, the Owner of the Partner/Consultant can only log in to the Partner Portal.

**Priority**: High · **Status**: ✅ Automated (same file, ⚠ tagged `@46` — see suite note 1)

⚠ **Assertion gap**: only the positive half is asserted — nothing proves the Member Portal login is rejected (step 3).

**Precondition**: Partner created with `Payment options` = `Member Portal Consumer`, Bank Transfer ON.

| # | Step | Expected Result |
|---|---|---|
| 1 | Create the partner and verify it is visible | Partner created |
| 2 | Activate the partner (`"Partner Portal"`, `Password@123`) and observe the landing page | Partner Portal Home page loads |
| 3 | Open the **Member Portal** login page and submit the same credentials | ⚠ **Not asserted today.** Login must be rejected. The exact pattern already exists in TC47: `loginPage.fillLoginForm(<member portal URL>, email, password)` followed by `onboardingFlow.validateAccountNotExist()`. Adding those two lines completes this case with no new locators. |

---

### TC47 — For Businesses under a Partner with Payment Options = Member Portal Consumer, the Business Owner cannot log in to the Partner Portal.

**Priority**: High · **Status**: ✅ Automated (same file)

**Precondition**: Partner created with `Payment options` = `Member Portal Consumer`, Bank Transfer ON. Business Owner payload from `PersonDataGenerator.generate({ emailDomain: "chinasteel.xyz" })`.

| # | Step | Expected Result |
|---|---|---|
| 1 | Create the partner and verify it is visible | Partner created |
| 2 | Activate the partner (`"Partner portal"`, `Password@123`) | Partner reaches the Partner Portal |
| 3 | Create a Business with the generated person as its owner, and read the Owner cell | Business is created with its own Owner |
| 4 | Activate that Business Owner (`"Consumer"`, `Password@123`) and observe the landing page | Member Portal Home page loads — the Owner *can* use the Member Portal |
| 5 | Open the **Partner Portal** login page (`partnerPage.getURL()`) and submit the Business Owner's credentials | `validateAccountNotExist()` passes — the account is rejected on the Partner Portal |
