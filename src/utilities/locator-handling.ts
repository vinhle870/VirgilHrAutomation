import { Locator, Page } from "@playwright/test";

/**
 * Core locator utilities: find elements and wait for visibility.
 * For component-specific interactions (dropdown, date picker, etc.),
 * see `src/utilities/components/`.
 */
export class LocatorHandling {
  private static getEffectiveTimeout(timeout?: number): number {
    return timeout ?? (process.env.UI_ELEMENT_TIMEOUT_MS ? Number(process.env.UI_ELEMENT_TIMEOUT_MS) : 60000);
  }

  private static async waitForNetworkSettled(page: Page, timeout: number): Promise<void> {
    const networkWait = Math.min(3000, timeout);
    try {
      await page.waitForLoadState("networkidle", { timeout: networkWait });
    } catch {
      // ignore — some pages don't reach 'networkidle' quickly
    }
  }

  /**
   * Find and return a locator, waiting until it's visible.
   * @param page Playwright `Page` instance
   * @param selector selector string (CSS or XPath)
   * @param timeout optional timeout in ms
   */
  static async getLocator(page: Page, selector: string, timeout?: number): Promise<Locator> {
    const effectiveTimeout = this.getEffectiveTimeout(timeout);

    const locator = page.locator(selector);

    await locator.first().waitFor({ state: "visible", timeout: effectiveTimeout });

    return locator;
  }

  static async getLocatorInIframe(page: Page, iframeSelector: string, selector: string, timeout?: number): Promise<Locator> {
    const effectiveTimeout = this.getEffectiveTimeout(timeout);

    const frame = await page.locator(iframeSelector).contentFrame();
    const locator = frame.locator(selector);
    await locator.first().waitFor({ state: "visible", timeout: effectiveTimeout });
    return locator;
  }
}
