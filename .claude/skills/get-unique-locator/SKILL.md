---
name: get-unique-locator
description: >
  Find a single verified-unique locator for one specific element using a
  structured XPath attribute-priority cascade. Dumps all element attributes
  first, then works through: stable IDs → automation attributes → ARIA/semantic
  → text-based XPath → compound predicates → axis navigation (ancestor,
  sibling). Every locator is verified with count = 1 before acceptance.
  Outputs XPath expression + Playwright equivalent + POM TypeScript snippet.
allowed-tools: Bash(playwright-cli:*) Bash(npx:*)
---

# Get Unique Locator — Skill

> **Scope**: One missing or broken locator at a time.
> For a full user journey, use `/automate-test-cases` → `/playwright-cli` instead.

---

## When to Use

| Situation | Use this skill |
|-----------|---------------|
| One locator missing from an `automate-test-cases` plan | ✅ |
| A locator in an existing page object is broken | ✅ |
| A single new element was added to the page | ✅ |
| Recording a full user journey | ❌ use `/playwright-cli` |

**Hard rule:** Never invent or guess a locator. Every locator must pass the count = 1 verification before it is accepted.

**Locator declaration rule (this repo):** locators are declared as plain `static readonly` string constants on a Locator class in a `locators/*.ts` file (e.g. `src/ui/pages/partner-portal/locators/business.ts`), usually as an XPath expression (`"xpath=//div[text()='Owner']"`). They are **not** stored as constructor-assigned `Locator` fields inside the Page Object itself — resolution (`this.page.locator(SomeLocator.field)`) happens at the point of use in the Page Object or Flow method.

**Never use `getByTestId()` / `getByRole()` / `getByLabel()` / `getByText()` — not as the final locator, and not as a discovery/verification command either.** Every probe, every uniqueness check, and every accepted locator must go through `page.locator(...)` (CSS selector, `:has-text()`/`:text-is()` pseudo-classes, or an `xpath=` string) — no exceptions, no "transient" use of the semantic getters. This product has few, if any, `data-testid` hooks, so expect to land on the text-based (Tier 5) or structural tiers far more often than in a test-id-instrumented app.

---

## Priority Cascade — Overview

Work top to bottom. **Stop at the first tier that yields count = 1.** Never use a lower tier when a higher one works.

```
Tier 1  Stable identity attributes
        1a. id (non-generated)              //tag[@id='value']
        1b. name                            //tag[@name='value']

Tier 2  Automation / test attributes
        2a. data-testid                     //tag[@data-testid='value']
        2b. data-cy / data-qa / data-test   //tag[@data-cy='value']
        2c. data-automation-id              //tag[@data-automation-id='value']

Tier 3  ARIA / accessibility attributes
        3a. role + aria-label               //tag[@role='button'][@aria-label='Save']
        3b. aria-labelledby reference       //tag[@aria-labelledby='label-id']
        3c. aria-describedby                //tag[@aria-describedby='desc-id']

Tier 4  Functional / structural attributes
        4a. type + value (inputs)           //input[@type='submit'][@value='Save']
        4b. placeholder                     //input[@placeholder='Search…']
        4c. href (links)                    //a[contains(@href,'/dashboard')]
        4d. tag + class (stable BEM class)  //button[contains(@class,'btn--primary')]

Tier 5  Text-based XPath
        5a. Exact text                      //button[normalize-space(text())='Save chart']
        5b. Partial text                    //button[contains(text(),'Save')]
        5c. Descendant text                 //button[.//span[text()='Save']]

Tier 6  Compound predicates
        6a. Tag + attribute + text          //button[@type='button'][text()='Delete']
        6b. Multiple attributes             //input[@type='email'][@name='login']

Tier 7  Axis navigation (relational)
        7a. Ancestor scoping               //div[@data-testid='form']//button[@type='submit']
        7b. Following-sibling              //label[text()='Name']/following-sibling::input
        7c. Preceding-sibling              //button[preceding-sibling::button[text()='Cancel']]
        7d. Parent → nth child             //div[@data-testid='toolbar']/button[2]

Tier 8  Positional (last resort — must justify)
        (//button[contains(@class,'action')])[1]
```

