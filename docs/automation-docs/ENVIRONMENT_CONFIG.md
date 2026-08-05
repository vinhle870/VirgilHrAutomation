# Environment Configuration

Single source of truth for how env vars are loaded: [`src/utilities/load-env.ts`](../../src/utilities/load-env.ts), called from `playwright.config.ts` as `loadPlaywrightEnv(path.resolve(__dirname))`.

## Loading rule (exactly what the code does)

```
loadPlaywrightEnv(projectRoot)
  1. If <root>/.env exists → dotenv.config({ path: <root>/.env })
  2. ENV = (process.env.ENV || "qa").toLowerCase()
  3. If process.env.CI is NOT set → stop here (local run)
  4. If process.env.CI IS set:
       If profile/.env.${ENV} exists → dotenv.config({ path: ..., override: true })
```

There is no Zod validation, no fail-fast error message, and no per-environment credential prefixing (`STAGING_*` / `PRODUCTION_*`). Every env var has one name regardless of environment; `ENV` just selects which `profile/.env.<env>` file overrides it in CI.

## File inventory (actual)

| File | Tracked in git? | Loaded when |
|---|:-:|---|
| `.env` (repo root) | **yes** — already committed, contains real QA values | Always, if present |
| `.env.qa` (repo root) | **yes** | Not auto-loaded by `load-env.ts` — legacy/unused duplicate of `.env` |
| `profile/.env.qa` | **yes** | `CI=true` and `ENV=qa` |
| `profile/.env.uat` | **yes** | `CI=true` and `ENV=uat` |
| `profile/.env.prod` | **yes** | `CI=true` and `ENV=prod` |

> Unlike a typical setup, `.env` here is **not** gitignored-and-secret-free — it and `.env.qa` are already tracked in this repository's history. Treat any credentials in them as already exposed; do not add new secrets to a tracked file. New secrets belong in CI repo/environment secrets (see below), consumed via `process.env` which wins over file values loaded later since `load-env.ts` uses `dotenv.config()` without `override` for the root file.

## Variables actually read (grep-verified, `process.env.*` across `src/`)

| Variable | Where it's used |
|---|---|
| `ENV` | `load-env.ts` — selects `profile/.env.<ENV>` in CI |
| `CI` | `load-env.ts` — gates whether the `profile/` file is loaded |
| `BASE_URL`, `ADMIN_PORTAL_BASE_URL` | Admin login URL (`LoginPage.login()`) |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | Admin login credentials |
| `API_BASE_URL`, `API_USERNAME`, `API_PASSWORD`, `API_TOKEN`, `API_KEY`, `API_VERSION` | API client / services |
| `MEMBER_PORTAL_BASEURL` | Member-portal checkout return-URL assertions |
| `DEPARTMENT_NAME` | Passed into `DataFactory.partnerBuilder().withDepartmentName(...)` on almost every UI test |
| `SYSTEM_ID` | API request context |
| `MAILBOX_URL` | Selects the email handler — must contain `yopmail` or `beeinbox` (see [AUTH_FLOW.md](AUTH_FLOW.md)) |
| `UI_ELEMENT_TIMEOUT_MS` | Default timeout for `UiAssert`, `BasePage.selectRadio`, and `playwright.config.ts` `expect`/action timeouts |

## Local developer setup

```bash
pnpm install
# .env already exists at repo root with QA values — edit it if you need different credentials
pnpm test:playwright
```

There is no `.env.example` and no copy-template step — the tracked `.env` already has working QA values.

## CI (`.github/workflows/playwright.yml`)

Triggered by push to `main` (defaults to `qa`) or manually via `workflow_dispatch` with an `environment` input (`qa` / `uat` / `staging`). The workflow:

1. Sets `ENV` from the chosen environment.
2. Reads `BASE_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` from the matching **GitHub Environment**'s vars/secrets and exports them into the job env.
3. Runs `pnpm run install:browsers`, then `pnpm run test:playwright` (or a single `--project` when a specific browser was chosen).
4. Uploads `playwright-report/` as an artifact.

There is no Slack notification step and no Allure step in this workflow.

## See also

- [AUTH_CREDENTIALS.md](AUTH_CREDENTIALS.md) — credential variables and rotation guidance.
- [AUTH_FLOW.md](AUTH_FLOW.md) — how the credentials above are actually used to log in / activate accounts.
