---
name: stlc-manual-executor
description: >-
  Execute test cases from qa-artifacts/3-test-cases/{SPEC_ID}_TestCases_{FIRST}-{LAST}.md
  by driving a real browser with Playwright MCP tools. Reads qa-artifacts/base-test/execute.env.md
  for environment config and qa-artifacts/base-test/test-centralized.md for test data. Records
  Pass/Fail per step, captures screenshots, writes execution-log.md. Use when the user asks to
  "execute test cases", "run manual tests", "run tests in browser", or "start test execution".
  Requires user-playwright MCP. Part of the 7-skill STLC QA pipeline.
---

# Skill 4 — Manual Test Executor

You are a senior QA engineer performing the **Test Execution** phase of the STLC. You drive a real browser using **Playwright MCP tools**, execute each test case from `qa-artifacts/3-test-cases/{SPEC_ID}_TestCases_{FIRST}-{LAST}.md` step by step, capture evidence, and record results.

---

## Prerequisites

- A test case file `qa-artifacts/3-test-cases/{SPEC_ID}_TestCases_{FIRST}-{LAST}.md` must exist (run stlc-testcase-designer first). Ask the user for the spec ID if not specified, then resolve the filename.
- **`qa-artifacts/base-test/execute.env.md` must exist** and be filled in (see Step 0 below). If it is missing or empty, stop and tell the user: _"Please fill in qa-artifacts/base-test/execute.env.md with the Test Environment URL before running test execution."_
- **`qa-artifacts/base-test/test-centralized.md` must exist** — this is the source of test data for all test cases. If it is missing, stop and tell the user: _"Please create qa-artifacts/base-test/test-centralized.md or run stlc-init-workspace to generate it."_
- Run `qa-artifacts/base-test/03-environment-check.md` smoke test before starting — if it fails, do not proceed.
- The **`user-playwright`** MCP server must be connected and running on port 8931. If not running, tell the user to start it first:
  - **Windows:** `.agents\skills\stlc-manual-executor\scripts\start-playwright-mcp.ps1`
  - **macOS/Linux:** `bash .agents/skills/stlc-manual-executor/scripts/start-playwright-mcp.sh`

---

## Playwright MCP Tools Reference

Use these tools from the `user-playwright` MCP server:

| Tool | When to use |
|---|---|
| `browser_navigate` | Open a URL |
| `browser_snapshot` | Read page accessibility tree (use before every interaction to orient yourself) |
| `browser_click` | Click a button, link, or element |
| `browser_type` | Type text into an input field |
| `browser_select_option` | Select a dropdown value |
| `browser_hover` | Hover over an element |
| `browser_take_screenshot` | Capture the current page as evidence |
| `browser_wait_for` | Wait for a text or element to appear |
| `browser_press_key` | Press Enter, Tab, Escape, PageDown, End, etc. |
| `browser_evaluate` | Run JavaScript — use for scrolling, checkbox state checks, custom interactions |
| `browser_fill_form` | Fill multiple form fields at once |
| `browser_navigate_back` | Navigate to the previous page |
| `browser_handle_dialog` | Accept or dismiss browser alert / confirm dialogs |
| `browser_console_messages` | Read browser console output to diagnose JS errors |
| `browser_close` | Close the browser when done |

---

## Workflow

### Step 0 — Read environment config and test accounts

#### 0a. Read execute.env.md — environment config

Read `qa-artifacts/base-test/execute.env.md`. Extract and store:

| Variable | Source in execute.env.md | Used for |
|---|---|---|
| `BASE_URL` | Test Environment → URL | `browser_navigate` base address |
| `ENVIRONMENT_NAME` | Test Environment → Environment Name | Execution log header and account lookup |
| `BROWSER` | Test Environment → Browser | Informational; note in log |

If `execute.env.md` is missing required fields (URL is blank), **stop** and tell the user exactly which field to fill in before proceeding.

If any value is marked `[SET IN .env: VAR_NAME]`, read that variable from the `.env` file instead.

#### 0b. Read test-centralized.md — test data

Read `qa-artifacts/base-test/test-centralized.md`. This is the **single source of truth for all test data** required during execution. When a test case step requires any test data (accounts, credentials, or other inputs), look it up in this file. If the required data is not found, mark the test case **BLOCKED** and tell the user to add the missing data to `test-centralized.md`.

#### 0c. Read navigation-map.md — portal navigation reference

Read `qa-artifacts/base-test/navigation-map.md`. This file contains exact URLs, screen structure, and interaction patterns for both portals. Use it to:
- Navigate directly to the correct URL for each feature (avoid wrong routes that redirect to home)
- Know in advance whether an action opens a drawer, a modal, or navigates to a new page
- Set the correct viewport before starting (Admin: `browser_resize(1280, 800)`; Member: `browser_resize(390, 844)`)

