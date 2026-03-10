import { chromium, Browser, BrowserContext, Page } from "@playwright/test";

export class PlaywrightManager {
  private browser!: Browser;
  private context!: BrowserContext;

  async init() {
    this.browser = await chromium.launch({ headless: false });
    this.context = await this.browser.newContext();
  }

  async newPage(): Promise<Page> {
    if (!this.context) {
      throw new Error("PlaywrightManager not initialized. Call init() first.");
    }
    return await this.context.newPage();
  }

  async close() {
    await this.context?.close();
    await this.browser?.close();
  }
}