---

## Unstable Locator Patterns — Never Use

Reject any attribute whose value matches these patterns. Move to the next tier immediately.

| Pattern | Examples | Why it breaks |
|---------|----------|---------------|
| Framework-generated prefix | `reka-dialog-v-0`, `headlessui-btn-12`, `radix-popover` | Changes on every render or version bump |
| Pure numeric / UUID | `id="123"`, `id="550e8400-e29b-41d4-a716"` | Regenerated on each page load |
| Timestamp / random suffix | `btn-1716800000-abc`, `field-x7k9p` | Changes every session |
| Build-hash class | `.css-1a2b3c`, `._3xA_q` | Changes on every build |
| Angular internal | `_nghost-abc-c123`, `ng-reflect-*` | Framework internals, not stable |
| Utility-first class only | `.flex`, `.text-sm`, `.mt-4` | Shared across hundreds of elements |

---

## Step 0 — Attribute Dump (Do This First)

Before probing attributes one at a time, dump all attributes of the target element in one call. This gives you the full picture and saves time.

```bash
# Navigate and snapshot to get the element ref
playwright-cli open <APP_BASE_URL>
playwright-cli state-load .auth/staging-user.json
playwright-cli goto <page-path>
playwright-cli snapshot
# → identifies ref, e.g. e18

# Dump ALL attributes at once
playwright-cli eval "el => JSON.stringify([...el.attributes].map(a => ({name: a.name, value: a.value})), null, 2)" e18
```

**Example dump output:**
```json
[
  { "name": "data-testid",   "value": "chart-save-btn" },
  { "name": "type",          "value": "button" },
  { "name": "class",         "value": "btn btn--primary css-1x2y3z" },
  { "name": "aria-label",    "value": "Save chart" },
  { "name": "id",            "value": "headlessui-btn-:r3:" }
]
```

Read the dump, then pick the correct tier based on what is available. In this example:
- Tier 1 (id) → reject — `headlessui-btn-:r3:` is framework-generated
- Tier 2 (data-testid) → `chart-save-btn` → probe this next

Also dump the parent's attributes when the element itself looks attribute-poor:

```bash
playwright-cli eval "el => JSON.stringify([...el.parentElement.attributes].map(a => ({name: a.name, value: a.value})), null, 2)" e18
```

---

## Step 1 — Reveal Hidden Elements

If the target element is inside a dialog, dropdown, tooltip, or hover-only container, trigger the interaction first:

```bash
playwright-cli hover e7          # reveal hover-only element
playwright-cli click e3          # open dialog / dropdown
playwright-cli snapshot          # re-snapshot after state change
```

For elements inside `<iframe>`:
```bash
playwright-cli snapshot          # note the iframe ref, e.g. f1
# Switch into frame context — use run-code for frame-scoped eval
playwright-cli run-code "async page => { const frame = page.frameLocator('iframe').first(); const el = await frame.locator('button[type=submit]').elementHandle(); return JSON.stringify([...el.attributes].map(a => ({name: a.name, value: a.value}))); }"
```

For Shadow DOM elements:
```bash
# Shadow DOM cannot be pierced by XPath — use Playwright's locator chaining
playwright-cli run-code "async page => (await page.locator('my-component').locator('button').count())"
```

---

## Step 2 — Probe by Tier

### Tier 1 — id / name

```bash
# Read from attribute dump (Step 0) — no extra eval needed
# If id is present and non-generated:
playwright-cli eval "document.querySelectorAll('#chart-save-btn').length"
# → XPath equivalent: //button[@id='chart-save-btn']
```

**POM locator:** `page.locator('#chart-save-btn')`
**XPath:** `//button[@id='chart-save-btn']`

If count = 1 → accepted. Stop.

For `name`:
```bash
playwright-cli eval "document.querySelectorAll('[name=\"email\"]').length"
# → XPath: //input[@name='email']
```

**POM locator:** `page.locator('[name="email"]')`
**XPath:** `//input[@name='email']`

---

### Tier 2 — Automation attributes

