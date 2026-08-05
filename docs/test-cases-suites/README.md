# B2C Smoke Test Cases — Suite Index

Markdown conversion of `docs/automation-docs/Smoke test - B2C_Latest.csv` (84 test cases), split by portal and feature area. Each suite file carries a **Test Data Reference** table sourced from real constants and locators in this repo, then one section per test case with priority, automation status, precondition, and a step/expected-result table.

## Scope: UI / E2E only

Every case is written as a **browser-driven end-to-end journey** — navigate, click, type, read what the user sees. No case is satisfied by asserting an HTTP response body, a database row, or an internal numeric code. API specs under `tests/API/**` still exist and still run in `test:regression:api`, but they do not count as coverage here: an API assertion on `subscription.name` does not prove a user sees the right plan.

## How status is decided

Status answers exactly one question: **does a test in `tests/UI/**` own this case?** A case is ✅ when a spec contains a test titled and tagged for it. Anything else is ❌ — including cases whose journey already runs as another test's *setup*.

Two separate labels carry the quality information, so it is not lost:

- **⚠ Assertion gap** — the test exists and runs, but its assertion is weaker than the case title claims (e.g. TC34 creates a partner for each Payment Option but never verifies which one was saved).
- **♻ Reusable setup / Overlapping coverage** — the case is ❌, but the flow methods it needs already run elsewhere, so writing it is mostly assembly (e.g. TC17's whole journey is TC56's setup).

Verified against all 16 UI spec files on 2026-08-05.

## Tracking view

📊 **[AUTOMATION_STATUS.md](AUTOMATION_STATUS.md)** — all 84 cases in one table: TC number, priority, scenario, status, **last-run result**, owning spec file, tag, and the specific next action. Use that file for sprint planning and coverage reporting; use the suite files below for the step-by-step detail an agent needs to write the test.

