import { Locator, Page } from "@playwright/test";
import { BasePage } from "../base-page";

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  public getHomeTitle = async (): Promise<Locator> => {
    const homeLocator = this.page.getByRole("heading", { level: 2, name: "Home" }).first();
    await homeLocator.waitFor({ state: "visible", timeout: 30000 });
    return homeLocator;
  };
}
