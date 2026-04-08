import { Page } from "@playwright/test";
import { LocatorHandling } from "../../utilities/locator-handling";
import { DropdownComponent } from "../../utilities/components";

export abstract class BasePage {
  protected readonly page: Page;
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

  protected async getLocatorInIframe(
    iframeSelector: string,
    selector: string,
    timeout?: number,
  ) {
    return LocatorHandling.getLocatorInIframe(
      this.page,
      iframeSelector,
      selector,
      timeout,
    );
  }
}
