# CLAUDE.md — VirgilHR Automation Framework

> **Scope**: Standalone Playwright E2E + API automation for **VirgilHR** (Admin Portal, Member Portal, Partner Portal).
> This is the only CLAUDE.md in the repo — there is no parent project and no PHP/Laravel tooling here.

---

## 1. Identity

| | |
|---|---|
| Package manager | **`pnpm`** (10.33.0) — never `npm` or `yarn` |
| Runner | Playwright Test 1.61.1, TypeScript strict, `ts-node` + `tsconfig-paths` |
| Default environment | **`qa`** (`ENV` defaults to `qa`) |
| Browser project | **`chromium`** only — the others are commented out in `playwright.config.ts` |
| Import style | **`src/*`** only (e.g. `import { test } from "src/fixtures"`). There is **no `@/` alias.** |
| Default branch | `dev` (PRs target `main`) |

**Not present in this repo — do not reference or reach for these:** ESLint (`pnpm lint` is `tsc --noEmit`), Allure, `storageState` auth, `docs/features-logic/`, `docs/coverage-reports/`, `config/env.ts`, `data/test-presets.ts`, visual/baseline snapshots.

---

## 2. Architecture — Non-Negotiable

```
Spec (tests/)  →  Fixtures (src/fixtures/)  →  Flow (src/ui/flows/)  →  Page Object (src/ui/pages/)  →  Locator class
                                            ↘  API Service (src/api/services/)  ↗
                  Data / Constants (src/data-factory/, src/constant/, src/objects/) — no browser dependency
```

No layer may import upward. **Layer violations are bugs — fix the boundary before adding code.**

| Layer | Location | Core constraint |
|---|---|---|
| **Locator class** | `src/ui/pages/<portal>/locators/` | `static readonly` selector **strings** only — no `Locator` objects, no logic. XPath strings are prefixed `xpath=`. Placeholder tokens (`phoneNumberValue`, `planValue`, `stateValue`, `errormessage`) are `.replace()`d by the Page Object. |
| **Page Object** | `src/ui/pages/<portal>/` | Extends `BasePage`. Single-element actions built from locator constants. **No assertions, no `test.step()`.** |
| **Flow** | `src/ui/flows/` | Orchestrates Page Objects and owns **all** assertions via `UiAssert` (`src/assertions/`). **No `test.step()`.** |
| **Spec** | `tests/UI/`, `tests/API/` | Imports `test` from `src/fixtures`. Calls fixture/flow methods only. **All `test.step()` lives here.** No direct `page.locator()`. |

`BasePage` provides exactly three helpers: **`getLocator`**, **`getLocatorInIframe`**, **`selectRadio`**. It does *not* have `fillWithRetry` or `waitForLoadingToDisappear` — don't call them.

Portal folders under `src/ui/pages/`: `admin-portal/`, `member-portal/`, `partner-portal/`, `shared-pages/`.

Depth: `docs/automation-docs/ARCHITECTURE.md` · `docs/automation-docs/AUTOMATION_FRAMEWORK_RULES.md`

---

## 3. Locator Rules

**Only `page.locator(...)` is permitted.** `getByTestId()`, `getByRole()`, `getByLabel()` and `getByText()` are banned — not as a final locator, and not as a throwaway probe during discovery either. Use CSS, `:has-text()` / `:text-is()`, or an `xpath=` string.

> Note: a few pre-existing call sites still use `getByText`/`getByRole` (e.g. `OnboardingFlow.verifyPartnerVisible`, `EmailServicePage`). Treat those as legacy debt, not precedent — never add new ones.

Full cascade and verification procedure: `/get-unique-locator`.

---

## 4. Fixtures

Import `test` from `src/fixtures` — never from `@playwright/test` in a spec.

