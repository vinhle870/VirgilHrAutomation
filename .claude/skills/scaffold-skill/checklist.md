# Scaffold Skill — GOLDEN Checklist

Reference checklist for verifying any new skill before it is declared done.
Run through every item. Fix all ❌ before finishing.

---

## GOLDEN Checklist

### Frontmatter

- [ ] `name` present — lowercase, hyphens only, max 64 chars
- [ ] `description` present — third person, WHAT + WHEN, ≤ 1024 chars,
      includes key trigger terms

### File Size & Structure

- [ ] `SKILL.md` body ≤ 150 lines (hard limit for this project; global limit is 500)
- [ ] Heavy reference material (tables, templates, routing logic) is in support
      files, not inline in SKILL.md
- [ ] Support file references are one level deep — no `../../` paths
- [ ] `## Resources` section at the bottom of SKILL.md lists every support file

### Content Quality

- [ ] No Windows-style paths (`\`) — forward slashes only
- [ ] Consistent terminology — one term per concept, used throughout
- [ ] No time-sensitive information (dates, "before version X", etc.)
- [ ] No redundant explanations — trust that the agent is smart
- [ ] Examples are concrete, not abstract ("e.g. `FR9_TestCases_001-005.md`",
      not "e.g. a test case file")

### ARCHITECTURE.md Registration

- [ ] Skill is listed in the correct table in `ARCHITECTURE.md`
- [ ] Skill's folder/support files are listed in the "Skills Folder Layout" tree

---

## Project-Specific Conventions by Skill Type

### STLC Pipeline Skills (stlc-*)

- [ ] `## Next Move` block appended at end of SKILL.md
- [ ] `## Next Move` writes `qa-artifacts/.session-state.md` with:
      `pipeline_stage`, `last_skill_run`, `last_action`
- [ ] `pipeline_stage` value is one of the valid values (see below)
- [ ] Output artifact written to correct `qa-artifacts/` subfolder
- [ ] Skill is numbered in ARCHITECTURE.md's STLC Pipeline Skills table (0–7)

**Valid `pipeline_stage` values:**

| Value                  | Set by                     |
|------------------------|----------------------------|
| `requirements-done`    | stlc-requirements-analyst  |
| `test-plan-done`       | stlc-test-plan-designer    |
| `test-cases-done`      | stlc-testcase-designer     |
| `execution-in-progress`| stlc-manual-executor       |
| `execution-done`       | stlc-manual-executor       |
| `bugs-reported`        | stlc-bug-reporter          |
| `report-done`          | stlc-test-reporter         |
| `tickets-updated`      | stlc-ticket-updater        |
| `sprint-fetched`       | op-fetch-sprint-tickets    |

### OpenProject Skills (op-*)

- [ ] Includes OpenProject Access Rule or references `routing.md` which does
- [ ] Uses OpenProject MCP tools (`mcp__openproject__*`) as primary access method
- [ ] Falls back to REST API (`OPENPROJECT_URL` + `OPENPROJECT_API_KEY`) if MCP
      not connected
- [ ] Write operations use `op-manage-child-ticket` skill

### All Skills

- [ ] SKILL.md starts with a one-line purpose statement (no preamble)
- [ ] Workflow has numbered steps (`### Step 1`, `### Step 2`, …)
- [ ] `## Rules` section at end of main content, before `## Resources`

---

## Description Formula

```
<Verb phrase describing core capability>. [Optional: secondary capability.]
Use when the user says "<trigger 1>", "<trigger 2>", or "<trigger 3>".
[Optional: Part of the X-skill STLC QA pipeline.]
```

**Good examples:**
```yaml
# STLC skill
description: >-
  Execute test cases from qa-artifacts/3-test-cases/ by driving a real browser
  with Playwright MCP. Records Pass/Fail per step, captures screenshots, writes
  execution-log.md. Use when the user says "execute test cases", "run tests in
  browser", or "start test execution". Part of the 7-skill STLC QA pipeline.

# OpenProject skill
description: >-
  Fetch and display the details of an OpenProject ticket by ID — metadata and
  description only. Use when the user asks to "show ticket #XXX", "get details
  of #XXX", "view ticket", or "what is ticket #XXX".

# Standalone skill
description: >-
  Scaffold a new Cursor agent skill for this QA project following the GOLDEN
  best practices and project conventions. Use when the user says "create a new
  skill", "scaffold a skill", or "add a skill".
```

---

## File Structure Reference

```
.claude/skills/<skill-name>/
├── SKILL.md          ← required, ≤ 150 lines
├── template.md       ← output templates, session-state schema
├── routing.md        ← detailed option routing, stage tables, access rules
└── reference.md      ← domain knowledge, API details, examples
```

Use `template.md` when the skill generates structured output files.
Use `routing.md` when the skill has many branching options.
Use `reference.md` for reference data the agent reads only occasionally.

---

## Anti-Patterns

| Anti-pattern | Fix |
|---|---|
| SKILL.md over 150 lines | Move tables/templates to support files |
| Description in first person ("I can…") | Rewrite in third person |
| Option IDs with gaps (1, 2, 8, 9…) | Use prefixed sequential IDs (op1, op2, op3…) |
| Windows paths (`qa-artifacts\base-test\`) | Use `/` always |
| Repeating the same logic 6 times | Extract as a named Rule, reference it |
| Hard-coded sprint name | Apply Sprint Resolution Rule |
| Text sub-menu after a clickable picker | Expand options directly into the picker |
| Vague skill name (`helper`, `utils`) | Use specific action name (`op-get-ticket`) |

---

## Reference Example

`agent-coordination` is the gold-standard example for this project:
- `.claude/skills/agent-coordination/SKILL.md` — 154 lines, two-step menu,
  Sprint Resolution Rule extracted, `## Resources` section
- `.claude/skills/agent-coordination/routing.md` — all heavy detail
- `.claude/skills/agent-coordination/template.md` — output schemas

`stlc-requirements-analyst` is the gold-standard STLC skill:
- Concise `## Workflow` with numbered steps
- Clean `## Rules` and `## Resources` sections
- Complete `## Next Move` block updating session state
