# Automation Framework Rules

> **Stack**: Playwright (`@playwright/test` ^1.61) · TypeScript (strict) · pnpm
> **Architecture**: Locators → Page Objects → Flows → Tests
> **Enforced by**: TypeScript `strict: true` via `tsc --noEmit` (there is **no** ESLint in this repo)

These rules describe how test specs, flow classes, page objects, and locators are actually written in this framework. See [ARCHITECTURE.md](ARCHITECTURE.md) for the full directory map.

---

## 1. Imports

### Test specs — always import from `src/fixtures`

```typescript
// ✅ Correct
import { test } from "src/fixtures";

// ❌ Wrong — bypasses the merged fixture set (page + flow + api)
import { test } from "@playwright/test";
```

`expect` comes from `src/fixtures` too when needed in a spec, but most specs never call `expect` directly — assertions live in Flow methods.

### No path aliases

There is no `@/*` alias. Use `src/...` (resolved via `tsconfig.json` `paths`) or relative imports.

---

## 2. Authentication

There is **no** storage-state caching and **no** `global.setup.ts`. Every test that needs to be logged in calls a login method explicitly at the start of the test:

```typescript
await test.step("Login to Admin portal", async () => {
  await loginPage.login(); // reads ADMIN_PORTAL_BASE_URL / ADMIN_USERNAME / ADMIN_PASSWORD from env
});
```

Partner/Member/Customer accounts are activated by pulling the credential email from a mailbox (yopmail or beeinbox, `MAILBOX_URL` env var) via `authFlow.activateAndChangePassIndividualCustomer(...)` and similar `AuthFlow` methods — see [AUTH_FLOW.md](AUTH_FLOW.md).

---

## 3. Writing Flow Classes

### Location and naming

```
src/ui/flows/<name>.flow.ts                         # cross-portal flows: AuthFlow, OnboardingFlow, PurchaseFlow
src/ui/pages/<portal>/flows/<portal>.<name>.flow.ts # portal-specific flows: adminportal.onboarding.flow.ts, …
```

### Constructor pattern

```typescript
export class OnboardingFlow {
  private readonly page: Page;
  private readonly onboardingAdminPortalFlow: OnboardingAdminPortalFlow;

  constructor(page: Page) {
    this.page = page;
    this.onboardingAdminPortalFlow = new OnboardingAdminPortalFlow(this.page);
  }
}
```

### Assertions live in the Flow, via `UiAssert`

```typescript
public verifyOwnerVisible = async () =>
  await UiAssert.allVisible([this.page.locator(BusinessLocator.ownerText)]);
```

`UiAssert` (`src/assertions/ui-assert.ts`) exposes `allVisible`, `noneVisible`, `textContains`, `urlMatches`. Prefer it over raw `expect(locator).toBeVisible()` — it batches multiple locators in parallel and applies the default `UI_ELEMENT_TIMEOUT_MS`.

There is no hard rule that a Flow must always call a Page-object getter before asserting — it commonly builds the locator inline from a static Locator class (`this.page.locator(BusinessLocator.ownerText)`). This is normal in this codebase, not a shortcut to avoid.

No `test.step()` inside flow methods — steps belong in the spec.

### Teardown

There is no automatic fixture teardown for flows in this repo (no `flow.teardown()` wired into fixtures). If a test creates data that must be cleaned up, do it explicitly inside the test, not via fixture magic.

---

## 4. Writing Page Objects

### Location and naming

```
src/ui/pages/<portal>/<name>.page.ts     # e.g. admin-home.page.ts, partner-page.ts, member.page.ts
src/ui/pages/<portal>/<name>-page.ts     # some files use a hyphen instead of a dot — both exist, match the sibling file
src/ui/pages/shared-pages/<name>.page.ts
```

### Always extend `BasePage`

```typescript
import { BasePage } from "../base-page"; // relative — no @/pages alias

export class PartnerManagementPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }
}
```

`BasePage` (`src/ui/pages/base-page.ts`) provides `getLocator(selector, timeout?)`, `getLocatorInIframe(...)`, and `selectRadio(...)`. It does **not** provide `fillWithRetry`, `waitForLoadingToDisappear`, or any similarly named helper — those do not exist in this repo.

### Locators are static classes, not `Locator` fields

The dominant pattern is a plain class of `static readonly` selector strings, usually XPath, in a sibling `locators/` folder:

```typescript
// src/ui/pages/partner-portal/locators/business.ts
export class BusinessLocator {
  static readonly ownerText = "xpath=//div[text()='Owner']";
  static readonly addBussinessButton = "xpath=//span[text()='Add Business']";
}
```

Page-object methods resolve the selector at the point of use:

```typescript
async clickAddBusiness(): Promise<void> {
  await this.page.locator(BusinessLocator.addBussinessButton).click();
}
```

A minority of pages (e.g. `HomePage.getHomeTitle()`) expose a real `getXxx(): Promise<Locator>` getter. Either style is acceptable — match whatever the file you're extending already does.

### Method rules

- Page objects may contain guard-style waits (`locator.waitFor({ state: "visible" })`) but should not contain business-level `verifyXxx()` assertions — those belong in the Flow.
- No `test.step()` in page objects.

