# Agent Coordination — Routing Reference

Detailed routing logic for all options. Read this file when executing a specific
option or running Post-Skill Completion. Do not read on startup.

---

## Option Routing

### op1 — List sprint tickets

Apply **Sprint Resolution Rule**.
Use `op-fetch-sprint-tickets` skill. Display result table grouped by status.

### op2 — Read ticket detail

Ask: _"Enter the OpenProject ticket ID:"_
Use `op-get-ticket` skill to fetch and render the ticket card.

### op3 — List blocked tickets

Apply **Sprint Resolution Rule**.
Query OpenProject (access rule) for WPs with status `Blocked` in that sprint.
Show: ID · subject · assignee · days blocked.
Offer: _"Post a comment to any of these? Enter ticket ID or 'skip'."_

### op4 — Check sprint progress

Apply **Sprint Resolution Rule**.
Use `op-fetch-sprint-tickets`. Calculate and display:
```
Sprint: <name>   Total WPs: <N>
  Done / QA Completed / UAT Completed : <N> (<X>%)
  In QA / Ready for QA                : <N> (<X>%)
  In Progress / Dev Completed         : <N> (<X>%)
  To Do / New                         : <N> (<X>%)
  Blocked                             : <N>
```

### op5 — Review yesterday's activity

Apply **Sprint Resolution Rule**.
Run in parallel:
1. OpenProject (access rule): fetch WPs updated in last 24 h in that sprint.
2. `git log --since="1 day ago" --oneline`

Compile a digest of OpenProject changes + code commits.

### op6 — Post comment

Ask: _"Enter WP ID:"_ then _"Enter your comment:"_
Use `op-manage-child-ticket` skill (`action: update`) to post the update.

### op7 — View team workload

Apply **Sprint Resolution Rule**.
Read `qa-artifacts/base-test/op_assignees.md` for team member ID → name mapping.
Use `op-fetch-sprint-tickets`. Group WPs by assignee, count open
(non-Done, non-Closed) WPs per person.
Display as a table: Assignee | Open WPs | Blocked | In QA.

### q1 — View daily QA summary

Read `qa-artifacts/.session-state.md` (active sprint/feature/stage).
Also read:
- `qa-artifacts/4-execution-results/**` — pass/fail counts
- `qa-artifacts/5-testing-report/bug-report*.md` — open bug counts by severity
- OpenProject (access rule): blocked WP count

Render using the **Daily Summary Briefing** template in `template.md`.

### q2 — View execution queue

Apply **Sprint Resolution Rule** using `active_spec_id` as the key.
Read `qa-artifacts/3-test-cases/**`. Filter TCs with status `Not Run`.
Sort by priority: Critical → High → Medium → Low.
Output: TC ID · subject · priority · spec file path.

### q3 — Triage open bugs

Read `qa-artifacts/5-testing-report/bug-report*.md`.
Group open bugs by severity: Critical → High → Medium → Low.
Flag bugs without an OpenProject ticket ID. Show count awaiting ticket creation.

### q4 — Analyse QA coverage gaps

Apply **Sprint Resolution Rule**.
List all WP IDs via `op-fetch-sprint-tickets`.
Scan `qa-artifacts/3-test-cases/**` filenames for each WP/spec ID.
Report WPs with no test case file — these are coverage gaps.

### c1 — Review code changes for a ticket

Ask: _"Enter the OpenProject ticket ID or branch name:"_
Run:
```
git log --grep=<ID> --oneline -20
git diff main...HEAD --stat
```
Scan `qa-artifacts/3-test-cases/` to map changed files to test cases.
List TCs that may need re-execution.

### c2 — Check environment health

Read `qa-artifacts/base-test/execute.env.md` for UAT URL and credentials.
Use Playwright MCP (`browser_navigate`) to open the login page.
Verify: HTTP 200 + login form visible. Capture a screenshot.
Report: `PASS` or `FAIL` with screenshot path.

> If `execute.env.md` is absent, check `env.md` at repo root. Flag the
> mismatch to the user if neither file exists.

### exit — Exit session

Print: _"QA session ended. Come back anytime."_ and stop.

---

## Post-Skill Completion Behaviour

Triggered automatically after any s1–s7 skill finishes. Never triggered on
startup, from the main menu, or after op/q/c actions.

### Step 1 — Read session state (silent)

Read `qa-artifacts/.session-state.md`. Extract `pipeline_stage` and `last_action`.

