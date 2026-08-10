# Bug Report

**Project:** {{PROJECT_NAME}}
**Report ID:** BR-{{YYYYMMDD}}-001
**Test Cycle:** {{TEST_CYCLE_DESCRIPTION}}
**Date:** {{DATE}}
**Reported by:** QA Agent — Bug Reporter Skill
**Source:** qa-artifacts/test-cases.md — Execution Log

| Metric | Value |
|---|:---:|
| Total defects | {{TOTAL}} |
| Critical | {{CRITICAL}} |
| High | {{HIGH}} |
| Medium | {{MEDIUM}} |
| Low | {{LOW}} |
| Tracker tickets created | {{TICKET_COUNT}} |

---

## Defect Summary

| Bug ID | TC ID | Title | Severity | Priority | Tracker Ticket | Status |
|---|---|---|:---:|:---:|---|:---:|
| BUG-001 | TC-002 | {{TITLE}} | High | P1 | {{TICKET_LINK}} | Open |
| BUG-002 | TC-005 | {{TITLE}} | Medium | P2 | {{TICKET_LINK}} | Open |
| BUG-003 | TC-007 | {{TITLE}} | Low | P4 | {{TICKET_LINK}} | Open |

---

## Bug Details

---

### BUG-001 — {{SHORT_TITLE}}

| Field | Value |
|---|---|
| **Bug ID** | BUG-001 |
| **Test Case** | TC-002 |
| **Requirement** | REQ-001 — {{FEATURE_NAME}} |
| **Severity** | Critical / High / Medium / Low |
| **Priority** | P1 / P2 / P3 / P4 |
| **Environment** | {{BROWSER}} · {{OS}} · App version {{VERSION}} |
| **Tracker Ticket** | [{{TICKET_ID}}]({{TICKET_URL}}) |
| **Status** | Open |
| **First found** | {{DATE}} |
| **Reproducibility** | Always / Intermittent ({{N}}/{{M}} attempts) |

**Summary:**
{{ONE_SENTENCE_DESCRIBING_THE_DEFECT}}

> _Example: "The 'Save Changes' button on the Profile page does nothing when the email field contains a valid but unusual TLD (e.g. `.museum`)."_

**Steps to Reproduce:**

1. {{STEP_1}}
2. {{STEP_2}}
3. {{STEP_3}}
4. _(Add exact values and button labels used during execution)_

**Expected Result:**
{{WHAT_SHOULD_HAVE_HAPPENED — reference the acceptance criterion}}

**Actual Result:**
{{WHAT_ACTUALLY_HAPPENED}}

**Evidence:**

| Type | Path / Link |
|---|---|
| Screenshot | `reports/screenshots/TC-002-fail-step3.png` |
| Screenshot (context) | `reports/screenshots/TC-002-fail-context.png` |
| Console log | _(paste error if observed, or "None captured")_ |

**Suggested Root Cause:**
{{OPTIONAL — e.g. "Input validation regex does not account for 4-character TLDs." or "Unknown — for dev investigation."}}

**Notes:**
{{ADDITIONAL_CONTEXT — e.g. intermittency, specific data, environment-specific, regression?}}

---

### BUG-002 — {{SHORT_TITLE}}

| Field | Value |
|---|---|
| **Bug ID** | BUG-002 |
| **Test Case** | TC-005 |
| **Requirement** | REQ-002 — {{FEATURE_NAME}} |
| **Severity** | Medium |
| **Priority** | P2 |
| **Environment** | {{ENV}} |
| **Tracker Ticket** | [{{TICKET_ID}}]({{TICKET_URL}}) |
| **Status** | Open |
| **First found** | {{DATE}} |
| **Reproducibility** | Always |

**Summary:**
{{ONE_SENTENCE}}

**Steps to Reproduce:**

1. {{STEP_1}}
2. {{STEP_2}}

**Expected Result:**
{{EXPECTED}}

**Actual Result:**
{{ACTUAL}}

**Evidence:**

| Type | Path |
|---|---|
| Screenshot | `reports/screenshots/TC-005-fail-step2.png` |

---

<!-- Repeat BUG block for BUG-003, BUG-004 … -->

---

## Defect Distribution

| Severity | Count | Affected TCs |
|---|:---:|---|
| Critical | {{N}} | {{TC_IDS or "—"}} |
| High | {{N}} | {{TC_IDS or "—"}} |
| Medium | {{N}} | {{TC_IDS or "—"}} |
| Low | {{N}} | {{TC_IDS or "—"}} |

---

## Defects by Requirement

| Requirement | Bug Count | Bug IDs |
|---|:---:|---|
| REQ-001 — {{NAME}} | {{N}} | BUG-001, BUG-002 |
| REQ-002 — {{NAME}} | {{N}} | BUG-003 |

---

## Ticket Update Log

> _(Appended by **stlc-ticket-updater** skill. Do not edit manually.)_

**Updated by:** QA Agent — Ticket Updater Skill
**Date:** _(filled by updater)_

| Bug ID | Ticket | Action | New Status | Updated on |
|---|---|---|---|---|
| BUG-001 | {{TICKET_ID}} | _(pending)_ | _(pending)_ | — |
| BUG-002 | {{TICKET_ID}} | _(pending)_ | _(pending)_ | — |