Read from the attribute dump. Check in order: `data-testid` → `data-cy` → `data-qa` → `data-test` → `data-automation-id`.

```bash
playwright-cli eval "document.querySelectorAll('[data-testid=\"chart-save-btn\"]').length"
# → XPath: //*[@data-testid='chart-save-btn']
```

**POM locator:** `page.locator('[data-testid="chart-save-btn"]')`
**XPath:** `//*[@data-testid='chart-save-btn']`

If count = 1 → accepted. Stop.

---

### Tier 3 — ARIA / accessibility attributes

```bash
# From dump: aria-label, aria-labelledby, role
playwright-cli eval "el => el.getAttribute('aria-label')" e18
playwright-cli eval "el => el.getAttribute('aria-labelledby')" e18
playwright-cli eval "el => el.getAttribute('role')" e18

# Verify uniqueness — role + aria-label compound
playwright-cli eval "document.querySelectorAll('[role=\"button\"][aria-label=\"Save chart\"]').length"
# → XPath: //button[@aria-label='Save chart']
#    or:   //*[@role='button'][@aria-label='Save chart']
```

**POM locator:** `page.locator('[aria-label="Save chart"]')`
**XPath:** `//button[@aria-label='Save chart']`

For `aria-labelledby` — resolve the referenced label ID:
```bash
playwright-cli eval "el => el.getAttribute('aria-labelledby')" e18
# → "chart-name-label"
```

**POM locator:** `page.locator('[aria-labelledby="chart-name-label"]')`
**XPath:** `//input[@aria-labelledby='chart-name-label']`

---

### Tier 4 — Functional / structural attributes

```bash
# type + value (submit buttons, radio buttons)
playwright-cli eval "document.querySelectorAll('input[type=\"submit\"][value=\"Save\"]').length"
# → XPath: //input[@type='submit'][@value='Save']

# placeholder (inputs)
playwright-cli eval "document.querySelectorAll('[placeholder=\"Search devices…\"]').length"
# → XPath: //input[@placeholder='Search devices…']

# href pattern (navigation links)
playwright-cli eval "document.querySelectorAll('a[href*=\"/dashboard\"]').length"
# → XPath: //a[contains(@href,'/dashboard')]

# Stable BEM/component class — only if class is NOT utility-first
playwright-cli eval "document.querySelectorAll('button.btn--primary').length"
# → XPath: //button[contains(@class,'btn--primary')]
```

---

### Tier 5 — Text-based XPath

Use when no attributes are suitable. Text must be **stable** (not i18n-translated, not dynamic data, not counts or dates).

```bash
# Exact text — normalize-space handles leading/trailing whitespace
playwright-cli eval "[...document.querySelectorAll('button')].filter(el => el.textContent.trim() === 'Delete dashboard').length"
# → XPath: //button[normalize-space(text())='Delete dashboard']

# Partial text — use when text has dynamic suffix (e.g. "Save (3 items)")
playwright-cli eval "[...document.querySelectorAll('button')].filter(el => el.textContent.includes('Save')).length"
# → XPath: //button[contains(text(),'Save')]

# Descendant text — element contains a child with the text (e.g. button > span)
playwright-cli eval "[...document.querySelectorAll('button')].filter(el => el.querySelector('span')?.textContent?.trim() === 'Save').length"
# → XPath: //button[.//span[normalize-space(text())='Save']]
```

**POM locators:**
- `page.locator('button:text-is("Delete dashboard")')`
- `page.locator('button:has-text("Save")')`

---

### Tier 6 — Compound predicates

When no single attribute is unique, combine multiple attributes in one XPath expression.

```bash
# tag + type + visible text
playwright-cli eval "document.querySelectorAll('button[type=\"button\"]').length"
# Too many — add text filter:
playwright-cli eval "[...document.querySelectorAll('button[type=\"button\"]')].filter(el => el.textContent.trim() === 'Delete').length"
# → XPath: //button[@type='button'][normalize-space(text())='Delete']

# type + name (form inputs)
playwright-cli eval "document.querySelectorAll('input[type=\"email\"][name=\"login\"]').length"
# → XPath: //input[@type='email'][@name='login']

# Scoped container + type
playwright-cli eval "document.querySelectorAll('.modal-footer button[type=\"submit\"]').length"
# → XPath: //div[contains(@class,'modal-footer')]//button[@type='submit']
```

