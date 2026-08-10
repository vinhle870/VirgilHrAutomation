---
name: stlc-baseline-generator
description: >-
  Generate or update baseline test files in qa-artifacts/base-test/ based on
  the application under test. Baseline files define reusable preconditions, test
  data setup, environment checks, API calls, and cleanup steps shared across all
  test cases. Use when the user asks to "generate baseline tests", "create base
  test", "update the auth steps", "add test data steps", "update baseline", or
  any request to define reusable setup/teardown steps. Safe to re-run — updates
  only the specific file the user asks to change.
---

# Skill — Baseline Test Generator

Generate **reusable baseline test steps** for `qa-artifacts/base-test/`. Test cases reference these files instead of repeating setup steps inline.

---

## Baseline File Set

| File | Covers |
|---|---|
| `01-auth-steps.md` | Login / logout for every user role the app supports |
| `02-test-data.md` | Step-by-step UI instructions to create required test records |
| `03-environment-check.md` | Pre-run smoke checks before test execution begins |
| `04-api-baseline.md` | Direct API calls to seed, verify, or clean data state |
| `05-cleanup-steps.md` | Teardown and cleanup after test case execution |

---

## Workflow

### Step 1 — Understand the application

1. Read `qa-artifacts/1-requirements-analysis/requirements-analysis.md` — extract user roles, key entities, and feature names.
2. If absent, read `requirements/*.md` instead.
3. Ask the user only for what cannot be inferred (roles, entity names, login URL).

### Step 2 — Identify scope

- **"generate baseline"** / **"generate all"** → write all 5 files.
- **Named concern** (e.g. "update auth steps", "add cleanup for orders") → update only that file.
- **File already exists** → read it first; apply only the described change, preserve everything else.

### Step 3 — Write the file(s)

Use the structure in [template.md](template.md). Fill in real values from Step 1.
Keep `[VAR_NAME]` notation only for values that must come from `.env` at runtime (credentials, base URLs).

### Step 4 — Confirm

List every file created or updated and the scenarios added.

---

## Update Rules

- **Add scenario** → append under the correct heading.
- **Change scenario** → replace only that block; leave all others untouched.
- **Rename role/entity** → apply consistently across all 5 files.
- **Delete scenario** → only on explicit user request.
- Never leave unfilled placeholder text in a generated file.

---

## Resources

- File structure and section definitions: [template.md](template.md)

---

## Handoff

> "Baseline generated. [N] file(s) written to qa-artifacts/base-test/:  
> [list filenames and key scenarios]  
> Reference in test cases as: `See base-test/01-auth-steps.md → [Scenario Name]`"
