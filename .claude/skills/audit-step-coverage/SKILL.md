---
name: audit-step-coverage
description: >-
  For a given smoke test suite document, read every existing POM and flow file
  in the automation framework and map each test step to the method(s) that
  already cover it. Writes the result as a .md file to
  docs/coverage-reports/<SUITE_FILENAME>_COVERAGE.md. Produces one coverage
  table per test case (columns: step, POM page, POM method, flow method) plus a
  consolidated gap summary and re-use summary. Use before /automate-test-cases
  to know exactly what is missing and what can be re-used.
---

# Audit Step Coverage — Skill

> **Hard rule**: This skill writes ONE file only — the coverage report `.md`.
> Do NOT write or modify any POM, flow, spec, or test-data file.
> Do NOT open a browser.
> Hand the gap summary to `/automate-test-cases` as the starting point for
> its Phase 1 duplicate-method check.

---

## When to Use

| Situation | Use this skill |
|---|---|
| Before automating a new test suite — need to know what already exists | ✅ |
| Planning which POM / flow methods need to be added vs re-used | ✅ |
| Verifying coverage after a refactor changed method names | ✅ |
| Discovering a locator or writing code | ❌ use `/get-unique-locator` or `/automate-test-cases` |

---

## Skill Chain Position

```
audit-step-coverage (this)
        │  reads: suite doc + POM + flow files
        │  writes: docs/coverage-reports/<SUITE>_COVERAGE.md
        ↓
   Gap Summary in the .md file
        ↓
   /automate-test-cases   ← uses the coverage report as Phase 1 input;
        ↓                    Re-use/New column already pre-filled
   /generate-pom  /generate-flow
```

---

## Phase 1 — Collect Inputs

### 1.1 Identify the test suite document

The user provides one of:
- A file path to a test-case suite document (`docs/test-cases-suites/*.md`)
- One or more test case IDs (e.g. `SMOKE-BC-D01`)
- A natural-language description (e.g. "bar chart D below canvas suite")

If a file path is given, read it:

```
Read: docs/test-cases-suites/<SUITE_FILENAME>.md
```

If only IDs or a description are given, glob for the matching file:

```
Glob: docs/test-cases-suites/**/*<keyword>*.md
```

Read the file and extract:
- The suite tag and component group (e.g. `D — Below the Canvas`)
- Every test case ID, name, priority, and bar type
- Every test step and its expected outcome (per test case)

### 1.2 Identify the domain's Page Object, Locator, and Flow files

Infer the domain from the suite document's component names and feature scope. This repo groups files by portal, not by a single flat `pages/`/`flows/` directory:

| Layer | Typical location |
|---|---|
| Locators | `src/ui/pages/<portal>/locators/**/*.ts` (or `src/ui/pages/shared-pages/locators/*.ts`) — static selector-constant classes |
| Page Objects | `src/ui/pages/<portal>/<name>.page.ts` or `<name>-page.ts` |
| Cross-portal Flows | `src/ui/flows/<name>.flow.ts` (`AuthFlow`, `OnboardingFlow`, `PurchaseFlow`) |
| Portal-specific Flows | `src/ui/pages/<portal>/flows/<portal>.<name>.flow.ts` |

