---
name: automate-test-cases
description: >-
  Turn test case IDs or a test-case document into working Playwright automation
  (Page Object → Flow → Spec). Runs audit-step-coverage first, then discovers
  missing locators via playwright-cli or get-unique-locator for POM gaps. Saves
  a plan to docs/automation-plans/ and waits for approval before writing any code.
---

# Automate Test Cases — Skill

> **Gate**: Do NOT write any code until the human approves the plan.
> Save the plan file → present the path → wait for "approved" / "looks good" / "proceed".

---

## Skill chain

```
audit-step-coverage   → docs/coverage-reports/<SUITE>_COVERAGE.md
       ↓ POM gaps with unknown locators
playwright-cli        → verified locators (generate-locator, count = 1)
       ↓ single missing locator fallback
get-unique-locator
       ↓
automate-test-cases (this)
  ├─ generate-pom     ← locators + action methods (no verify)
  ├─ generate-flow    ← verifyXxx() using expect(page.getXxx())
  └─ Spec generation
```

> **Architecture invariant:**
> POM = locators + actions — no business-level `verifyXxx()`.
> Flow = assertions via `UiAssert.*` (or `expect()`) — reading either a static Locator class or a POM getter. Never `page.verifyXxx()`.
> Spec = calls flow methods only, wrapped in `test.step()`.
> See `docs/automation-docs/ARCHITECTURE.md` for how this repo actually implements the three layers.

---

## Phase 1 — Gather Context

### 1.1 Read inputs (on-demand — do NOT pre-load)

| Input | Read when |
|---|---|
| Test case suite — `docs/test-cases-suites/*.md` | Always — needed for §1.2 |
| Feature logic — `docs/features-logic/*.md` | Only if a step's expected behaviour is ambiguous |
| Fixtures — `src/fixtures/flow-fixtures.ts`, `src/fixtures/page-fixtures.ts` | Only if §1.5 finds a new flow or page fixture is needed |
| Test data — `src/data-factory/*.ts` (`DataFactory`, `PersonDataGenerator`) | Only when writing plan Section 5 |
| Existing specs — `tests/UI/<portal>/*.spec.ts`, `tests/API/<portal>/*.spec.ts` | Only when writing plan Section 6 |
| Framework rules — `docs/automation-docs/AUTOMATION_FRAMEWORK_RULES.md` | Only if a framework question arises |

### 1.2 Run audit-step-coverage — MANDATORY FIRST

Run `.claude/skills/audit-step-coverage/SKILL.md` for the target suite.

Produces: `docs/coverage-reports/<SUITE_FILENAME>_COVERAGE.md`
Contains: per-TC step table · **Gap Summary** · Re-use Summary.

The Gap Summary pre-fills Re-use / New for plan Sections 3 and 4. Do not re-derive it.

### 1.3 Route each gap

| Gap type in coverage report | Next action |
|---|---|
| Any POM gap (`POM getter`, `POM action`, `…+ Flow verify`) | Run locator discovery (§1.4) |
| `Flow verify` only — POM getter already exists | Skip browser; go to `generate-flow` |
| `API-only` | No POM/flow work — handle in spec only |

### 1.4 Discover locators — POM gaps with unknown locators only

Skip entirely for: covered steps · flow-verify-only gaps · API-only gaps · POM gaps where the locator already exists and only a new action method is needed.

**Decision:**

| Situation | Tool |
|---|---|
| 1 locator missing | Read `.claude/skills/get-unique-locator/SKILL.md` and follow it |
| 2+ locators missing | Use `playwright-cli` (§1.4a below) |
| Locator exists — only a new action or getter method needed | No browser needed — derive method from existing locator |

#### §1.4a — Multi-locator discovery with playwright-cli

1. Read `.claude/skills/playwright-cli/SKILL.md` for command reference.
2. Open a browser session and load the feature page:
   ```bash
   playwright-cli open <feature-url>
   ```
   This repo has no `playwright-cli` config file — run it from the repo root with no `--config` flag.
3. Navigate to the state where the target elements are visible (e.g. create a chart, open a modal).
4. Take a snapshot:
   ```bash
   playwright-cli snapshot
   ```
5. For each POM-gap element, run `generate-locator` on its ref:
   ```bash
   playwright-cli generate-locator <ref> --raw
   ```
6. Confirm count = 1 before accepting:
   ```bash
   playwright-cli eval "document.querySelectorAll('<selector>').length"
   ```
7. Record each confirmed locator as: `Locator name · Expression · Source (snapshot date)`.
   Mark any element not yet visible as `[BLOCKED — Step N]` in plan §3.
8. Close the session:
   ```bash
   playwright-cli close
   ```

> **No invented locators.** Every new locator must be confirmed via `generate-locator` with count = 1.

---

## Phase 2 — Save Plan and Wait for Approval

### 2.1 Fill in the template

Copy `.claude/skills/automate-test-cases/PLAN_TEMPLATE.md` as the starting point.
Save to `docs/automation-plans/<SUITE_NAME>_PLAN.md`.
Replace every `{{PLACEHOLDER}}` marker with real values from Phase 1.

**Section-by-section fill-in guide:**

