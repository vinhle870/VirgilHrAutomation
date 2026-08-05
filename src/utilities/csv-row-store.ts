import type { CsvReportRow } from "./csv-report-generator";

/**
 * In-memory hand-off between `CsvRowCollectorReporter` (writes during `onTestEnd`,
 * while the test run is still active) and `global-teardown.ts` (reads once teardown
 * starts, after the run has fully finished). Both run in the same Node process for a
 * `playwright test` invocation, so a module-level array is enough — no intermediate
 * file on disk is needed.
 */
const rows: CsvReportRow[] = [];

export function addRow(row: CsvReportRow): void {
  rows.push(row);
}

export function getRows(): CsvReportRow[] {
  return rows;
}

export function resetRows(): void {
  rows.length = 0;
}