**Latest execution (2026-08-05, UAT):** the 14 cases automated in this cycle were run — **13 pass, 1 fails** (TC24, see the tracker's open-issue section). The other 42 automated cases were not re-run in this cycle.

## Suites

| File | CSV rows | Area | UI coverage |
|---|---|---|---|
| [member-portal-signup-and-payment.md](member-portal-signup-and-payment.md) | 1–16 | Member Portal sign-up, plan selection, Stripe checkout | **14 ✅ / 2 ❌** |
| [admin-portal-customer-management-create-account.md](admin-portal-customer-management-create-account.md) | 17–29 | Admin Portal → Customer Management, account creation, Bank Transfer | **8 ✅ / 5 ❌** |
| [admin-portal-partner-management.md](admin-portal-partner-management.md) | 30–47 | Admin Portal → Partner Management, partner levels, payment options, credentials | **18 ✅ / 0 ❌** |
| [partner-portal-onboarding-and-payment.md](partner-portal-onboarding-and-payment.md) | 48–53 | Partner Portal first login, Stripe payment, team/business ownership | **6 ✅ / 0 ❌** |
| [team-member-invitations-and-roles.md](team-member-invitations-and-roles.md) | 54–62 | Invitations from the Member Portal and Admin Portal, roles, permissions | **4 ✅ / 5 ❌** |
| [partner-portal-business-creation-and-ownership.md](partner-portal-business-creation-and-ownership.md) | 63–70 | Clients → Business tab, invited members, owner assignment rules | **2 ✅ / 6 ❌** |
| [admin-portal-plan-auto-renew-upgrade-and-renewal.md](admin-portal-plan-auto-renew-upgrade-and-renewal.md) | 71–84 | Auto-Renew Plan, Upgrade Plan, renewal on expiry | **4 ✅ / 10 ❌** |
| **Total** | **84** | | **56 ✅ / 28 ❌ (67%)** |

## UI spec files → cases owned

| Spec file | Cases |
|---|---|
| `member-portal/member-portal-signup-and-validation_TC01_TC02_TC03_TC04_TC05.spec.ts` | TC01–TC05 |
| `member-portal/member-portal-plan-selection-and-checkout_TC06_TC07_TC08_TC09_TC10.spec.ts` | TC06–TC10 |
| `member-portal/member-portal-payment-card-and-partner-signup_TC11_TC12_TC14_TC16.spec.ts` | TC11, TC12, TC14, TC16 |
| `member-portal/member-portal-invite-member.spec.ts` | TC54, TC55 |
| `admin-portal/admin-portal-create-partner-basics_TC30_TC31_TC32_TC33_TC34.spec.ts` | TC30–TC34 |
| `admin-portal/admin-portal-partner-payment-and-business_TC35_TC36_TC37_TC38_TC39.spec.ts` | TC35–TC39 |
| `admin-portal/admin-portal-bank-transfer-and-credentials_TC40_TC41_TC42_TC43_TC44.spec.ts` | TC40–TC44 |
| `admin-portal/admin-portal-member-consumer-access_TC45_TC46_TC47.spec.ts` | TC45–TC47 |
| `admin-portal/customer-management.spec.ts` | TC56, TC71 |
| `admin-portal/admin-portal-customer-creation-and-credentials_TC17_TC20_TC22_TC24_TC25.spec.ts` | TC17, TC20, TC22, TC24, TC25 |
| `admin-portal/admin-portal-customer-first-login-and-payment_TC26_TC27_TC28.spec.ts` | TC26, TC27, TC28 |
| `admin-portal/admin-portal-plan-upgrade-eligibility_TC72_TC80_TC84.spec.ts` | TC72, TC80, TC84 |
| `member-portal/member-portal-invitation-email_TC58.spec.ts` | TC58 |
| `partner-portal/partner-portal-onboarding-payment_TC48_TC49_TC50_TC51_TC52.spec.ts` | TC48–TC52 |
| `partner-portal/partner-portal-business-ownership-member-consumer_TC53.spec.ts` | TC53 |
| `partner-portal/partner-portal-business-creation-and-member-invite_TC63_TC70.spec.ts` | TC63, TC70 |

**Cases with no owning UI test** (28): TC13, TC15, TC18, TC19, TC21, TC23, TC29, TC57, TC59, TC60, TC61, TC62, TC64–TC69, TC73–TC79, TC81, TC82, TC83.

The two big contiguous holes are now partly closed: Customer Management went 0 → 8 of 13, and Business creation 0 → 2 of 8. What remains in those blocks needs either a read-back locator or a product answer — see the tracker.

## The three fixes that move the most cases

Ranked by cases improved per unit of work — all UI-side:

1. **Add locators that read a subscription back from the screen.** The current *plan name* is now readable in the Admin Portal Customer Details modal → Subscription section (`CustomerDetailModalLocator.subscriptionPlan`, asserted by `OnboardingFlow.verifySubscriptionPlanOfCustomer` — used by TC71). Still nothing reads subscription dates, trial days, or the renewal date, and nothing reads a plan back in the Member Portal, which keeps TC18, TC21, TC27, TC29, TC73, TC79, TC80 and TC81 from having a real verification.
2. **Make the Owner assertion identify *who* owns.** `verifyOwnerVisible()` checks only that a `//div[text()='Owner']` label exists, so TC35 and TC36 — and TC52 and TC53 — pass with an identical assertion while expecting **opposite** owners. The email-parameterised pattern already exists next door (`ClientPartnerPortalLocators.role`); reuse its shape against the Business table.
3. **Add `withFreeTrial(...)` to `CustomerBuilder`.** `CustomerInfo.freeTrial` exists and `fillFormToCreateCustomer` already reads it to pick the `Free Trial` radio, but there is no setter — so the entire free-trial branch of the create-customer form is unreachable from a UI test. Blocks TC19 and TC29.

## Blocked cases — need data or decisions from product/QA

Every gap is flagged inline with ⚠ in its own case. These cannot be automated at all until someone supplies information:

| Case | What is missing |
|---|---|
| TC09 (⚠ assertion gap) | Discount/coupon code — no field, flow, or test data exists anywhere in the repo |
| TC13 | A Stripe decline-reason matrix; only one invalid card (`4242 4242 4242 0000`) is defined |
| TC15, TC37 (⚠) | The benefit → visible-UI-element mapping for each plan. Without it there is nothing on screen to assert against. |
| TC23 | Subject line of the customer plan-benefit notification email |
| TC29 | Whether the trial length is admin-configurable in the `Add New Customer` modal or fixed server-side, and where remaining days are displayed |
| TC31 (⚠) | The two visible option labels in the `Partner Level` dropdown (only the numeric `withLevel(0\|1)` values are known) |
| TC61 | The full role → permission matrix (only "a `User` cannot invite" is known) |
| TC62 | Expected behaviour when inviting an already-registered email, and how multi-team membership appears in the UI |
| TC64, TC67 | Whether roles are selectable during Business creation, and whether "first invited member" means the first form row or the first to accept |
| TC74, TC76–TC78 | The **Auto-Renew Plan feature is not modelled anywhere in this repo** — no page object, no locator, no flow method. Its modal's fields and buttons are unrecorded. |
| TC75, TC76, TC83 | Any way to reach a subscription-expiry event inside a test (a date hook, a force-renew action, or an agreed manual-only classification) |
| TC77 | A Stripe fixture for a stored card that is valid at setup and fails at renewal |
| TC82 | Subject line of the upgrade payment-request email |

> One gap closed during the UI rewrite: **"official account" (TC75) is no longer unknown** — the `Add New Customer` modal's `Subscription Type` field offers exactly `Official Subscription` and `Free Trial`, so an official account is one created with the former.

## Defects found in the existing automation while converting

| Where | Issue |
|---|---|
| `new-customer-modal.ts` | `CreateNewCustomerModalLocator.bankTranfer` ends in `//span]` — an unbalanced bracket that makes it an invalid XPath. Production code silently works around it by borrowing the *partner* modal's `bankTransfer` locator. |
| `customer-builder.ts` | No `withFreeTrial(...)` setter, despite `CustomerInfo.freeTrial` existing and the page object reading it — the free-trial UI path is unreachable from tests |
| `admin-portal-member-consumer-access_TC45_TC46_TC47.spec.ts` | TC45/TC46 are tagged `@45` / `@46` — missing the `TC` prefix, so `--grep @TC45` never matches them |
| `api-partner-management-create-and-level_*.spec.ts` vs UI | CSV row 30 is `@TC030` in the API spec but `@TC30` in the UI spec — `--grep @TC30` hits only one of them |
| `api-admin-portal-customer-free-trial_TC030.spec.ts` | Tagged `@TC030` for CSV row **29** — collides with the partner-management `@TC030` above |
| `api-partner-management-benefits-and-login_*.spec.ts` | The commented-out TC47 block's title says "cannot log in to the **Member** Portal", contradicting the CSV ("Partner Portal") |
| `onboarding.flow.ts:48` (`verifyOwnerVisible`) | Asserts only that an `Owner` label exists, never *which* email holds it — so TC35/TC36 and TC52/TC53 pass identically despite expecting opposite owners |
| `admin-portal-create-partner-basics_*.spec.ts` (TC33) | The step is named "Verify the domain is emty" but calls `verifyPartnerVisible`, which checks the email — the sub-domain is never read back |
| `admin-portal-bank-transfer-and-credentials_*.spec.ts` (TC40) | Builds the partner without an explicit `.withBankTransfer(true)`, so the case does not exercise the toggle it is named for |
| `customer-management.spec.ts`, `member-portal-invite-member.spec.ts` | The only two UI spec files with no test-case IDs in their filenames — inconsistent with the repo's `<summary>_TC<ids>.spec.ts` convention. `customer-management.spec.ts` additionally holds two unrelated suites (TC56 + TC71). |
| `locators/common/admin-home.ts`, `admin-leftmenu.ts` | Not VirgilHR locators at all — OrangeHRM `oxd-*` classes and widget names ("Time at Work", "Buzz Latest Posts") from an unrelated demo app. Should be deleted so nobody writes tests against them. |
| `profile/.env.qa`, `profile/.env.uat` | `MAILBOX_URL` is set to `tempemailfree.com`, but `AuthFlow.getCredentialsFromEmail` supports only `yopmail` and `beeinbox` — any CI run that reads a credential email would throw `Unsupported mailbox` |
