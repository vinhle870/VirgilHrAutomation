# Test Suite — Partner Portal: Business Creation & Ownership (B2C Smoke)

> **Source**: `docs/automation-docs/Smoke test - B2C_Latest.csv`, rows 63–70
> **Portal**: Partner Portal → Clients page → Business tab, plus the Member Portal sign-up path
> **Scope**: **UI / E2E only.** Every case below is specified as a browser-driven end-to-end journey. No step asserts an HTTP response body. There are no API specs for these rows, so nothing is lost by that restriction.
> **Tags**: `@regression_UI`, `@partner_portal` / `@member_portal`

## Test Data Reference

| Key | Value | Source |
|---|---|---|
| Admin login | `process.env.ADMIN_USERNAME` / `ADMIN_PASSWORD` against `ADMIN_PORTAL_BASE_URL` | `loginPage.login()` |
| Partner payload | `DataFactory.partnerBuilder().withDepartmentName(process.env.DEPARTMENT_NAME!).withPaymentOption(...).withProductsType([plans[0]]).build()` | `src/data-factory/partner-builder.ts` |
| Payment Option values | `"Partner/Consultant Owner"` or `"Member Portal Consumer"` — `createBusinessFromPartnerPortal` **throws** for any other value | `src/ui/flows/onboarding.flow.ts:39-41` |
| Create Business | `onboardingFlow.createBusinessFromPartnerPortal(partnerInfo, owner?)` — calls `eraseModal()` then `fillFormToCreateBusiness(partnerInfo, owner)` | `src/ui/pages/partner-portal/flows/partnerportal.onboarding.flow.ts` |
| Business Owner / invited member payload | `PersonDataGenerator.generate({ emailDomain: "ussteel.xyz" })` or `{ emailDomain: "chinasteel.xyz" })` | Existing partner-portal / admin-portal specs |
| Owner-label assertion | `onboardingFlow.verifyOwnerVisible()` → `BusinessLocator.ownerText` | `src/ui/flows/onboarding.flow.ts:48` |
| Partner-Team Owner assertion | `onboardingFlow.verifyOwnerRoleInUserPage(partnerInfo)` | `src/ui/flows/onboarding.flow.ts:85` |
| Member Portal sign-up | `onboardingFlow.signUpIndividualCustomerFromMemberPortal(customerInfo, hrSystem?, url?)` — `hrSystem` is where the Partner/Consultant is selected | `src/ui/pages/member-portal/flows/memberportal.onboarding.flow.ts` |
| Customer payload | `DataFactory.customerBuilder().withPassword("Password@123").build()` | `src/data-factory/customer-builder.ts` |
| Invite members (Member Portal) | `onboardingFlow.inviteMemberInOrganizationTabMemberPortal(members)` with `CustomerFactory.generateMembers(<count>, <role>)` | `src/ui/flows/onboarding.flow.ts:79` |
| Accept invite | `authFlow.acceptInviteAndJoinTeamByCustomer(email, "Password@123")` | `src/ui/flows/auth.flow.ts` |
| Invitation email subject | `"VirgilHR: Join your team"` (QA and UAT) | `getEmailSubjectByDepartment().JOIN_TEAM` |
| Activation (Business Owner) | `authFlow.activateAndChangePassIndividualCustomer(email, "Consumer", "Password@123")` | `admin-portal-member-consumer-access_TC45_TC46_TC47.spec.ts` |
| Plans (QA) | `plans[0]`–`plans[3]` = `ASO Essentials`, `ASO Expert`, `ASO Enterprise`, `ASO Ultimate` | `src/constant/department.data.qa.ts` |

⚠ **Suite-wide coverage weakness — `verifyOwnerVisible()` does not identify the owner.** It only asserts that an "Owner" label exists somewhere on the Business view; it never compares that cell against a specific email. Every ownership case in this suite (TC66, TC67, and TC52/TC53 in the sibling suite) therefore passes with the *same* assertion despite expecting *different* owners. A parameterised assertion — Owner cell text equals a given email — is a prerequisite for genuinely covering TC66 and TC67.

⚠ **Suite-wide gap — no UI spec owns any of TC63–TC70.** None of the eleven files in `tests/UI/**` contains a test titled or tagged for these rows. Business creation is exercised only as a *step inside* partner-management and partner-portal tests (TC35, TC36, TC47, TC52, TC53), so the Clients → Business tab is never the subject of a test. TC65, TC68 and TC69 have no related coverage at all; the rest have reusable setup, marked ♻ per case.

---

### TC63 — Verify that the Partner Owner/Admin can create a new Business in the Clients page – Business tab.

**Priority**: High · **Status**: ✅ Automated — `tests/UI/partner-portal/partner-portal-business-creation-and-member-invite_TC63_TC70.spec.ts` (tag `@TC63`) · **Last run: ✅ passed** (2026-08-05, UAT, 65s)