| Section | Source |
|---|---|
| Header links + date | Coverage report path, suite doc path, today's date |
| ⚠ Blocked Items | Any steps marked `[BLOCKED]` in coverage report — remove section if none |
| §1 Summary table | IDs, names, priorities from suite doc |
| §1 Per-test step tables | Steps from suite doc — do NOT add a Coverage column |
| §2 Files | Derive from gap list: new POM file (if any), modified POM/flow, new spec |
| §3 New Locators | Sourced from Step+Locator report (`count = 1` confirmed). Columns: `Locator name · Expression · Source`. Mark `[BLOCKED — Step N]` for any pending browser discovery |
| §3 Methods | Re-use / New from coverage Gap Summary. Mark blocked methods `[BLOCKED — Step N]` |
| §4 Flow Methods | Re-use / New from coverage Gap Summary. Include POM calls + one-line purpose |
| §5 Test Data | `DataFactory`/`PersonDataGenerator` builder chain(s) needed — no preset constants exist in this repo |
| §6 Spec scaffold | Full spec file using `import { test } from "src/fixtures"`, `test.step()` per action, tags on both `describe` and `test()` |
| §7 Fixtures | Already-registered fixtures keep status "Already registered". New ones marked "New — must register" |
| §8 Risks | Any locator uncertainty, DOM unknowns, data assumptions from §1.3–1.4 |
| §9 Order | Table with Step · Action · Skill · Blocked by. Always end with `pnpm lint` step |

### 2.2 Reply after saving

Reply with:
1. Plan file path
2. One-line count: `X test cases · Y new POM methods · Z new flow methods · W re-used`
3. Which gaps needed a browser session vs. resolved from coverage report alone

End with:
> **Review `docs/automation-plans/<SUITE_NAME>_PLAN.md` and reply "approved" to begin implementation.**

---

## Phase 3 — Implement (after approval only)

Execute in the order in plan Section 9.

### Step 1 — Page Object(s)

Read and execute `.claude/skills/generate-pom/SKILL.md`.
Input: Locators table + Methods table from plan Section 3.

### Step 2 — Flow Class(es)

Read and execute `.claude/skills/generate-flow/SKILL.md`.
Input: Methods table from plan Section 4.

### Step 3 — Test Data

Build data inline in the spec via `DataFactory`/`PersonDataGenerator` (plan Section 5) — there is no shared preset file to update.

### Step 4 — Fixture (if new flow)

Add to `src/fixtures/flow-fixtures.ts`:

```typescript
<fixtureName>: async ({ page }, use) => {
  await use(new <FlowClass>(page));
},
```

Only add a `.teardown()` call here if the new flow actually tracks created entities and exposes a `teardown()` method — most flows in this repo don't; don't invent one.

### Step 5 — Spec File

Write the spec exactly as specified in plan Section 6. The template already encodes all framework patterns — do not deviate from it.

Only two constraints not visible in the template:
- No `page.waitForTimeout()` — use `locator.waitFor({ state: "visible" })` or an `expect.poll()`/`UiAssert` wait instead
- No `test.step()` inside flow or page object methods

### Step 6 — Lint

```bash
pnpm lint
```

Fix all errors before proceeding.

---

## Phase 4 — Completion Message

One message only. Two tables. No code blocks. Remove template rows not produced.
Add a one-sentence deviation note if implementation differed from the test case doc.

### Table 1 — Updated Methods

| File | Method | What changed |
|---|---|---|
| `src/ui/pages/<portal>/<name>.page.ts` | `existingMethod()` | … |

### Table 2 — New Methods

| Layer | File | Method / Item | Description |
|---|---|---|---|
| Locator | `src/ui/pages/<portal>/locators/<name>.ts` | `SomeLocator.newField` | … |
| Page | `src/ui/pages/<portal>/<name>.page.ts` | `clickCreatePartner()` | … |
| Flow | `src/ui/flows/<name>.flow.ts` | `verifyPartnerVisible(partnerInfo)` | … |
| Spec | `tests/{UI\|API}/<portal>/<summary>_TC001....spec.ts` | `TC001` | … |

---

## Completion Checklist

- [ ] `audit-step-coverage` ran first — coverage report exists
- [ ] Plan saved to `docs/automation-plans/<SUITE_NAME>_PLAN.md` using `PLAN_TEMPLATE.md` — all `{{PLACEHOLDER}}` markers replaced
- [ ] Re-use / New in Sections 3 and 4 sourced from coverage Gap Summary — not re-derived
- [ ] No Coverage column in §1 per-test step tables (coverage lives in the coverage report, not the plan)
- [ ] §3 locator table columns: `Locator name · Expression · Source` (not "Count" or "Report step")
- [ ] Locator discovery ran only for POM gaps with unknown locators (not covered steps, flow-only gaps, or gaps where the locator already exists)
- [ ] Every new locator confirmed via `playwright-cli generate-locator` or `get-unique-locator` with count = 1 (no invented selectors)
- [ ] POM: no business-level `verifyXxx()` assertions — those live in the Flow
- [ ] Flow: assertions go through `UiAssert.*` (or `expect()` on a locator from a POM getter or a static Locator class) — never `this.page.verifyXxx()`
- [ ] Spec: steps in `test.step()`, TC-ID in the `test()` tag array, no hardcoded unique strings (use `DataFactory`/`PersonDataGenerator`)
- [ ] No manual teardown invented unless the flow already tracks created entities
- [ ] `pnpm lint` passes with 0 errors
- [ ] Spec runs: `pnpm exec playwright test <spec-path> --workers=1 --headed`
