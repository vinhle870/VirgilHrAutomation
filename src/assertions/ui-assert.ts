import { expect, Locator } from "@playwright/test";

type VisibilityOptions = { timeout?: number; soft?: boolean };

/**
 * Static helpers for Playwright locator assertions.
 *
 * Replaces verbose repeated `await expect(locator).toBeVisible()` blocks.
 *
 * Usage:
 *   await UiAssert.allVisible([cardNumber, cardCvc, cardHolder]);
 *   await UiAssert.allVisible([field1, field2], { soft: true, timeout: 10000 });
 *   await UiAssert.noneVisible([errorBanner, modal]);
 *   await UiAssert.textContains(heading, "Welcome");
 */
export class UiAssert {
  /**
   * Assert every locator in the list is visible.
   * Assertions run in parallel — faster than sequential awaits.
   */
  static async allVisible(locators: Locator[], options?: VisibilityOptions): Promise<void> {
    const ex = options?.soft ? expect.configure({ soft: true }) : expect;
    await Promise.all(locators.map((l) => ex(l).toBeVisible({ timeout: options?.timeout })));
  }

  /**
   * Assert none of the given locators are visible.
   */
  static async noneVisible(locators: Locator[], options?: VisibilityOptions): Promise<void> {
    const ex = options?.soft ? expect.configure({ soft: true }) : expect;
    await Promise.all(locators.map((l) => ex(l).not.toBeVisible({ timeout: options?.timeout })));
  }

  /**
   * Assert that a locator's text contains the given substring.
   */
  static async textContains(locator: Locator, text: string, options?: VisibilityOptions): Promise<void> {
    const ex = options?.soft ? expect.configure({ soft: true }) : expect;
    await ex(locator).toContainText(text, { timeout: options?.timeout });
  }

  /**
   * Assert that a URL matches a pattern (string suffix or regex).
   */
  static async urlMatches(url: string, pattern: string | RegExp): Promise<void> {
    if (typeof pattern === "string") {
      expect(url).toContain(pattern);
    } else {
      expect(url).toMatch(pattern);
    }
  }
}
