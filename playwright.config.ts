import { defineConfig, devices } from "@playwright/test";
import path from "path";
import { loadPlaywrightEnv } from "src/utilities/load-env";

loadPlaywrightEnv(path.resolve(__dirname));

// Run headed when HEADED=true. Default is headless mode.
const headed = (process.env.HEADED ?? "false").toLowerCase() === "true";

/**
 * See https://playwright.dev/docs/test-configuration.
 */

export default defineConfig({
  timeout: 180000,
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
    /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [["html", { open: "always" }]],
  /* Default assertion timeout — reads UI_ELEMENT_TIMEOUT_MS from .env. */
  expect: { timeout: Number(process.env.UI_ELEMENT_TIMEOUT_MS) || 30000 },
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Default timeout for individual actions (click, fill, waitFor, etc.) */
    actionTimeout: Number(process.env.UI_ELEMENT_TIMEOUT_MS) || 30000,
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    // Let the browser open a real window and use the system window size when headed
    viewport: null,
    // Provide a sensible screen size when headed; still allow OS to maximize window.

    launchOptions: {
      headless: !headed,
      // start maximized and set a fallback window size when running headed
      args: headed ? ["--start-maximized", "--window-size=1920,1080"] : [],
    },

    /* Capture screenshot on test failure. */
    screenshot: "only-on-failure",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "retain-on-failure",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
