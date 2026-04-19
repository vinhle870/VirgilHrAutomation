import { test as base } from "@playwright/test";
import dotenv from "dotenv";
dotenv.config();
import { ApiClient } from "../utilities/api.client";
import { AdminHomePage, AdminLeftMenu, BuyPlanPage, LoginPage } from "../ui/pages";
import { AuthFlow, OnboardingFlow, PurchaseFlow } from "../ui/flows";
import { Authentication } from "../api/services/authentication.service";
import { AdminPortalService } from "src/api/services/admin-portal.services";
import { MemberPortalService } from "src/api/services";
import { PartnerPortalService } from "src/api/services/partner-portal.services";
import { TempEmailFreePage } from "../ui/pages";
import { LoginAdminPage } from "src/ui/pages/admin-portal/login.page";
import { PartnerManagementPage } from "src/ui/pages/admin-portal/partner-management";

import { PartnerIntegrationService } from "src/api/services/partner-integration.service";
import { CustomerManagementPage } from "src/ui/pages/admin-portal/customer-management";
import { PartnerPage } from "src/ui/pages/partner-portal/partner-page";
type MyFixtures = {
  adminLoggedIn: void;
  homePage: AdminHomePage;
  leftmenu: AdminLeftMenu;

  authFlow: AuthFlow;
  onboardingFlow: OnboardingFlow;
  purchaseFlow: PurchaseFlow;

  apiClient: ApiClient;
  authenticationService: Authentication;
  adminPortalService: AdminPortalService;
  memberPortalService: MemberPortalService;
  partnerPortalService: PartnerPortalService;

  tempEmailFreePage: TempEmailFreePage;
  partnerIntegrationService: PartnerIntegrationService;

  loginAdminPage: LoginAdminPage;
  partnerManagementPage: PartnerManagementPage;
  customerManagementPage: CustomerManagementPage;

  partnerPage: PartnerPage;

  loginPage: LoginPage;
};

export const test = base.extend<MyFixtures>({
  authFlow: async ({ page }, use) => {
    await use(new AuthFlow(page));
  },

  onboardingFlow: async ({ page }, use) => {
    await use(new OnboardingFlow(page));
  },

  purchaseFlow: async ({ page }, use) => {
    await use(new PurchaseFlow(page));
  },

  adminLoggedIn: async ({ authFlow }, use) => {
    const { BASE_URL, ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;

    if (!BASE_URL || !ADMIN_USERNAME || !ADMIN_PASSWORD) {
      throw new Error("Missing environment variables");
    }

    await authFlow.loginWithValidAccount(BASE_URL, ADMIN_USERNAME, ADMIN_PASSWORD);

    await use();
  },

  homePage: async ({ page }, use) => {
    await use(new AdminHomePage(page));
  },

  leftmenu: async ({ page }, use) => {
    await use(new AdminLeftMenu(page));
  },

  apiClient: async ({}, use) => {
    const baseURL = process.env.API_BASE_URL ?? process.env.BASE_URL;
    const token = process.env.API_TOKEN;

    if (!baseURL) {
      throw new Error("Missing API_BASE_URL or BASE_URL environment variable for API fixture");
    }

    const apiClient = await ApiClient.create(baseURL, token);
    await use(apiClient);
  },

  authenticationService: async ({ apiClient: api }, use) => {
    const authenticationService = new Authentication(api);
    await use(authenticationService);
  },

  adminPortalService: async ({ apiClient: api, authenticationService: auth }, use) => {
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

  tempEmailFreePage: async ({ page }, use) => {
    const tempEmailFreePage = new TempEmailFreePage(page);

    await use(tempEmailFreePage);
  },
  partnerIntegrationService: async ({ apiClient: api }, use) => {
    const partnerIntegrationService = new PartnerIntegrationService(api);
    await use(partnerIntegrationService);
  },

  loginAdminPage: async ({ page }, use) => {
    await use(new LoginAdminPage(page));
  },
  partnerManagementPage: async ({ page }, use) => {
    await use(new PartnerManagementPage(page));
  },
  customerManagementPage: async ({ page }, use) => {
    await use(new CustomerManagementPage(page));
  },

  partnerPage: async ({ page }, use) => {
    await use(new PartnerPage(page));
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});

export { expect } from "@playwright/test";
