import fs from "fs";
import path from "path";
import dotenv from "dotenv";

let playwrightEnvLoaded = false;

/**
 * Loads env files in order for Playwright runs:
 * 1. Repository root `.env` — local defaults (never committed secrets go here).
 * 2. `profile/.env.${ENV}` — only when `process.env.CI` is set (pipeline / CI runners),
 *    applied after root so profile values override the same keys from root `.env`.
 *
 * `ENV` defaults to `qa` after step 1 if still unset.
 */
export function loadPlaywrightEnv(projectRoot: string = getDefaultProjectRoot()): void {
  if (playwrightEnvLoaded) {
    return;
  }
  playwrightEnvLoaded = true;

  const rootEnvPath = path.join(projectRoot, ".env");
  if (fs.existsSync(rootEnvPath)) {
    dotenv.config({ path: rootEnvPath });
  }

  const env = (process.env.ENV || "qa").toLowerCase();
  process.env.ENV = env;

  if (!process.env.CI) {
    return;
  }

  const profileEnvPath = path.join(
    projectRoot,
    "profile",
    `.env.${env}`,
  );
  if (fs.existsSync(profileEnvPath)) {
    dotenv.config({ path: profileEnvPath, override: true });
  }
}

function getDefaultProjectRoot(): string {
  return path.resolve(__dirname, "..", "..");
}
