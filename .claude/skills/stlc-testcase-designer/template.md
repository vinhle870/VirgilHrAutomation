# Test Cases — {{SPEC_ID}} (File {{FILE_INDEX}} of {{TOTAL_FILES}})

**Project:** {{PROJECT_NAME}}
**Requirement:** {{SPEC_ID}} — {{SPEC_TITLE}}
**Source:** {{SOURCE_FILE}}
**Date:** {{DATE}}
**Designed by:** QA Agent — Test Case Designer Skill
**TC Range:** {{SPEC_ID}}_{{FIRST_NUM}} to {{SPEC_ID}}_{{LAST_NUM}} ({{TC_COUNT}} test cases)
**Coverage:** {{COVERAGE_TYPES}}

---

## Summary Table

| TC ID | Title | Type | Priority | Status |
|---|---|---|:---:|:---:|
| {{SPEC_ID}}_001 | {{TITLE}} | Functional | High | Not Run |
| {{SPEC_ID}}_002 | {{TITLE}} | Negative | High | Not Run |
| {{SPEC_ID}}_003 | {{TITLE}} | Edge-case | Medium | Not Run |
| {{SPEC_ID}}_004 | {{TITLE}} | Functional | High | Not Run |
| {{SPEC_ID}}_005 | {{TITLE}} | Negative | Medium | Not Run |

> Status values: `Not Run` · `PASS` · `FAIL` · `BLOCKED` · `SKIPPED`

---

## Test Cases

---

### {{SPEC_ID}}_001 — {{TITLE}}

| Field | Value |
|---|---|
| **TC ID** | {{SPEC_ID}}_001 |
| **Title** | {{TITLE}} |
| **Requirement** | {{SPEC_ID}} — {{AC_OR_RULE}} |
| **Type** | Functional |
| **Priority** | High |
| **Status** | Not Run |
| **Executed on** | _(filled by executor)_ |
| **Result** | _(filled by executor)_ |

**Why this matters:** _(optional — add when the scenario is not self-explanatory; explains business impact to developers and PMs)_

**Test Data:**

| Variable | Value |
|---|---|
| {{FIELD_NAME}} | {{VALUE}} |
| {{FIELD_NAME}} | {{VALUE}} |

**Steps:**

| # | Action | Expected Result |
|---|---|---|
| 1 | [Pre-Condition] {{SETUP — e.g. "Log in as standard customer (john@example.com / Test@1234)"}} | {{EXPECTED — e.g. "Logged in, dashboard visible"}} |
| 2 | [Pre-Condition] {{NAVIGATION — e.g. "Navigate to My Account page via avatar dropdown"}} | {{EXPECTED — e.g. "My Account page loads"}} |
| 3 | {{ACTION — exact UI label in quotes, e.g. Click "Edit"}} | {{EXPECTED_RESULT}} |
| 4 | {{ACTION}} | {{EXPECTED_RESULT}} |
| 5 | [Verification] {{FINAL ASSERTION}} | {{FINAL_EXPECTED_STATE}} |

---

### {{SPEC_ID}}_002 — {{TITLE}}

| Field | Value |
|---|---|
| **TC ID** | {{SPEC_ID}}_002 |
| **Title** | {{TITLE}} |
| **Requirement** | {{SPEC_ID}} — {{AC_OR_RULE}} |
| **Type** | Negative |
| **Priority** | High |
| **Status** | Not Run |
| **Executed on** | _(filled by executor)_ |
| **Result** | _(filled by executor)_ |

**Why this matters:** _(optional)_

**Test Data:**

| Variable | Value |
|---|---|
| {{FIELD_NAME}} | {{INVALID_VALUE}} |

**Steps:**

| # | Action | Expected Result |
|---|---|---|
| 1 | [Pre-Condition] {{SETUP_ACTION}} | {{EXPECTED}} |
| 2 | {{ACTION — enter invalid data}} | Field shows the invalid value |
| 3 | Click "**{{SUBMIT_BUTTON}}**" | Error message "**{{EXACT_ERROR_TEXT}}**" appears; save blocked |
| 4 | [Verification] {{VERIFY_NO_SIDE_EFFECTS}} | Page stays in same state; no success toast; original data preserved |

---

### {{SPEC_ID}}_003 — {{TITLE}}

| Field | Value |
|---|---|
| **TC ID** | {{SPEC_ID}}_003 |
| **Title** | {{TITLE}} |
| **Requirement** | {{SPEC_ID}} — {{AC_OR_RULE}} |
| **Type** | Edge-case |
| **Priority** | Medium |
| **Status** | Not Run |
| **Executed on** | _(filled by executor)_ |
| **Result** | _(filled by executor)_ |

**Why this matters:** _(optional)_

**Test Data:**

| Variable | Value | Notes |
|---|---|---|
| {{FIELD_NAME}} | {{BOUNDARY_VALUE}} | {{e.g. "Maximum allowed — 50 chars"}} |
| {{FIELD_NAME}} | {{OVER_LIMIT_VALUE}} | {{e.g. "Over limit — 51 chars"}} |

**Steps:**

| # | Action | Expected Result |
|---|---|---|
| 1 | [Pre-Condition] {{SETUP_ACTION}} | {{EXPECTED}} |
| 2 | Enter {{BOUNDARY_VALUE}} in "**{{FIELD_LABEL}}**" | Field accepts value |
| 3 | Click "**{{SUBMIT_BUTTON}}**" | {{BOUNDARY_EXPECTED}} |
| 4 | [Verification] Verify {{OVER_LIMIT_VALUE}} in "**{{FIELD_LABEL}}**" is rejected | {{OVER_LIMIT_EXPECTED}} |

---

<!-- {{SPEC_ID}}_004 and {{SPEC_ID}}_005 follow the same block structure above. -->
<!-- When TC count exceeds 5, create next file per SKILL.md Step 5 (filename computed from actual TC range). -->

---

## Coverage Matrix

| Requirement / AC | Functional | Negative | Edge-case | Regression |
|---|:---:|:---:|:---:|:---:|
| {{AC_OR_RULE_1}} | {{SPEC_ID}}_001 | {{SPEC_ID}}_002 | — | — |
| {{AC_OR_RULE_2}} | {{SPEC_ID}}_004 | — | {{SPEC_ID}}_003, {{SPEC_ID}}_005 | — |

---

## Execution Log

> _(Filled in by **stlc-manual-executor** after execution — do not edit manually)_

| TC ID | Result | Screenshot |
|---|:---:|---|
| {{SPEC_ID}}_001 | _(pending)_ | — |
| {{SPEC_ID}}_002 | _(pending)_ | — |
| {{SPEC_ID}}_003 | _(pending)_ | — |
| {{SPEC_ID}}_004 | _(pending)_ | — |
| {{SPEC_ID}}_005 | _(pending)_ | — |
