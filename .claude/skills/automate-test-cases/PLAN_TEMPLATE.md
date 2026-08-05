# Automation Plan — {{FEATURE_LABEL}} {{SUITE_LABEL}}

> **Coverage report**: `docs/coverage-reports/{{FEATURE}}_{{SUITE}}_COVERAGE.md`
> **Suite doc**: `docs/test-cases-suites/{{FEATURE}}_{{SUITE}}.md`
> **Generated**: {{YYYY-MM-DD}}
> **Status**: ⏳ Awaiting approval

---

<!-- OPTIONAL: Remove this section if there are no blocked items. -->
## ⚠ Blocked Items

List any test cases that cannot be implemented immediately and the reason (e.g. missing browser snapshot, unknown DOM structure, pending backend data).

| Test ID(s) | Blocked on | Unblocked by |
|---|---|---|
| {{TEST_ID}} | {{REASON}} | Step {{N}} |

---

## 1. Test Cases

Summary table — one row per test case.

| ID | Name | Priority | Precondition summary | Depends on |
|---|---|---|---|---|
| {{TC_ID}} | {{TC_NAME}} | P0 / P1 / P2 | {{PRECONDITION}} | — |

---

<!-- Repeat this block for each test case. -->
### {{TC_ID}} — {{TC_NAME}}

**Precondition**: {{Full precondition description.}}

| # | Step | Expected result |
|---|---|---|
| 1 | {{step}} | {{expected}} |

---

## 2. Files to Create / Modify

### New Files

| File | Purpose |
|---|---|
| `tests/{{UI\|API}}/{{portal}}/{{summary}}_{{TC_ID}}_{{TC_ID}}....spec.ts` | {{description}} — filename: summary first, TC IDs after, max 5 test cases per file |

### Modified Files

| File | Changes |
|---|---|
| `src/ui/pages/{{portal}}/{{name}}.page.ts` or `.../locators/{{name}}.ts` | {{description}} |
| `src/ui/flows/{{name}}.flow.ts` or `src/ui/pages/{{portal}}/flows/{{name}}.flow.ts` | {{description}} |

### No Changes Needed

| File | Reason |
|---|---|
| `{{path/to/file.ts}}` | {{reason}} |

---

## 3. Page Object / Locator Changes — `{{path/to/page-or-locator.ts}}`

> All locators sourced from confirmed DOM inspection ({{YYYY-MM-DD}}).
> Mark any speculative locators `[BLOCKED — Step N]`.

### New Locators

Add as `static readonly` fields on a Locator class (e.g. `src/ui/pages/{{portal}}/locators/{{name}}.ts`), matching the existing style in that file (usually `xpath=//...`):

| Locator name | Expression | Source |
|---|---|---|
| `{{LocatorClass.field}}` | `{{selector}}` | {{DOM source / browser snapshot}} |

### Methods

| Method | Re-use / New | Interaction pattern |
|---|---|---|
| `{{method(args)}}` | **Re-use** (line {{N}}) | — |
| `{{method(args)}}` | **New** | `{{LocatorClass.field}}` → `{{action}}` |
| `{{method(args)}}` | **New** `[BLOCKED — Step N]` | TBD after browser snapshot |

---

## 4. Flow Class Changes — `{{path/to/flow.ts}}`

| Method | Re-use / New | Calls | Purpose |
|---|---|---|---|
| `{{method(args)}}` | **Re-use** (line {{N}}) | — | — |
| `{{method(args)}}` | **New** | `UiAssert.allVisible([this.page.locator({{LocatorClass.field}})])` | {{one-line description}} |
| `{{method(args)}}` | **New** `[BLOCKED — Step N]` | `{{pomMethod()}}` | {{one-line description}} |

---

## 5. Test Data

No shared preset file exists in this repo — build data inline in the spec via the builder pattern:

```typescript
const partnerInfo = await DataFactory.partnerBuilder()
  .withDepartmentName(process.env.DEPARTMENT_NAME!)
  .withPaymentOption("{{value}}")
  .build();

// or, for a business owner / arbitrary person:
const ownerInfo = await PersonDataGenerator.generate({ emailDomain: "{{domain}}" });
```

List which builder methods are new vs already exist on `DataFactory` / the relevant `*-builder.ts` file.

---

## 6. Spec File Structure

**File**: `tests/{{UI|API}}/{{portal}}/{{summary}}_{{TC_ID}}_{{TC_ID}}....spec.ts` — brief summary first, test-case IDs after, **max 5 `test()` cases per file**.

```typescript
import { test } from "src/fixtures";
import { DataFactory } from "src/data-factory";
import { plans } from "src/constant/static-data";

test.describe("{{FEATURE_LABEL}} -> {{SUITE_LABEL}}", { tag: ["{{@regression_UI|@regression_API}}", "{{@suite-tag}}"] }, () => {
  test(
    "{{TC_ID}}: {{TC_NAME}}",
    { tag: ["{{@TC_ID}}"] },
    async ({ {{FIXTURES}} }) => {
      await test.step("{{step description}}", async () => {
        // ...
      });

      await test.step("{{step description}}", async () => {
        // ...
      });
    },
  );

  // repeat test() per TC in this file, up to 5
});
```

No `test.use({ storageState: ... })` — there is no storage-state auth in this repo, log in explicitly inside a `test.step()` (see `docs/automation-docs/AUTH_FLOW.md`). No `test.describe.configure({ mode: "serial" })` requirement and no `test.afterEach` teardown unless the flow being used already tracks and cleans up created entities.

---

## 7. Fixture Registration

<!-- Remove entries that do not apply. -->

| Fixture | Status | Notes |
|---|---|---|
| `{{fixtureName}}` | Already registered | `src/fixtures/flow-fixtures.ts` or `src/fixtures/page-fixtures.ts`, line {{N}} |
| `{{fixtureName}}` | **New — must register** | Add to `src/fixtures/flow-fixtures.ts` (flow) or `src/fixtures/page-fixtures.ts` (page) |

---

## 8. Risks / Assumptions

| # | Risk | Mitigation |
|---|---|---|
| 1 | {{risk description}} | {{mitigation strategy}} |

---

## 9. Implementation Order

| Step | Action | Skill | Blocked by |
|---|---|---|---|
| 1 | Add new locators + page-object methods | `/generate-pom` | — |
| 2 | Add new flow methods | `/generate-flow` | Step 1 |
| 3 | Build test data inline via `DataFactory`/`PersonDataGenerator` in the spec | Direct edit | — |
| 4 | {{OPTIONAL: browser snapshot step}} | `/playwright-cli` | — |
| 5 | Write spec file (unblocked tests) | Direct edit | Steps 1–3 |
| 6 | Add blocked tests once Step 4 unblocks them | Direct edit | Step 4 |
| 7 | `pnpm lint` — must pass with 0 errors | `pnpm lint` | Step 6 |

---

**Awaiting approval to proceed with implementation.**
