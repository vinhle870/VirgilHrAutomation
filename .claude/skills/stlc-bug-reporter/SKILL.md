---
name: stlc-bug-reporter
description: >-
  Read execution results from qa-artifacts/4-execution-results/execution-log.md and the
  corresponding {SPEC_ID}_TestCases.md, write a structured bug-report.md, and create
  tickets in Jira or OpenProject. Use when the user asks to "report bugs", "create bug
  tickets", "log defects", or "generate the bug report" after test execution.
  Part of the 7-skill STLC QA pipeline.
---

# Skill 5 — Bug Reporter

You are a senior QA engineer performing the **Bug Reporting** phase of the STLC. You read the execution results, write a professional `qa-artifacts/bug-report.md`, and create tickets in the configured bug tracker.

---

## Workflow

### Step 1 — Read inputs

Read `qa-artifacts/3-test-cases/{SPEC_ID}_TestCases.md` (identify spec from execution-log or ask the user) and `qa-artifacts/4-execution-results/execution-log.md`. Focus on:
- Test cases with Status = **FAIL** or **BLOCKED**
- Step-level failure details and screenshot paths in `qa-artifacts/4-execution-results/screenshots/`

If no FAILed or BLOCKED tests exist, write a clean bug-report.md and skip ticket creation.

### Step 2 — Classify each defect

For every failed test case, determine:

**Severity** (impact on the system):
| Level | Definition |
|---|---|
| Critical | System crash, data loss, security breach, cannot proceed at all |
| High | Core feature broken, major workflow blocked |
| Medium | Feature partially works, workaround exists |
| Low | Minor UI issue, typo, cosmetic problem |

**Priority** (urgency to fix):
| Level | Definition |
|---|---|
| P1 | Fix immediately — blocks release |
| P2 | Fix in current sprint |
| P3 | Fix in next sprint |
| P4 | Nice to have / low urgency |

### Step 3 — Write the output file

Write to `qa-artifacts/5-testing-report/bug-report.md` using the exact structure in [template.md](template.md).

### Step 4 — Create tracker tickets

After writing the report, ask the user: _"Which tracker should I use: **Jira** or **OpenProject**?"_ (or read the `TRACKER` env var if set).

Then follow the correct sub-workflow:

#### If Jira (Atlassian MCP)

1. Authenticate: call the Atlassian MCP `mcp_auth` tool first if not already authenticated.
2. For each bug with Severity ≥ Medium, call the Atlassian MCP to create a Jira issue:
   - **Project key**: from `JIRA_PROJECT_KEY` env var
   - **Issue type**: Bug
   - **Summary**: `[BUG-XXX] [TC ID] — [short title]`
   - **Description**: Use the Bug Report template content (Steps to Reproduce, Expected, Actual, Environment, Severity, Priority, screenshots)
   - **Priority**: map Severity → Jira priority (Critical→Highest, High→High, Medium→Medium, Low→Low)
   - **Labels**: `qa-agent`, `stlc-automated`
3. Record the returned Jira issue key (e.g. `PROJ-42`) in the bug report.

#### If OpenProject

Use the OpenProject MCP to create each bug ticket.

1. **Resolve the project ID** — read `qa-artifacts/.session-state.md` for `active_spec_id` (e.g. `OP43314`). Extract the numeric ticket ID and fetch it to get the project:

   ```
   OpenProject MCP → get_work_package
   id: <active_spec_id numeric>
   ```

   Extract `projectId` from `_links.project.href` in the response.

2. **Create a work package** for each bug with Severity ≥ Medium:

   ```
   OpenProject MCP → create_work_package
   projectId  : <from step 1>
   subject    : "[BUG-XXX][TC ID] — <short title>"
   typeId     : 7
   priorityId : <mapped from severity — see table below>
   description: <full bug report section in Markdown>
   ```

   Severity → priorityId mapping:

   | Severity | priorityId | Name |
   |---|---|---|
   | Critical | 10 | Immediate |
   | High | 9 | High |
   | Medium | 8 | Normal |
   | Low | 7 | Low |