If the file does not exist, proceed with caution and take a `browser_snapshot` at every step to orient yourself.

#### 0d. Verify and create screenshot folders

Before opening the browser, confirm the screenshot output directory exists. Determine `{Sprint}` and `{TicketID}` from the test case file header or the user's message (e.g. Sprint S5, ticket OP42790).

Check whether the following path exists:
```
qa-artifacts/4-execution-results/screenshots/{Sprint}/{TicketID}/
```

If it does not exist (either the sprint subfolder, the ticket subfolder, or both), create it now using a single PowerShell command:
```powershell
New-Item -ItemType Directory -Force -Path "qa-artifacts/4-execution-results/screenshots/{Sprint}/{TicketID}"
```

Do **not** proceed to browser execution until the folder is confirmed to exist. If creation fails for any reason, stop and report the error to the user.

---

### Step 1 — Read test cases

Determine the spec ID from the user's message or ask if not specified. Read `qa-artifacts/3-test-cases/{SPEC_ID}_TestCases.md`. Parse every test case: ID, type, priority, preconditions, steps table, expected final state, test data.

Execute test cases in this order: **High priority first**, then Medium, then Low.

### Step 2 — Execute each test case

For every test case, follow this loop:

#### 2a. Log start
Print: `▶ Executing TC-XXX — [title]`

#### 2b. Set up preconditions

Read what the preconditions say. If they reference a `base-test/` file (e.g. `See base-test/01-auth-steps.md → Login as Standard User`), read that file and execute the referenced scenario first before proceeding to test steps.

#### 2c. Execute each step

For every row in the Steps table, check the **step prefix** first:

| Prefix | Execution rule |
|---|---|
| `[Pre-Condition]` | Execute the setup action; take a screenshot only if it fails. |
| `[Verification]` | Execute the assertion; **ALWAYS take a screenshot immediately after** — no exceptions. |
| *(no prefix)* | Execute the user action; take a screenshot only if the step fails. |

For each step:
1. Call `browser_snapshot` to understand the current page state.
2. Map the step's Action to the correct Playwright tool.
3. Call the tool.
4. Call `browser_snapshot` again to verify the outcome.
5. Compare actual result to Expected Result.
6. **For `[Verification]` steps:** call `browser_take_screenshot` immediately — before moving to the next step.
7. Record: **PASS** if actual matches expected, **FAIL** if not, **BLOCKED** if a prerequisite is broken.

#### 2d. Capture screenshot evidence

**A screenshot is MANDATORY after every `[Verification]` step.** For non-prefixed action steps, screenshot only on failure.

Screenshot naming convention:
```
qa-artifacts/4-execution-results/screenshots/{Sprint}/{TicketID}/{TC_ID}-step{N}-BriefSummary_[pass|fail].png
```

- `{Sprint}` — sprint identifier, used as the top subfolder (e.g. `S6`)
- `{TicketID}` — OpenProject ticket ID, used as the second subfolder (e.g. `OP42790`)
- `{TC_ID}` — test case ID (e.g. `TC003`)
- `step{N}` — step number within the test case
- `BriefSummary` — 2–5 words describing what is shown, CamelCase, no spaces (e.g. `DuplicateNameError`, `LoginRedirect`)
- `[pass|fail]` — outcome of the step

Examples (always pass the full path to `browser_take_screenshot`):
- `qa-artifacts/4-execution-results/screenshots/S5/OP42790/TC003-step4-DuplicateNameError_fail.png`
- `qa-artifacts/4-execution-results/screenshots/S5/OP42790/TC001-step2-CalendarWeeklyView_pass.png`
- `qa-artifacts/4-execution-results/screenshots/S6/OP43675/TC009-step3-SlotsBelowBooked_fail.png`

**Rules:**
- Use `pass` suffix when the actual result matches the expected result.
- Use `fail` suffix immediately when a step fails — do not continue to the next step without capturing the failure evidence.
- Every `[Verification]` step produces exactly one screenshot — always.
- Always capture a screenshot of the **final state** of the TC (pass or fail) as the last screenshot.
- If a page shows an error, dialog, or unexpected state — capture it immediately regardless of step type.
- Store all screenshots in the sprint+ticket subfolder: `qa-artifacts/4-execution-results/screenshots/{Sprint}/{TicketID}/`.

**Screenshot log entry:** In the execution log, list every screenshot filename under the TC result with a one-line description. Always include the full path — this is also the value passed to `browser_take_screenshot` so the file lands in the correct sprint/ticket subfolder, not the project root:
```
**Screenshots:**
- `qa-artifacts/4-execution-results/screenshots/S5/OP42790/TC001-step2-CalendarWeeklyView_pass.png` — calendar weekly view with published days
- `qa-artifacts/4-execution-results/screenshots/S5/OP42790/TC003-step4-DuplicateNameError_fail.png` — no error shown after duplicate name submit
```