---

## 5. Writing Test Specs

### File placement and naming

```
tests/UI/admin-portal/*.spec.ts
tests/UI/partner-portal/*.spec.ts
tests/UI/member-portal/*.spec.ts
tests/API/admin-portal/*.spec.ts
tests/API/member-portal/*.spec.ts
tests/API/partner-integration/*.spec.ts
```

Split files so each contains **at most 5 test cases**; name the file `<brief-summary>_TC<id>_TC<id>....spec.ts` (test-case IDs after the summary).

### Required structure

```typescript
import { test } from "src/fixtures";
import { DataFactory } from "src/data-factory";
import { plans } from "src/constant/static-data";

test.describe("E2E -> Admin Portal -> Partner Management", { tag: ["@regression_UI", "@partner_management"] }, () => {
  test(
    "TC30 Verify that a partner account can only be created in the Admin Portal – Partner Management.",
    { tag: ["@TC30"] },
    async ({ loginPage, onboardingFlow }) => {
      await test.step("Login to Admin portal", async () => {
        await loginPage.login();
      });

      const partnerInfo = await DataFactory.partnerBuilder()
        .withDepartmentName(process.env.DEPARTMENT_NAME!)
        .withPaymentOption("Partner/Consultant Owner")
        .withProductsType([plans[0]])
        .build();

      await test.step("Create a new partner", async () => {
        await onboardingFlow.createPartnerAndAddPeoInAdminPortal(partnerInfo!);
      });
    },
  );
});
```

### Tags

Tag both the `describe` block (suite-level, e.g. `@regression_UI`, `@partner_management`) and each `test()` (test-case tag, e.g. `@TC30`). API specs additionally use `@API`, `@regression_API`.

### Steps

Wrap each meaningful action in `test.step("<description>", ...)`. No mandatory numbering convention exists (some specs number, e.g. `"1 - Login to Admin portal"`, most don't) — follow whatever the existing tests in that file do.

There is **no** `test.describe.configure({ mode: "serial" })` convention and **no** required parallel/serial mode — `playwright.config.ts` already runs with `workers: 1` and `fullyParallel: false` globally.

---

## 6. Test Data

Build data with `DataFactory` (`src/data-factory`), never hardcoded literals for anything that must be unique (emails, names):

```typescript
import { DataFactory, PersonDataGenerator } from "src/data-factory";

const partnerInfo = await DataFactory.partnerBuilder()....build();
const ownerInfo = await PersonDataGenerator.generate({ emailDomain: "ussteel.xyz" });
```

There is no `data/test-presets.ts` and no named preset constants (`TEST_APPS`, etc.) in this repo — every test builds its own data via the builder.

For API specs, resolve live IDs first via `TestDataProvider` (`src/test-data`), then feed them into the builder (`.withDepartment(departmentID)`, `.withPlanId(masterPlanId)`, …).

---

## 7. TypeScript Rules

- `strict: true`. Avoid `any` where a real type is available, but the codebase does use `any` pragmatically for API response shapes (`resp: any`) — don't rewrite existing patterns to fight this.
- Non-null assertions (`!`) are used freely on builder outputs (`partnerInfo!.accountInfo?.email!`) — this is idiomatic here, not a smell to fix.

---

## 8. Linting / Type-checking

```bash
pnpm lint          # = tsc --noEmit --pretty — the ONLY check; there is no ESLint config
```

Run this after any source change before considering the change done.

---

## 9. Running Tests

```bash
pnpm test:playwright                                    # full suite
pnpm test:playwright:api                                # tests/API only
pnpm test:regression:ui                                 # --project=chromium --workers=1 --headed, @regression_UI
pnpm test:regression:ui:partner-management               # @partner_management
pnpm test:regression:ui:member-portal                    # @member_portal
pnpm test:regression:ui:partner-portal                    # @partner_portal
pnpm test:regression:ui:customer-management               # @customer_management
pnpm test:regression:api                                # @regression_API
pnpm playwright:report                                   # open last HTML report
```

There is no Allure integration and no `pnpm test:smoke*` script — everything above is the real script list in `package.json`.

---

## 10. Anti-Patterns — Never Do

| Anti-pattern | Why it is wrong | Correct approach |
|---|---|---|
| `import { test } from "@playwright/test"` in a spec | Skips the merged page/flow/api fixtures | Import from `src/fixtures` |
| Calling a nonexistent `BasePage` helper (`fillWithRetry`, `waitForLoadingToDisappear`) | Those methods don't exist in this repo | Use `this.getLocator(...)` + `.waitFor({ state: "visible" })`, or plain Playwright locator methods |
| Referencing `@/fixtures`, `@/pages`, `data/test-presets.ts`, Allure, or storage-state auth | None of these exist in this project — they belong to a different framework | Use `src/fixtures`, `src/data-factory`, env-var/email-based login |
| Hardcoding an email/name literal that must be unique across test runs | Causes collisions on re-run | Generate via `DataFactory` / `PersonDataGenerator` |
| More than 5 `test()` cases in one spec file | Repo convention caps spec files at 5 test cases | Split into multiple files, named `<summary>_TC<id>_TC<id>....spec.ts` |
