import { Page } from "playwright/test";

export default async function refreshPage(page: Page) {
  await page.reload();
}
