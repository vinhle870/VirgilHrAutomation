# Templates — Initiate Agent Conversation Skill

---

## 1. Session State File Template

Use this structure when creating or updating `qa-artifacts/.session-state.md`.

```markdown
# QA Session State
last_updated: {{ISO-8601 TIMESTAMP}}
active_sprint: {{e.g. S4 (version 697)}}
active_feature: {{e.g. FR17 — Predictive Care Reminders}}
active_spec_id: {{e.g. FR17}}
pipeline_stage: {{fresh-start|requirements-done|test-plan-done|test-cases-done|execution-in-progress|execution-complete|bug-report-done|test-report-done|pipeline-complete}}
last_skill_run: {{skill name, e.g. stlc-manual-executor}}
last_action: {{human-readable, e.g. TC-FR17_003 marked FAIL}}
tc_progress: {{e.g. 3/7 (2 PASS, 1 FAIL, 4 remaining) — or "—" if not in execution}}
artifacts:
  test_cases: {{path, e.g. qa-artifacts/3-test-cases/S4/FR17_TestCases_001-007.md}}
  execution_log: {{path or "—"}}
  bug_report: {{path or "—"}}
  test_report: {{path or "—"}}
notes: {{free text or "—"}}
```

---

## 2. Next Move Block Template

Every STLC skill appends this block at the end of its output. Fill in the
skill-specific values from the Per-skill Next Move table in SKILL.md.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SKILL COMPLETE: {{Skill Name}}
 Output: {{one-line summary of what was produced}}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 WHAT TO DO NEXT:
  → [PRIMARY]   {{most logical next step}}
  → [ALTERNATE] {{second option}}
  → [ALTERNATE] {{third option}}
  → [QUICK]     {{fast action}}
  → [PAUSE]     Save progress and exit
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Say "what's next" at any time to see this again.
```

**Instruction to every skill:** Before printing this block, update
`qa-artifacts/.session-state.md` with the current `pipeline_stage`,
`last_skill_run`, `last_action`, and `artifacts` paths.

---

## 3. Daily Summary Briefing Template (Menu Option 3)

```markdown
# QA Daily Summary Briefing
Generated: {{timestamp}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SPRINT: {{active_sprint}}
 FEATURE IN FOCUS: {{active_feature}}
 PIPELINE STAGE: {{human-readable stage label}}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Test Execution Summary
| Metric         | Value |
|---|---|
| Total TCs      | {{N}} |
| PASS           | {{N}} ({{%}}) |
| FAIL           | {{N}} ({{%}}) |
| BLOCKED        | {{N}} |
| SKIPPED        | {{N}} |
| Not Run        | {{N}} |
| Pass Rate      | {{%}} |

## Open Bugs
| Severity | Count |
|---|---|
| Critical | {{N}} |
| High     | {{N}} |
| Medium   | {{N}} |
| Low      | {{N}} |
| **Total** | **{{N}}** |

## Blocked Items
{{N}} items blocked in OpenProject sprint.
{{List ticket IDs if any, or "None"}}

## Suggested First Action
→ {{PRIMARY next move based on pipeline stage}}

## Notes
{{notes from session-state, or "None"}}
```

---

## 4. Next Move Panel Template (used by SKILL.md Phase 3A)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 CURRENT STATE: {{human-readable stage label}}
 Feature : {{active_feature}}
 Sprint  : {{active_sprint}}
 Progress: {{tc_progress}}
 Last    : {{last_action}}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SUGGESTED NEXT MOVES:
  → [1] {{PRIMARY action}}
  → [2] {{ALTERNATE action}}
  → [3] {{ALTERNATE action}}
  → [4] {{QUICK action}}
  → [5] Pause — save progress and exit
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Or type a number from the full menu below.
```

---

## 5. Human-readable Stage Labels

| pipeline_stage | Display label |
|---|---|
| `fresh-start` | Fresh Start / No Active Task |
| `requirements-done` | Requirements Analysed — Test Plan Pending |
| `test-plan-done` | Test Plan Ready — Test Cases Pending |
| `test-cases-done` | Test Cases Written — Execution Pending |
| `execution-in-progress` | Test Execution In Progress |
| `execution-complete` | Execution Complete — Bug Report Pending |
| `bug-report-done` | Bug Report Done — Test Report Pending |
| `test-report-done` | Test Report Done — Ticket Update Pending |
| `pipeline-complete` | Pipeline Complete |
