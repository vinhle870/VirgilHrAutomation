# VirgilHR Automation — Architecture

## Overview

Playwright + TypeScript, `pnpm`, testing three portals (Admin, Partner, Member) over UI and API.

```
Test Spec (tests/UI/**, tests/API/**)
        ↓ uses fixtures only
Fixtures (src/fixtures/*-fixtures.ts)
        ↓ instantiate
Flow classes (src/ui/flows/*.flow.ts, src/ui/pages/<portal>/flows/*.flow.ts)
        ↓ orchestrate + assert (UiAssert)
Page objects (src/ui/pages/**/*.page.ts, *-page.ts)
        ↓ read
Locator classes (src/ui/pages/**/locators/*.ts — static XPath/CSS strings)
        ↓
Browser (Playwright)

API side:
Test Spec → Services (src/api/services/*.services.ts) → Endpoints (src/api/endpoints/*.ts) → HTTP
```

There is no path-alias system (`@/...`) — imports use plain relative paths or the `src/` root resolved via `tsconfig.json` (e.g. `import { test } from "src/fixtures"`).

---

## Directory Structure (actual)

```
src/
├── ui/
│   ├── pages/
│   │   ├── base-page.ts                     # BasePage: getLocator(), getLocatorInIframe(), selectRadio()
│   │   ├── admin-portal/
│   │   │   ├── admin-home.page.ts
│   │   │   ├── admin-leftmenu.page.ts
│   │   │   ├── partner-management-page.ts    # note: no `.` before "page" — inconsistent naming exists
│   │   │   ├── customer-management-page.ts
│   │   │   ├── flows/adminportal.onboarding.flow.ts
│   │   │   └── locators/**/*.ts              # static classes: CommonPartnerLocator, CreateNewPartnerModalLocator, …
│   │   ├── partner-portal/
│   │   │   ├── partner-page.ts
│   │   │   ├── flows/partnerportal.onboarding.flow.ts
│   │   │   └── locators/*.ts                 # BusinessLocator, ClientLocator, …
│   │   ├── member-portal/
│   │   │   ├── member.page.ts
│   │   │   ├── flows/memberportal.onboarding.flow.ts
│   │   │   └── locators/*.ts                 # SignUpLocators, OrganizationLocators, …
│   │   └── shared-pages/
│   │       ├── login.page.ts, home.page.ts, buy-plan.page.ts, emailservice.page.ts, welome.modal.ts
│   │       └── locators/*.ts
│   └── flows/
│       ├── auth.flow.ts        # AuthFlow — login, activation, email-credential retrieval
│       ├── onboarding.flow.ts  # OnboardingFlow — create partner/customer, business, verify visible
│       ├── purchase.flow.ts    # PurchaseFlow — plan selection, Stripe payment
│       └── index.ts
│
├── api/
│   ├── endpoints/*.endpoints.ts    # raw path/method constants per portal
│   └── services/*.services.ts      # AdminPortalService, MemberPortalService, PartnerPortalService, AuthenticationService, …
│
├── data-factory/                   # builder pattern for test data — NOT `data/test-presets.ts`
│   ├── data-factory.ts             # DataFactory — entry point: DataFactory.partnerBuilder(), .customerBuilder(), .peoPartnerBuilder()
│   ├── partner-builder.ts, customer-builder.ts, peopartner-builder.ts
│   ├── person-data-generator.ts    # PersonDataGenerator — fake user/business owner data
│   └── platinum-data-generator.ts
│
├── objects/                        # plain data models: Partner, CustomerInfo, UserInfo, ProductInfo, PeoPartner, …
├── test-data/                      # TestDataProvider — resolves department/plan/product-type IDs via API before building payloads
├── constant/                       # static-data.ts (plans[]), department-data.ts, department.data.qa.ts / .uat.ts
├── assertions/
│   ├── ui-assert.ts                # UiAssert.allVisible/noneVisible/textContains/urlMatches
│   └── api-assert.ts
├── fixtures/
│   ├── page-fixtures.ts            # page objects: loginPage, homePage, leftmenu, partnerManagementPage, …
│   ├── flow-fixtures.ts            # flows: authFlow, onboardingFlow, purchaseFlow
│   ├── api-fixtures.ts             # apiClient, adminPortalService, memberPortalService, authenticationService, …
│   ├── basetest-fixtures.ts        # mergeTests(apiTest, pageTest, flowTest) → exported as `test`
│   └── index.ts                    # `import { test } from "src/fixtures"`
└── utilities/                      # LocatorHandling, DropdownComponent, CollectionUtils, email-handling, load-env.ts, …

tests/
├── UI/<portal>/*.spec.ts           # e.g. tests/UI/admin-portal/, tests/UI/partner-portal/, tests/UI/member-portal/
└── API/<portal>/*.spec.ts
```

