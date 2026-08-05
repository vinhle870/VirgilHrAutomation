import path from "path";
import type { FullConfig, Reporter, Suite, TestCase, TestResult } from "@playwright/test/reporter";
import type { CsvReportRow } from "./csv-report-generator";
import { addRow, resetRows } from "./csv-row-store";

function getProjectName(test: TestCase): string {
  let suite: Suite | undefined = test.parent;
  while (suite && suite.type !== "project") suite = suite.parent;
  return suite?.title ?? "";
}

function formatErrorMessage(result: TestResult): string {
  if (result.errors.length) return result.errors.map((e) => e.message ?? "").join(" | ");
  if (result.error?.message) return result.error.message;
  return "";
}

/**
 * Collects one row per finished test into the in-memory `csv-row-store` as tests
 * complete — NOT in `onEnd()`. `onTestEnd` fires while the test run itself is still in
 * its "setup" phase; Playwright only starts unwinding `globalTeardown` once every test
 * has already finished, so by the time global-teardown.ts reads the store every row is
 * guaranteed to already be there. Reporters' own `onEnd()` (built-in `json`/`html`
 * included) fires strictly AFTER globalTeardown has already run, so it cannot be used
 * as the data source here — and writing no file at all avoids leaving any intermediate
 * artifact behind.
 */
export default class CsvRowCollectorReporter implements Reporter {
  private repoRoot = "";

  onBegin(config: FullConfig, _suite: Suite): void {
    this.repoRoot = config.configFile ? path.dirname(config.configFile) : process.cwd();
    resetRows(); // drop rows from any previous run sharing this process (e.g. --repeat-each)
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const titlePath = test.titlePath(); // [root, project, file, ...describe blocks, test title]

    addRow({
      suite: titlePath.slice(3, -1).join(" > "),
      testCase: test.title,
      tags: test.tags.join(";"),
      project: getProjectName(test),
      status: result.status,
      retry: result.retry,
      durationMs: result.duration,
      startedAt: result.startTime.toISOString(),
      file: path.relative(this.repoRoot, test.location.file).split(path.sep).join("/"),
      errorMessage: formatErrorMessage(result),
    });
  }
}
