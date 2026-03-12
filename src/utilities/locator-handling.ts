import { Locator, Page } from "@playwright/test";

export class LocatorHandling {
  private static getEffectiveTimeout(timeout?: number): number {
    return (
      timeout ??
      (process.env.UI_ELEMENT_TIMEOUT_MS
        ? Number(process.env.UI_ELEMENT_TIMEOUT_MS)
        : 60000)
    );
  }

  private static async waitForNetworkSettled(
    page: Page,
    timeout: number
  ): Promise<void> {
    const networkWait = Math.min(3000, timeout);
    try {
      await page.waitForLoadState("networkidle", { timeout: networkWait });
    } catch {
      // ignore — some pages don't reach 'networkidle' quickly
    }
  }

  /**
   * Click a dropdown to open it, then click a child option within its DOM subtree.
   * Use when the option list is rendered as a descendant of the dropdown container.
   *
   * @param page          Playwright `Page` instance
   * @param dropdownSelector  selector for the dropdown trigger/container
   * @param optionSelector    selector for the option **relative to the dropdown**
   * @param timeout           optional timeout in ms
   */
  static async selectDropdownOption(
    page: Page,
    dropdownSelector: string,
    optionSelector: string,
    timeout?: number
  ): Promise<void> {
    const effectiveTimeout = this.getEffectiveTimeout(timeout);
    await this.waitForNetworkSettled(page, effectiveTimeout);

    const dropdown = page.locator(dropdownSelector);
    await dropdown
      .first()
      .waitFor({ state: "visible", timeout: effectiveTimeout });
    await dropdown.first().click();

    const option = dropdown.locator(optionSelector);
    await option
      .first()
      .waitFor({ state: "visible", timeout: effectiveTimeout });
    await option.first().click();
  }

  /**
   * Click a dropdown to open it, then select an option by its visible text.
   * The option is located **anywhere on the page** (supports portals/overlays).
   *
   * @param page              Playwright `Page` instance
   * @param dropdownSelector  selector for the dropdown trigger/container
   * @param optionText        visible text of the option to select
   * @param optionListSelector  optional selector scoping where options appear
   *                            (defaults to page-level text search)
   * @param timeout           optional timeout in ms
   */
  static async selectDropdownOptionByText(
    page: Page,
    dropdownSelector: string,
    optionText: string,
    optionListSelector?: string,
    timeout?: number
  ): Promise<void> {
    const effectiveTimeout = this.getEffectiveTimeout(timeout);
    await this.waitForNetworkSettled(page, effectiveTimeout);

    const dropdown = page.locator(dropdownSelector);
    await dropdown
      .first()
      .waitFor({ state: "visible", timeout: effectiveTimeout });
    await dropdown.first().click();

    const scope = optionListSelector
      ? page.locator(optionListSelector)
      : page;
    const option = scope.getByText(optionText, { exact: true });
    await option
      .first()
      .waitFor({ state: "visible", timeout: effectiveTimeout });
    await option.first().click();
  }

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
    const effectiveTimeout = this.getEffectiveTimeout(timeout);
    await this.waitForNetworkSettled(page, effectiveTimeout);

    const locator = page.locator(selector);
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
    const effectiveTimeout = this.getEffectiveTimeout(timeout);
    await this.waitForNetworkSettled(page, effectiveTimeout);

    const frame = await page.locator(iframeSelector).contentFrame();
    const locator = frame.locator(selector);
    await locator
      .first()
      .waitFor({ state: "visible", timeout: effectiveTimeout });
    return locator;
  }
}
