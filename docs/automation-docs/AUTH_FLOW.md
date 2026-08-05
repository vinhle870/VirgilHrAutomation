# Login and Account Activation Flow

There is no storage-state caching, no `global.setup.ts`, and no cookie reuse in this repo. Every test logs in fresh through the UI (or an API auth call) at the point it needs to.

## 1. Admin Portal login

`LoginPage.login()` (`src/ui/pages/shared-pages/login.page.ts`) reads credentials straight from env vars and submits the login form:

```typescript
public login = async (): Promise<void> => {
  const url = process.env.ADMIN_PORTAL_BASE_URL ?? process.env.BASE_URL ?? "";
  const username = process.env.ADMIN_USERNAME ?? "";
  const password = process.env.ADMIN_PASSWORD ?? "";
  await this.fillLoginForm(url, username, password);
};
```

Used in specs as:

```typescript
await test.step("Login to Admin portal", async () => {
  await loginPage.login();
});
```

`fillLoginForm(url, username, password)` is also exposed directly for logging into a Partner/Member portal URL with an arbitrary email+password (see §3).

## 2. Activating Partner / Member / Customer accounts

These accounts don't exist until an admin creates them, and their first password is sent by email — there is no fixed credential to log in with. `AuthFlow` (`src/ui/flows/auth.flow.ts`) retrieves that email and drives the activation:

```
onboardingFlow.createPartnerAndAddPeoInAdminPortal(partnerInfo)
        ↓ system sends an activation email to partnerInfo.accountInfo.email
authFlow.activateAndChangePassIndividualCustomer(email, portal, newPassword)
        ↓
  getCredentialsFromEmail(email, subject)   → polls the mailbox (yopmail or beeinbox)
        ↓
  loginPage.fillLoginForm(credential.loginUrl, email, credential.password)
        ↓
  loginPage.changePassword(credential.password, newPassword)
```

`getCredentialsFromEmail` branches on `MAILBOX_URL`:

| `MAILBOX_URL` contains | Handler |
|---|---|
| `yopmail` | `YopmailHandler` (`src/utilities/email-handling.ts`) — polls with `expect.poll`, timeout 120s |
| `beeinbox` | `EmailServicePage.extractAccountCredentialFromInBox()` |
| anything else | throws `Unsupported mailbox` |

Key `AuthFlow` methods:

| Method | Use for |
|---|---|
| `loginToAdminPortal()` | Admin login using env-var credentials |
| `loginToPortals(portalUrl, email, password)` | Login to any portal URL with explicit credentials |
| `activateAndChangePassIndividualCustomer(email, portal, newPassword)` | Retrieve credential email → login → change temp password |
| `activateCustomerAccount(email, newPassword)` | Same, customer-specific subject |
| `activateSignedUpCustomer(email)` | Click the "Verify your email address" link for a self-signed-up member |
| `activateSignedUpCustomerUnderAPartner(email)` | Same, for a member signed up under a partner |
| `acceptInviteAndJoinTeamByCustomer(email, password)` | Accept a team invite email and set a password |

## 3. Email subjects

Subjects are resolved via `getEmailSubjectByDepartment()` (`src/constant/department-data.ts`), not hardcoded per test:

```typescript
export const emailSubjects = {
  JOIN_TEAM: "VirgilHR: Join your team",
  PARTNER_ACC_ACTIVATE: "HR Compliance - Partner Credential",
  CUSTOMER_ACC_ACTIVATE: "HR Compliance: Your User Portal Credentials",
};
```

## 4. What does not exist here

- No `.auth/` directory, no `storageState` files, no `test.use({ storageState: ... })`.
- No `AuthHelper.ensureAuthenticated()` / cookie-caching layer.
- No worker-level login lock — every test performs its own login/activation independently.
