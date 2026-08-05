---
name: generate-pom
description: >-
  Generate or extend a Page Object / Locator file for a domain in this repo.
  Locators are static selector-constant classes; Page Objects extend BasePage
  and expose action methods built from those locators. NO business-level
  verify/assertion methods are added to a Page Object — assertions live in
  the Flow layer (see generate-flow skill).
---

# Generate POM — Skill

> **Hard rule**: A Page Object is a locator + action library only.
> It MUST NOT contain business-level `expect()` or `verifyXxx()`.
> Guard-style waits (`locator.waitFor({ state: "visible" })`) before an action are fine — those are not assertions.

This repo's actual convention differs from the generic Playwright-framework "getter-per-locator" pattern — read this whole file before writing anything, and prefer matching the sibling file you're extending over the idealized examples below.

---

## The two real building blocks

### 1. Locator classes — plain, `static readonly` string constants

Live in a `locators/` folder next to the page they belong to. No `Locator` type, no `page.locator()` call inside the class — just the selector string, usually XPath:

```typescript
// src/ui/pages/partner-portal/locators/business.ts
export class BusinessLocator {
  static readonly businessTab = "xpath=//div[@id='tab-business']";
  static readonly addBussinessButton = "xpath=//span[text()='Add Business']";
  static readonly ownerText = "xpath=//div[text()='Owner']";
}
```

### 2. Page Objects — extend `BasePage`, resolve locators inline

```typescript
import { Page } from "@playwright/test";
import { BasePage } from "../base-page"; // relative import — no @/pages alias exists

export class PartnerPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async clickAddBusiness(): Promise<void> {
    await this.page.locator(BusinessLocator.addBussinessButton).click();
  }
}
```

`BasePage` (`src/ui/pages/base-page.ts`) provides:

| Helper | Signature | Use for |
|---|---|---|
| `getLocator(selector, timeout?)` | `Promise<Locator>` | Resolve a selector with `LocatorHandling`'s built-in wait |
| `getLocatorInIframe(iframeSelector, selector, timeout?)` | `Promise<Locator>` | Same, scoped inside an iframe |
| `selectRadio(label, scopeSelector?, timeout?)` | `Promise<void>` | Click a radio option by accessible name |

There is **no** `fillWithRetry`, `waitForLoadingToDisappear`, `verifyElementVisible`, or `clickAndWaitForNavigation` helper in this repo — do not call or add methods with those names expecting them to already exist.

A minority of Page Objects (e.g. `HomePage.getHomeTitle()`) do expose a real `async getXxx(): Promise<Locator>` getter that waits for visibility and returns the `Locator`. That style is acceptable when the flow genuinely needs to read the same locator more than once, but it is not required — inlining `this.page.locator(SomeLocator.field)` at the call site is the norm.

---

## What a Page Object contains

| Category | Allowed | Forbidden |
|---|---|---|
| Locator class | `static readonly fooSelector = "xpath=..."` in a sibling `locators/*.ts` file | Selectors defined inline inside a Page-Object method body |
| Action methods | `async clickFoo(): Promise<void>`, `async fillFoo(value: string): Promise<void>` | Any business-level `expect()` call |
| Reader methods | `async getFooText(): Promise<string>` | `verifyXxx()` naming |
| Optional getter | `async getFoo(): Promise<Locator>` (see `HomePage.getHomeTitle`) | Returning a non-`Promise` `Locator` unless the rest of the file already does so |
| Assertions | **NONE** | `verifyXxx()`, business-level `expect()`, `toBeVisible()`, etc. |

---

## Step-by-step generation

### 1. Read the existing file(s)

```
Read: src/ui/pages/<portal>/<name>.page.ts   (or <name>-page.ts, or shared-pages/<name>.page.ts)
Read: src/ui/pages/<portal>/locators/<name>.ts
```

Grep for every name you plan to add before adding it:

```
Grep: <locator name> → src/ui/pages/<portal>/locators/**/*.ts
Grep: <method name>  → src/ui/pages/<portal>/<name>.page.ts
```

If found → re-use. If not found → safe to add.

### 2. Add locator constants

Add to the existing Locator class for that page/modal, or create a new one following the naming of siblings in the same `locators/` folder:

```typescript
// Step N — count verified = 1
static readonly saveButton = "xpath=//button[text()='Save']";
```

Never invent a selector — every new selector must be confirmed by a live count check (see `get-unique-locator`).

### 3. Add action methods

```typescript
async clickSave(): Promise<void> {
  const btn = this.page.locator(SomeLocator.saveButton);
  await btn.waitFor({ state: "visible" });
  await btn.click();
}
```

Rules:
- `waitFor({ state: "visible" })` before `click()` / `fill()` when the element may not yet be in the DOM.
- Use `this.getLocator(selector, timeout)` instead of `this.page.locator(selector)` when you need `BasePage`'s built-in wait/timeout handling (check how the file you're editing already does it — both styles exist).
- No `test.step()`. No business-level `expect()`. No `verify` naming.

### 4. Add reader methods (optional)

```typescript
async getFooLabel(): Promise<string> {
  const el = this.page.locator(SomeLocator.fooLabel);
  await el.waitFor({ state: "visible" });
  return (await el.textContent())?.trim() ?? "";
}
```

---

## Full pattern example (real style)

```typescript
import { Page } from "@playwright/test";
import { BasePage } from "../base-page";
import { BusinessLocator } from "./locators/business";

export class PartnerPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async clickBusinessTab(): Promise<void> {
    await this.page.locator(BusinessLocator.businessTab).click();
  }

  async clickAddBusiness(): Promise<void> {
    const btn = this.page.locator(BusinessLocator.addBussinessButton);
    await btn.waitFor({ state: "visible" });
    await btn.click();
  }

  async fillTeamName(name: string): Promise<void> {
    await this.page.locator(BusinessLocator.teamNameInput).fill(name);
  }
}
```

---

## Checklist before handing off to generate-flow

- [ ] No business-level `expect()` import used for assertions in the file
- [ ] No method named `verifyXxx`
- [ ] New locators added as `static readonly` fields in the matching `locators/*.ts` file — not inlined in a method body
- [ ] All new locators sourced from a confirmed browser check — no invented selectors
- [ ] Grepped the file for every new name before adding — no duplicates
- [ ] Matched the existing file's style (`this.page.locator(...)` vs `this.getLocator(...)`, getter vs inline) rather than introducing a third pattern
- [ ] `pnpm lint` passes with 0 errors on this file (this is `tsc --noEmit` — there is no ESLint in this repo)
