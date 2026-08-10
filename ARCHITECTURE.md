# Agent Architecture

This document describes the skills organisation for the QA Agent project.
**Use this file as the authoritative reference for every skill's location, group, and purpose.**

---

## Skills Location

All skills live in `.claude/skills/` (repo-relative from project root).
Each skill is a folder containing a `SKILL.md` entry point plus optional support files.

---

## Skills Organisation

### 1. Coordination

| Skill | SKILL.md | Role |
|---|---|---|
| `agent-coordination` | `.claude/skills/agent-coordination/SKILL.md` | Session entry point. Greets the user and presents the interactive action menu (OpenProject · QA Pipeline · Code & Environment). Invoked automatically at session startup via `QA_AGENTS.md`. |

Support files:
```
.claude/skills/agent-coordination/
├── SKILL.md          ← entry point & menu logic
├── routing.md        ← option routing (op1–op7, q1–q4, c1–c2, post-skill completion)
└── template.md       ← Daily Summary Briefing format, session-state schema, Next Move block
```

---

### 2. STLC Pipeline Skills

Executed in sequence to complete one full test cycle.

| # | Skill | SKILL.md | Output |
|---|---|---|---|
| 0 | `stlc-init-workspace` | `.claude/skills/stlc-init-workspace/SKILL.md` | Creates `qa-artifacts/` folder structure |
| — | `stlc-baseline-generator` | `.claude/skills/stlc-baseline-generator/SKILL.md` | `qa-artifacts/base-test/*.md` |
| 1 | `stlc-requirements-analyst` | `.claude/skills/stlc-requirements-analyst/SKILL.md` | `qa-artifacts/1-requirements-analysis/requirements-analysis.md` |
| 2 | `stlc-test-plan-designer` | `.claude/skills/stlc-test-plan-designer/SKILL.md` | `qa-artifacts/2-test-plan/test-plan.md` |
| 3 | `stlc-testcase-designer` | `.claude/skills/stlc-testcase-designer/SKILL.md` | `qa-artifacts/3-test-cases/{SPEC_ID}_TestCases_{FIRST}-{LAST}.md` |
| 4 | `stlc-manual-executor` | `.claude/skills/stlc-manual-executor/SKILL.md` | `qa-artifacts/4-execution-results/execution-log.md` + screenshots |
| 5 | `stlc-bug-reporter` | `.claude/skills/stlc-bug-reporter/SKILL.md` | `qa-artifacts/5-testing-report/bug-report.md` + tracker tickets |
| 6 | `stlc-test-reporter` | `.claude/skills/stlc-test-reporter/SKILL.md` | `qa-artifacts/5-testing-report/test-report.md` |
| 7 | `stlc-ticket-updater` | `.claude/skills/stlc-ticket-updater/SKILL.md` | Updates Jira / OpenProject tickets |

Support files per skill (where present):
```
.claude/skills/stlc-<name>/
├── SKILL.md
├── template.md                  ← output document template
├── summary-report-template.md   ← (stlc-manual-executor only)
└── scripts/
    ├── init.sh                  ← (stlc-init-workspace, automation-framework-builder)
    └── init.ps1
```

---

### 3. OpenProject Skills

Standalone skills for direct OpenProject access — callable from `agent-coordination` or independently.

| Skill | SKILL.md | Purpose |
|---|---|---|
| `op-fetch-sprint-tickets` | `.claude/skills/op-fetch-sprint-tickets/SKILL.md` | Fetch all work packages in a sprint by name |
| `op-get-ticket` | `.claude/skills/op-get-ticket/SKILL.md` | Fetch and display details of a single ticket by ID |
| `op-manage-child-ticket` | `.claude/skills/op-manage-child-ticket/SKILL.md` | Create or update a child work package under a parent ticket |

---

### 4. Infrastructure Skills

| Skill | SKILL.md | Purpose |
|---|---|---|
| `automation-framework-builder` | `.claude/skills/automation-framework-builder/SKILL.md` | Scaffold a Playwright + POM + Builder framework project |
| `scaffold-skill` | `.claude/skills/scaffold-skill/SKILL.md` | Create or audit a new agent skill following GOLDEN best practices |

