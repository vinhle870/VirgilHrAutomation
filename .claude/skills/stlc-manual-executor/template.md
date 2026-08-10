# Execution Log

> Written to `qa-artifacts/4-execution-results/execution-log.md` by the **stlc-manual-executor** skill
> after all test cases have been executed. Do not write this manually.

---

## Execution Summary

**Executed by:** QA Agent — Manual Executor Skill
**Date:** {{DATE}}
**Base URL:** {{APP_BASE_URL}}
**Browser:** Chromium (Playwright)
**Duration:** {{START_TIME}} → {{END_TIME}}

| Metric | Value |
|---|:---:|
| Total test cases | {{TOTAL}} |
| Passed | {{PASSED}} |
| Failed | {{FAILED}} |
| Blocked | {{BLOCKED}} |
| Skipped | {{SKIPPED}} |
| **Pass rate** | **{{PASS_RATE}}%** |

---

## Result Table

| TC ID | Title | Priority | Result | Steps Passed | Steps Failed | Screenshot |
|---|---|:---:|:---:|:---:|:---:|---|
| TC-001 | {{TITLE}} | High | **PASS** | 4 | 0 | `qa-artifacts/4-execution-results/screenshots/TC-001-pass-step4.png` |
| TC-002 | {{TITLE}} | High | **FAIL** | 2 | 1 | `qa-artifacts/4-execution-results/screenshots/TC-002-fail-step3.png` |
| TC-003 | {{TITLE}} | Medium | **BLOCKED** | 0 | 0 | `qa-artifacts/4-execution-results/screenshots/TC-003-blocked.png` |

> Result values: **PASS** · **FAIL** · **BLOCKED** · **SKIPPED**

---

## Failure Details

> One block per FAIL or BLOCKED test case.

### TC-002 — {{TITLE}} — FAIL

| Field | Value |
|---|---|
| **Failed at step** | Step 3 of 4 |
| **Action** | Click "**{{BUTTON_LABEL}}**" |
| **Expected result** | {{EXPECTED}} |
| **Actual result** | {{ACTUAL}} |
| **Error / Console message** | {{ERROR_TEXT or "None observed"}} |
| **Screenshot** | `qa-artifacts/4-execution-results/screenshots/TC-002-fail-step3.png` |
| **Notes** | {{ADDITIONAL_CONTEXT — e.g. "Issue intermittent; reproduced 2/3 attempts"}} |

---

### TC-003 — {{TITLE}} — BLOCKED

| Field | Value |
|---|---|
| **Blocked at step** | Step 1 (precondition) |
| **Reason** | {{WHY_BLOCKED — e.g. "Login page returned 500 Internal Server Error"}} |
| **Screenshot** | `qa-artifacts/4-execution-results/screenshots/TC-003-blocked.png` |
| **Dependency** | {{WHAT_MUST_BE_FIXED — e.g. "BUG-001 must be resolved before this TC can run"}} |

---

## Skipped Test Cases

| TC ID | Reason |
|---|---|
| TC-00X | {{REASON — e.g. "Out of scope for this cycle per test plan v1.0 section 2.2"}} |

_(Remove table if no test cases were skipped)_

---

## Environment Observations

{{ANY_NOTES_ABOUT_ENVIRONMENT_DURING_EXECUTION}}

> _Example: "Application was slow to respond between 14:30–14:45; response times > 5s observed on TC-004 step 2. Likely unrelated to test failures."_

_(Write "None" if no observations)_
