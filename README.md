# VirgilHR Automation Framework

An automation framework built with [Playwright](https://playwright.dev/) for end-to-end testing of the VirgilHR platform. Covers three portals (Admin, Member, Partner) with both API and UI test layers, integrated with GitHub Actions for CI/CD.

---

## Framework Architecture

### Design Principles

| Principle | Description |
|-----------|-------------|
| **Page Object Model** | Each UI page is represented by a class that encapsulates its locators and actions |
| **Separation of Concerns** | Locators, pages, flows, API services, and test data are in separate layers |
| **Portal-Based Organization** | UI and API layers are grouped by portal (admin, member, partner) |
| **Base Page Abstraction** | All pages extend `BasePage` to avoid repeated boilerplate |
| **UI Component Helpers** | Shared interactions (dropdown, etc.) live under `src/utilities/components/` and are composed on `BasePage` |
| **Flow Layer** | Cross-page workflows are separated from individual page objects |
| **Fixture Injection** | Pages, flows, and API services are provided to tests via Playwright fixtures |
| **Builder Pattern** | Test data is generated through builder classes in the data factory |

---

### Directory Structure

```
.
├── .github/workflows/           # GitHub Actions CI/CD workflows
├── profile/                     # Environment-specific config files
│   ├── .env.prod
│   ├── .env.qa
│   └── .env.uat
│
├── src/                         # Framework source code
│   ├── api/                     # API layer
│   │   ├── endpoints/           # API endpoint URL definitions
│   │   │   ├── admin-portal.endpoints.ts
│   │   │   ├── member-portal.endpoints.ts
│   │   │   └── partner-portal.endpoints.ts
│   │   └── services/            # API service classes (business logic)
│   │       ├── admin-portal.services.ts
│   │       ├── member-portal.services.ts
│   │       ├── partner-portal.services.ts
│   │       └── authentication.service.ts
│   │
│   ├── ui/                      # UI layer (Page Object Model)
│   │   ├── flows/               # Cross-portal workflows (auth, onboarding, purchase)
│   │   └── pages/
│   │       ├── base-page.ts     # Abstract base class; composes UI helpers (e.g. dropdown)
│   │       ├── admin-portal/    # Admin Portal
│   │       │   ├── locators/    # Page locators (nested by feature where needed)
│   │       │   ├── flows/       # Admin-only workflows
│   │       │   ├── admin-home.page.ts
│   │       │   ├── admin-leftmenu.page.ts
│   │       │   └── ...
│   │       ├── member-portal/   # Member Portal
│   │       │   ├── locators/
│   │       │   ├── flows/
│   │       │   └── member-onboarding.page.ts
│   │       ├── partner-portal/  # Partner Portal
│   │       │   ├── locators/
│   │       │   └── flows/
│   │       └── shared/          # Cross-portal pages (login, buy plan, email helpers)
│   │           ├── locators/
│   │           └── ...
│   │
│   ├── data-factory/            # Test data builders (Builder pattern)
│   ├── objects/                 # Data models and interfaces
│   ├── fixtures/                # Playwright test fixtures (DI)
│   ├── utilities/               # Shared helpers (API client, locator handling, etc.)
│   │   └── components/          # Reusable UI interactions (BaseComponent, DropdownComponent, …)
│   ├── constant/                # Static data and constants
│   ├── enum/                    # Shared enums
│   ├── test-data/               # Test data providers
│   └── data-handling/           # File reading and parsing utilities
│
├── tests/                       # Test cases
│   ├── API/                     # API tests
│   │   ├── admin-portal/
│   │   ├── member-portal/
│   │   ├── partner-portal/
│   │   └── partner-integration/
│   └── UI/                      # UI tests
│       ├── e2e/
│       ├── smoke/
│       └── regression/
│
├── playwright.config.ts         # Playwright configuration
├── package.json                 # Dependencies and scripts
└── tsconfig.json                # TypeScript configuration
```

---

## Contributing Guidelines

### Adding a New Page

1. **Create the locator file** in the portal's `locators/` folder:

```typescript
// src/ui/pages/admin-portal/locators/admin-settings.locators.ts
export class AdminSettingsLocators {
  static readonly saveButton = "//button[text()='Save']";
  static readonly nameInput = "//input[@id='name']";
}
```

2. **Create the page file** in the portal's folder:

```typescript
// src/ui/pages/admin-portal/admin-settings.page.ts
import { BasePage } from "../base-page";
import { AdminSettingsLocators } from "./locators";

export class AdminSettingsPage extends BasePage {
  async updateName(name: string) {
    const input = await this.getLocator(AdminSettingsLocators.nameInput);
    await input.fill(name);

    const saveBtn = await this.getLocator(AdminSettingsLocators.saveButton);
    await saveBtn.click();
  }
}
```

3. **Export** from `locators/index.ts` and portal `index.ts`:

```typescript
// src/ui/pages/admin-portal/locators/index.ts
export * from "./admin-settings.locators";

// src/ui/pages/admin-portal/index.ts
export * from "./admin-settings.page";
```

4. **Register as a fixture** in `src/fixtures/basetest-fixtures.ts` if needed.

### Adding a New Flow

**Portal-specific flow** (uses pages from one portal only):

```typescript
// src/ui/pages/admin-portal/flows/customer-setup.flow.ts
import { Page } from "@playwright/test";
import { LoginPage } from "../../shared/login.page";
import { BuyPlanPage } from "../../shared/buy-plan.page";

export class CustomerSetupFlow {
  private readonly loginPage: LoginPage;
  private readonly buyPlanPage: BuyPlanPage;

  constructor(page: Page) {
    this.loginPage = new LoginPage(page);
    this.buyPlanPage = new BuyPlanPage(page);
  }

  async setupCustomerWithPlan(url: string, email: string, password: string) {
    await this.loginPage.fillLoginForm(url, email, password);
    await this.buyPlanPage.fillBuyPlanForm(url, email, password, {});
  }
}
```

**Cross-portal flow** (uses pages from 2+ portals):

```typescript
// src/ui/flows/full-onboarding.flow.ts
import { Page } from "@playwright/test";
import { MemberOnboardingPage } from "../pages/member-portal/member-onboarding.page";

export class FullOnboardingFlow {
  // Compose pages from different portals
  constructor(page: Page) {
    /* ... */
  }
}
```

### Adding a New API Service

Follow the existing pattern in `src/api/`:

1. Add endpoints in `src/api/endpoints/<portal>.endpoints.ts`
2. Add service class in `src/api/services/<portal>.services.ts`
3. Register as a fixture in `src/fixtures/basetest-fixtures.ts`

### Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Page file | `<portal>-<name>.page.ts` | `admin-settings.page.ts` |
| Locator file | `<portal>-<name>.locators.ts` | `admin-settings.locators.ts` |
| Flow file | `<name>.flow.ts` | `account-activation.flow.ts` |
| API service | `<portal>.services.ts` | `admin-portal.services.ts` |
| API endpoint | `<portal>.endpoints.ts` | `admin-portal.endpoints.ts` |
| Test file | `<description>.spec.ts` | `customer-management.spec.ts` |
| Page class | `<Portal><Name>Page` | `AdminSettingsPage` |
| Locator class | `<Portal><Name>Locators` | `AdminSettingsLocators` |
| Flow class | `<Name>Flow` | `AccountActivationFlow` |

### Where to Put Things

| What you're adding | Where it goes |
|-------------------|---------------|
| Page for a single portal | `src/ui/pages/<portal>/` (e.g. `admin-portal`, `member-portal`) |
| Locators for a page | `src/ui/pages/<portal>/locators/` |
| Flow within one portal | `src/ui/pages/<portal>/flows/` |
| Flow spanning 2+ portals | `src/ui/flows/` |
| External tool page (Yopmail, etc.) | `src/ui/pages/shared/` |
| API service | `src/api/services/` |
| Data model / interface | `src/objects/` |
| Test data builder | `src/data-factory/` |
| Reusable utility | `src/utilities/` |
| Reusable UI interaction (dropdown, date picker, …) | `src/utilities/components/` — extend `BaseComponent`, export from `components/index.ts`, add a property on `BasePage` |

### Reusable UI components

Shared interactions that appear on many pages (custom dropdowns, date pickers, etc.) should not live on `BasePage` as dozens of one-off methods. Use **composition**:

- **`BaseComponent`** (`src/utilities/components/base-component.ts`) — shared timeout and wait helpers.
- **Concrete helpers** — e.g. `DropdownComponent` (`dropdown.component.ts`) with methods like `selectOption` and `selectByText`.
- **`BasePage`** exposes helpers as properties (e.g. `this.dropdown`) so page objects stay readable:

```typescript
// Inside any page extending BasePage
await this.dropdown.selectByText(MyLocators.countryDropdown, "United States");
await this.dropdown.selectOption(MyLocators.roleDropdown, MyLocators.roleOptionEngineering);
```

Add new component types by creating `src/utilities/components/<name>.component.ts`, exporting from `components/index.ts`, and wiring `new MyComponent(page)` on `BasePage`.

---

## Test Data Architecture

### Data Flow

```
API Services              →  Raw API calls (AdminPortalService, etc.)
      ↓
TestDataProvider          →  Fetch & cache reference data (departments, plans, products)
      ↓
CollectionUtils           →  Filter, search, randomly pick from API responses
      ↓
DataFactory / Builders    →  Build test entities (CustomerBuilder, PartnerBuilder)
      ↓
PersonDataGenerator       →  Generate realistic fake data (names, emails, phones)
```

### Layers

| Layer | Class | Responsibility |
|-------|-------|---------------|
| **API Services** | `AdminPortalService`, etc. | Raw API calls, return response data |
| **Data Provider** | `TestDataProvider` | Fetch & cache pre-condition data from APIs |
| **Collection Utils** | `CollectionUtils` | Generic operations on arrays: filter, find, random pick |
| **Data Factory** | `DataFactory`, `CustomerBuilder`, `PartnerBuilder` | Build typed test objects with sensible defaults |
| **Data Generator** | `PersonDataGenerator`, `DataGenerate` | Generate fake names, emails, phone numbers |

### Using `CollectionUtils`

When you retrieve data from an API and need to filter, search, or randomly pick items, use `CollectionUtils`:

```typescript
import { CollectionUtils } from "src/utilities";

// Find one item by exact property match (throws if not found)
const plan = CollectionUtils.findByProperty(plans, "name", "Premium");

// Find by name (case-insensitive partial match)
const match = CollectionUtils.findByName(plans, "premium");

// Find without throwing (returns undefined)
const maybe = CollectionUtils.findByPropertyOrNull(plans, "id", someId);

// Filter by property
const activeItems = CollectionUtils.filterByProperty(items, "status", "active");

// Filter by name list
const filtered = CollectionUtils.filterByNames(products, ["Plan A", "Plan B"]);

// Filter where property is in a set of values
const subset = CollectionUtils.filterByPropertyIn(items, "type", [1, 2, 3]);

// Pick one random item
const randomPlan = CollectionUtils.pickOne(plans);

// Pick N random items (no duplicate references)
const sample = CollectionUtils.pickRandom(plans, 3);

// Pick N items with unique values on a specific key
const uniqueProducts = CollectionUtils.pickUniqueByKey(products, "productType", 2);
```

### Using `TestDataProvider`

`TestDataProvider` fetches and caches reference data that tests need before building entities:

```typescript
const testData = new TestDataProvider(adminPortalService);

// Fetch department (cached after first call)
const departmentId = await testData.getDepartmentId("BiginHR");
const domain = await testData.getDepartmentDomain(departmentId);

// Fetch and filter product types
const products = await testData.getProductTypesBasedDepartmentId(departmentId);

// Find a specific plan
const masterPlan = await testData.filterMasterPlanBasedName(departmentId, "Premium");
```

### Using `DataFactory`

Build test entities with the builder pattern. Builders auto-generate missing fields:

```typescript
const customer = await DataFactory.customerBuilder()
  .forMemberPortal()
  .withDepartment(departmentId)
  .withCompanyName("Acme Corp")
  .withMembers(3)
  .build();

const partner = await DataFactory.partnerBuilder()
  .withDepartment(departmentId)
  .withFilterProductTypes(products)
  .withPlanId(masterPlanId)
  .build();
```

### Adding a New Data Provider

For portal-specific data operations, add a provider in `src/test-data/`:

```typescript
// src/test-data/partner-data-provider.ts
import { CollectionUtils } from "src/utilities";

export class PartnerDataProvider {
  static filterPlansByLevel(plans: Plan[], level: number): Plan[] {
    return CollectionUtils.filterByProperty(plans, "level", level);
  }

  static pickRandomPartnerPlan(plans: Plan[]): Plan {
    return CollectionUtils.pickOne(plans);
  }
}
```

---

## Setup

### Package manager

This repo uses **[pnpm](https://pnpm.io/)**. The intended version is pinned in `package.json`:

- **`packageManager`** — `pnpm@10.33.0` (used by [Corepack](https://nodejs.org/api/corepack.html) when enabled)
- **`devDependencies.pnpm`** — local CLI so you can run the same version via `pnpm exec pnpm` or `npx pnpm` without a global install

**Enable Corepack (optional, recommended on Node 16.13+):**

```bash
corepack enable
```

Then installs in this repo use the pinned pnpm version automatically.

### Prerequisites

1. **Node.js** v18 or higher ([download](https://nodejs.org/))
2. Install dependencies:

   ```bash
   pnpm install
   ```

   If you use npm only: `npm install` still works, but prefer pnpm for consistency with `pnpm-lock.yaml`.

3. Install Playwright browsers:

   ```bash
   pnpm exec playwright install --with-deps
   ```

   Or: `pnpm run install:browsers`

4. Configure environment variables in `profile/.env.<env>` (e.g. `.env.qa`, `.env.uat`, `.env.prod`):

   - `BASE_URL`
   - `API_BASE_URL`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`

---

## Running Tests

### Locally

```bash
# Run all tests
pnpm exec playwright test

# Run specific browser
pnpm exec playwright test --project=chromium

# Run specific environment (PowerShell)
$env:ENV="qa"; pnpm exec playwright test

# Run specific environment (CMD)
set ENV=qa && pnpm exec playwright test

# Run API tests only
pnpm run test:playwright:api

# Run with path aliases (recommended — same as npm run test:playwright)
pnpm run test:playwright
```

### Path Aliases

If using `paths` in `tsconfig.json` (e.g., `"src/*": ["src/*"]`), preload `ts-node` and `tsconfig-paths`. Dependencies are already listed in `package.json`; use:

```powershell
$env:NODE_OPTIONS = "--require ts-node/register --require tsconfig-paths/register"
pnpm exec playwright test
```

Or use: `pnpm run test:playwright`

### View Reports

```bash
pnpm exec playwright show-report
```

---

## Running Tests via GitHub Actions

The workflow [`.github/workflows/playwright.yml`](.github/workflows/playwright.yml) uses **pnpm** (pinned in `package.json` via `pnpm/action-setup`), **Node 20**, `pnpm install --frozen-lockfile`, `pnpm run install:browsers`, and `pnpm run test:playwright` (or `pnpm exec playwright test --project=…` for a single browser).

1. **Manual run:** **Actions** → **Playwright Tests** → **Run workflow**
2. Choose **environment** (qa, uat, staging — selects the [GitHub Environment](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment) and sets `ENV` for `profile/.env.<env>`) and **browser** (`all` runs the full suite; otherwise one Playwright project)
3. **Push to `main`** also runs the same workflow (defaults: environment `qa`, browser `all`)
4. Open the run → **Artifacts** → download **playwright-report** (uploaded even when tests fail)

Configure repository/environment **Variables** (e.g. `BASE_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`) and **Secrets** (e.g. `API_BASE_URL`) as referenced in the workflow.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Environment variables not set | Configure in `profile/.env.<env>` or GitHub Settings > Environments |
| Dependencies not installed | Run `pnpm install` (or `npm install`) |
| Browsers not installed | Run `pnpm exec playwright install --with-deps` or `pnpm run install:browsers` |
| Path alias errors (`src/...` not found) | Use `pnpm run test:playwright` to preload path resolvers |
| Wrong pnpm version | Run `corepack enable` or use `pnpm exec pnpm` from this repo |

---

## License

This project is licensed under the **ISC** License. See `package.json` (`license` field) for details.