**POM locators:**
- `page.locator('button[type="button"]:has-text("Delete")')`
- `page.locator('input[type="email"][name="login"]')`

---

### Tier 7 — Axis navigation (relational XPath)

Use when the element has no useful attributes but is consistently positioned relative to a unique sibling or ancestor.

#### 7a — Ancestor scoping (most common)

Find the closest ancestor with a unique attribute, then descend to the target.

```bash
# Find unique ancestor
playwright-cli eval "el => el.closest('[data-testid]')?.getAttribute('data-testid')" e18
# → "chart-builder-toolbar"

# Verify scoped uniqueness
playwright-cli eval "document.querySelectorAll('[data-testid=\"chart-builder-toolbar\"] button[type=\"submit\"]').length"
# → XPath: //div[@data-testid='chart-builder-toolbar']//button[@type='submit']
```

**POM locator:** `page.locator('[data-testid="chart-builder-toolbar"] button[type="submit"]')`

---

#### 7b — following-sibling (element after a label)

```bash
# Label with stable text → sibling input
playwright-cli eval "document.querySelectorAll('label').length"
playwright-cli eval "[...document.querySelectorAll('label')].filter(l => l.textContent.trim() === 'Chart name').length"
# → 1 ✅

# The input immediately after this label:
playwright-cli eval "document.querySelectorAll('label + input').length"
# If multiple — scope with text filter:
playwright-cli eval "[...document.querySelectorAll('label')].filter(l => l.textContent.trim() === 'Chart name').map(l => l.nextElementSibling?.tagName).length"
# → XPath: //label[normalize-space(text())='Chart name']/following-sibling::input[1]
```

**POM locator:** `page.locator('label:has-text("Chart name") + input')`

---

#### 7c — preceding-sibling (button next to a known button)

```bash
# "Delete" button always appears after "Cancel" button in a toolbar
playwright-cli eval "[...document.querySelectorAll('button')].filter(b => b.textContent.trim() === 'Cancel').map(b => b.nextElementSibling?.textContent?.trim())"
# → ["Delete"]
# → XPath: //button[normalize-space(text())='Cancel']/following-sibling::button[1]
```

**POM locator:** `page.locator('button:has-text("Cancel") + button')`

---

#### 7d — Parent → indexed child (fixed-structure toolbars only)

Only when the toolbar structure is **documented as fixed** (e.g. always `[Edit, Save, Delete]`).

```bash
playwright-cli eval "document.querySelectorAll('[data-testid=\"chart-actions\"] button').length"
# → 3 — "Edit" is always index 0
# → XPath: (//div[@data-testid='chart-actions']/button)[1]
```

**POM locator:** `page.locator('[data-testid="chart-actions"] button').nth(0)`

---

### Tier 8 — Positional (absolute last resort)

Only when Tiers 1–7 all fail **and** the position is structurally guaranteed never to change.

```bash
playwright-cli eval "document.querySelectorAll('.chart-action-buttons button').length"
# → 3 (fixed order: Save, Edit, Delete)
# → XPath: (//div[contains(@class,'chart-action-buttons')]/button)[2]
```

**Mandatory comment in POM:**
```typescript
// nth(1): .chart-action-buttons always renders [Save, Edit, Delete] in that DOM order.
// No unique attribute is available. Update if button order changes.
private readonly editButton = this.page.locator('.chart-action-buttons button').nth(1);
```

---

## Uniqueness Verification — Mandatory for Every Tier

Run **both** checks before accepting any locator:

### Check 1 — DOM count via querySelectorAll (CSS-expressible locators)

```bash
playwright-cli eval "document.querySelectorAll('<selector>').length"
# Must return: 1
```

### Check 2 — Playwright count (semantic / XPath locators)

```bash
playwright-cli run-code "async page => (await page.locator('xpath=//button[@data-testid=\"save\"]').count())"
playwright-cli run-code "async page => (await page.locator('button[aria-label=\"Save chart\"]').count())"
# Must return: 1
```