⚠ **Assertion gap**: covers the Partner **Owner** path only (step 1). The Partner **Admin** path (step 2) still needs the Partner-Team role set documented before it can be written.

> Note `--grep @TC63` also matches an API test in `partner-portal-invitemember.spec.ts` — pass the spec path for single-test runs.

**Precondition**: A Partner exists (either Payment Option) and has been activated (`"Partner portal"`, `Password@123`). The Partner is logged in to the Partner Portal.

| # | Step | Expected Result |
|---|---|---|
| 1 | As the Partner Owner, open the Clients page → Business tab and create a new Business | Business is created and appears in the Business list |
| 2 | As a Partner **Admin** (not Owner), repeat | ⚠ **Not automated — no test creates a Partner Admin account.** The Partner-Team role set is not documented in this repo (see the note in `team-member-invitations-and-roles.md`); obtain the available Partner-Team roles from product/QA, then create an Admin via `addMoreMembersInPartnerManagementPage` before automating this half. |

---

### TC64 — Verify that members can be invited to a Business during the Business creation process.

**Priority**: High · **Status**: ❌ Not automated — no UI spec owns TC64

> ♻ **Reusable setup**: `createBusinessFromPartnerPortal(partnerInfo, owner)` already passes one person into the creation form (used by TC36, TC47, TC52, TC53). No test asserts that person received an invitation or joined the Business.

**Precondition**: Partner activated and on the Clients page → Business tab.

| # | Step | Expected Result |
|---|---|---|
| 1 | Start creating a Business and add one or more members in the creation form (`PersonDataGenerator.generate({ emailDomain: "ussteel.xyz" })`) | Members are accepted by the form |
| 2 | Submit the Business | Business is created |
| 3 | Check each invited member's mailbox | Invitation email `"VirgilHR: Join your team"` received |
| 4 | Each member accepts the invite and sets `Password@123` | Member appears in the Business's member list with the role assigned at creation time |

⚠ **Data gap — role selection during Business creation is unspecified.** The CSV does not say whether the creation form lets you choose each invited member's role, or assigns one implicitly (TC66 implies invitees get "roles other than Owner", TC67 implies the first invitee becomes Owner). Confirm the exact rule and the available role options in the Business-creation form before automating step 4's role assertion.

---

### TC65 — Verify that members can also be invited to a Business after it has been successfully created.

**Priority**: High · **Status**: ❌ Not automated

**Precondition**: A Business has been created under an activated Partner.

| # | Step | Expected Result |
|---|---|---|
| 1 | Open the existing Business from the Clients page → Business tab | Business detail view opens |
| 2 | Invite one or more members to it | Invitations are sent |
| 3 | Each member accepts the invite (`"VirgilHR: Join your team"`) and sets `Password@123` | Members appear in the Business's member list |

⚠ **To automate**: no page-object method exists for inviting into an *existing* Business. `addMoreMembersInPartnerManagementPage` targets the Admin Portal's Partner Management page, and `inviteMemberInOrganizationTabMemberPortal` targets the Member Portal — neither is the Partner Portal's Business detail view. A new flow method plus locators for that view are required.

---

### TC66 — For Businesses under a Partner with Payment Options = Partner/Consultant Owner, the Partner account Owner is also the Owner of all Businesses, and any invited members will have roles other than Owner.

**Priority**: High · **Status**: ❌ Not automated — no UI spec owns TC66

> ♻ **Overlapping coverage**: TC52 (`partner-portal-onboarding-payment_*.spec.ts`) asserts the first half — the Partner is both Business Owner and Partner-Team Owner. The invited-member-is-not-Owner half is untested.

**Precondition**: Partner created with `paymentOption = "Partner/Consultant Owner"`, activated, and a Business created with one invited member.

| # | Step | Expected Result |
|---|---|---|
| 1 | Create a Business under this Partner, passing an invited member | Business created |
| 2 | Verify the Business's Owner | ⚠ **The Partner account's email** holds the Owner role — needs the email-specific assertion described in the suite-wide note; today only a generic "Owner" label is checked |
| 3 | Verify the invited member's role in the Business | ⚠ **Not asserted today.** The invited member holds a role other than Owner. Requires both the Business member-list read-back and the documented role set (see TC64's data gap). |
| 4 | Create a second Business under the same Partner | Its Owner is also the Partner account — proving "all Businesses" |

---

### TC67 — For Businesses under a Partner with Payment Options = Member Portal Consumer, the first invited member becomes the Owner of that Business.

**Priority**: High · **Status**: ❌ Not automated — no UI spec owns TC67

> ♻ **Overlapping coverage**: TC47 and TC53 create exactly this kind of Business with one person and check that an `Owner` label exists — but neither asserts the Owner is *that* person, and neither tests the "**first** invited member" ordering rule.

