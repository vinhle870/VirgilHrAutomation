import { Page } from "@playwright/test";
import { LoginPage } from "../pages";

export class AuthFlow {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async loginWithValidAccount(
    url: string,
    username: string,
    password: string,
  ) {
    await new LoginPage(this.page).fillLoginForm(url, username, password);
  }
}
