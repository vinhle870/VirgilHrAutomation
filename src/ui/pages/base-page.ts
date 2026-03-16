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

  /**
   * Open a dropdown and click a child option within its DOM subtree.
   * Works for custom dropdowns where options are descendants of the container.
   */
  protected async selectDropdownOption(
    dropdownSelector: string,
    optionSelector: string,
    timeout?: number,
  ) {
    return LocatorHandling.selectDropdownOption(
      this.page,
      dropdownSelector,
      optionSelector,
      timeout,
    );
  }

  /**
   * Open a dropdown and select an option by its visible text.
   * Supports portals/overlays where options may not be children of the dropdown.
   */
  protected async selectDropdownOptionByText(
    dropdownSelector: string,
    optionText: string,
    isLastElement?: boolean,
    optionListSelector?: string,
    timeout?: number,
  ) {
    return LocatorHandling.selectDropdownOptionByText(
      this.page,
      dropdownSelector,
      optionText,
      isLastElement,
      optionListSelector,
      timeout,
    );
  }

  protected async selectRadio(
    radioText: string,
    radioSelector?: string,
    timeout?: number,
  ) {
    await LocatorHandling.selectRadio(
      this.page,
      radioText,
      radioSelector,
      timeout,
    );
  }
}
