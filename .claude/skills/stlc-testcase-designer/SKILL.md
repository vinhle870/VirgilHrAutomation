---
name: stlc-testcase-designer
description: >-
  Design detailed test cases from requirements and test plan. Writes files to
  qa-artifacts/3-test-cases/ named {SPEC_ID}_TestCases_{FIRST}-{LAST}.md
  (e.g. FR9_TestCases_001-005.md). TC IDs use spec prefix format FR9_001.
  Max 5 test cases per file, max 5 steps per test case.
  Use when the user asks to "design test cases", "write test cases", or
  "create test cases". Part of the 7-skill STLC QA pipeline.
---

# Skill 3 — Test Case Designer

Design detailed, executable test cases for a given requirement or spec ID and write them to `qa-artifacts/3-test-cases/`.

---

## Workflow

### Step 1 — Read inputs

1. `qa-artifacts/1-requirements-analysis/requirements-analysis.md` — requirement IDs, ACs, risks, test types.
2. `qa-artifacts/2-test-plan/test-plan.md` — scope, strategy, test types per requirement.
3. **`qa-artifacts/base-test/02-test-data.md`** — **read this first before writing any Test Data table.** It contains the verified school DB values, student profiles, size bands, locale codes, scoring formula, hard filter rules, and MongoDB verification queries for this project. Never invent test data values that could conflict with what is defined here.
4. `qa-artifacts/base-test/` — other baseline files (auth steps, environment checks, cleanup steps) for available preconditions and teardown steps.
5. The original requirement file if the user points to one directly.

If `qa-artifacts/1-requirements-analysis/requirements-analysis.md` is missing for this spec, and a requirement file (input 5) is available, offer a choice before proceeding:

**Cursor:**
```
AskQuestion:
  title: "Requirements Analysis Missing"
  questions:
    - id: "missing_ra"
      prompt: "No requirements-analysis.md found for this spec. How would you like to proceed?"
      allow_multiple: false
      options:
        - id: "analyze_first" label: "Generate requirements analysis first, then design test cases"
        - id: "design_now"    label: "Design test cases now, directly from the raw requirement"
```

**Claude Code:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 REQUIREMENTS ANALYSIS NOT FOUND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 No qa-artifacts/1-requirements-analysis/requirements-analysis.md for this spec.
  1. Generate requirements analysis first, then design test cases
  2. Design test cases now, directly from the raw requirement
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

- **Option 1 (`analyze_first`)** — invoke `stlc-requirements-analyst` on the requirement file. Once it completes, re-read `requirements-analysis.md` (and `test-plan.md` if present) and continue this workflow from Step 1 with the full inputs.
- **Option 2 (`design_now`)** — skip inputs 1 and 2. Derive requirement IDs, ACs, and test types directly from the raw requirement file. Add a "Why this matters" note under the TC metadata table on each affected test case: _"Derived directly from the raw requirement — no formal requirements analysis exists yet for this spec."_

If neither `requirements-analysis.md` nor a requirement file is available at all, stop and ask the user for the source.

### Step 2 — Determine the spec ID and TC ID format

Extract the spec ID from the user's message, the requirement filename, or the requirement ID.
Strip hyphens when forming the prefix: `US-012` → `US012`.

**TC ID format:** `{SPEC_ID}_{NNN}` (zero-padded to 3 digits)

| Spec | First TC | Fifth TC | Sixth TC (overflow) |
|---|---|---|---|
| FR9 | `FR9_001` | `FR9_005` | `FR9_006` |
| US012 | `US012_001` | `US012_005` | `US012_006` |
| REQ003 | `REQ003_001` | `REQ003_005` | `REQ003_006` |

**Filename format:** `{SPEC_ID}_TestCases_{FIRST_ID}-{LAST_ID}.md`
where `{FIRST_ID}` and `{LAST_ID}` are the zero-padded numbers of the first and last TC in that file.

