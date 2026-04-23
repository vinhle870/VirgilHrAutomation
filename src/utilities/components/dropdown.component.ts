import { BaseComponent } from "./base-component";

/**
 * Reusable helper for custom dropdown interactions.
 * Accessed in any page object via `this.dropdown`.
 */
export class DropdownComponent extends BaseComponent {
  /**
   * Open a dropdown and click a child option within its DOM subtree.
   * Use when the option list is rendered as a descendant of the dropdown container.
   *
   * @param dropdownSelector  selector for the dropdown trigger/container
   * @param optionSelector    selector for the option **relative to the dropdown**
   * @param timeout           optional timeout in ms
   */
  async selectOption(dropdownSelector: string, optionSelector: string, timeout?: number): Promise<void> {
    const effectiveTimeout = this.getEffectiveTimeout(timeout);
    await this.waitForNetworkSettled(effectiveTimeout);

    const dropdown = this.page.locator(dropdownSelector);
    await this.waitAndClick(dropdown, effectiveTimeout);

    const option = dropdown.locator(optionSelector);
    await this.waitAndClick(option, effectiveTimeout);
  }

  /**
   * Open a dropdown and select an option by its visible text.
   * Supports portals/overlays where options may not be children of the dropdown.
   *
   * @param dropdownSelector    selector for the dropdown trigger/container
   * @param optionText          visible text of the option to select
   * @param optionListSelector  optional selector scoping where options appear
   * @param timeout             optional timeout in ms
   */
  async selectByText(dropdownSelector: string, optionText: string, page = this.page, optionListSelector?: string, timeout = 60000): Promise<void> {
    const effectiveTimeout = this.getEffectiveTimeout(timeout);
    await this.waitForNetworkSettled(effectiveTimeout);

    const dropdown = page.locator(dropdownSelector);
    await this.waitAndClick(dropdown, effectiveTimeout);

    const scope = optionListSelector ? page.locator(optionListSelector) : page;
    const option = scope.getByText(optionText, { exact: true });
    await this.waitAndClick(option, effectiveTimeout);
  }

  /**
   * Same as {@link selectByText}, but when several dropdowns share one selector,
   * opens the instance at `dropdownIndex` (0-based).
   */
  async selectByTextForNthDropdown(dropdownSelector: string, optionText: string, dropdownIndex: number, optionListSelector?: string, timeout?: number): Promise<void> {
    const effectiveTimeout = this.getEffectiveTimeout(timeout);
    await this.waitForNetworkSettled(effectiveTimeout);

    const dropdown = this.page.locator(dropdownSelector).nth(dropdownIndex);
    await dropdown.waitFor({ state: "visible", timeout: effectiveTimeout });
    await dropdown.click();

    const scope = optionListSelector ? this.page.locator(optionListSelector) : this.page;
    const option = scope.getByText(optionText, { exact: true });
    await this.waitAndClick(option, effectiveTimeout);
  }
}