| Group | Available fixtures |
|---|---|
| Flows | `authFlow`, `onboardingFlow`, `purchaseFlow`, `adminLoggedIn` |
| Pages | `loginPage`, `homePage`, `leftmenu`, `buyPlanPage`, `partnerManagementPage`, `customerManagementPage`, `partnerPage`, `homeExceptAdminPage` |
| API | `apiClient`, `authenticationService`, `adminPortalService`, `memberPortalService`, `partnerPortalService`, `partnerIntegrationService` |

---

## 5. Auth & Test Data

**No stored session state.** Every test logs in explicitly:

```ts
await loginPage.login();                       // Admin Portal, from ADMIN_USERNAME / ADMIN_PASSWORD
```

Partner and customer accounts are activated by **parsing their credential email**:

```ts
await authFlow.activateAndChangePassIndividualCustomer(email, "Member" | "Consumer" | "Partner portal", "Password@123");
```

That one call retrieves the credentials, logs in, and changes the password. **Never automate a mailbox as a UI journey** — assume the email was sent unless the case's subject *is* the email.

Mailbox providers supported by `AuthFlow.getCredentialsFromEmail`: **`yopmail`** and **`beeinbox`** only. Anything else throws `Unsupported mailbox`.

Data comes from builders — never hardcode a payload:

```ts
DataFactory.partnerBuilder()  /  .customerBuilder()  /  .peoPartnerBuilder()
CustomerFactory.generateMembers(count, "Admin" | "User")
PersonDataGenerator.generate({ emailDomain: "ussteel.xyz" })
```

API specs resolve live IDs at runtime via `TestDataProvider` (`getDepartmentId`, `filterMasterPlanBasedName`, `getProductTypesBasedDepartmentId`) — **never hardcode an ID**.

Shared constants live in `src/constant/`: `static-data.ts` (`validCardInfo`, `inValidCardInfo`, `validIndustry`, `validCountry`, `plans`) and `department.data.qa.ts` / `.uat.ts` (plan names + email subjects per department).

Detail: `docs/automation-docs/AUTH_FLOW.md` · `docs/automation-docs/AUTH_CREDENTIALS.md`

---

## 6. Environment

`loadPlaywrightEnv()` (`src/utilities/load-env.ts`) loads, in order:

1. Repo-root **`.env`** — always.
2. **`profile/.env.${ENV}`** — **only when `process.env.CI` is set**, overriding root values.

`ENV` defaults to `qa`. Files present: root `.env`, `.env.qa`; `profile/.env.qa`, `.env.uat`, `.env.prod`.

⚠ Root `.env` and `.env.qa` are **git-tracked and contain real QA credentials** — treat them as already exposed. Never add a new secret to a tracked file; use GitHub Environment secrets.

Headed mode is driven by `HEADED=true`; timeouts by `UI_ELEMENT_TIMEOUT_MS` (default 30000).

Detail: `docs/automation-docs/ENVIRONMENT_CONFIG.md`

---

## 7. Commands

```bash
pnpm install:browsers                          # playwright install --with-deps

pnpm test:playwright                           # everything under tests/
pnpm test:playwright:api                       # tests/API only
pnpm test:regression:api                       # --grep @regression_API
pnpm test:regression:ui                        # chromium, workers=1, headed
pnpm test:regression:ui:customer-management    # --grep @customer_management
pnpm test:regression:ui:partner-management     # --grep @partner_management
pnpm test:regression:ui:member-portal          # --grep @member_portal
pnpm test:regression:ui:partner-portal         # --grep @partner_portal

pnpm lint                                      # tsc --noEmit --pretty  (there is NO lint:fix)
pnpm playwright:report                         # open the last HTML report
pnpm playwright:codegen                        # record locators
```

Single-test dev loop — pass the spec path so a shared tag can't pull in an unrelated file:

```bash
pnpm exec playwright test tests/UI/admin-portal/<file>.spec.ts --project=chromium --workers=1 --headed --grep @TC35
```

---

## 8. Reporting

