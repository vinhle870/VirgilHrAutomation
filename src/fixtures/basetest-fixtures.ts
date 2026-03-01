import { test as base } from "@playwright/test";
import dotenv from "dotenv";
dotenv.config();
import { ApiClient } from "../utilities/api.client";
import {
  AdminLoginPage,
  AdminHomePage,
  AdminLeftMenu,
  AdminPlanPage,
  YopMailPage,
} from "../ui/pages";
import { ShareFlow } from "../ui/flows";
import { Authentication } from "../api/services/authentication.service";
import { AdminPortalService } from "src/api/services/admin-portal.services";
import { MemberPortalService } from "src/api/services";
import { PartnerPortalService } from "src/api/services/partner-portal.services";

type MyFixtures = {
  dealerAccount: object;
  loginPage: AdminLoginPage;
  homePage: AdminHomePage;
  leftmenu: AdminLeftMenu;
  planPage: AdminPlanPage;

  apiClient: ApiClient;
  authenticationService: Authentication;
  adminPortalService: AdminPortalService;
  memberPortalService: MemberPortalService;
  partnerPortalService: PartnerPortalService;
  api_token: string;
  yopmailPage: YopMailPage;
  accountActivation: ShareFlow;
};

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    const { BASE_URL, ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;

    if (!BASE_URL || !ADMIN_USERNAME || !ADMIN_PASSWORD) {
      throw new Error("Missing environment variables");
    }

    const loginPage = new AdminLoginPage(page);

    await loginPage.loginWithValidAccount(
      BASE_URL,
      ADMIN_USERNAME,
      ADMIN_PASSWORD,
    );

    await use(loginPage);
  },

  homePage: async ({ page }, use) => {
    await use(new AdminHomePage(page));
  },

  leftmenu: async ({ page }, use) => {
    await use(new AdminLeftMenu(page));
  },

  planPage: async ({ page }, use) => {
    await use(new AdminPlanPage(page));
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

  partnerPortalService: async ({ apiClient: api }, use) => {
    const partnerPortalService = new PartnerPortalService(api);
    await use(partnerPortalService);
  },

  yopmailPage: async ({ page }, use) => {
    await use(new YopMailPage(page));
  },

  accountActivation: async ({ page }, use) => {
    await use(new ShareFlow(page));
  },
});

export { expect } from "@playwright/test";
