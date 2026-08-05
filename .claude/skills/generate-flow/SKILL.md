---
name: generate-flow
description: >-
  Generate or extend a Flow class for a domain in this repo.
  Flows own ALL assertion logic — mainly via UiAssert helpers (allVisible,
  noneVisible, textContains, urlMatches) on a locator built from a static
  Locator class or a page-object getter. Actions delegate to page-object
  methods. No test.step(). Companion to the generate-pom skill.
---

# Generate Flow — Skill

> **Hard rule**: All assertions live in the Flow, never in the Page Object.
> The Flow builds a `Locator` — either `this.page.locator(SomeLocator.field)` directly, or via a page-object getter — and asserts on it, preferably through `UiAssert` (`src/assertions/ui-assert.ts`).
> The Flow MUST NOT call a `page.verifyXxx()` method — Page Objects don't have those.

---

## What a Flow contains

| Category | Allowed | Forbidden |
|---|---|---|
| Constructor | `new <DomainPage>(page)`, `this.page = page` | — |
| Action delegates | `async clickFoo() { await this.domainPage.clickFoo(); }` | Raw `page.click()` bypassing the page object for an action that already has a page-object method |
| Simple assertions | `async verifyFooVisible() { await UiAssert.allVisible([this.page.locator(SomeLocator.foo)]); }` | `page.verifyXxx()` (doesn't exist) |
| Text assertions | `UiAssert.textContains(locator, "expected text")` | — |
| Complex assertions | `expect.poll()`, multi-step checks, regex matching, value comparisons | Accessing private page-object members |
| Composite methods | Orchestrate multiple page calls in order | `test.step()` |

---

## Assertion patterns (this repo's real style)

### Visibility — batched via `UiAssert.allVisible`

```typescript
public verifyOwnerVisible = async () =>
  await UiAssert.allVisible([this.page.locator(BusinessLocator.ownerText)]);
```

`UiAssert.allVisible` accepts an array so multiple locators can be checked in parallel:

```typescript
public verifyPartnerVisible = async (partnerInfo: Partner) => {
  const partnerEmailLocator = this.page.getByText(partnerInfo.accountInfo!.email).first();
  await UiAssert.allVisible([partnerEmailLocator]);
};
```

### Nothing visible

```typescript
await UiAssert.noneVisible([this.page.locator(SomeLocator.errorBanner)]);
```

### Text content

```typescript
await UiAssert.textContains(this.page.locator("body"), "Email is existed");
```

### URL assertion (sync helper, not a `Locator`)

```typescript
public verifyURL = async (containedURL: string) =>
  await this.page.waitForURL(`**${containedURL}**`, { timeout: 30000 });
```

`UiAssert.urlMatches(url, pattern)` is available for a plain string comparison when you already have the URL as a string rather than waiting on navigation.

### Retry-with-reload pattern (used when data can be slow to appear)

```typescript
public verifyCustomerVisible = async (customerInfo: CustomerInfo) => {
  let locator;
  try {
    locator = this.page.getByText(customerInfo.accountInfo!.email).first();
    await UiAssert.allVisible([locator], { timeout: 60000 });
  } catch {
    await this.page.reload();
    locator = this.page.getByText(customerInfo.accountInfo!.email).first();
    await UiAssert.allVisible([locator], { timeout: 60000 });
  }
};
```

### Raw `expect()` — acceptable for one-off checks not covered by `UiAssert`

```typescript
async verifyFooCount(expected: number): Promise<void> {
  const count = await this.page.locator(SomeLocator.fooItem).count();
  expect(count).toBe(expected);
}
```

Prefer `UiAssert` when the assertion is "is this visible / does this contain text" — reach for raw `expect()` only when `UiAssert` has no matching helper.

---

## Step-by-step generation

### 1. Read the existing flow file

```
Read: src/ui/flows/<name>.flow.ts
      or src/ui/pages/<portal>/flows/<portal>.<name>.flow.ts
```

Grep every name you plan to add before adding it:

```
Grep: <method name> → <that flow file>
```

If found → re-use. If not found → safe to add.

### 2. Confirm the locator or page-object method exists

For every assertion you plan to write, confirm the Locator class already has the field, or the page object already has the getter:

```
Grep: <field name> → src/ui/pages/<portal>/locators/**/*.ts
```

If it doesn't exist → run the `generate-pom` skill first to add it.

### 3. Add action delegates

```typescript
async clickAddBusiness(): Promise<void> {
  await this.partnerPage.clickAddBusiness();
}
```

Composite actions sequence multiple page calls in order:

```typescript
public createBusinessFromPartnerPortal = async (partnerInfo: Partner, owner?: UserInfo) => {
  await this.onboardingPartnerPotalFlow.eraseModal();
  await this.onboardingPartnerPotalFlow.fillFormToCreateBusiness(partnerInfo, owner);
};
```

### 4. Add verify methods

Rules:
- Method name: `verifyXxx` for assertions, `getXxx` when returning a value for the spec to inspect.
- Prefer `UiAssert.allVisible([...])` / `noneVisible` / `textContains` over hand-written `expect(locator).toBeVisible()`.
- No `test.step()` — steps belong in the spec.
- Read locators from a static Locator class (`this.page.locator(SomeLocator.field)`) or a page-object getter — never invent a new selector string inline in the flow.

---

## Full pattern example (real style)

```typescript
import { Page } from "@playwright/test";
import { BusinessLocator } from "../pages/partner-portal/locators/business";
import { UiAssert } from "src/assertions";
import { OnboardingPartnerPotalFlow } from "../pages/partner-portal/flows/partnerportal.onboarding.flow";
import { Partner, UserInfo } from "src/objects";

export class OnboardingFlow {
  private readonly page: Page;
  private readonly onboardingPartnerPotalFlow: OnboardingPartnerPotalFlow;

  constructor(page: Page) {
    this.page = page;
    this.onboardingPartnerPotalFlow = new OnboardingPartnerPotalFlow(this.page);
  }

  public createBusinessFromPartnerPortal = async (partnerInfo: Partner, owner?: UserInfo) => {
    await this.onboardingPartnerPotalFlow.eraseModal();
    await this.onboardingPartnerPotalFlow.fillFormToCreateBusiness(partnerInfo, owner);
  };

  public verifyOwnerVisible = async () =>
    await UiAssert.allVisible([this.page.locator(BusinessLocator.ownerText)]);
}
```

---

## Checklist before marking the flow done

- [ ] Every `verifyXxx` asserts via `UiAssert.*` or a direct `expect()` — never `this.page.verifyXxx()`
- [ ] Every locator used in an assertion is confirmed to exist as a static field in a Locator class (or a page-object getter)
- [ ] Complex assertions (polling, multi-step, read-then-compare) live here, not in the page object
- [ ] No `test.step()` in any flow method
- [ ] Grepped the file for every new method name — no duplicates
- [ ] `pnpm lint` passes with 0 errors on this file (`tsc --noEmit` — no ESLint in this repo)
