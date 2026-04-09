import { test as base } from "@playwright/test";
import { ApiClient } from "../utilities/api.client";
import { LoginPage } from "../ui/pages/login-page";
import { HomePage } from "../ui/pages/home-page";
import dotenv from "dotenv";
dotenv.config();
import { LeftMenu } from "../ui/pages/leftmenu";
import { Authentication } from "../api/services/authentication.service";
import { AdminPortalService } from "src/api/services/admin-portal.services";
import { MemberPortalService } from "src/api/services";
import { PlanPage } from "src/ui/pages/plan-page";

// Declare the types of your fixtures.
type MyFixtures = {
  dealerAccount: object;
  loginPage: LoginPage;
  homePage: HomePage;
  leftmenu: LeftMenu;
  planPage: PlanPage;

  apiClient: ApiClient;
  authenticationService: Authentication;
  adminPortalService: AdminPortalService;
  memberPortalService: MemberPortalService;
  api_token: string;
};

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    // Use the fixture value in the test.

    const { BASE_URL, ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;

    if (!BASE_URL || !ADMIN_USERNAME || !ADMIN_PASSWORD) {
      throw new Error("Missing environment variables");
    }

    const loginPage = new LoginPage(page);

    await loginPage.loginWithValidAccount(
      BASE_URL,
      ADMIN_USERNAME,
      ADMIN_PASSWORD,
    );

    await use(loginPage);
  },

  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  leftmenu: async ({ page }, use) => {
    await use(new LeftMenu(page));
  },

  planPage: async ({ page }, use) => {
    await use(new PlanPage(page));
  },

  apiClient: async ({}, use) => {
    const baseURL = process.env.API_BASE_URL ?? process.env.BASE_URL;
    const token = process.env.API_TOKEN;

    if (!baseURL) {
      throw new Error(
        "Missing API_BASE_URL or BASE_URL environment variable for API fixture",
      );
    }

    const apiClient = await ApiClient.create(baseURL, token);
    await use(apiClient);
  },

  authenticationService: async ({ apiClient: api }, use) => {
    const authenticationService = new Authentication(api);
    await use(authenticationService);
  },

  adminPortalService: async (
    { apiClient: api, authenticationService: auth },
    use,
  ) => {
    const adminPortalService = await AdminPortalService.create(api, auth);
    await use(adminPortalService);
  },

  memberPortalService: async ({ apiClient: api }, use) => {
    const memberPortalService = new MemberPortalService(api);
    await use(memberPortalService);
  },
});

export { expect } from "@playwright/test";
