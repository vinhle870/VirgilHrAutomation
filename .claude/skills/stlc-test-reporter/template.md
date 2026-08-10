# Test Execution Report

**Report ID:** TR-{{YYYYMMDD}}-001
**Project:** {{PROJECT_NAME}}
**Test Cycle:** {{CYCLE_DESCRIPTION — e.g. "Sprint 12 — User Profile Feature"}}
**Application version:** {{VERSION or BUILD_ID}}
**Date:** {{DATE}}
**Prepared by:** QA Agent — Test Reporter Skill

---

## Verdict

> # ✅ PASS — Ready for Release
> _Replace with one of:_
> _⚠️ CONDITIONAL PASS — Ship with conditions_
> _❌ FAIL — Not Ready for Release_

**Rationale:** {{ONE_SENTENCE — e.g. "Pass rate of 95% exceeds the 90% threshold; zero Critical bugs open."}}

---

## Executive Summary

{{3–5 SENTENCES FOR NON-TECHNICAL STAKEHOLDERS}}

> _Example: "The QA team completed a full test cycle of the User Profile feature across 12 test cases covering 4 requirements. 11 of 12 test cases passed, achieving a 91.7% pass rate. Two defects were found: one High severity issue with email validation (PROJ-42) and one Low severity cosmetic issue (PROJ-43). The High severity defect is recommended for immediate fix before release. The Low severity defect may be deferred to the next sprint."_

---

## Test Metrics

| Metric | Value |
|---|:---:|
| Requirements covered | {{N}} of {{TOTAL_REQ}} |
| Total test cases | {{TOTAL_TC}} |
| Passed | {{PASSED}} ({{PASS_RATE}}%) |
| Failed | {{FAILED}} ({{FAIL_RATE}}%) |
| Blocked | {{BLOCKED}} |
| Skipped | {{SKIPPED}} |
| **Pass rate** | **{{PASS_RATE}}%** |
| Pass rate threshold | {{THRESHOLD}}% |
| Threshold met? | ✅ Yes / ❌ No |

**Defect Metrics:**

| Severity | Open | Resolved | Total Found |
|---|:---:|:---:|:---:|
| Critical | {{N}} | {{N}} | {{N}} |
| High | {{N}} | {{N}} | {{N}} |
| Medium | {{N}} | {{N}} | {{N}} |
| Low | {{N}} | {{N}} | {{N}} |
| **Total** | **{{N}}** | **{{N}}** | **{{N}}** |

---

## Exit Criteria Assessment

| Criterion | Target | Actual | Met? |
|---|---|---|:---:|
| All High-priority TCs executed | 100% | {{ACTUAL}}% | ✅ / ❌ |
| Pass rate | ≥ {{THRESHOLD}}% | {{ACTUAL}}% | ✅ / ❌ |
| Critical bugs open | 0 | {{N}} | ✅ / ❌ |
| High bugs open | ≤ {{MAX}} | {{N}} | ✅ / ❌ |
| Test report generated | Yes | Yes | ✅ |

---

## Requirement Coverage

| Requirement | Test Cases | Passed | Failed | Blocked | Coverage |
|---|:---:|:---:|:---:|:---:|:---:|
| REQ-001 — {{NAME}} | 3 | 2 | 1 | 0 | 67% |
| REQ-002 — {{NAME}} | 2 | 2 | 0 | 0 | 100% |
| REQ-003 — {{NAME}} | 4 | 4 | 0 | 0 | 100% |
| **Total** | **{{N}}** | **{{N}}** | **{{N}}** | **{{N}}** | **{{OVERALL}}%** |

---

## Defect Summary

| Bug ID | Title | Severity | Priority | Requirement | Tracker | Status |
|---|---|:---:|:---:|---|---|:---:|
| BUG-001 | {{TITLE}} | High | P1 | REQ-001 | [{{TICKET}}]({{URL}}) | Open |
| BUG-002 | {{TITLE}} | Low | P4 | REQ-002 | [{{TICKET}}]({{URL}}) | Open |

---

## Test Artifacts

| Artifact | Location | Generated on |
|---|---|---|
| Requirements Analysis | `qa-artifacts/requirements-analysis.md` | {{DATE}} |
| Test Plan | `qa-artifacts/test-plan.md` | {{DATE}} |
| Test Cases | `qa-artifacts/test-cases.md` | {{DATE}} |
| Execution Log | `qa-artifacts/test-cases.md` (Execution Log section) | {{DATE}} |
| Bug Report | `qa-artifacts/bug-report.md` | {{DATE}} |
| Screenshots | `reports/screenshots/` ({{N}} files) | {{DATE}} |
| **This Report** | `qa-artifacts/test-report.md` | {{DATE}} |

---

## Risks and Observations

{{LIST_ANY_GAPS_OR_CONCERNS}}

- {{e.g. "TC-007 was blocked throughout the cycle due to a 503 error on the /api/profile endpoint. Coverage for REQ-003 error handling is incomplete."}}
- {{e.g. "REQ-004 has no negative test cases — flagged as coverage gap for next cycle."}}

_(Write "None" if no risks or observations)_

---

## Recommendations

1. {{SPECIFIC_ACTION — e.g. "Fix BUG-001 (High severity — email validation) before merging to main."}}
2. {{SPECIFIC_ACTION — e.g. "Investigate 503 errors on /api/profile that blocked TC-007."}}
3. {{SPECIFIC_ACTION — e.g. "Add negative test cases for REQ-004 in the next sprint."}}
4. {{SPECIFIC_ACTION — e.g. "BUG-002 (Low severity — cosmetic) may be deferred to Sprint 13."}}

---

## Sign-off

| Role | Name | Decision | Signature | Date |
|---|---|:---:|:---:|---|
| QA Agent | QA Agent (Automated) | {{PASS/FAIL}} | _(automated)_ | {{DATE}} |
| QA Lead | {{NAME}} | Pending | | |
| Development Lead | {{NAME}} | Pending | | |
| Product Owner | {{NAME}} | Pending | | |