Read `src/ui/pages/index.ts` and `src/ui/flows/index.ts` (plus each portal's own `index.ts` under `src/ui/pages/<portal>/`) to discover what's registered, then read the ones relevant to the suite.

**Always read all candidate files in full before mapping. Never guess.**

```
Read: src/ui/pages/<portal>/<name>.page.ts
Read: src/ui/pages/<portal>/locators/**/*.ts
Read: src/ui/flows/<name>.flow.ts  (and/or src/ui/pages/<portal>/flows/*.flow.ts)
```

Read additional files if the suite covers setup steps that touch other portals
(e.g. Admin Portal for partner creation, Partner Portal for business setup).

### 1.3 Build a method inventory (internal, not written to file)

From each file you read, build an internal inventory before mapping begins.

**POM inventory** — for each method record:

| Column | What to capture |
|---|---|
| Method name | Exact signature (e.g. `getLegendCount(chartName)`) |
| Category | `getter` · `action` · `reader` |
| What it does | One sentence from the JSDoc or inferred from the body |

**Flow inventory** — for each method record:

| Column | What to capture |
|---|---|
| Method name | Exact signature |
| Category | `action-delegate` · `verify` · `composite` |
| What it does | One sentence |

Do not abbreviate or paraphrase method names — use the exact name from the file.

---

## Phase 2 — Map Steps to Methods

Work through every test case in the suite document sequentially.

For each test step, ask:

1. **Which element(s) does this step interact with or observe?**
2. **Is there a POM method whose body touches that element?**
   Match by element identity (same locator path, same `data-testid`, same
   `aria-label`), not by name similarity alone.
3. **Is there a flow method that orchestrates or asserts on the outcome?**
   Match by behaviour: does the flow method assert the exact condition in
   "Expected"? Does it perform the same action sequence?

### Mapping decision table

| Situation | Coverage verdict |
|---|---|
| POM has a public getter / action for the element AND flow has a `verifyXxx` that asserts the expected outcome | **Covered** — list both method names |
| POM has the getter, but flow has no corresponding `verifyXxx` | **POM covered · Flow gap** — list POM method, mark flow `N/A` |
| Neither POM nor flow has any method for this element or outcome | **Not covered** — mark both `N/A` |
| A method exists with related but not identical behaviour (e.g. checks count ≠ 0 but step needs exact count = 2) | **Partial** — list method name with a note `(partial — needs extension)` |
| The step is a pure Playwright API call with no DOM element (e.g. `page.setViewportSize()`) | **API-only** — mark POM and flow `N/A`, note "Playwright API, no POM method needed" |

### Naming precision rule

Never write a method name that is not confirmed to exist in the file you read.
If you are unsure, grep for it before listing it.

```
Grep: <method name> → src/pages/<domain>.page.ts
Grep: <method name> → src/flows/<domain>.flow.ts
```

---

## Phase 3 — Write the Report File

### 3.1 Resolve the output path

Derive the output filename from the suite document filename:

```
Input:   docs/test-cases-suites/<SUITE_FILENAME>.md
Output:  docs/coverage-reports/<SUITE_FILENAME>_COVERAGE.md
```

Examples:

| Suite file | Report file |
|---|---|
| `BAR_CHART_SMOKE_D_BELOW_CANVAS.md` | `docs/coverage-reports/BAR_CHART_SMOKE_D_BELOW_CANVAS_COVERAGE.md` |
| `BAR_CHART_SMOKE_A_HEADER.md` | `docs/coverage-reports/BAR_CHART_SMOKE_A_HEADER_COVERAGE.md` |

Create the `docs/coverage-reports/` directory if it does not exist, then write
the file. If the file already exists, overwrite it — re-running the skill always
produces a fresh report reflecting the current state of the POM and flow.

### 3.2 Report file template

Write exactly this structure to the output `.md` file:

---

```markdown
# Coverage Report — <Suite Name>

> **Source**: `docs/test-cases-suites/<SUITE_FILENAME>.md`
> **POM**: `<pom file(s) read>`
> **Flow**: `<flow file(s) read>`
> **Generated**: <YYYY-MM-DD>

---

## <SMOKE-TC-ID> · <Test Case Name>

| Step | POM page | POM method | Flow method |
|---|---|---|---|
| <step text> | `<PageClass>` | `<method()>` | `<flowMethod()>` |
| <step text> | N/A | N/A | N/A |
| <step text> | `<PageClass>` | `<method()>` (partial — needs extension) | N/A |

---

## <SMOKE-TC-ID> · <Test Case Name>

<!-- repeat the table block above for every test case in the suite -->

---

## Gap Summary

| Gap | Affected test cases | Gap type |
|---|---|---|
| <description of missing element/behaviour> | TC-ID · TC-ID | <gap type> |

---

## Re-use Summary

| Method | Layer | Re-used in |
|---|---|---|
| `<method()>` | POM / Flow | TC-ID · TC-ID · … |

---

*Generated by `/audit-step-coverage` skill.*
```

---

### Content rules for the file

- **One `##` section per test case.** Never merge steps from different test cases.
- **Use exact method names** from the files read. Never invent a name.
- **Step text** — copy the step verbatim from the test case document; shorten only
  if the original text exceeds ~120 characters without losing meaning.
- **POM page column** — short class name only (e.g. `BarChartCardV2Page`), not the file path.
- **N/A** — use for POM page + POM method together when the step has no element-level
  coverage; use N/A for flow method only when POM has it but flow does not.
- **Gap type values** — must be one of:
  `POM getter` · `POM action` · `Flow verify` · `POM getter + Flow verify` ·
  `POM action + Flow verify` · `API-only (no method needed)`
- **Re-use Summary** — list every method that appears in 2 or more test case tables.
  Omit methods used in only one test case.

---

## Phase 4 — Confirm and Hand Off

After writing the file, reply to the user with:

1. The output file path (as a relative link).
2. A one-line count: `X test cases mapped · Y gaps found · Z methods re-used`.
3. Which gaps require **new POM methods** (locator discovery → `/get-unique-locator`
   or full recording → `/automate-test-cases`).
4. Which gaps require **only new flow methods** (POM getter already exists — no
   browser session needed → `/generate-flow`).
5. Which gaps are **API-only** (Playwright API call in spec, no POM/flow work).

End with:

> **Ready for `/automate-test-cases`.**
> `docs/coverage-reports/<SUITE_FILENAME>_COVERAGE.md` — Gap Summary maps directly
> to Plan Sections 3 and 4 (`Re-use / New` column pre-filled).

---

## Checklist before writing the file

- [ ] Read every relevant POM and flow file in full — no guessing
- [ ] Method inventory built internally before mapping begins
- [ ] Every method name in the tables confirmed to exist in the file (grep-verified)
- [ ] No invented method names anywhere in the file
- [ ] Every test case from the suite document has a `##` section — none skipped
- [ ] Gap type is one of the six defined values
- [ ] Re-use Summary lists only methods used in 2+ test cases
- [ ] Output path follows `docs/coverage-reports/<SUITE_FILENAME>_COVERAGE.md`
- [ ] File ends with the `*Generated by…*` line
- [ ] Hand-off reply is sent to the user after the file is written
