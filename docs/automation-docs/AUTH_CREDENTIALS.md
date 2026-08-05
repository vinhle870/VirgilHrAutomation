# Authentication & Credentials

> Full loading mechanics: [ENVIRONMENT_CONFIG.md](ENVIRONMENT_CONFIG.md). This page covers what the credential variables are for and how to rotate them.
>
> **Note on secret hygiene**: the repo-root `.env` and `.env.qa` are already tracked in git history in this project (unlike a typical setup where `.env` is gitignored-and-untracked). Any credential currently in them should be treated as already exposed. Do not add a *new* secret to a tracked file — put it in a GitHub Environment secret instead and read it via `process.env` in `.github/workflows/playwright.yml`.

## Quick start

```bash
pnpm install
pnpm test:playwright        # uses the credentials already in the tracked .env (QA)
```

To point at a different environment locally, set `ENV` and `CI=true` so `load-env.ts` picks up `profile/.env.<env>`:

```bash
CI=true ENV=uat pnpm test:playwright
```

## Credential contract

| Variable | Required for | Secret? |
|---|---|---|
| `ENV` | Selecting `profile/.env.<env>` in CI | no |
| `ADMIN_PORTAL_BASE_URL` / `BASE_URL` | Admin login navigation | no |
| `ADMIN_USERNAME` | Admin login | **yes** |
| `ADMIN_PASSWORD` | Admin login | **yes** |
| `API_BASE_URL` | API client base | no |
| `API_USERNAME` / `API_PASSWORD` | API auth | **yes** |
| `PARTNER_API_KEY` / `PARTNER_API_SECRET` | Partner-integration API tests | **yes** |
| `MAILBOX_URL` | Selects yopmail/beeinbox handler for credential-email retrieval | no |
| `DEPARTMENT_NAME`, `PARTNER_NAME`, `SYSTEM_ID` | Test-data scoping | no |

There is no fail-fast validation step — if a required var is missing, the failure surfaces later as a failed login/navigation inside the test, not as an upfront error.

## CI setup (actual — GitHub Environments)

Credentials are stored per GitHub Environment (`qa`, `uat`, `staging` — matching the `workflow_dispatch` choices) as environment `vars`/`secrets`, and injected by `.github/workflows/playwright.yml`:

```yaml
environment: ${{ github.event.inputs.environment || 'qa' }}
env:
  API_BASE_URL: ${{ secrets.API_BASE_URL }}
# later step reads vars.BASE_URL, vars.ADMIN_USERNAME, vars.ADMIN_PASSWORD from that Environment
```

To add or rotate a credential: update the value in the GitHub repo's **Settings → Environments → <qa|uat|staging> → Secrets/Variables**. There is no separate Slack-notified rotation policy documented for this project.

## What does not exist here

- No `1Password`/`Vault` integration mentioned anywhere in the codebase.
- No `getCurrentUser()` account-resolution helper — every credential is read directly via `process.env.<NAME>` at the point of use.
- No `SLACK_WEBHOOK_URL` / Slack notification on auth failure.
