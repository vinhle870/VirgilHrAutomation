import { test as base } from "@playwright/test";
import { AdminHomePage, AdminLeftMenu, BuyPlanPage, LoginPage, EmailServicePage } from "../ui/pages";
import { PartnerManagementPage } from "src/ui/pages/admin-portal/partner-management-page";
import { CustomerManagementPage } from "src/ui/pages/admin-portal/customer-management-page";
import { PartnerPage } from "src/ui/pages/partner-portal/partner-page";
import { HomePage } from "src/ui/pages/shared-pages/home.page";

type PageFixtures = {
  homePage: AdminHomePage;
  leftmenu: AdminLeftMenu;
  buyPlanPage: BuyPlanPage;
  loginPage: LoginPage;
  partnerManagementPage: PartnerManagementPage;
  customerManagementPage: CustomerManagementPage;
  partnerPage: PartnerPage;
  homeExceptAdminPage: HomePage;
  mailboxFallback: void;
};

export const test = base.extend<PageFixtures>({
  homePage: async ({ page }, use) => {
    await use(new AdminHomePage(page));
  },

  leftmenu: async ({ page }, use) => {
    await use(new AdminLeftMenu(page));
  },

  buyPlanPage: async ({ page }, use) => {
    await use(new BuyPlanPage(page));
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
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

  homeExceptAdminPage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  mailboxFallback: [
    async ({}, use, testInfo) => {
      const originalUrl = process.env.MAILBOX_URL;
      if (testInfo.retry > 0 && originalUrl?.includes("yopmail")) process.env.MAILBOX_URL = "https://beeinbox.com/";

      await use();
      process.env.MAILBOX_URL = originalUrl ?? "";
    },
    { auto: true },
  ],
});