Map `pipeline_stage` to a suggestion group (primary):

| pipeline_stage          | Group                |
|-------------------------|----------------------|
| `requirements-done`     | After requirements   |
| `test-plan-done`        | After test plan      |
| `test-cases-done`       | After test cases     |
| `execution-in-progress` | After execution      |
| `execution-done`        | After execution      |
| `bugs-reported`         | After bug report     |
| `report-done`           | After test report    |
| `tickets-updated`       | After ticket update  |
| `sprint-fetched`        | After sprint review  |

Fallback to `last_skill_run` if `pipeline_stage` is missing or unrecognised:

| last_skill_run                | Group                |
|-------------------------------|----------------------|
| `stlc-requirements-analyst`   | After requirements   |
| `stlc-test-plan-designer`     | After test plan      |
| `stlc-testcase-designer`      | After test cases     |
| `stlc-manual-executor`        | After execution      |
| `stlc-bug-reporter`           | After bug report     |
| `stlc-test-reporter`          | After test report    |
| `stlc-ticket-updater`         | After ticket update  |

If neither matches → skip suggestions and re-show the main menu.

### Step 2 — Show 4 focused next-step options

**Cursor:**
```
AskQuestion:
  title: "What's next?"
  questions:
    - id: "next"
      prompt: "Last action: <last_action>. Select your next step:"
      allow_multiple: false
      options: <4 options from Stage table below + "← Back to menu">
```

**Claude Code:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 WHAT'S NEXT?  Last action: <last_action>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  1. <option 1>     4. <option 4>
  2. <option 2>     0. ← Back to menu
  3. <option 3>
```

### Stage → Next-Step Options

Bold IDs map directly to menu option IDs. Options without an ID are free-form
actions executed directly.

| Group               | Option 1                                    | Option 2                              | Option 3                            | Option 4                                    |
|---------------------|---------------------------------------------|---------------------------------------|-------------------------------------|---------------------------------------------|
| After requirements  | Design test plan → **s2**                   | Review analysis with stakeholders     | Update baseline → `stlc-baseline-generator` | Post summary to tracker → **op6** |
| After test plan     | Write test cases → **s3**                   | Review test plan for coverage gaps    | Analyse QA coverage gaps → **q4**   | Update tracker ticket status → **op6**      |
| After test cases    | Execute test cases → **s4**                 | Peer-review test cases                | Check environment health → **c2**   | Link test cases to tracker → **op6**        |
| After execution     | Report bugs → **s5**                        | Re-execute failed TCs → **s4**        | View execution log → **q2**         | Update tracker with results → **op6**       |
| After bug report    | Generate test report → **s6**               | Triage open bugs → **q3**             | Re-test a fixed bug → **s4**        | Create bug ticket(s) in tracker → **op6**   |
| After test report   | Update tracker tickets → **s7**             | Share test report with team           | Review go/no-go verdict             | Post report link to tracker → **op6**       |
| After ticket update | Pull new requirements → **s1**              | Start next sprint                     | Analyse QA coverage gaps → **q4**   | Close verified bugs in tracker → **op6**    |
| After sprint review | Read specific ticket detail → **op2**       | List blocked tickets → **op3**        | Execute Ready-for-QA ticket → **s4**| Post sprint comment → **op6**               |

### Step 3 — Execute

Route to the option the user picked using the ID in the table.
For options referencing **"tracker"**: read `TRACKER` from `.env` to determine
OpenProject or Jira, then use the appropriate skill/MCP.
After completing → re-show the main menu.

---

## OpenProject Access Rule

1. **Primary:** use the OpenProject MCP tools (prefix: `mcp__openproject__`).
2. **Fallback** (MCP not connected): call OpenProject REST API directly using
   `OPENPROJECT_URL` and `OPENPROJECT_API_KEY` from `.mcp.json` (repo root) →
   `mcpServers.openproject.env`.
   Auth: `Authorization: Basic <base64("apikey:<key>")>`.
   Base URL: `https://op.bigin.vn`.
3. **Writes** (comments, status changes): use `op-manage-child-ticket` skill.

---

## Session State Rule

**Reads** `qa-artifacts/.session-state.md` (silent):
op1 (active sprint), q1, q2, q4, op7, Post-Skill Completion Step 1.

**Writes** `qa-artifacts/.session-state.md`:
s1–s7 skills each write it via their own `## Next Move` block on completion.
Schema is in `template.md`.