### Check 3 — Visibility (elements that exist but are hidden)

```bash
playwright-cli run-code "async page => (await page.locator('[data-testid=\"save-btn\"]').isVisible())"
# Must return: true (if the test needs to interact with it)
```

**Decision table:**

| count | visible | Action |
|-------|---------|--------|
| 1 | true | ✅ Accept — locator is ready |
| 1 | false | ⚠️ Add `{ state: 'visible' }` wait in POM method — note the hidden trigger |
| 0 | — | ❌ Element not in DOM — wrong page state, trigger the interaction first |
| > 1 | — | ❌ Not unique — add more specificity (compound predicate or ancestor scope) |

---

## POM Locator Expression Guide

> All entries below are written as `page.locator(...)` — the only permitted form for POM field declarations.

| Situation | `page.locator()` expression | Notes |
|-----------|----------------------------|-------|
| Element has `data-testid` | `page.locator('[data-testid="value"]')` | Most stable — prefer this tier |
| Element has `data-cy` / `data-qa` | `page.locator('[data-cy="value"]')` | Same as testid tier |
| Element has `id` (non-generated) | `page.locator('#id-value')` | Only if id is stable |
| Element has `name` | `page.locator('[name="value"]')` | Common for form inputs |
| Element has `aria-label` | `page.locator('[aria-label="value"]')` | Stable if label is not i18n |
| Element has `aria-labelledby` | `page.locator('[aria-labelledby="label-id"]')` | Use resolved ID, not text |
| Element has `placeholder` | `page.locator('[placeholder="value"]')` | Inputs only |
| Element has `type` + `value` | `page.locator('input[type="submit"][value="Save"]')` | Submit buttons |
| Text match (exact) | `page.locator('button:text-is("Delete dashboard")')` | Only stable, non-i18n text |
| Text match (partial) | `page.locator('button:has-text("Save")')` | When text has dynamic suffix |
| Ancestor-scoped element | `page.locator('[data-testid="toolbar"] button[type="submit"]')` | Single CSS descendant expression |
| Adjacent sibling (label → input) | `page.locator('label:has-text("Chart name") + input')` | CSS adjacent combinator |
| Next-sibling button | `page.locator('button:has-text("Cancel") + button')` | CSS adjacent combinator |
| Indexed child (fixed structure) | `page.locator('[data-testid="toolbar"] button').nth(0)` | Only when order is documented |
| Complex XPath predicate | `page.locator('xpath=//div[@data-testid="x"]//button[@type="submit"]')` | Last resort for compound XPath |
| Shadow DOM | `page.locator('my-component').locator('button')` | Playwright chaining — XPath cannot pierce |
| iframe-scoped element | `page.frameLocator('iframe').locator('[data-testid="x"]')` | XPath cannot cross frame boundary |

---

## Output Format

After verification, produce this block:

```
## Locator Result — <Element Description>

| Field              | Value |
|--------------------|-------|
| Element            | <human description> |
| Page / state       | <URL + any interaction needed to reveal it> |
| Tier used          | Tier N — reason |
| XPath expression   | `//button[@data-testid='save-btn']` |
| POM locator        | `page.locator('[data-testid="save-btn"]')` |
| DOM count verified | 1 (querySelectorAll) |
| Visible verified   | true |
| POM field name     | `saveButton` |

### TypeScript — Locator class field

```typescript
// src/ui/pages/<portal>/locators/<name>.ts
export class SomeLocator {
  // Tier 2 — data-testid="save-btn", count = 1, visible = true
  static readonly saveButton = '[data-testid="save-btn"]';
}
```

### TypeScript — Page Object action method

```typescript
async clickSave(): Promise<void> {
  const btn = this.page.locator(SomeLocator.saveButton);
  await btn.waitFor({ state: 'visible' });
  await btn.click();
}
```
```

---

## Full Example — Tier 2 Success

**Goal:** Find the locator for the "Save" button inside a modal.

```bash
# Navigate — this repo has no storage-state auth; log in through the UI first if the
# target element requires a session, then snapshot the actual page you need.
playwright-cli open <ADMIN_PORTAL_BASE_URL or PARTNER_PORTAL_BASE_URL>
playwright-cli snapshot

