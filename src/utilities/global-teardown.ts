import path from "path";
import type { FullConfig } from "@playwright/test/reporter";
import { generateCsvReport } from "./csv-report-generator";
import { getRows } from "./csv-row-store";

/**
 * Derives a filename-safe label from the `--grep`/`-g` value the CLI was actually
 * invoked with, e.g. `--grep @TC35` → `"TC35"`, `--grep "@TC35|@TC36"` → `"TC35_TC36"`.
 *
 * NOTE: the CLI `--grep` flag is NOT reflected in `FullConfig.projects[].grep` — that
 * field only carries `testConfig.grep`/`testProject.grep` set in playwright.config.ts.
 * Playwright applies the CLI flag as a separate, internal runtime filter that never
 * makes it onto the public `FullConfig` object reporters/globalTeardown receive. Reading
 * `process.argv` directly is the only way to see it — reporters and globalTeardown run
 * in the same root process that parsed the original CLI command (worker processes,
 * spawned separately to run the actual tests, are not involved here).
 */
function extractGrepTag(): string | undefined {
  const argv = process.argv;
  const flagIndex = argv.findIndex((arg) => arg === "--grep" || arg === "-g");
  const inlineFlag = argv.find((arg) => arg.startsWith("--grep=") || arg.startsWith("-g="));

  const raw = flagIndex !== -1 ? argv[flagIndex + 1] : inlineFlag?.split("=").slice(1).join("=");
  if (!raw) return undefined;

  const label = raw.replace(/[^a-zA-Z0-9_]+/g, "_").replace(/^_+|_+$/g, "");
  return label || undefined;
}

/**
 * Runs once after the whole Playwright run finishes (all projects, all workers).
 * Converts the rows collected in-memory by `CsvRowCollectorReporter` into CSV
 * report(s) — no intermediate file is written or left behind.
 *
 * This deliberately does NOT read a reporter's `onEnd()` output (e.g. the built-in
 * `json` reporter) — Playwright calls `globalTeardown` BEFORE any reporter's `onEnd()`,
 * so that data would never be ready yet at this point. `CsvRowCollectorReporter`
 * collects each row during `onTestEnd` instead, which always completes before
 * teardown starts, and both hooks run in the same process, so an in-memory hand-off is enough.
 *
 * Output goes to `csv-report/` at the repo root, NOT `test-results/` — Playwright wipes
 * each project's `outputDir` (`test-results/` here) at the START of every run, which
 * would otherwise delete the previous run's CSV before this teardown even executes.
 * `csv-report/` sits outside that directory so reports accumulate across runs.
 */
export default async function globalTeardown(config: FullConfig): Promise<void> {
  const repoRoot = config.configFile ? path.dirname(config.configFile) : process.cwd();
  const outputDir = path.resolve(repoRoot, "csv-report");

  await generateCsvReport(getRows(), outputDir, extractGrepTag());
}