| TCs in file | Filename |
|---|---|
| FR9_001 → FR9_005 | `FR9_TestCases_001-005.md` |
| FR9_006 → FR9_010 | `FR9_TestCases_006-010.md` |
| FR9_011 → FR9_014 | `FR9_TestCases_011-014.md` |

### Step 3 — Plan test coverage

For each requirement / AC:
- At minimum 1 **Functional** (happy path) test case
- At minimum 1 **Negative** test case (invalid input, unauthorized access, missing data)
- **Edge-case** tests where boundaries exist (empty, max/min length, zero, boundary values)
- **Regression** marker if this is a change to existing behaviour

Use test types from the test plan coverage table.

### Step 4 — Write each test case

#### Golden Rule for Test Case Titles

> **A title must answer: "What is being tested, under what condition, and what should happen?"**
>
> Anyone — developer, product manager, or a new QA — should read the title and immediately know:
> 1. **What feature or behavior** is under test
> 2. **The specific scenario or input condition**
> 3. **The expected outcome** (the pass state)

**Title formula:**
```
[Feature] — [Condition/Scenario] → [Expected Outcome]
```
Or in plain language:
```
"When [user does X under condition Y], the system should [Z]"
```

**5 title rules (apply every time):**

| # | Rule | ❌ Bad | ✅ Good |
|---|---|---|---|
| 1 | Write for the reader, not the system | "ASHRAE zone 3B maps to warm bucket" | "A school in Los Angeles scores high when the student prefers warm weather" |
| 2 | State the condition, not just the feature | "Climate preference works" | "Climate preference 'Cold' ranks Minnesota schools above Florida schools" |
| 3 | Include the expected outcome | "Test College Town in Teaser Flow" | "Selecting 'College Town' in Teaser Flow returns only town-area schools at 100% match" |
| 4 | Name the key data — avoid internal IDs | "Locale 33 college_town classification verified" | "Dartmouth College (a remote-town campus) appears in 'College Town' match results" |
| 5 | Keep under 120 characters | Write a "Why this matters" note for complex context instead of cramming it all in the title | — |

**Self-test:** Read the title aloud. If a colleague says *"I get it"* — it's good. If they say *"what does that mean?"* — rewrite it.

> All structural constraints (max TCs, max steps, ID format, status values) are enforced in the → **Rules** section below. Apply them throughout this step.

**Step prefix rules — every Action cell must begin with one of these prefixes:**

| Prefix | When to use | Screenshot required? |
|---|---|---|
| `[Pre-Condition]` | Setup steps before the test begins: login, navigate to starting page, create required data | No |
| `[Verification]` | Assert-only steps: check visible text, URL, element state, count, status — **no user action** | **Yes — always** |
| *(no prefix)* | Normal user-action steps: click, type, select, upload, drag, press key | Only on failure |

**Steps table format:**

```markdown
| # | Action | Expected Result |
|---|---|---|
| 1 | [Pre-Condition] Log in as standard customer (john@example.com / Test@1234) | Logged in, dashboard visible |
| 2 | [Pre-Condition] Navigate to My Account page via avatar dropdown | My Account page loads |
| 3 | Click "Edit" | Edit mode: all four fields become inputs; "Save Changes" and "Cancel" appear |
| 4 | Clear "First Name", type "TemporaryName" | Field shows "TemporaryName" |
| 5 | [Verification] Verify "First Name" field value equals "TemporaryName" and "Save Changes" button is enabled | Field value correct; button enabled |
```

**Consolidation rules to stay within 5 steps:**
- Merge multiple field verifications into a single `[Verification]` step (e.g. "Verify First Name, Last Name, Email, Phone are read-only" = 1 step).
- Combine closely related preconditions into one `[Pre-Condition]` row.
- Aim for 1–2 `[Pre-Condition]` rows, 2–3 action rows, and 1 `[Verification]` row as the final step.
- A `[Verification]` step should always be the **last step** in a test case to confirm the expected final state.

Each test case must be:
- **Self-contained**: all test data stated in the Test Data table; reference `base-test/` files where applicable.
- **Unambiguous**: exact UI labels, button text, and field names in quotes.
- **Verifiable**: expected results are observable (visible text, URL change, toast message, HTTP status).