---

## Layer rules (as actually followed in this repo)

| Layer | Responsibility | Notes |
|---|---|---|
| **Locator classes** | `static readonly` selector strings (often `xpath=//...`), grouped by page/modal | Plain classes, not `Locator` objects — the selector is resolved at the point of use |
| **Page objects** | Extend `BasePage`; action methods (`fill`, `click`) built from `this.page.locator(SomeLocator.field)` or `this.getLocator(selector)` | Most Page classes hold **no** constructor-assigned `Locator` fields and **no** `getXxx(): Locator` getters — locators are read from the static classes inline. `HomePage.getHomeTitle()` is one of the few pages with a real getter; it is not the dominant pattern |
| **Flow classes** | Orchestrate one or more Page objects into a user journey; assertions live here via `UiAssert`, e.g. `UiAssert.allVisible([this.page.locator(BusinessLocator.ownerText)])` | Flows sometimes read a Locator class directly rather than going through a Page-object getter — this is normal here |
| **Test specs** | Import `test`/`expect` from `src/fixtures` only; call flow methods inside `test.step()` | No page-object instantiation, no raw `page.locator()` in specs |

**Do not** assume the idealized rule "POM = zero expect, Flow = `expect(page.getXxx())`" from other Playwright frameworks applies literally here — the Flow layer usually calls `UiAssert.*` on a locator built straight from a static Locator class, not from a POM getter method.

---

## Fixtures (`src/fixtures`)

No auto-teardown, no storage-state reuse, no Allure. Everything is composed via `mergeTests`:

```typescript
export const test = mergeTests(apiTest, pageTest, flowTest);
```

| Group | Fixtures |
|---|---|
| Page (`page-fixtures.ts`) | `loginPage`, `homePage`, `leftmenu`, `buyPlanPage`, `partnerManagementPage`, `customerManagementPage`, `partnerPage`, `homeExceptAdminPage` |
| Flow (`flow-fixtures.ts`) | `authFlow` (`AuthFlow`), `onboardingFlow` (`OnboardingFlow`), `purchaseFlow` (`PurchaseFlow`) |
| API (`api-fixtures.ts`) | `apiClient`, `adminPortalService`, `memberPortalService`, `authenticationService`, … |

Import in specs as:

```typescript
import { test } from "src/fixtures";
```

---

## Data layer

Builder pattern via `DataFactory`, not preset constant objects:

```typescript
const partnerInfo = await DataFactory.partnerBuilder()
  .withDepartmentName(process.env.DEPARTMENT_NAME!)
  .withPaymentOption("Partner/Consultant Owner")
  .withProductsType([plans[0]])
  .withBankTransfer(true)
  .build();
```

`TestDataProvider` (`src/test-data`) resolves live IDs (department, master plan, product types) from the API before a builder can fill them in — used heavily in API specs.

---

## Dependency rules

```
✅ Test spec   → Fixtures only
✅ Flow        → Page objects, UiAssert, Locator classes
✅ Page object → BasePage, Locator classes
✅ API service → Endpoints, ApiClient

❌ Test spec   → Page object / Locator class directly
❌ Page object → Flow (never)
```
