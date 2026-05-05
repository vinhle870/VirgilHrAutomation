import { test as base } from "@playwright/test";
import { AdminHomePage, AdminLeftMenu, BuyPlanPage, LoginPage, TempEmailFreePage } from "../ui/pages";
import { PartnerManagementPage } from "src/ui/pages/admin-portal/partner-management-page";
import { CustomerManagementPage } from "src/ui/pages/admin-portal/customer-management-page";
import { PartnerPage } from "src/ui/pages/partner-portal/partner-page";

type PageFixtures = {
  homePage: AdminHomePage;
  leftmenu: AdminLeftMenu;
  buyPlanPage: BuyPlanPage;
  loginPage: LoginPage;
  tempEmailFreePage: TempEmailFreePage;
  partnerManagementPage: PartnerManagementPage;
  customerManagementPage: CustomerManagementPage;
  partnerPage: PartnerPage;
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

  tempEmailFreePage: async ({ page }, use) => {
    await use(new TempEmailFreePage(page));
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
});
