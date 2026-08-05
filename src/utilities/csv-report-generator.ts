import { promises as fs } from "fs";
import path from "path";

export interface CsvReportRow {
  suite: string;
  testCase: string;
  tags: string;
  project: string;
  status: string;
  retry: number;
  durationMs: number;
  startedAt: string;
  file: string;
  errorMessage: string;
}

const CSV_HEADERS: (keyof CsvReportRow)[] = ["suite", "testCase", "tags", "project", "status", "retry", "durationMs", "startedAt", "file", "errorMessage"];

function escapeCsvField(value: unknown): string {
  const str = String(value ?? "");
  return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function rowsToCsv(rows: CsvReportRow[]): string {
  const lines = rows.map((row) => CSV_HEADERS.map((key) => escapeCsvField(row[key])).join(","));
  return [CSV_HEADERS.join(","), ...lines].join("\n");
}

function groupRowsByFile(rows: CsvReportRow[]): Map<string, CsvReportRow[]> {
  const grouped = new Map<string, CsvReportRow[]>();

  for (const row of rows) {
    const bucket = grouped.get(row.file) ?? [];
    bucket.push(row);
    grouped.set(row.file, bucket);
  }

  return grouped;
}

/** Spec file name without its directory or `.spec.ts` extension, e.g. `partner-portal-business-ownership-member-consumer_TC53`. */
function specFileBaseName(file: string): string {
  return path.basename(file).replace(/\.spec\.ts$/, "");
}

/** Formats a Date as `MMDDYYYY_HHmmss` (local time), e.g. `08042026_194432`. */
function formatExecutionTimestamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getMonth() + 1)}${pad(date.getDate())}${date.getFullYear()}_${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

/**
 * Takes the rows collected by `CsvRowCollectorReporter` (via the in-memory
 * `csv-row-store`, no intermediate file involved) and writes CSV report(s) into
 * `outputDir`, named `<name>_<MMDDYYYY>_<HHmmss>.csv`. Seconds are included (not
 * just HHmm) so that two runs never collide and silently overwrite each other's report.
 *
 * - `runLabel` given (e.g. the `--grep` tag the CLI was invoked with, such as `TC35`):
 *   all matched rows go into ONE file named `<runLabel>_<timestamp>.csv` — this is
 *   what the CLI actually asked to run, regardless of how many spec files it touched.
 * - `runLabel` omitted (untagged / whole-suite run): falls back to one CSV per spec
 *   file, named after that file, e.g. `partner-portal-business-ownership-member-consumer_TC53_08042026_194432.csv`.
 */
export async function generateCsvReport(rows: CsvReportRow[], outputDir: string, runLabel?: string): Promise<void> {
  if (rows.length === 0) {
    console.warn("[csv-report] No test results found — skipping CSV generation.");
    return;
  }

  const timestamp = formatExecutionTimestamp(new Date());

  await fs.mkdir(outputDir, { recursive: true });

  if (runLabel) {
    const outputPath = path.join(outputDir, `${runLabel}_${timestamp}.csv`);
    await fs.writeFile(outputPath, rowsToCsv(rows), "utf-8");
    console.log(`[csv-report] Wrote ${rows.length} row(s) to ${outputPath}`);
    return;
  }

  for (const [file, fileRows] of groupRowsByFile(rows)) {
    const outputPath = path.join(outputDir, `${specFileBaseName(file)}_${timestamp}.csv`);
    await fs.writeFile(outputPath, rowsToCsv(fileRows), "utf-8");
    console.log(`[csv-report] Wrote ${fileRows.length} row(s) to ${outputPath}`);
  }
}
