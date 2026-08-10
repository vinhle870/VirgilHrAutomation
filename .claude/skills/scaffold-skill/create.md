# Scaffold Skill — Create Workflow

Full workflow for creating a new skill. Read this file when CREATE mode is
selected in SKILL.md.

---

## Step 1 — Gather Requirements

**Cursor** — use AskQuestion:

```
AskQuestion:
  title: "New Skill — Requirements"
  questions:
    - id: "type"
      prompt: "What type of skill is this?"
      allow_multiple: false
      options:
        - id: "stlc"       label: "STLC Pipeline  (reads/writes qa-artifacts/, part of the pipeline)"
        - id: "op"         label: "OpenProject    (reads from or writes to OpenProject)"
        - id: "infra"      label: "Infrastructure (workspace setup, framework, scaffolding)"
        - id: "standalone" label: "Standalone     (independent utility, no pipeline integration)"

    - id: "complexity"
      prompt: "How complex is this skill?"
      allow_multiple: false
      options:
        - id: "simple"  label: "Simple   (SKILL.md only, under 100 lines)"
        - id: "medium"  label: "Medium   (SKILL.md + 1 support file)"
        - id: "complex" label: "Complex  (SKILL.md + routing.md + template.md)"
```

Then ask conversationally:
1. _"What is the skill name? (lowercase, hyphens only, e.g. `my-skill-name`)"_
2. _"What does this skill do in one sentence?"_
3. _"What trigger phrases should activate it?"_

---

## Step 2 — Design

### Description formula

Write in **third person**. Include WHAT and WHEN. Max 1024 chars.

```
<What the skill does>. Use when the user says "<trigger 1>", "<trigger 2>",
or "<trigger 3>". [Part of the 7-skill STLC QA pipeline.]
```

### File structure

| Complexity | Files to create                              |
|------------|----------------------------------------------|
| Simple     | `SKILL.md` only                              |
| Medium     | `SKILL.md` + `template.md` or `reference.md` |
| Complex    | `SKILL.md` + `routing.md` + `template.md`    |

Apply **progressive disclosure**: core workflow in `SKILL.md` (≤ 150 lines),
detail in support files.

---

## Step 3 — Generate Files

### SKILL.md template

```markdown
---
name: <skill-name>
description: >-
  <third-person description — WHAT + WHEN>
---

# Skill — <Skill Title>

<One-line purpose statement.>

---

## Workflow

### Step 1 — <first step>
<Instructions>

### Step 2 — <second step>
<Instructions>

---

## Rules

- <rule 1>
- <rule 2>

---

## Resources          ← only if support files exist

- **[support-file.md](support-file.md)** — <what it contains>
```

### Next Move block (STLC skills only)

Append after the main workflow:

```markdown
---

## Next Move

Before printing this block, update `qa-artifacts/.session-state.md`:
- `pipeline_stage: <stage-value>`
- `last_skill_run: <skill-name>`
- `last_action: <Human-readable summary of what was done>`

\`\`\`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SKILL COMPLETE: <Skill Title>
 Output: <artifact file> — <key metric>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 WHAT TO DO NEXT:
  → [PRIMARY]   <primary next step> — say "<trigger phrase>"
  → [ALTERNATE] <alternate next step>
  → [ALTERNATE] <another alternate>
  → [QUICK]     Post summary to tracker ticket
  → [PAUSE]     Save progress and exit
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Say "what's next" at any time to see this again.
\`\`\`
```

Valid `pipeline_stage` values:

| Value                   | Set by skill                |
|-------------------------|-----------------------------|
| `requirements-done`     | stlc-requirements-analyst   |
| `test-plan-done`        | stlc-test-plan-designer     |
| `test-cases-done`       | stlc-testcase-designer      |
| `execution-in-progress` | stlc-manual-executor        |
| `execution-done`        | stlc-manual-executor        |
| `bugs-reported`         | stlc-bug-reporter           |
| `report-done`           | stlc-test-reporter          |
| `tickets-updated`       | stlc-ticket-updater         |
| `sprint-fetched`        | op-fetch-sprint-tickets     |

---

## Step 4 — Register in ARCHITECTURE.md

Add a row to the correct table in `ARCHITECTURE.md`, and add the skill's
folder to the tree diagram under "Skills Folder Layout":

- STLC skill → **2. STLC Pipeline Skills** table (include step number 0–7)
- OpenProject skill → **3. OpenProject Skills** table
- Coordination / infrastructure skill → **4. Infrastructure Skills** table

Row format:
```
| `<skill-name>` | `.claude/skills/<skill-name>/SKILL.md` | <output artifact or action> |
```

---

## Step 5 — Run REVIEW Mode

After creating all files, invoke REVIEW Mode from `SKILL.md` on the new skill
to confirm it passes the full GOLDEN checklist before declaring done.