# Reveal element — e.g. click "Add Business" to open the modal
playwright-cli click e14
playwright-cli snapshot
# → e31 = Save button

# Step 0 — Attribute dump
playwright-cli eval "el => JSON.stringify([...el.attributes].map(a => ({name: a.name, value: a.value})), null, 2)" e31
# Output:
# [
#   { "name": "id",    "value": "ant-btn-:r9:" },  ← generated, reject
#   { "name": "type",  "value": "button" },
#   { "name": "class", "value": "ant-btn ant-btn-primary" }
# ]
# No data-testid — typical for this product. Fall through to text (Tier 5).

# Tier 1 — id is framework-generated → skip
# Tier 2 — no automation attributes present → skip
# Tier 5 — exact text
playwright-cli eval "[...document.querySelectorAll('button')].filter(el => el.textContent.trim() === 'Save').length"
# → 1 ✅

playwright-cli run-code "async page => (await page.locator('xpath=//button[normalize-space(text())=\"Save\"]').isVisible())"
# → true ✅

playwright-cli close
```

**Result:**

```
## Locator Result — Save button in the Add Business modal

| Field              | Value |
|--------------------|-------|
| Element            | Save button in the Add Business modal |
| Page / state       | Partner Portal → click "Add Business" to reveal |
| Tier used          | Tier 5a — exact text 'Save' |
| XPath expression   | `//button[normalize-space(text())='Save']` |
| DOM count verified | 1 ✅ |
| Visible verified   | true ✅ |
| Locator field name | `saveButton` |
```

```typescript
// src/ui/pages/partner-portal/locators/business.ts
export class BusinessLocator {
  // Tier 5a — exact text 'Save', count = 1, visible = true
  static readonly saveButton = "xpath=//button[normalize-space(text())='Save']";
}
```

```typescript
// Page Object
async clickSave(): Promise<void> {
  const btn = this.page.locator(BusinessLocator.saveButton);
  await btn.waitFor({ state: 'visible' });
  await btn.click();
}
```

---

## Full Example — Tier 7b (following-sibling)

**Goal:** Find an input field with no stable attribute — e.g. "Team name" in a form. It has no testid.

```bash
playwright-cli eval "el => JSON.stringify([...el.attributes].map(a => ({name: a.name, value: a.value})), null, 2)" e42
# Output:
# [
#   { "name": "type",  "value": "text" },
#   { "name": "class", "value": "input css-xb12k" }   ← no stable attributes
# ]

# Tier 1–6 all fail — no stable attributes on the input
# Tier 7b — check sibling label
playwright-cli eval "el => el.previousElementSibling?.textContent?.trim()" e42
# → "Team name "   (note: trailing space — copy the label text exactly, don't trim it away in the selector)

# Verify label uniqueness
playwright-cli eval "[...document.querySelectorAll('label')].filter(l => l.textContent.trim() === 'Team name').length"
# → 1 ✅

# Verify sibling scoping via XPath (this repo's Locator classes are XPath strings)
playwright-cli run-code "async page => (await page.locator(\"xpath=//label[text()='Team name ']/parent::div//div/input\").count())"
# → 1 ✅

playwright-cli close
```

```typescript
// src/ui/pages/partner-portal/locators/business.ts
export class BusinessLocator {
  // Tier 7a — descendant of the 'Team name' label's parent, count = 1
  static readonly teamNameInput = "xpath=//label[text()='Team name ']/parent::div//div/input";
}
```

```typescript
// Page Object
async fillTeamName(name: string): Promise<void> {
  const input = this.page.locator(BusinessLocator.teamNameInput);
  await input.waitFor({ state: 'visible' });
  await input.fill(name);
}
```

---

## Integration with `/automate-test-cases`

This skill is the **single-element fallback** for `/automate-test-cases`:

- Invoke when only **one** locator is missing from an otherwise complete Step+Locator Report.
- After verification, copy the output block back into the Step+Locator Report and continue implementation.
- Do **not** restart a full `/playwright-cli` session for a single missing locator.