3. **Upload screenshot evidence** to the work package as an attachment.

   For each screenshot listed in the bug's Evidence section, upload the file via the OpenProject REST API. Read credentials from `.mcp.json` (`mcpServers.openproject.env`). Write a PowerShell script to the scratchpad directory and execute it:

   ```powershell
   $mcpConfig = Get-Content ".mcp.json" | ConvertFrom-Json
   $apiKey    = $mcpConfig.mcpServers.openproject.env.OPENPROJECT_API_KEY
   $baseUrl   = $mcpConfig.mcpServers.openproject.env.OPENPROJECT_URL
   $wpId      = <work package id>
   $filePath  = "<absolute path to screenshot>"
   $fileName  = [System.IO.Path]::GetFileName($filePath)
   $creds     = [Convert]::ToBase64String([System.Text.Encoding]::ASCII.GetBytes("apikey:$apiKey"))
   $authHdr   = "Basic $creds"
   $boundary  = "----FormBoundary" + [System.Guid]::NewGuid().ToString("N")
   $fileBytes = [System.IO.File]::ReadAllBytes($filePath)
   $enc       = [System.Text.Encoding]::UTF8
   $CRLF      = "`r`n"
   $metaJson  = "{`"fileName`":`"$fileName`"}"
   $ms = [System.IO.MemoryStream]::new()
   $p1 = $enc.GetBytes("--$boundary$CRLF" + "Content-Disposition: form-data; name=`"metadata`"$CRLF" + "Content-Type: application/json$CRLF$CRLF" + "$metaJson$CRLF")
   $ms.Write($p1, 0, $p1.Length)
   $p2 = $enc.GetBytes("--$boundary$CRLF" + "Content-Disposition: form-data; name=`"file`"; filename=`"$fileName`"$CRLF" + "Content-Type: image/png$CRLF$CRLF")
   $ms.Write($p2, 0, $p2.Length)
   $ms.Write($fileBytes, 0, $fileBytes.Length)
   $p3 = $enc.GetBytes("$CRLF--$boundary--$CRLF")
   $ms.Write($p3, 0, $p3.Length)
   $result = Invoke-RestMethod -Uri "$baseUrl/api/v3/work_packages/$wpId/attachments" -Method Post -Headers @{ Authorization = $authHdr } -ContentType "multipart/form-data; boundary=$boundary" -Body $ms.ToArray() -ErrorAction Stop
   Write-Output "Uploaded: id=$($result.id) file=$($result.fileName)"
   ```

   Record the returned attachment ID in the bug report Evidence table.

4. Record the returned work package ID (e.g. `#43605`) in the bug report's Ticket Update Log.

---

## Rules

- Bug IDs: BUG-001, BUG-002 … sequential per report.
- Only report bugs for FAIL or BLOCKED tests. PASS tests are not bugs.
- Do not create duplicate tickets. If the user says a bug was already reported, add a comment to the existing ticket instead of creating a new one.
- Always include screenshot evidence if available.
- Steps to Reproduce must be copy-pasteable by a developer — exact values, exact labels.
- If the tracker API call fails, still write the full bug-report.md and tell the user the ticket creation failed with the error.

---

## Resources

- Bug report structure and all section definitions: [template.md](template.md)

---

## Handoff

When `qa-artifacts/bug-report.md` is written and tickets are created, tell the user:

> "Bug report complete. [N] defects documented.  
> Tracker tickets created: [list ticket IDs]  
> Written to qa-artifacts/5-testing-report/bug-report.md  
> Next step → run **stlc-test-reporter** to generate the final test report."

---

## Next Move

Before printing this block, update `qa-artifacts/.session-state.md`:
- `pipeline_stage: bugs-reported`
- `last_skill_run: stlc-bug-reporter`
- `last_action: Bug report written — [N] defects, tickets: [IDs]`
- `artifacts.bug_report: qa-artifacts/5-testing-report/bug-report.md`

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SKILL COMPLETE: Bug Reporter
 Output: bug-report.md — [N] defects documented
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 WHAT TO DO NEXT:
  → [PRIMARY]   Generate test report — say "generate test report"
  → [ALTERNATE] Triage bugs by severity (menu option 7)
  → [ALTERNATE] Re-test a fixed bug
  → [QUICK]     Post bug summary to OP ticket (menu option 13)
  → [PAUSE]     Save progress and exit
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Say "what's next" at any time to see this again.
```
