import { Page } from "@playwright/test";
import { LocatorHandling } from "../../utilities/locator-handling";
import { DropdownComponent } from "../../utilities/components";
import { TeamAdditionLocator } from "./admin-portal/locators/partner-management/locator/team-addition";
import { UserInfo } from "src/objects";
import delay from "src/utilities/delay";

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

  public async moveToPage(path: string, page = this.page): Promise<void> {
    await page.locator(`xpath=//a[@href='${path}']`).click();
  }

  public async inviteMembersByEmail(invitedMembers: UserInfo[], page = this.page): Promise<void> {
    let emailEl = page.locator(CommonPortalLocators.emailInput);
    let firstNameElement = page.locator(CommonPortalLocators.firstNameInput);
    let lastNameElement = page.locator(CommonPortalLocators.lastNameInput);
    let phoneNumberElement = page.locator(CommonPortalLocators.phoneNumberInput);
    let jobTitleElement = page.locator(CommonPortalLocators.jobTitleInput);

    const addMoreButtonEl = page.locator(CommonPortalLocators.addMoreButton);

    for (let i = 0; i < invitedMembers?.length; i++) {
      if (i < invitedMembers?.length - 1) await addMoreButtonEl.click();

      await emailEl.nth(i).fill(invitedMembers[i].email!);

      await firstNameElement.nth(i).fill(invitedMembers[i].firstName!);

      await lastNameElement.nth(i).fill(invitedMembers[i].lastName!);

      await phoneNumberElement.nth(i).fill(invitedMembers[i].phoneNumber!);

      await jobTitleElement.nth(i).fill(invitedMembers[i].jobTitle!);

      await this.dropdown.selectByText(TeamAdditionLocator.roleInput, invitedMembers[i].invitedRole!, page);
    }

    await page.locator(CommonPortalLocators.sendInviteButton).click();

    await delay(10000);
  }
}
