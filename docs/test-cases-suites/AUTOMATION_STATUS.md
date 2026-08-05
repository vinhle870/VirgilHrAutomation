# B2C Smoke — Automation Status Tracker

Single-table tracking view of all 84 cases in `docs/automation-docs/Smoke test - B2C_Latest.csv`.

> **Scope**: UI / E2E only. API specs under `tests/API/**` are not counted — see [README.md](README.md#scope-ui--e2e-only).
> **Automation verified**: 2026-08-05, against all 16 spec files in `tests/UI/**`.
> **Execution verified**: 2026-08-05 against **UAT** (`exec_env=uat`, `--project=chromium --workers=1 --headed`).
> **Status rule**: ✅ means a test in `tests/UI/**` is titled and tagged for the case. Everything else is ❌, including cases whose journey already runs as another test's setup (those carry ♻).
> **Mailbox convention**: mailboxes are never automated as a UI journey. Cases needing an activated account call `authFlow.activateAndChangePassIndividualCustomer(email, portal, password)` and assume the email was sent. Only TC23, TC24, TC43, TC45 and TC58 assert anything *about* an email.

## Summary

### Automation coverage

| | Total | ✅ Automated | ❌ Not automated | % |
|---|---|---|---|---|
| **All cases** | 84 | **56** | **28** | **67%** |
| High priority | 55 | 37 | 18 | 67% |
| Medium priority | 28 | 18 | 10 | 64% |
| Low priority | 1 | 1 | 0 | 100% |

### Execution status of the 56 automated cases

| Last run | Count | Cases |
|---|---|---|
| ✅ Passed | 13 | TC17, TC20, TC22, TC25, TC26, TC27, TC28, TC58, TC63, TC70, TC72, TC80, TC84 |
| ❌ Failed | 1 | TC24 |
| ⚠ Known intermittent | 1 | TC35 — fails inside `createBusinessFromPartnerPortal` at two different points across runs (app-side) |
| – Not run in this cycle | 41 | TC01–TC12, TC14, TC16, TC30–TC34, TC36–TC57 (automated subset), TC71 |

All 14 newly written cases were executed; **13 pass, 1 fails**. The 41 pre-existing cases were not re-run in this cycle, so their last-known state is from earlier runs — treat as unverified rather than green.

### Per suite

| Suite | Rows | ✅ | ❌ | % |
|---|---|---|---|---|
| [Member Portal — sign-up & payment](member-portal-signup-and-payment.md) | 1–16 | 14 | 2 | 88% |
| [Admin Portal — Customer Management](admin-portal-customer-management-create-account.md) | 17–29 | 8 | 5 | 62% |
| [Admin Portal — Partner Management](admin-portal-partner-management.md) | 30–47 | 18 | 0 | 100% |
| [Partner Portal — onboarding & payment](partner-portal-onboarding-and-payment.md) | 48–53 | 6 | 0 | 100% |
| [Team member invitations & roles](team-member-invitations-and-roles.md) | 54–62 | 4 | 5 | 44% |
| [Partner Portal — business creation](partner-portal-business-creation-and-ownership.md) | 63–70 | 2 | 6 | 25% |
| [Admin Portal — auto-renew / upgrade](admin-portal-plan-auto-renew-upgrade-and-renewal.md) | 71–84 | 4 | 10 | 29% |
| **Total** | **84** | **56** | **28** | **67%** |

## Legend

| Mark | Meaning |
|---|---|
| ✅ | A UI test owns this case |
| ❌ | No UI test owns this case |
| ⚠ | **Assertion gap** — case is ✅ and runs, but the assertion is weaker than the case title claims |
| ♻ | **Reusable setup** — case is ❌, but the flow methods it needs already run inside another test |
| 🚫 | **Blocked** — cannot be automated until product/QA or engineering supplies something |
| 🟢 | **Ready to write** — no blockers, no missing locators; assembly work only |

**Run** column: `✅ pass` / `❌ fail` / `⚠ flaky` / `–` not run in this cycle / blank = not automated.

Spec-file short names used in the tables:

| Short name | Path under `tests/UI/` |
|---|---|
| `signup-validation` | `member-portal/member-portal-signup-and-validation_TC01_TC02_TC03_TC04_TC05.spec.ts` |
| `plan-checkout` | `member-portal/member-portal-plan-selection-and-checkout_TC06_TC07_TC08_TC09_TC10.spec.ts` |
| `card-partner-signup` | `member-portal/member-portal-payment-card-and-partner-signup_TC11_TC12_TC14_TC16.spec.ts` |
| `invite-member` | `member-portal/member-portal-invite-member.spec.ts` |
| `invitation-email` | `member-portal/member-portal-invitation-email_TC58.spec.ts` |
| `partner-basics` | `admin-portal/admin-portal-create-partner-basics_TC30_TC31_TC32_TC33_TC34.spec.ts` |
| `partner-payment` | `admin-portal/admin-portal-partner-payment-and-business_TC35_TC36_TC37_TC38_TC39.spec.ts` |
| `bank-credentials` | `admin-portal/admin-portal-bank-transfer-and-credentials_TC40_TC41_TC42_TC43_TC44.spec.ts` |
| `consumer-access` | `admin-portal/admin-portal-member-consumer-access_TC45_TC46_TC47.spec.ts` |
| `customer-mgmt` | `admin-portal/customer-management.spec.ts` |
| `customer-creation` | `admin-portal/admin-portal-customer-creation-and-credentials_TC17_TC20_TC22_TC24_TC25.spec.ts` |
| `first-login` | `admin-portal/admin-portal-customer-first-login-and-payment_TC26_TC27_TC28.spec.ts` |
| `upgrade-eligibility` | `admin-portal/admin-portal-plan-upgrade-eligibility_TC72_TC80_TC84.spec.ts` |
| `partner-onboarding` | `partner-portal/partner-portal-onboarding-payment_TC48_TC49_TC50_TC51_TC52.spec.ts` |
| `business-ownership` | `partner-portal/partner-portal-business-ownership-member-consumer_TC53.spec.ts` |
| `business-creation` | `partner-portal/partner-portal-business-creation-and-member-invite_TC63_TC70.spec.ts` |

---

## Member Portal — Sign-up & Payment (TC01–TC16)

| TC | Pri | Scenario | Status | Run | Spec | Tag | Notes / next action |
|---|---|---|---|---|---|---|---|
| TC01 | High | Sign Up button creates a new account | ✅ | – | `signup-validation` | `@TC01` | — |
| TC02 | Med | Fill all required info on Sign Up | ✅ | – | `signup-validation` | `@TC02` | — |
| TC03 | High | Email address must be unique | ✅ | – | `signup-validation` | `@TC03` | — |
| TC04 | Med | All fields required except HR System | ✅ | – | `signup-validation` | `@TC04` | — |
| TC05 | High | Confirmation email received after sign-up | ✅ | – | `signup-validation` | `@TC05` | — |
| TC06 | Low | Confirmation email valid for 24 hours | ✅ | – | `plan-checkout` | `@TC06` | ⚠ Validates the email's stated wording, not real link expiry |
| TC07 | Med | After confirming email → Select Plan screen | ✅ | – | `plan-checkout` | `@TC07` | — |
| TC08 | High | Choose any available plan | ✅ | – | `plan-checkout` | `@TC08` | — |
| TC09 | Med | Pay annually or monthly, apply discount code | ✅ | – | `plan-checkout` | `@TC09` | ⚠🚫 Both billing cycles covered; **discount code has no field, flow, or data anywhere** |
| TC10 | High | After confirming payment → Stripe checkout | ✅ | – | `plan-checkout` | `@TC10` | — |
| TC11 | Med | Enter card info on Stripe | ✅ | – | `card-partner-signup` | `@TC11` | — |
| TC12 | High | Only valid cards are processed | ✅ | – | `card-partner-signup` | `@TC12` | — |
| TC13 | Med | All invalid cards are declined | ❌ | | — | — | 🚫 Needs an agreed Stripe decline-reason matrix; only `4242…0000` exists |
| TC14 | High | After payment → Virgil homepage | ✅ | – | `card-partner-signup` | `@TC14` | — |
| TC15 | High | Access granted per the plan's benefits | ❌ | | — | — | 🚫 Needs the benefit → visible-UI-element mapping per plan |
| TC16 | High | Sign up under an existing partner | ✅ | – | `card-partner-signup` | `@TC16` | — |

## Admin Portal — Customer Management (TC17–TC29)

Was 0/13. Eight cases automated in this cycle; **seven pass, TC24 fails**.

| TC | Pri | Scenario | Status | Run | Spec | Tag | Notes / next action |
|---|---|---|---|---|---|---|---|
| TC17 | High | Create a member account via Create New | ✅ | ✅ pass | `customer-creation` | `@TC17` | 44s |
| TC18 | Med | Admin fills the customer information | ❌ | | — | — | ♻ Form-filling exists; needs detail-view locators to assert values were saved |
| TC19 | Med | Choose paid account vs free trial | ❌ | | — | — | 🚫 `CustomerBuilder` has no `withFreeTrial(...)` setter |
| TC20 | Med | Enable or disable Bank Transfer | ✅ | ✅ pass | `customer-creation` | `@TC20` | 72s. Both branches; asserts the ON plan was assigned |
| TC21 | High | Bank ON → plan assigned, no Stripe | ❌ | | — | — | ♻🟢 Setup exists; plan now assertable via `verifySubscriptionPlanOfCustomer` |
| TC22 | High | Bank OFF → Select Plan + Stripe payment | ✅ | ✅ pass | `customer-creation` | `@TC22` | 107s |
| TC23 | Med | Bank ON → two emails received | ❌ | | — | — | 🚫 Plan-benefit notification email subject is undefined |
| TC24 | Med | Bank OFF → one email received | ✅ | ❌ **fail** | `customer-creation` | `@TC24` | ⚠🚫 See the open issue below — asserts presence, not count, and times out on the mailbox |
| TC25 | High | Log in with the credentials from the email | ✅ | ✅ pass | `customer-creation` | `@TC25` | 77s |
| TC26 | Med | First login forces a password change | ✅ | ✅ pass | `first-login` | `@TC26` | 81s. ⚠ Asserts the `change-password` URL was reached; proving it is *unskippable* needs `AuthFlow` split into login + changePassword |
| TC27 | High | Bank ON → Homepage with pre-assigned plan | ✅ | ✅ pass | `first-login` | `@TC27` | 90s. Asserts the plan via `verifySubscriptionPlanOfCustomer` |
| TC28 | High | Bank OFF → Select Plan screen | ✅ | ✅ pass | `first-login` | `@TC28` | 120s. Overlaps TC22 — consider merging |
| TC29 | Med | Free trial: plan + limited free days | ❌ | | — | — | 🚫 Plan half now assertable; blocked on `withFreeTrial(...)` **and** a trial-days locator |

## Admin Portal — Partner Management (TC30–TC47)

All 18 automated. Several carry assertion gaps: the test runs but stops at "the partner exists".

| TC | Pri | Scenario | Status | Run | Spec | Tag | Notes / next action |
|---|---|---|---|---|---|---|---|
| TC30 | High | Partner created only in Admin Portal | ✅ | – | `partner-basics` | `@TC30` | ⚠ The "only" half is unproven — no negative check |
| TC31 | High | Select level: Partner or PEO/Consultant | ✅ | – | `partner-basics` | `@TC31_UI` | ⚠🚫 **Never touches the `Partner Level` field.** Needs the two visible option labels |
| TC32 | Med | Partner ranks above PEO/Consultant | ✅ | – | `partner-basics` | `@TC32` | ⚠ Adds only one PEO — "one or multiple" unproven |
| TC33 | Med | Assign a sub-domain, or not | ✅ | – | `partner-basics` | `@TC33_UI` | ⚠ Only the empty branch runs; value never read back |
| TC34 | High | Payment Options: Owner or Consumer | ✅ | – | `partner-basics` | `@TC34` | ⚠ Loops both options but never verifies which was saved |
| TC35 | High | Owner pays in Partner Portal, owns Businesses | ✅ | ⚠ flaky | `partner-payment` | `@TC35` | ⚠ Owner assertion doesn't identify whose. **Known app-side instability in business creation** |
| TC36 | High | Consumer: no payment, Business has own owner | ✅ | – | `partner-payment` | `@TC36` | ⚠ Same owner-identity weakness as TC35 |
| TC37 | Med | Allow certain benefits in the Member Portal | ✅ | – | `partner-payment` | `@TC37` | ⚠🚫 Asserts only that Home loads. Needs the benefit → UI mapping |
| TC38 | Med | Restrict plans via the Product Type field | ✅ | – | `partner-payment` | `@TC38` | ⚠ Value entered but never verified |
| TC39 | High | Partner email must be unique | ✅ | – | `partner-payment` | `@TC39` | — |
| TC40 | High | Enable Bank Transfer for a new Partner | ✅ | – | `bank-credentials` | `@TC40` | ⚠ Test omits `.withBankTransfer(true)` — relies on the builder default |
| TC41 | High | Bank ON → plan assigned, no Stripe | ✅ | – | `bank-credentials` | `@TC41` | — |
| TC42 | High | Bank OFF → Select Plan + Stripe | ✅ | – | `bank-credentials` | `@TC42` | — |
| TC43 | Med | Owner config → two credential emails | ✅ | – | `bank-credentials` | `@TC43` | — |
| TC44 | High | Owner can log in to both portals | ✅ | – | `bank-credentials` | `@TC44` | — |
| TC45 | Med | Consumer config → one credential email | ✅ | – | `consumer-access` | `@45` | ⚠ **Tag missing the `TC` prefix** — `--grep @TC45` matches nothing |
| TC46 | High | Consumer owner can only use Partner Portal | ✅ | – | `consumer-access` | `@46` | ⚠ **Tag defect**, plus the negative half is unasserted |
| TC47 | High | Business owner cannot use Partner Portal | ✅ | – | `consumer-access` | `@TC47` | — |

## Partner Portal — Onboarding & Payment (TC48–TC53)

| TC | Pri | Scenario | Status | Run | Spec | Tag | Notes / next action |
|---|---|---|---|---|---|---|---|
| TC48 | Med | First login forces a password change | ✅ | – | `partner-onboarding` | `@TC48` | — |
| TC49 | High | Owner + Bank OFF → pays via Stripe | ✅ | – | `partner-onboarding` | `@TC49` | — |
| TC50 | High | After payment → Partner Homepage | ✅ | – | `partner-onboarding` | `@TC50` | Overlaps TC49 |
| TC51 | High | Other configurations require no payment | ✅ | – | `partner-onboarding` | `@TC51` | ⚠🚫 Covers 1 of 4 configurations. **Consumer + Bank OFF untested and unspecified** |
| TC52 | High | Owner owns Partner Team and all Businesses | ✅ | – | `partner-onboarding` | `@TC52` | ⚠ One Business only; owner assertion doesn't identify whose |
| TC53 | High | Consumer: Team owner ≠ Business owner | ✅ | – | `business-ownership` | `@TC53` | ⚠ Shares TC52's assertion despite expecting the opposite owner |

## Team Member Invitations & Roles (TC54–TC62)

| TC | Pri | Scenario | Status | Run | Spec | Tag | Notes / next action |
|---|---|---|---|---|---|---|---|
| TC54 | High | Invite members via Organization tab | ✅ | – | `invite-member` | `@TC54` | — |
| TC55 | High | Only Owner and Admin can invite | ✅ | – | `invite-member` | `@TC55` | — |
| TC56 | High | Admin invites members in Customer Management | ✅ | – | `customer-mgmt` | `@TC56_UI` | — |
| TC57 | Med | Invite from any account's Details page | ❌ | | — | — | ♻ TC56 covers two account types; the arbitrary-type branch is unspecified |
| TC58 | High | Invitation email is received | ✅ | ✅ pass | `invitation-email` | `@TC58` | 139s. Explicit `JOIN_TEAM` subject assertion |
| TC59 | Med | Invite link → Password Confirmation screen | ❌ | | — | — | ♻🚫 Screen is reached today; its URL fragment is unrecorded |
| TC60 | High | Member joins with the invited role | ❌ | | — | — | ♻ Needs a role read-back on the team list |
| TC61 | High | Permissions follow assigned roles | ❌ | | — | — | 🚫 Needs the full role → permission matrix |
| TC62 | Med | An account can belong to multiple teams | ❌ | | — | — | 🚫 Duplicate-invite behaviour undefined; no team-switcher UI modelled |

## Partner Portal — Business Creation & Ownership (TC63–TC70)

| TC | Pri | Scenario | Status | Run | Spec | Tag | Notes / next action |
|---|---|---|---|---|---|---|---|
| TC63 | High | Create a Business in Clients → Business tab | ✅ | ✅ pass | `business-creation` | `@TC63` | 65s. ⚠ As Partner **Owner** only; the Partner-Admin path needs the Partner role set. Note `--grep @TC63` also matches an API test |
| TC64 | High | Invite members during Business creation | ❌ | | — | — | ♻🚫 One person is passed today; role rules in the creation form are unspecified |
| TC65 | High | Invite members after Business creation | ❌ | | — | — | Needs a new flow method + locators for the Business detail view |
| TC66 | High | Owner config: Partner owns all Businesses | ❌ | | — | — | ♻ TC52 covers half; needs owner-identity + member-role read-back |
| TC67 | High | Consumer config: first invitee becomes Owner | ❌ | | — | — | ♻🚫 "First" is ambiguous; flow accepts only one owner today |
| TC68 | Med | Self-created Business → Admin role | ❌ | | — | — | Sign-up half exists (TC16); needs an own-role read-back |
| TC69 | Med | Self-created Business → Owner role | ❌ | | — | — | Same as TC68 — a pair worth writing together |
| TC70 | High | Business Owner/Admin invites from Member Portal | ✅ | ✅ pass | `business-creation` | `@TC70` | 204s. Failed once on a `beeinbox.com` connection drop, passed on re-run — no retries are configured |

## Admin Portal — Auto-Renew, Upgrade & Renewal (TC71–TC84)

The Auto-Renew Plan feature still has **no** page object, locator, or flow method anywhere in the repo.

| TC | Pri | Scenario | Status | Run | Spec | Tag | Notes / next action |
|---|---|---|---|---|---|---|---|
| TC71 | High | Admin can auto-renew or upgrade a plan | ✅ | – | `customer-mgmt` | `@TC71` | ⚠ Upgrade half only; auto-renew half 🚫 |
| TC72 | High | Only a team Owner can be renewed/upgraded | ✅ | ✅ pass | `upgrade-eligibility` | `@TC72` | 152s. Positive + negative control via `verifyUpgradePlan(Not)Available` |
| TC73 | High | Renew/upgrade actually changes the plan | ❌ | | — | — | Plan name assertable now; subscription **dates** still have no locator |
| TC74 | High | Auto-Renew can modify benefits and price | ❌ | | — | — | 🚫 Feature absent; no benefit/price data contract |
| TC75 | High | Official accounts: change applies only at expiry | ❌ | | — | — | 🚫 Feature absent + no expiry hook. "Official account" **is** resolved (`Official Subscription`) |
| TC76 | High | All auto-renew accounts renew per setup | ❌ | | — | — | 🚫 Feature absent + no expiry hook |
| TC77 | High | Auto-Renew needs a valid payment method | ❌ | | — | — | 🚫 Feature absent + needs a failing-stored-card Stripe fixture |
| TC78 | Med | Cancel a scheduled renewal | ❌ | | — | — | 🚫 Feature absent |
| TC79 | High | Upgrade Plan moves to a higher plan | ❌ | | — | — | ♻ TC71/TC80 have the mechanism; needs the lower-plan direction |
| TC80 | Med | Upgrade Plan allows toggling Bank Transfer | ✅ | ✅ pass | `upgrade-eligibility` | `@TC80` | 219s. ON → applied immediately; OFF → plan unchanged after `Request Payment` |
| TC81 | High | Bank ON → upgrade applies immediately | ❌ | | — | — | ♻ TC80's ON branch already asserts this; needs its own test + a no-email check |
| TC82 | High | Bank OFF → payment-request email → upgrade | ❌ | | — | — | 🚫 Payment-request email subject undefined |
| TC83 | High | No Auto-Renew → same plan renews at expiry | ❌ | | — | — | 🚫 No way to reach a subscription-expiry event |
| TC84 | Med | Functions apply only to non-Partner accounts | ✅ | ✅ pass | `upgrade-eligibility` | `@TC84` | 137s. Standalone vs Partner-linked (Business owner) |

---

## Open issue — TC24 is automated but failing

`validateReceivedOneEmailForCreatingCustomer` times out after 20s (`UI_ELEMENT_TIMEOUT_MS`) waiting for the beeinbox subject row `//div[contains(@class,'w-1/2')][contains(.,'VirgilHR - Your User Portal Credentials')]`. Failed on two consecutive runs, so it is consistent, not flaky.

The email definitely arrives — **TC25 reads that exact same credential email successfully** via `getCredentialsFromEmail`, and TC58 passes with the same helper because the invitation email lands faster. The credential email simply takes longer than the single 20s attach-wait allows.

Three options, none applied yet:

1. **Switch step 4 to `getCredentialsFromEmail`** — reliable, but TC24 then asserts roughly what TC25 does, since the distinguishing part (*exactly one* email) is blocked on TC23's unknown subject.
2. **Add refresh-polling to the mailbox helper** so it tolerates slow credential emails — more work, but benefits every future email assertion.
3. **`test.skip` with a note** until the plan-benefit subject is known.

Recommendation: (1) now, (2) when the mailbox layer is next touched.

## Fixes made to shared code during this cycle

| Change | Why |
|---|---|
| `PartnerManagementPage.accessToManagementPage` now expands the `Management` menu **conditionally** | `Management` is a toggle. The unconditional click expanded a collapsed menu (fine on fresh login, which is why 45 tests passed over it) but **collapsed an already-open one**, leaving the submenu attached-but-invisible. This broke TC20/TC72/TC80/TC84 the moment they reloaded the page. Pre-existing latent bug. |
| `OnboardingAdminPortalFlow.openDetailsInCustomerManagement` reloads first | Dismisses a modal left open by a previous step, whose `b-modal__wrapper` intercepts left-menu clicks — the same trick `assertSubscriptionPlanOfCustomer` already used. |
| New `OnboardingFlow.dismissOpenModals()` | Explicit spec-level step for the same problem where a left-menu navigation follows a modal-opening step. |
| New `OnboardingFlow.verifyUpgradePlanAvailable/NotAvailable()` + `CustomerManagementPage.getUpgradePlanButton()` | The negative check TC72 and TC84 need. Returned via `page.locator` (not `getLocator`, which waits for `attached` and would throw before absence could be asserted). |
| `AuthFlow.validateReceivedOneEmailForCreatingCustomer` now forwards an optional `subject` | The page method already accepted one; the flow wrapper was swallowing it, so no test could check a credential or invitation subject. |

## Suggested order of work

**1 — 🟢 Ready to write, no blockers** (7): TC21, TC57, TC59 *(needs only the URL fragment)*, TC66, TC73, TC79, TC81.

**2 — Unblocked by small code additions.** Each unlocks several cases:

| Change | Unblocks |
|---|---|
| Locators for subscription **dates** / trial days (plan *name* now exists) | TC29, TC73 |
| An owner assertion that identifies *which* email holds the role | TC66, TC67 — and the ⚠ on TC35, TC36, TC52, TC53 |
| `CustomerBuilder.withFreeTrial(...)` | TC19, TC29 |
| A member-role read-back on team lists | TC60, TC66, TC68, TC69 |
| A flow method + locators for the Business detail view | TC65 |

**3 — 🚫 Blocked pending product/QA input** (do not start): TC13, TC15, TC23, TC61, TC62, TC64, TC74–TC78, TC82, TC83, plus the ⚠ halves of TC09, TC31, TC37, TC51.

**4 — Housekeeping** (independent of coverage): fix the `@45` / `@46` tags; add explicit `.withBankTransfer(true)` to TC40; rename `customer-management.spec.ts` and `member-portal-invite-member.spec.ts` to the `<summary>_TC<ids>.spec.ts` convention and split TC56/TC71 apart; delete the OrangeHRM leftovers in `locators/common/`; fix the invalid `bankTranfer` XPath; correct `MAILBOX_URL` in `profile/.env.qa` and `.env.uat`; consider configuring `retries` given the observed `beeinbox.com` connection drop.
