# Baseline Test File Templates

The agent follows the structure below when generating or updating files in `qa-artifacts/base-test/`.
Each section shows the exact format for one file. Fill in real values — do not leave `{{PLACEHOLDER}}`
unless the value must come from `.env` at runtime.

---

## 01-auth-steps.md

```markdown
# 01 — Authentication Baseline Steps

**Application:** [app name]
**Last updated:** [date]
**Roles covered:** [list all roles]

> Reference in test cases as:
> `See base-test/01-auth-steps.md → [Scenario Name]`

---

## Scenario: Login as [ROLE_NAME]

**Test data (from .env):**

| Variable | Description |
|---|---|
| `[ROLE]_EMAIL` | Email address for this role |
| `[ROLE]_PASSWORD` | Password for this role |

**Steps:**

| # | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `[LOGIN_URL]` | Login page loads; "[HEADING_TEXT]" visible |
| 2 | Enter `[EMAIL_VAR]` in **[Email field label]** | Field accepts input |
| 3 | Enter `[PASSWORD_VAR]` in **[Password field label]** | Field accepts input (masked) |
| 4 | Click **"[Submit button label]"** | Redirect to [destination]; [visible indicator] confirms login |

**Expected final state:** User is authenticated as [ROLE_NAME]. [Describe visible indicator, e.g. "User name appears in header"].

---

## Scenario: Logout

**Precondition:** User is logged in (any role).

**Steps:**

| # | Action | Expected Result |
|---|---|---|
| 1 | [Describe how to access logout — e.g. "Click user avatar in top-right"] | [Dropdown / menu appears] |
| 2 | Click **"[Logout label]"** | Redirect to [LOGIN_URL]; session cleared |

---

## Scenario: Access Denied — Unauthorized Navigation

**Steps:**

| # | Action | Expected Result |
|---|---|---|
| 1 | Without logging in, navigate directly to `[PROTECTED_URL]` | Redirect to `[LOGIN_URL]` |

---
[Add one Scenario block per role. Copy the Login block and fill in the role-specific values.]
```

---

## 02-test-data.md

```markdown
# 02 — Test Data Setup

**Application:** [app name]
**Last updated:** [date]
**Entities covered:** [list entity names]

> Reference in test cases as:
> `See base-test/02-test-data.md → [Scenario Name]`

---

## Scenario: Create a [ENTITY_NAME] via UI

**Requires:** [Required login role — e.g. "Login as Admin"]

**Steps:**

| # | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `[CREATE_URL]` | "[Page title]" form loads |
| 2 | Enter `[TEST_VALUE]` in **[Field label]** | Field accepts input |
| 3 | [Fill additional required fields] | All required fields populated |
| 4 | Click **"[Save/Create button label]"** | [Entity] created; ID assigned; success message "[text]" shown |

**Test data:**

| Field | Value | Notes |
|---|---|---|
| [Field label] | TC-[TC_ID] [Entity name] | Prefix with TC- for easy cleanup |
| [Field label] | [value] | [note] |

**Record the assigned ID** — subsequent test steps may reference it.

**Cleanup:** See `base-test/05-cleanup-steps.md → Delete a [ENTITY_NAME]`

---

## Scenario: [ENTITY_NAME] — Minimum Required State

Describes the minimum data that must exist in the system before any test case runs.

| Data | Minimum count | Setup method |
|---|:---:|---|
| [ENTITY_NAME] in [status] | [N] | [UI / API / Seed script] |
| [User role] accounts | [N] | [UI / Admin panel] |

---
[Add one Scenario block per entity or data setup need.]
```

---

## 03-environment-check.md

