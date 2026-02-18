import { Locator, Page } from "@playwright/test";

export class LocatorHandling {
  /**
   * Find and return the UI Field's locator and wait until it's visible.
   * Call sites in the repo already `await` this method.
   * @param page Playwright `Page` instance
   * @param selector selector string (CSS or XPath)
   * @param timeout optional timeout in ms (defaults to env `UI_ELEMENT_TIMEOUT_MS` or 10000)
   */
  static async getLocator(
    page: Page,
    selector: string,
    timeout?: number
  ): Promise<Locator> {
    const locator = page.locator(selector);
    const effectiveTimeout =
      timeout ??
      (process.env.UI_ELEMENT_TIMEOUT_MS
        ? Number(process.env.UI_ELEMENT_TIMEOUT_MS)
        : 60000);
    // Give the page a chance to finish loading network activity before waiting
    const networkWait = Math.min(3000, effectiveTimeout);
    try {
      await page.waitForLoadState("networkidle", { timeout: networkWait });
    } catch (e) {
      // ignore — some pages don't reach 'networkidle' quickly; we'll still wait for the locator
    }
    await locator
      .first()
      .waitFor({ state: "visible", timeout: effectiveTimeout });
    return locator;
  }

  static async getLocatorInIframe(
    page: Page,
    iframeSelector: string,
    selector: string,
    timeout?: number
  ): Promise<Locator> {
    //iframe[@name='embedded-checkout']
    const iframeLocator = page.locator(iframeSelector);

    const frame = await iframeLocator.contentFrame();

    const locator = frame.locator(selector);

    const effectiveTimeout =
      timeout ??
      (process.env.UI_ELEMENT_TIMEOUT_MS
        ? Number(process.env.UI_ELEMENT_TIMEOUT_MS)
        : 60000);
    // Give the page a chance to finish loading network activity before waiting
    const networkWait = Math.min(3000, effectiveTimeout);
    try {
      await page.waitForLoadState("networkidle", { timeout: networkWait });
    } catch (e) {
      // ignore — some pages don't reach 'networkidle' quickly; we'll still wait for the locator
    }
    await locator
      .first()
      .waitFor({ state: "visible", timeout: effectiveTimeout });
    return locator;
  }
}
