---
name: scaffold-skill
description: >-
  Create or review a Cursor agent skill for this QA project following the
  GOLDEN best practices and project conventions. Create mode generates SKILL.md,
  optional support files, and registers in ARCHITECTURE.md. Review mode audits an
  existing skill against the GOLDEN checklist and offers to fix violations.
  Use when the user says "create a new skill", "scaffold a skill", "add a skill",
  "review a skill", "audit a skill", or "check skill quality".
---

# Skill — Scaffold Skill

Creates or reviews skills for this project. Follows the GOLDEN checklist
throughout. See [checklist.md](checklist.md) for the full verification reference.

---

## Step 0 — Pick a Mode

**Cursor:**
```
AskQuestion:
  title: "Skill Tool"
  questions:
    - id: "mode"
      prompt: "What would you like to do?"
      allow_multiple: false
      options:
        - id: "create" label: "Create — scaffold a new skill"
        - id: "review" label: "Review — audit an existing skill against GOLDEN checklist"
```

**Claude Code:** ask _"Create a new skill or review an existing one?"_

---

## CREATE Mode

Ask for: skill name, one-sentence purpose, trigger phrases, type, and complexity.
Then follow the full workflow in [create.md](create.md).

| Type         | Required extra                                              |
|--------------|-------------------------------------------------------------|
| STLC         | `## Next Move` block that writes `qa-artifacts/.session-state.md` |
| OpenProject  | OpenProject Access Rule (inline or reference `routing.md`)  |
| Both         | Both of the above                                           |
| Standalone   | None                                                        |

After generating all files → run **REVIEW Mode** on the new skill before
declaring done.

---

## REVIEW Mode

### Step R1 — Identify the skill

Ask: _"Enter the skill folder path or name (e.g. `stlc-manual-executor`):"_

Read:
- `.claude/skills/<name>/SKILL.md`
- Any support files linked in the `## Resources` section

### Step R2 — Run the GOLDEN checklist

Check every item from [checklist.md](checklist.md). For each item report:
- ✅ — passes
- ❌ — fails (include the exact line or value that fails)
- ⚠ — warning (could be improved)

Present the full audit report:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SKILL AUDIT: <skill-name>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 FRONTMATTER
  ✅ name — valid
  ✅ description — third person, includes triggers

 FILE SIZE & STRUCTURE
  ✅ SKILL.md — 98 lines (≤ 150)
  ⚠  No ## Resources section — support files not declared

 CONTENT QUALITY
  ✅ No Windows paths
  ❌ Terminology inconsistency — "OP" and "OpenProject" both used

 PROJECT CONVENTIONS
  ✅ ## Next Move block present (STLC skill)
  ❌ pipeline_stage value "exec-done" not in valid list

 ARCHITECTURE.md
  ✅ Registered in Infrastructure Skills table
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 RESULT: 2 ❌  1 ⚠  — NOT READY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step R3 — Fix violations

**Cursor:**
```
AskQuestion:
  title: "Fix violations?"
  questions:
    - id: "fix"
      prompt: "How would you like to proceed?"
      allow_multiple: false
      options:
        - id: "all"      label: "Fix all ❌ automatically"
        - id: "pick"     label: "Let me pick which to fix"
        - id: "report"   label: "Report only — I will fix manually"
```

Apply chosen fixes, then re-run Step R2 to confirm all ❌ are resolved.

---

## Rules

- SKILL.md body ≤ 150 lines. Move detail to support files.
- Description: third-person, WHAT + WHEN, trigger phrases, ≤ 1024 chars.
- No Windows-style paths (`\`) — always forward slashes (`/`).
- File references are always one level deep (no nested paths).
- After creating a skill, always run REVIEW Mode on it before finishing.

---

## Resources

- **[create.md](create.md)** — full Create workflow: requirements gathering,
  file structure, SKILL.md template, Next Move block template, ARCHITECTURE.md
  registration steps.
- **[checklist.md](checklist.md)** — GOLDEN verification checklist, project
  conventions by skill type, description formula, anti-patterns, reference
  examples.
