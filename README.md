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
│   └── .env.qa
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
│   │   ├── flows/               # Cross-portal workflows
│   │   │   └── account-activation.flow.ts
│   │   └── pages/
│   │       ├── base-page.ts     # Abstract base class for all pages
│   │       ├── admin/           # Admin Portal
│   │       │   ├── locators/    # Admin page locators
│   │       │   ├── flows/       # Admin-only workflows
│   │       │   ├── admin-login.page.ts
│   │       │   ├── admin-home.page.ts
│   │       │   ├── admin-leftmenu.page.ts
│   │       │   └── admin-plan.page.ts
│   │       ├── member/          # Member Portal
│   │       │   ├── locators/    # Member page locators
│   │       │   ├── flows/       # Member-only workflows
│   │       │   └── member-onboarding.page.ts
│   │       ├── partner/         # Partner Portal
│   │       │   ├── locators/    # Partner page locators
│   │       │   └── flows/       # Partner-only workflows
│   │       └── shared/          # External tools (Yopmail, etc.)
│   │           ├── locators/
│   │           └── yopmail.page.ts
│   │
│   ├── data-factory/            # Test data builders (Builder pattern)
│   ├── objects/                 # Data models and interfaces
│   ├── fixtures/                # Playwright test fixtures (DI)
│   ├── utilities/               # Shared helpers (API client, locator handling, etc.)
│   ├── constant/                # Static data and constants
│   ├── enum/                    # Shared enums
│   ├── test-data/               # Test data providers
│   └── data-handling/           # File reading and parsing utilities
│
├── tests/                       # Test cases
│   ├── API/                     # API tests
│   │   ├── admin-portal/
│   │   ├── member-portal/
│   │   └── partner-portal/
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
// src/ui/pages/admin/locators/admin-settings.locators.ts
export class AdminSettingsLocators {
  static readonly saveButton = "//button[text()='Save']";
  static readonly nameInput = "//input[@id='name']";
}
```

2. **Create the page file** in the portal's folder:

```typescript
// src/ui/pages/admin/admin-settings.page.ts
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
// src/ui/pages/admin/locators/index.ts
export * from "./admin-settings.locators";

// src/ui/pages/admin/index.ts
export * from "./admin-settings.page";
```

4. **Register as a fixture** in `src/fixtures/basetest-fixtures.ts` if needed.

### Adding a New Flow

**Portal-specific flow** (uses pages from one portal only):

```typescript
// src/ui/pages/admin/flows/customer-setup.flow.ts
import { Page } from "@playwright/test";
import { AdminLoginPage } from "../admin-login.page";
import { AdminPlanPage } from "../admin-plan.page";

export class CustomerSetupFlow {
  private readonly loginPage: AdminLoginPage;
  private readonly planPage: AdminPlanPage;

  constructor(page: Page) {
    this.loginPage = new AdminLoginPage(page);
    this.planPage = new AdminPlanPage(page);
  }

  async setupCustomerWithPlan(url: string, email: string, password: string) {
    await this.loginPage.loginWithValidAccount(url, email, password);
    await this.planPage.buyPlan(url, email, password, {});
  }
}
```

**Cross-portal flow** (uses pages from 2+ portals):

```typescript
// src/ui/flows/full-onboarding.flow.ts
import { Page } from "@playwright/test";
import { YopMailPage } from "../pages/shared/yopmail.page";
import { MemberOnboardingPage } from "../pages/member/member-onboarding.page";

export class FullOnboardingFlow {
  // Compose pages from different portals
  constructor(page: Page) { /* ... */ }
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
| Page for a single portal | `src/ui/pages/<portal>/` |
| Locators for a page | `src/ui/pages/<portal>/locators/` |
| Flow within one portal | `src/ui/pages/<portal>/flows/` |
| Flow spanning 2+ portals | `src/ui/flows/` |
| External tool page (Yopmail, etc.) | `src/ui/pages/shared/` |
| API service | `src/api/services/` |
| Data model / interface | `src/objects/` |
| Test data builder | `src/data-factory/` |
| Reusable utility | `src/utilities/` |

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

### Prerequisites

1. **Node.js** v18 or higher ([download](https://nodejs.org/))
2. Install dependencies:
   ```bash
   npm install
   ```
3. Install Playwright browsers:
   ```bash
   npx playwright install --with-deps
   ```
4. Configure environment variables in `profile/.env.<env>`:
   - `BASE_URL`
   - `API_BASE_URL`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`

---

## Running Tests

### Locally

```bash
# Run all tests
npx playwright test

# Run specific browser
npx playwright test --project=chromium

# Run specific environment (PowerShell)
$env:ENV="qa"; npx playwright test

# Run specific environment (CMD)
set ENV=qa && npx playwright test

# Run API tests only
npm run test:playwright:api

# Run with path aliases (recommended)
npm run test:playwright
```

### Path Aliases

If using `paths` in `tsconfig.json` (e.g., `"src/*": ["src/*"]`), preload `ts-node` and `tsconfig-paths`:

```bash
npm install -D ts-node tsconfig-paths cross-env
```

```powershell
$env:NODE_OPTIONS = "--require ts-node/register --require tsconfig-paths/register"
npx playwright test
```

Or use the npm script: `npm run test:playwright`

### View Reports

```bash
npx playwright show-report
```

---

## Running Tests via GitHub Actions

1. Go to **Actions** tab > **Playwright Tests** workflow > **Run workflow**
2. Select `environment` (qa, uat, staging) and `browser` (all, chromium, firefox, webkit)
3. View results and download `playwright-report` artifact from the workflow run

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Environment variables not set | Configure in `profile/.env.<env>` or GitHub Settings > Environments |
| Dependencies not installed | Run `npm install` |
| Browsers not installed | Run `npx playwright install --with-deps` |
| Path alias errors (`src/...` not found) | Use `npm run test:playwright` to preload path resolvers |

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