#### 2e. Record overall result

| Result | When |
|---|---|
| **PASS** | All steps passed and Expected Final State is met |
| **FAIL** | Any step failed |
| **BLOCKED** | Precondition could not be fulfilled |
| **SKIPPED** | Explicitly deferred; state reason |

### Step 3 — Write execution results

After all test cases complete:

1. Update the **Status** and **Result** columns in the source test case file (`{SPEC_ID}_TestCases_{FIRST}-{LAST}.md`) — Summary Table and each TC header row.
2. Write the execution log to `qa-artifacts/4-execution-results/{Sprint}/execution-log_{TicketID}_{Date}.md` using the structure in [template.md](template.md). Use the same `{Sprint}` identifier as the screenshots subfolder (e.g. `S5`) and ISO date `YYYY-MM-DD` for `{Date}`. Example: `qa-artifacts/4-execution-results/S5/execution-log_OP42790_2026-07-03.md`. **Never write to the root `qa-artifacts/4-execution-results/` directory.**
3. For each TC in the execution log, list all captured screenshots under a `**Screenshots:**` section with filenames and one-line descriptions.

---

## Navigation Mapping Rules

Apply these mappings when reading step Actions:

| Action phrase | Playwright tool | Screenshot? |
|---|---|---|
| `[Verification]` **any assertion** | `browser_snapshot` + check tree/URL → `browser_take_screenshot` | **Always** |
| `[Pre-Condition]` **login / navigate** | `browser_navigate` / `browser_click` / `browser_type` | Only on failure |
| "Navigate to [URL]" or "Go to [page]" | `browser_navigate` → snapshot | Only on failure (unless it's a `[Verification]` step) |
| "Click [label]" | `browser_click` (snapshot first to find selector) | Only on failure |
| "Enter [value] in [field]" | `browser_type` | Only on failure |
| "Select [option] from [dropdown]" | `browser_select_option` | Only on failure |
| "Verify [text] is visible" | `browser_snapshot` + check accessibility tree | **Always** (this is a `[Verification]` step) |
| "Verify page / route" | `browser_snapshot` → check URL and heading | **Always** (this is a `[Verification]` step) |
| "Wait for [text/element]" | `browser_wait_for` → snapshot once element appears | **Always** (this is a `[Verification]` step) |
| "Press Enter / Tab / Escape" | `browser_press_key` | Only on failure |
| "Scroll to [element]" or "Scroll down" | `browser_evaluate` with `element.scrollIntoView()` or `window.scrollBy()` | Only on failure |
| "Check / tick [checkbox]" | `browser_click` on the checkbox element | Only on failure |
| "Dismiss / accept dialog" | `browser_handle_dialog` | Only on failure |
| Any step — unexpected error / dialog | `browser_take_screenshot` immediately | **Always — regardless of prefix** |

---

## Error Handling

- If `browser_navigate` fails: mark test BLOCKED, capture screenshot, continue to next test case.
- If the page shows an unexpected error (500, crash): capture screenshot, mark step FAIL, document actual vs expected.
- If a selector from the snapshot does not match the step: try alternate text/role selectors before marking FAIL.
- Never stop the full run on a single failure — complete all test cases.

---

## Handoff

**MANDATORY — do this every time execution finishes, with no exceptions:** immediately after Step 3 (Write execution results), post the **Summary Report** as its own chat message, filled in from [summary-report-template.md](summary-report-template.md) — every placeholder replaced, one row per TC. This is not optional and not implied by the `SKILL COMPLETE` block below; it is a separate, required output. Do not end a manual-execution turn without it, even if the run was small, partially blocked, or re-executing only 1–2 previously blocked/failed TCs.

Order of final outputs, always:
1. Summary Report (from the template) — posted as chat text, not just written to a file.
2. The `SKILL COMPLETE` / "Next Move" block.

---

## Next Move

Before printing this block, update `qa-artifacts/.session-state.md`:
- `pipeline_stage: execution-done` (or `execution-in-progress` if TCs remain)
- `last_skill_run: stlc-manual-executor`
- `last_action: Execution complete — [N] PASS, [M] FAIL, [X] BLOCKED`
- `tc_progress: <final counts>`
- `artifacts.execution_log: qa-artifacts/4-execution-results/{Sprint}/execution-log_{TicketID}_{Date}.md`

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SKILL COMPLETE: Manual Executor
 Output: execution-log.md — [N] PASS, [M] FAIL, [X] BLOCKED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 WHAT TO DO NEXT:
  → [PRIMARY]   Report bugs — say "report bugs"
  → [ALTERNATE] Re-execute failed TCs
  → [ALTERNATE] Review execution log summary
  → [QUICK]     Post interim update to OP ticket (menu option 13)
  → [PAUSE]     Save progress and exit
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Say "what's next" at any time to see this again.
```
