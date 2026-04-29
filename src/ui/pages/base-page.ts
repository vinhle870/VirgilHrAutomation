import { Page } from "@playwright/test";
import { LocatorHandling } from "../../utilities/locator-handling";
import { DropdownComponent } from "../../utilities/components";

export abstract class BasePage {
  protected page: Page;
  protected readonly dropdown: DropdownComponent;

  constructor(page: Page) {
    this.page = page;
    this.dropdown = new DropdownComponent(page);
  }

  get currentPage(): Page {
    return this.page;
  }

  protected async getLocator(selector: string, timeout?: number) {
    return LocatorHandling.getLocator(this.page, selector, timeout);
  }

  protected async getLocatorInIframe(iframeSelector: string, selector: string, timeout?: number) {
    return LocatorHandling.getLocatorInIframe(this.page, iframeSelector, selector, timeout);
  }

  /**
   * Click a radio option by accessible name. Optionally scope to a container.
   */
  protected async selectRadio(label: string, scopeSelector?: string, timeout?: number): Promise<void> {
    const effectiveTimeout = timeout ?? (process.env.UI_ELEMENT_TIMEOUT_MS ? Number(process.env.UI_ELEMENT_TIMEOUT_MS) : 60000);
    const scope = scopeSelector ? this.page.locator(scopeSelector) : this.page;
    const radio = scope.getByRole("radio", { name: label, exact: true });
    await radio.first().waitFor({ state: "visible", timeout: effectiveTimeout });
    await radio.first().click();
  }
}
