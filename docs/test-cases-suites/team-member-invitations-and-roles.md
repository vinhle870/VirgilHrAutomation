# Test Suite — Team Member Invitations & Roles (B2C Smoke)

> **Source**: `docs/automation-docs/Smoke test - B2C_Latest.csv`, rows 54–62
> **Portal**: Member Portal → Organization tab, and Admin Portal → Customer Management
> **Scope**: **UI / E2E only.** Every case below is specified as a browser-driven end-to-end journey. No step asserts an HTTP response body. `MemberPortalService.inviteMember` / `PartnerPortalService.inviteMember` exist in the API layer but are out of scope and are **not** counted as coverage here.
> **Tags**: `@regression_UI`, `@member_portal` / `@customer_management`, `@invite_customer_member`

## Test Data Reference

| Key | Value | Source |
|---|---|---|
| Admin login | `process.env.ADMIN_USERNAME` / `ADMIN_PASSWORD` against `ADMIN_PORTAL_BASE_URL` | `loginPage.login()` / `authFlow.loginToAdminPortal()` |
| Inviting customer (self-signup path) | `DataFactory.customerBuilder().withPassword("Password@123").build()` | `src/data-factory/customer-builder.ts` |
| Inviting customer (admin-created path) | `DataFactory.customerBuilder().withDepartmentName(process.env.DEPARTMENT_NAME!).withBankStranfer(true).withCompanySize(plans[0]).build()` | `tests/UI/admin-portal/customer-management.spec.ts` |
| Invited member payload | `CustomerFactory.generateMembers(<count>, <role>)` → array of `UserInfo` with `email`, `firstName`, `lastName`, `phoneNumber`, `jobTitle`, `invitedRole` | `src/data-factory/customer-factory.ts` |
| Roles used by automation | `"Admin"`, `"User"` (`generateMembers` defaults to `"User"`) | `member-portal-invite-member.spec.ts`, `customer-management.spec.ts` |
| Role dropdown | `//input[@placeholder='Select a role for the member']`, filled via `dropdown.selectByText(...)` | `src/ui/pages/admin-portal/locators/customer-management/team-imformation.ts` |
| "Invite more" button (Member Portal) | `//span[text()='Invite more']` | `src/ui/pages/member-portal/locators/organization.ts` |
| Invitation email subject | `getEmailSubjectByDepartment().JOIN_TEAM` — `"VirgilHR: Join your team"` (QA **and** UAT) | `src/constant/department.data.qa.ts`, `.uat.ts` |
| Accept-invite link | Anchor with text `Accept Invite` inside the email body | `TempEmailFreeLocators.acceptInviteButton`, `EmailHandling.parseInviteInfoFromMailBody` |
| Accept + set password | `authFlow.acceptInviteAndJoinTeamByCustomer(email, "Password@123")` | `src/ui/flows/auth.flow.ts` |
| Negative role check | `onboardingFlow.verifyCannotInviteMembersInMemberPortal()` | `src/ui/pages/member-portal/flows/memberportal.onboarding.flow.ts` |
| Plans (QA) | `plans[0]`–`plans[3]` = `ASO Essentials`, `ASO Expert`, `ASO Enterprise`, `ASO Ultimate` | `src/constant/department.data.qa.ts` |
| Valid Stripe test card | `4242 4242 4242 4242`, `12/34`, `123`, `Test User`, `123 Test St`, `Test City` | `validCardInfo` |

⚠ **Suite-wide data gap — the role model is not documented anywhere in this repo.** Automation only ever uses `"Admin"` and `"User"`, plus `"Owner"` as an implicit state (the account that created/purchased the team). The full role list and the exact permission matrix per role are required for TC61 and would sharpen TC55/TC60. Obtain from product/QA:
> 1. the complete set of selectable roles in the invite dropdown (both portals);
> 2. for each role, which actions are allowed/denied (invite members, view billing, upgrade plan, create Business, …);
> 3. whether the two portals expose the same role set.

⚠ **Suite-wide file-organisation note**: `tests/UI/admin-portal/customer-management.spec.ts` currently holds TC56 **and** TC71 — two unrelated suites in one file, and its filename carries no test-case IDs. Once TC57–TC62 are automated, split it per the repo's `<summary>_TC<ids>.spec.ts` convention.

---

### TC54 — Verify that a user can invite members to a team in the Member Portal – Organization tab.

