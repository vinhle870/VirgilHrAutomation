# Test Case Counts by Tag

Counted via `pnpm exec playwright test --list --grep "@<tag>"`.

| Tag | Count |
|---|---|
| `@customer_management` | 2 |
| `@partner_management` | 18 |
| `@member_portal` | 15 |
| `@partner_portal` | 6 |
| `@regression_UI` | 41 |
| `@regression_API` | 35 |

`@regression_UI` (41) = sum of the four portal tags, confirming no overlap between them.

## Execution Results

| Tag | Result |
|---|---|
| `@customer_management` | PASSED |
| `@member_portal` | PASSED |
| `@partner_portal` | PASSED |
| `@partner_management` | PASSED |