Support files:
```
.claude/skills/automation-framework-builder/
├── SKILL.md
├── CHECKLIST.md
├── README.md
└── scripts/
    ├── init.sh
    └── init.ps1

.claude/skills/scaffold-skill/
├── SKILL.md
├── create.md      ← creation workflow
└── checklist.md   ← GOLDEN quality checklist
```

---

### 5. Authoring Rules

```
.claude/skills/agentic-ai-rules.md
```

Not a skill — a reference document with best practices for writing agent skills
(structure, imperative verbs, anti-patterns, path conventions, self-check).
Read this before creating or editing any skill.

---

## Project Folder Structure

```
backend/                             ← project root
├── CLAUDE.md                        ← session config (read first by agent)
├── ARCHITECTURE.md                  ← this file (skills & folder reference)
├── requirements/                    ← INPUT: user-provided .md requirement files
│                                       (place feature specs here before running the pipeline)
├── .agents/
│   └── skills/                      ← all agent skills (see Skills Folder Layout below)
└── qa-artifacts/                    ← OUTPUT: all generated QA artifacts
    ├── .session-state.md            ← pipeline stage tracker (written by every STLC skill)
    ├── base-test/                   ← reusable preconditions, test data, cleanup steps
    │   ├── 01-auth-steps.md
    │   ├── 02-test-data.md
    │   ├── 03-environment-check.md
    │   ├── 04-api-baseline.md
    │   └── 05-cleanup-steps.md
    ├── 1-requirements-analysis/     ← requirements-analysis.md
    ├── 2-test-plan/                 ← test-plan.md
    ├── 3-test-cases/                ← {SPEC_ID}_TestCases_{FIRST}-{LAST}.md
    ├── 4-execution-results/         ← execution-log.md
    │   └── screenshots/             ← {TC_ID}-step{N}-[pass|fail].png
    └── 5-testing-report/            ← test-report.md · bug-report.md
```

---

## Skills Folder Layout

```
.claude/skills/
│
├── agentic-ai-rules.md                      ← authoring best practices
│
├── agent-coordination/                      ← [Coordination]
│   ├── SKILL.md
│   ├── routing.md
│   └── template.md
│
├── stlc-init-workspace/                     ← [STLC #0]
│   ├── SKILL.md
│   ├── template.md
│   └── scripts/ (init.sh · init.ps1)
│
├── stlc-baseline-generator/                 ← [STLC —]
│   ├── SKILL.md
│   └── template.md
│
├── stlc-requirements-analyst/               ← [STLC 1]
│   ├── SKILL.md
│   └── template.md
│
├── stlc-test-plan-designer/                 ← [STLC 2]
│   ├── SKILL.md
│   └── template.md
│
├── stlc-testcase-designer/                  ← [STLC 3]
│   ├── SKILL.md
│   └── template.md
│
├── stlc-manual-executor/                    ← [STLC 4]
│   ├── SKILL.md
│   ├── template.md
│   └── summary-report-template.md
│
├── stlc-bug-reporter/                       ← [STLC 5]
│   ├── SKILL.md
│   └── template.md
│
├── stlc-test-reporter/                      ← [STLC 6]
│   ├── SKILL.md
│   └── template.md
│
├── stlc-ticket-updater/                     ← [STLC 7]
│   ├── SKILL.md
│   └── template.md
│
├── op-fetch-sprint-tickets/                 ← [OpenProject]
│   └── SKILL.md
│
├── op-get-ticket/                           ← [OpenProject]
│   └── SKILL.md
│
├── op-manage-child-ticket/                  ← [OpenProject]
│   └── SKILL.md
│
├── automation-framework-builder/            ← [Infrastructure]
│   ├── SKILL.md
│   ├── CHECKLIST.md
│   ├── README.md
│   └── scripts/ (init.sh · init.ps1)
│
└── scaffold-skill/                          ← [Infrastructure]
    ├── SKILL.md
    ├── create.md
    └── checklist.md
```
