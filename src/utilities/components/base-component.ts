import { Locator, Page } from "@playwright/test";

/**
 * Shared foundation for all reusable UI component helpers.
 * Subclass this to create helpers for specific component types
 * (dropdowns, date pickers, autocomplete, etc.).
 */
export abstract class BaseComponent {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  protected getEffectiveTimeout(timeout?: number): number {
    return timeout ?? (process.env.UI_ELEMENT_TIMEOUT_MS ? Number(process.env.UI_ELEMENT_TIMEOUT_MS) : 60000);
  }

  protected async waitForNetworkSettled(timeout: number): Promise<void> {
    const networkWait = Math.min(3000, timeout);
    try {
      await this.page.waitForLoadState("networkidle", { timeout: networkWait });
    } catch {
      // ignore — some pages don't reach 'networkidle' quickly
    }
  }

  protected async waitAndClick(locator: Locator, timeout: number): Promise<void> {
    try {
      await locator.last().waitFor({ state: "visible", timeout });
      await locator.last().click({ timeout: 3000 });
    } catch (error) {
      await locator.first().waitFor({ state: "visible", timeout });
      await locator.first().click();
    }
  }
}
