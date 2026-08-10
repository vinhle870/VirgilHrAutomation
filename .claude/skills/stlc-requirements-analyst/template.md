# Requirements Analysis Report

**Project:** {{PROJECT_NAME}}
**Date:** {{DATE}}
**Analyst:** QA Agent — Requirements Analyst Skill
**Source files:** {{SOURCE_FILES}}
**Total requirements found:** {{TOTAL_REQUIREMENTS}}

---

## Executive Summary

{{EXECUTIVE_SUMMARY}}

> _Example: "Three feature areas were analyzed across two requirement files. A total of 5 requirements were extracted. Two testability risks were flagged due to missing acceptance criteria on REQ-003 and REQ-005. Overall testability is rated MEDIUM — the product team should clarify open questions before test case design begins."_

---

## Requirements Detail

<!-- Repeat this block for each requirement -->

### REQ-001 — {{FEATURE_NAME}}

| Field | Value |
|---|---|
| **User Story** | As a {{ROLE}}, I want {{GOAL}} so that {{REASON}} |
| **Priority** | High / Medium / Low |
| **Source File** | {{FILENAME.md}} |
| **Recommended Test Types** | Functional · Negative · Edge-case · Regression · UI · API |

**Acceptance Criteria:**

1. {{CRITERION_1}}
2. {{CRITERION_2}}
3. {{CRITERION_3}}

**Out of Scope:**

- {{OUT_OF_SCOPE_ITEM}} _(or "None stated")_

**⚠ Testability Risks:**

| Risk | Severity | Recommendation |
|---|:---:|---|
| {{RISK_DESCRIPTION}} | High / Medium / Low | {{MITIGATION}} |

_(Write "None identified" if no risks found)_

---

### REQ-002 — {{FEATURE_NAME}}

_(Copy the REQ-001 block above and fill in values)_

---

## Test Coverage Recommendations

| Requirement | Functional | Negative | Edge-case | Regression | UI | API | Accessibility | Performance |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| REQ-001 — {{name}} | ✓ | ✓ | ✓ | | | | | |
| REQ-002 — {{name}} | ✓ | ✓ | | ✓ | ✓ | | | |
| REQ-003 — {{name}} | ✓ | | ✓ | | | ✓ | | |

**Legend:** ✓ = recommended based on requirement content

---

## Open Questions

Questions that must be answered by the product team before test case design begins:

| # | Question | Raised against | Assigned to | Due |
|---|---|---|---|---|
| Q-001 | {{QUESTION}} | REQ-00X | {{PERSON}} | {{DATE}} |
| Q-002 | {{QUESTION}} | REQ-00X | {{PERSON}} | {{DATE}} |

_(Write "None" if no questions)_

---

## Testability Risk Summary

| Requirement | Risk | Severity | Status |
|---|---|:---:|:---:|
| REQ-00X | {{RISK}} | High | Open |
| REQ-00X | {{RISK}} | Medium | Open |

---

## Sign-off Checklist

- [ ] All requirements have at least one acceptance criterion
- [ ] All requirements have a priority assigned
- [ ] Testability risks have been logged
- [ ] Open questions have been assigned to stakeholders
- [ ] Recommended test types reviewed by QA Lead
- [ ] Ready to proceed to Test Plan Design