**Priority**: High · **Status**: ✅ Automated — `tests/UI/member-portal/member-portal-invite-member.spec.ts`

**Precondition**: A customer has signed up on the Member Portal, confirmed their email, and purchased `plans[0]` with the valid test card (so a team exists and they are its Owner).

| # | Step | Expected Result |
|---|---|---|
| 1 | Sign up an individual customer on the Member Portal (`Password@123`) | Account created |
| 2 | Activate via the confirmation link in the mailbox | Account confirmed, redirected to Select Plan |
| 3 | Select `plans[0]` and submit payment with the valid test card | Payment succeeds; home page loads |
| 4 | Open the Organization tab, click "Invite more", and invite 1 member with role `"User"` | Invitation is sent |
| 5 | Open the invited member's mailbox and click "Accept Invite", then set `Password@123` | Member joins the team and reaches the Member Portal home page |

---

### TC55 — In the Member Portal, only the Owner and Admin of a team can invite members to that team.

**Priority**: High · **Status**: ✅ Automated (same file)

**Precondition**: Same as TC54 — an Owner with an active paid team.

| # | Step | Expected Result |
|---|---|---|
| 1 | Sign up, activate, and purchase `plans[0]` as the Owner | Owner reaches the home page |
| 2 | As the **Owner**, invite 1 member with role `"Admin"` | Invitation sent — Owner *can* invite |
| 3 | The Admin member accepts the invite and sets `Password@123` | Admin joins the team |
| 4 | As the **Admin**, invite 1 member with role `"User"` | Invitation sent — Admin *can* invite |
| 5 | The User member accepts the invite and sets `Password@123` | User joins the team |
| 6 | As the **User**, open the Organization tab (`verifyCannotInviteMembersInMemberPortal`) | The "Invite more" control is not available — a User *cannot* invite |

---

### TC56 — Verify that the admin can invite members to a team in the Admin Portal – Customer Management.

**Priority**: High · **Status**: ✅ Automated — `tests/UI/admin-portal/customer-management.spec.ts` (tag `@TC56_UI`)

**Precondition**: Admin is logged in. A customer exists, created from Customer Management with `bankStranfer = true` and `companySize = plans[0]`, and has been activated (`"Member"`, `Password@123`).

| # | Step | Expected Result |
|---|---|---|
| 1 | Create a customer from the Customer Management page and verify it is visible | Customer appears by email |
| 2 | Activate the customer and change the password to `Password@123` | Customer can log in to the Member Portal |
| 3 | Log back in as admin, open the customer's Details page, and invite 1 member with role `"Admin"` | Invitation sent |
| 4 | The Admin member accepts the invite and sets `Password@123` | Admin joins the team and can log in to the Member Portal |
| 5 | Log back in as admin, open the **Admin member's** Details page, and invite 2 members with role `"User"` | Invitations sent |
| 6 | Each User member accepts the invite, sets `Password@123`, and lands on the home page | Both Users join the team |

---

### TC57 — In the Admin Portal, the admin can invite members to a team from the Details page of any account.

**Priority**: Medium · **Status**: ❌ Not automated — no UI spec owns TC57

> ♻ **Reusable setup**: TC56 already invites from two *different* accounts' Details pages (the Owner's, then an Admin member's), which is most of this case. What is missing is an owning test plus the arbitrary-account-type branch (step 3).

**Precondition**: Admin is logged in. Teams exist containing accounts in each role.

| # | Step | Expected Result |
|---|---|---|
| 1 | Open Customer Management and view the Details page of an Owner account, then invite a member | Invitation sent |
| 2 | Repeat from the Details page of an Admin-role account | Invitation sent |
| 3 | Repeat from the Details page of a User-role account | ⚠ **Unknown — the CSV says "any account", but whether the admin may invite from a User-role account's Details page (and which team the invitee lands in) is unspecified.** Confirm the intended behaviour with product/QA before automating. |

---

### TC58 — Verify that after being invited, the account receives an invitation email.

**Priority**: High · **Status**: ✅ Automated — `tests/UI/member-portal/member-portal-invitation-email_TC58.spec.ts` (tag `@TC58`) · **Last run: ✅ passed** (2026-08-05, UAT, 139s)