Two reporters run: the built-in `html`, and `CsvRowCollectorReporter` (`src/utilities/csv-row-collector-reporter.ts`), which collects one row per test **in memory** during `onTestEnd`.

`globalTeardown` (`src/utilities/global-teardown.ts`) turns those rows into a CSV in **`csv-report/`** — a persistent folder, deliberately *not* `test-results/`, which Playwright wipes at the start of every run. Filenames are `<grep-tag-or-spec-name>_MMDDYYYY_HHmmss.csv`, so runs accumulate instead of overwriting.

Two ordering facts that constrain any change here:

- `globalTeardown` always runs **before** any reporter's `onEnd()` — so teardown cannot read a reporter's output file. Hence the in-memory hand-off via `src/utilities/csv-row-store.ts`.
- CLI `--grep` is **not** exposed on `FullConfig`; the teardown reads `process.argv` to derive the filename tag.

---

## 9. Test Case Conventions

| Rule | Detail |
|---|---|
| Spec filename | `<brief-summary>_TC<ids>.spec.ts` — summary first, IDs after. Max **5** tests per file. |
| Test title | `TC<n> <scenario text from the CSV>` |
| Tags | Suite tag on `describe` (`@regression_UI` / `@regression_API` + area tag such as `@customer_management`), case tag on the test (`@TC35`) |
| Steps | Every action wrapped in `test.step()` inside the spec |

Known tag defects to avoid copying: `@45` / `@46` (missing `TC` prefix) and a duplicated `@TC030` across two different CSV rows.

---

## 10. Skills

Invoke with `/name`. **Announce the skill and the reason before invoking.**

| Skill | Use when |
|---|---|
| `/automate-test-cases` | **Start here for any new suite.** Turns test-case IDs or a suite doc into POM + Flow + Spec; runs the coverage audit and locator discovery itself. |
| `/audit-step-coverage` | Map an existing suite doc's steps onto the POM/flow methods that already cover them. |
| `/generate-pom` | Create or extend a Locator class + Page Object. |
| `/generate-flow` | Create or extend a Flow (assertions via `UiAssert`). |
| `/get-unique-locator` | Find one verified-unique locator for a single element. |
| `/playwright-cli` | Drive a real browser to explore the app or debug a spec. |

---

## 11. Reference Docs

Read the doc — don't guess.

| Topic | Read |
|---|---|
| Layers, folder map, path aliases | `docs/automation-docs/ARCHITECTURE.md` |
| Coding standards, locator rules, anti-patterns | `docs/automation-docs/AUTOMATION_FRAMEWORK_RULES.md` |
| Login and account-activation flows | `docs/automation-docs/AUTH_FLOW.md` |
| Which credentials exist and where they come from | `docs/automation-docs/AUTH_CREDENTIALS.md` |
| Env files and load order | `docs/automation-docs/ENVIRONMENT_CONFIG.md` |
| Playwright projects, timeouts, reporters | `playwright.config.ts` |
| **B2C smoke test cases (84, UI/E2E)** | `docs/test-cases-suites/README.md` → 7 suite files |
| **Automation coverage tracker** | `docs/test-cases-suites/AUTOMATION_STATUS.md` |

---

## 12. Docs Output Conventions

| Output | Folder | Naming |
|---|---|---|
| Test case suite | `docs/test-cases-suites/` | `<portal>-<area>.md` (kebab-case), indexed in that folder's `README.md` |
| Coverage tracker | `docs/test-cases-suites/` | `AUTOMATION_STATUS.md` — update it whenever a case's status changes |
| Framework reference | `docs/automation-docs/` | `UPPERCASE.md` |
| Automation plan | `docs/automation-plans/` | `<FEATURE>_<SUITE>_PLAN.md` (template: `.claude/skills/automate-test-cases/PLAN_TEMPLATE.md`) |
| Scratch / temp files | scratchpad dir | never the repo |