**Precondition**: Partner created with `paymentOption = "Member Portal Consumer"`, activated.

| # | Step | Expected Result |
|---|---|---|
| 1 | Create a Business inviting **two or more** members in a known order | Business created |
| 2 | Verify the Business's Owner | The **first** invited member's email holds the Owner role |
| 3 | Verify the remaining members' roles | They hold non-Owner roles |
| 4 | Activate the Owner (`"Consumer"`, `Password@123`) and log in to the Member Portal | Owner reaches the Member Portal home page (already covered by TC47) |

⚠ **Data gap — "first" is ambiguous with a multi-row invite form.** `fillFormToCreateBusiness` currently accepts a single optional owner. Confirm with product/QA whether "first" means the first row of the invite form or the first person to *accept*, then extend the flow to accept an ordered array before automating.

---

### TC68 — For a Partner with Payment Options = Partner/Consultant Owner, an account can also create a new Business by itself, with that account assigned as an Admin role in the Member Portal.

**Priority**: Medium · **Status**: ❌ Not automated

**Precondition**: An active Partner with `paymentOption = "Partner/Consultant Owner"` exists. Its name is selectable in the Member Portal sign-up "HR System" field.

| # | Step | Expected Result |
|---|---|---|
| 1 | Open the Member Portal sign-up page and sign up a new account (`DataFactory.customerBuilder().withPassword("Password@123").build()`), selecting this Partner in the **HR System** field | Account created |
| 2 | Confirm the email and complete sign-up | Account activated; a new Business is created for it under the Partner |
| 3 | Inspect the account's role in the Member Portal | The account holds the **Admin** role (the Partner Owner owns the Business) |

⚠ **Data gaps**: (a) whether this path requires a plan purchase before the Business exists is unspecified — for `Partner/Consultant Owner` the Partner pays, so presumably not, but the CSV does not say; (b) no page-object method reads back the signed-in account's own role, so the step-3 assertion has nothing to call yet. The sign-up half is already supported: `signUpIndividualCustomerFromMemberPortal(customerInfo, hrSystem)` takes the Partner name as `hrSystem`, and `member-portal-payment-card-and-partner-signup_*.spec.ts` (TC16) already signs up under a partner.

---

### TC69 — For a Partner with Payment Options = Member Portal Consumer, an account can also create a new Business by itself, with that account assigned as an Owner role in the Member Portal.

**Priority**: Medium · **Status**: ❌ Not automated

**Precondition**: An active Partner with `paymentOption = "Member Portal Consumer"` exists and is selectable in the sign-up HR System field. This is the same partner configuration TC16 already builds.

| # | Step | Expected Result |
|---|---|---|
| 1 | Sign up a new account on the Member Portal, selecting this Partner in the **HR System** field | Account created |
| 2 | Confirm the email | Account activated |
| 3 | Select a plan and pay with the valid test card | Payment succeeds — for `Member Portal Consumer` the account pays for itself |
| 4 | Inspect the account's role in the Member Portal | The account holds the **Owner** role of its own Business |

⚠ **Data gap**: same as TC68 — no read-back method exists for the signed-in account's own role. Note the asymmetry that makes TC68/TC69 a genuine pair worth automating: identical sign-up flow, opposite resulting role (Admin vs Owner) driven purely by the Partner's Payment Option.

---

### TC70 — Verify that the Owner/Admin of a Business can invite members from the Member Portal.

**Priority**: High · **Status**: ✅ Automated (same file as TC63, tag `@TC70`) · **Last run: ✅ passed** (2026-08-05, UAT, 204s)

⚠ **Assertion gap**: covers the Business **Owner** path (steps 1–3). The Business **Admin** path (step 4) is not covered.

> First run failed on a `net::ERR_CONNECTION_CLOSED` from `beeinbox.com` and passed on re-run. `retries` is not configured in `playwright.config.ts`, so mailbox-host flakes surface as hard failures.

**Precondition**: A Business exists under a Partner, and its Owner has been activated (`"Consumer"`, `Password@123`) and can log in to the Member Portal (the state TC47 reaches).

| # | Step | Expected Result |
|---|---|---|
| 1 | Log in to the Member Portal as the Business Owner | Home page loads |
| 2 | Open the Organization tab, click "Invite more", and invite a member with role `"User"` | Invitation sent |
| 3 | The member accepts the invite (`"VirgilHR: Join your team"`) and sets `Password@123` | Member joins the Business's team |
| 4 | Repeat steps 1–3 as a Business **Admin** | Admin can also invite |

⚠ **To automate**: chain the existing pieces rather than writing new ones — TC47's setup produces exactly the required precondition (Partner with `Member Portal Consumer` → Business with its own Owner → Owner activated as `"Consumer"`), and TC54's `inviteMemberInOrganizationTabMemberPortal` + `acceptInviteAndJoinTeamByCustomer` cover steps 2–3.
