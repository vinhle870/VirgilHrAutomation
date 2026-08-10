# Summary Report — [SPEC_ID]

**Session:** [Session label, e.g. "Session 1 (TC001–TC005)" or "Session 2 (TC006–TC017)"]
**Executed on:** [YYYY-MM-DD] · **Environment:** [ENVIRONMENT_NAME]

| Metric | Value |
|---|---|
| Total | [N] |
| ✅ PASS | [N] |
| ❌ FAIL | [N] |
| ⛔ BLOCKED | [N] |
| ⏭ SKIPPED | [N] |

| TC ID | Title | Result | Comment |
|---|---|---|---|
| [TC_ID] | [TC title — ≤60 chars] | ✅ PASS / ❌ FAIL / ⛔ BLOCKED / ⏭ SKIPPED | [comment — see rules below] |

### Bugs Found

| Bug ID | TC | Severity | Title |
|---|---|---|---|
| BUG-[NNN] | [TC_ID] | Critical / High / Medium / Low | [One-line bug title] |

> Omit this section entirely if no bugs were found in the session.

**Screenshots:** `qa-artifacts/4-execution-results/screenshots/`
**Execution log:** `qa-artifacts/4-execution-results/execution-log-[SPEC_ID].md`
**Next step → run `stlc-bug-reporter`** to create tracker tickets for all FAIL items.

---

## Comment Column Rules

| Result | What to write |
|---|---|
| ✅ PASS | `—` unless there is a notable observation (e.g. `Score differs from spec but behaviour correct`) |
| ❌ FAIL | Short failure reason + bug ID when filed (e.g. `BUG-002: Terrain section absent from UI`) |
| ⛔ BLOCKED | Blocking dependency (e.g. `Blocked by TC006 FAIL — Terrain UI missing`) |
| ⏭ SKIPPED | Skip reason (e.g. `Deferred — feature not yet deployed to QA`) |

**Formatting rules:**
- Max ~80 characters per Comment cell.
- Bug IDs: `BUG-NNN: <short title>`.
- Blocking TC: `Blocked by TC-NNN FAIL — <reason>`.
- Do NOT repeat information already visible in the Result column.
