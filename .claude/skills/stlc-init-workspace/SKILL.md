---
name: stlc-init-workspace
description: >-
  Initialise the qa-artifacts workspace by creating all required folders and
  placeholder files for the STLC pipeline. Use when the user asks to "init the
  workspace", "set up qa-artifacts", "create the output folders", "initialise
  the QA project", or at the very start of a new test cycle before any other
  STLC skill runs. Safe to re-run — existing files are never overwritten.
---

# Skill 0 — Workspace Initialiser

You are setting up the **qa-artifacts** workspace for a new STLC test cycle. Create the folder structure, seed placeholder files, and confirm everything is ready before the pipeline begins.

---

## Workflow

### Step 1 — Check if workspace already exists

Check whether `qa-artifacts/` exists in the project root.

- If it exists and is non-empty: tell the user which folders already exist and ask:
  _"qa-artifacts/ already exists. Should I reset it (delete existing artifacts) or keep existing files and only create missing folders?"_
  - **Reset**: delete `qa-artifacts/` and recreate from scratch.
  - **Keep**: create only the missing sub-folders; leave existing files untouched.
- If it does not exist: proceed directly to Step 2.

### Step 2 — Create folder structure

Create the following folders. Use the shell commands in [scripts/init.ps1](scripts/init.ps1) (Windows) or [scripts/init.sh](scripts/init.sh) (macOS/Linux).

```
qa-artifacts/
├── 0-sprint-tickets/
├── 1-requirements-analysis/
├── 2-test-plan/
├── 3-test-cases/
├── 4-execution-results/
│   └── screenshots/
├── 5-testing-report/
└── base-test/
```

Also create `requirements/` in the project root if it does not exist — this is where the user places their `.md` requirement files.

### Step 3 — Seed README files

Write a `README.md` into each sub-folder explaining its purpose. Use the content from [template.md](template.md). Do not overwrite an existing `README.md`.

### Step 4 — Verify

List all created paths and confirm each folder exists. Report any failures.

### Step 5 — Create execute.env.md

If `qa-artifacts/base-test/execute.env.md` does not exist, create it using the `execute.env.md` template from [template.md](template.md).

Tell the user:
_"execute.env.md has been created at qa-artifacts/base-test/. Please fill in your Test Environment URL, accounts, and any third-party service credentials before running the pipeline."_

> If `qa-artifacts/base-test/execute.env.md` already exists, do NOT overwrite it — tell the user it was found and skipped.

### Step 6 — Create test-centralized.md

If `qa-artifacts/base-test/test-centralized.md` does not exist, create it using the `test-centralized.md` template from [template.md](template.md).

Tell the user:
_"test-centralized.md has been created at qa-artifacts/base-test/. This is the single source of truth for all QA/UAT test accounts. Update the credentials table if your project uses different accounts."_

> If `qa-artifacts/base-test/test-centralized.md` already exists, do NOT overwrite it — tell the user it was found and skipped.

---

## Rules

- Never delete or overwrite files that already contain content.
- `qa-artifacts/base-test/execute.env.md` must never be overwritten if it already exists.
- `qa-artifacts/base-test/test-centralized.md` must never be overwritten if it already exists.
- `.gitkeep` files in empty folders are optional — skip if not using git.
- Always confirm the final folder list to the user after creation.

---

## Resources

- Init scripts: [scripts/init.ps1](scripts/init.ps1) (Windows) · [scripts/init.sh](scripts/init.sh) (macOS/Linux)
- README content for each folder: [template.md](template.md)

---

## Handoff

When the workspace is ready, tell the user:

> "Workspace initialised.  
> qa-artifacts/ and requirements/ are ready.  
> execute.env.md created at qa-artifacts/base-test/ — fill in your environment URL, accounts, and test data before running the pipeline.  
> test-centralized.md created at qa-artifacts/base-test/ — update credentials if your project uses different accounts.  
> Next step → add your requirement .md files to requirements/ then run **stlc-requirements-analyst**."
