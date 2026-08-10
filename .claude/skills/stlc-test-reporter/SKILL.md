---
name: stlc-test-reporter
description: >-
  Compile all STLC artifacts into a final executive test report and write
  qa-artifacts/5-testing-report/test-report.md. Use when the user asks to "generate
  the test report", "write the test report", "compile results", or "produce the
  final QA report". Must run after stlc-manual-executor and stlc-bug-reporter.
  Part of the 7-skill STLC QA pipeline.
---

# Skill 6 — Test Reporter

You are a senior QA engineer performing the **Test Reporting** phase of the STLC. Read all prior artifacts, calculate metrics, write an executive-quality `qa-artifacts/5-testing-report/test-report.md`, and optionally post a summary to Slack.

---

## Workflow

### Step 1 — Collect all artifacts

Read these files (skip if absent — note it in the report):

| File | What it provides |
|---|---|
| `qa-artifacts/1-requirements-analysis/requirements-analysis.md` | Requirement count, testability risks |
| `qa-artifacts/2-test-plan/test-plan.md` | Planned scope, entry/exit criteria, pass rate threshold |
| `qa-artifacts/3-test-cases/test-cases.md` | Test case list and Status per TC |
| `qa-artifacts/4-execution-results/execution-log.md` | Step-level results, failure details |
| `qa-artifacts/5-testing-report/bug-report.md` | Bug count, severity distribution, tracker ticket IDs |
| `qa-artifacts/4-execution-results/screenshots/` | Evidence (list filenames only, do not embed) |

### Step 2 — Calculate metrics

| Metric | How to calculate |
|---|---|
| Total test cases | Count all TC rows in test-cases.md |
| Passed / Failed / Blocked / Skipped | Count by Status value |
| Pass rate % | (Passed / Total) × 100 |
| Defect density | Total bugs / Total test cases |
| Critical / High bugs open | From bug-report.md Defect Summary table |

### Step 3 — Determine verdict

Apply exit criteria from `qa-artifacts/2-test-plan/test-plan.md`. If absent, use defaults:

| Verdict | Condition |
|---|---|
| **✅ PASS — Ready for Release** | Pass rate ≥ 90%, zero Critical bugs open |
| **⚠️ CONDITIONAL PASS** | Pass rate ≥ 80%, zero Critical, High bugs ≤ 2 |
| **❌ FAIL — Not Ready** | Pass rate < 80%, or any Critical bug open |

### Step 4 — Write the output file

Write to `qa-artifacts/5-testing-report/test-report.md` using the full structure in [template.md](template.md).

### Step 5 — Optional: Post to Slack

If the Slack MCP is connected and `SLACK_CHANNEL` is set, ask the user: _"Should I also post this summary to Slack?"_ If yes, post the Executive Summary and verdict using the Slack MCP tool.

---

## Rules

- Calculate metrics precisely from actual file content — never estimate.
- Verdict must appear in the first visual block, not buried in the body.
- Executive Summary must be written for a non-technical audience (no acronyms or jargon).
- Recommendations must be specific and actionable — not generic advice.

---

## Resources

- Output format, all sections, and sign-off table: [template.md](template.md)

---

## Handoff

When `qa-artifacts/5-testing-report/test-report.md` is written, tell the user:

> "Test report complete. Verdict: [PASS / CONDITIONAL PASS / FAIL]  
> Pass rate: [XX]% | Defects: [N] total ([C] Critical, [H] High)  
> Written to qa-artifacts/5-testing-report/test-report.md  
> Next step → run **stlc-ticket-updater** to update tracker tickets with final results."

---

## Next Move

Before printing this block, update `qa-artifacts/.session-state.md`:
- `pipeline_stage: report-done`
- `last_skill_run: stlc-test-reporter`
- `last_action: Test report written — verdict: [PASS/CONDITIONAL PASS/FAIL]`
- `artifacts.test_report: qa-artifacts/5-testing-report/test-report.md`

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SKILL COMPLETE: Test Reporter
 Output: test-report.md — Verdict: [PASS / CONDITIONAL PASS / FAIL]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 WHAT TO DO NEXT:
  → [PRIMARY]   Update tracker tickets — say "update tickets"
  → [ALTERNATE] Share test report with team
  → [ALTERNATE] Review verdict and decide go/no-go
  → [QUICK]     Post report link to OP ticket (menu option 13)
  → [PAUSE]     Save progress and exit
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Say "what's next" at any time to see this again.
```