### Step 5 — Assign TC IDs and compute filenames

Before writing any file:
1. Assign TC IDs sequentially: `{SPEC_ID}_001`, `{SPEC_ID}_002`, …
2. Group into batches of 5.
3. Compute the filename for each batch from the first and last ID in that batch.

Example for 14 test cases on FR9:

| Batch | TC IDs | Filename |
|---|---|---|
| 1 | FR9_001 – FR9_005 | `FR9_TestCases_001-005.md` |
| 2 | FR9_006 – FR9_010 | `FR9_TestCases_006-010.md` |
| 3 | FR9_011 – FR9_014 | `FR9_TestCases_011-014.md` |

### Step 6 — Write output files

Write each batch file to `qa-artifacts/3-test-cases/` using the structure in [template.md](template.md).

If files for this spec ID already exist, read them to find the highest existing TC number, then continue from the next number and compute new filenames accordingly.

---

## Rules

### Title rules
- **A TC title must state what is tested, the condition, and the expected outcome** — one sentence, plain English, readable by any team member without QA background.
- **Never use internal codes, field names, or tech jargon in the title.** Move those to the steps or a "Why this matters" note.
- **Title must be under 120 characters.** If more context is needed, add a "Why this matters" paragraph directly below the TC metadata table.
- **The title is a mini-assertion.** If the test fails, the title alone must tell a developer exactly what broke.

### Structure rules
- **Always read `qa-artifacts/base-test/02-test-data.md` before writing any Test Data table.** Use verified DB values, named student profiles, and defined size bands / locale codes from that file. Never fabricate data that conflicts with it.
- **TC ID and filename format:** defined with examples in Step 2 above — follow exactly. Never use `TC-` prefix. IDs are globally sequential per spec; never reuse.
- **Max 5 TCs per file.** Start a new file at TC 6. Compute the filename from the actual first–last ID range in that batch.
- **Max 5 rows in the Steps table** (including `[Pre-Condition]` and `[Verification]` rows).
- **No separate Preconditions block.** Use `[Pre-Condition]` step rows only.
- **Every step Action must start with `[Pre-Condition]`, `[Verification]`, or have no prefix** (plain action). Never leave a step prefix ambiguous.
- **The last step of every test case must be a `[Verification]` step** confirming the expected final state.
- Step actions must quote exact UI labels: `Click "Save Changes"`, `Enter "John" in "First Name"`.
- Expected results must be observable — no vague phrases like "it works".
- Test data must be complete. For sensitive values: `[SET IN .env: VAR_NAME]`.
- Status is always `Not Run` at design time. Status values (`PASS`, `FAIL`, `BLOCKED`, `SKIPPED`) are reference data — see template.md.

---

## Resources

- Full file structure and all placeholder variables: [template.md](template.md)
- **Test data reference (schools, profiles, formulas):** `qa-artifacts/base-test/02-test-data.md`

---

## Handoff

> "Test case design complete. [M] test cases written for [SPEC_ID] across [N] file(s).  
> Files: FR9_TestCases_001-005.md [, FR9_TestCases_006-010.md …]  
> Next step → run **stlc-manual-executor** to execute the test cases in the browser."

---

## Next Move

Before printing this block, update `qa-artifacts/.session-state.md`:
- `pipeline_stage: test-cases-done`
- `last_skill_run: stlc-testcase-designer`
- `last_action: [M] test cases written for [SPEC_ID]`
- `artifacts.test_cases: <path to file(s)>`

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SKILL COMPLETE: Test Case Designer
 Output: [M] test cases for [SPEC_ID] in [N] file(s)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 WHAT TO DO NEXT:
  → [PRIMARY]   Execute test cases — say "execute test cases"
  → [ALTERNATE] Peer-review test cases before execution
  → [ALTERNATE] Check execution environment is ready (menu option 10)
  → [QUICK]     View today's execution queue (menu option 6)
  → [PAUSE]     Save progress and exit
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Say "what's next" at any time to see this again.
```