> Asserts the `JOIN_TEAM` subject explicitly, rather than relying on the implicit consumption inside `acceptInviteAndJoinTeamByCustomer` that TC54/TC55/TC56 depend on.

**Precondition**: A member has just been invited (from either portal).

| # | Step | Expected Result |
|---|---|---|
| 1 | Open the invited member's mailbox | Exactly one invitation email received, subject `"VirgilHR: Join your team"`, containing an "Accept Invite" link |

⚠ **To automate as a standalone case**: an explicit assertion helper is needed. The existing `validateReceivedOneEmail` / `validateReceivedTwoEmails` on `EmailServicePage` take a `Partner` object and check *credential* subjects, so they cannot be reused directly for a `UserInfo` + `JOIN_TEAM` subject.

---

### TC59 — Verify that after confirming the invitation email, the user is redirected to the Password Confirmation screen.

**Priority**: Medium · **Status**: ❌ Not automated — no UI spec owns TC59

> ♻ **Implicitly exercised**: the redirect happens inside `acceptInviteAndJoinTeamByCustomer`, which then fills the password field — so the screen is reached, just never asserted as an outcome.

**Precondition**: An invitation email has been received.

| # | Step | Expected Result |
|---|---|---|
| 1 | Click "Accept Invite" in the email | Browser navigates to the Password Confirmation screen |
| 2 | Verify the screen | Password and confirm-password fields are displayed |

⚠ **Data gap**: the URL fragment that identifies this screen is not recorded anywhere in the repo (unlike `change-password` and `register-success`, which are). Capture the actual path so the redirect can be asserted with `onboardingFlow.verifyURL(...)`.

---

### TC60 — Verify that after confirming the password, the user is added as a team member with the role assigned during the invitation.

**Priority**: High · **Status**: ❌ Not automated — no UI spec owns TC60

> ♻ **Implicitly exercised**: TC54/TC55/TC56 prove the invitee can log in after setting a password, and TC55 proves the assigned role took effect *indirectly* (its User-role invitee is blocked from inviting). A direct role read-back is what is missing.

**Precondition**: An invitation was sent with a specific role; the invitee has opened the Accept Invite link.

| # | Step | Expected Result |
|---|---|---|
| 1 | Set the password to `Password@123` and confirm | Account is activated and joins the team |
| 2 | Verify the member's row in the Organization tab (Member Portal) or the team list on the account's Details page (Admin Portal) | The member is listed with exactly the role selected at invite time (`"Admin"` or `"User"`) |

⚠ **To automate**: there is no existing page-object method that reads back a member's role from a team list. `validateOwnerRoleInUserPage` (Partner Portal) is the closest analogue and would need a Member-Portal / Admin-Portal equivalent that takes an email + expected role.

---

### TC61 — Verify that team members are granted permissions according to their assigned roles.

**Priority**: High · **Status**: ❌ Not automated

⚠ **BLOCKED — missing test data**: there is no permission matrix in this repo. The only permission behaviour encoded anywhere is "a `User` cannot invite members" (TC55, step 6). Automating this case requires the full role → allowed-actions matrix listed in the suite-wide gap note above. Do not automate until product/QA supplies it.

**Precondition**: A team contains members in each available role.

| # | Step | Expected Result |
|---|---|---|
| 1 | For each role, log in and attempt each action in the agreed permission matrix | Every action is permitted or denied exactly as the matrix specifies |

---

### TC62 — Verify that an account can belong to one or multiple teams.

**Priority**: Medium · **Status**: ❌ Not automated

**Precondition**: Two separate teams exist (e.g. two Owners who each purchased a plan), and one target email address.

| # | Step | Expected Result |
|---|---|---|
| 1 | From team A, invite `member@…` with role `"User"`; the member accepts and sets `Password@123` | Member belongs to team A |
| 2 | From team B, invite the **same** email address | ⚠ **Unknown — the invite flow's behaviour for an already-registered email is unspecified.** Does the second invitation succeed silently, require no password step (the account already has one), or fail as a duplicate? |
| 3 | Log in as that member and inspect the team/organization switcher | ⚠ **Unknown — no team-switcher UI is modelled anywhere in this repo**, so there is currently no way to assert membership in two teams. |

⚠ **BLOCKED — two unknowns**: (a) the expected behaviour when inviting an email that already has an account, and (b) how a multi-team account is represented in the UI (switcher, list, or something else). Both must come from product/QA before this can be automated.