```markdown
# 03 — Environment Pre-Run Checks

**Application:** [app name]
**Last updated:** [date]

Run these checks **before starting test execution**. If any check fails, do not proceed.

---

## Smoke Test Checklist

| # | Check | How to verify | Pass condition |
|---|---|---|---|
| 1 | Application reachable | Navigate to `[APP_BASE_URL]` | Page loads; no error |
| 2 | Login page functional | Navigate to `[LOGIN_URL]` | Form renders with [Email] + [Password] fields |
| 3 | [ROLE_1] can log in | Run `01-auth-steps.md → Login as [ROLE_1]` | [Dashboard/home page] loads |
| 4 | [ROLE_2] can log in | Run `01-auth-steps.md → Login as [ROLE_2]` | [Dashboard/home page] loads |
| 5 | Minimum test data present | Log in → navigate to `[MAIN_LIST_URL]` | At least [N] [entity] records visible |
| 6 | No blocking error banners | Inspect home page | No red banners, no "maintenance mode" message |

**All pass:** Proceed with test execution.  
**Any fail:** Suspend testing; report the failure before continuing.

---

## Required .env Variables

Confirm these are set before execution:

| Variable | Purpose |
|---|---|
| `APP_BASE_URL` | Base URL for all navigation |
| `[ROLE_1]_EMAIL` | Login for [ROLE_1] tests |
| `[ROLE_1]_PASSWORD` | Login for [ROLE_1] tests |
| `[ROLE_2]_EMAIL` | Login for [ROLE_2] tests |
| `[ROLE_2]_PASSWORD` | Login for [ROLE_2] tests |
| `TRACKER` | `jira` or `openproject` |
```

---

## 04-api-baseline.md

```markdown
# 04 — API Baseline Steps

**Application:** [app name]
**Last updated:** [date]
**Base URL:** `[APP_BASE_URL]/api/[version]`

> Use for fast data seeding and state verification without browser interaction.

---

## Get Auth Token

```
POST [APP_BASE_URL]/api/[version]/[auth_endpoint]
Content-Type: application/json

{ "email": "[EMAIL_VAR]", "password": "[PASSWORD_VAR]" }
```

**Response:** `{ "token": "..." }` → store as `API_TOKEN`.

---

## Check Application Health

```
GET [APP_BASE_URL]/[health_endpoint]
```

**Expected:** HTTP 200

---

## Create [ENTITY_NAME] via API

```
POST [APP_BASE_URL]/api/[version]/[entity_path]
Authorization: Bearer [API_TOKEN]
Content-Type: application/json

{
  "[title_field]": "TC-[TC_ID] Test [ENTITY_NAME]",
  "[status_field]": "[default_status]",
  "[required_field]": "[value]"
}
```

**Expected:** HTTP 201 · `{ "id": "...", ... }` → store as `CREATED_ID`.

---

## Delete [ENTITY_NAME] via API

```
DELETE [APP_BASE_URL]/api/[version]/[entity_path]/[RECORD_ID]
Authorization: Bearer [API_TOKEN]
```

**Expected:** HTTP 200 or 204.

---
[Add one block per API operation needed by test cases.]
```

---

## 05-cleanup-steps.md

```markdown
# 05 — Cleanup & Teardown Steps

**Application:** [app name]
**Last updated:** [date]

> Reference in test case Postconditions as:
> `See base-test/05-cleanup-steps.md → [Scenario Name]`

---

## Scenario: Delete a [ENTITY_NAME]

**Via UI:**

| # | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `[ENTITY_DETAIL_URL]/[RECORD_ID]` | Record detail page loads |
| 2 | Click **"[Delete button label]"** | Confirmation dialog appears |
| 3 | Click **"[Confirm button label]"** | Record removed; success message shown |

**Via API (faster):**
```
DELETE [APP_BASE_URL]/api/[version]/[entity_path]/[RECORD_ID]
Authorization: Bearer [API_TOKEN]
```

---

## Scenario: Logout After Test

| # | Action | Expected Result |
|---|---|---|
| 1 | [Logout action — see 01-auth-steps.md → Logout] | Session cleared |

---

## Scenario: Full Teardown After Test Cycle

- [ ] Delete all records with `TC-` prefix created during the cycle
- [ ] Delete test user accounts created during the cycle
- [ ] Verify list counts match pre-cycle baseline
- [ ] Close browser (`browser_close`)

---
[Add one Scenario block per entity or cleanup need.]
```
