import { Page } from "@playwright/test";
import { LocatorHandling } from "../../utilities/locator-handling";

export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
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
