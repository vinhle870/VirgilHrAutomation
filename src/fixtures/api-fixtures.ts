import { test as base } from "@playwright/test";
import { ApiClient } from "../utilities/api.client";
import { Authentication } from "../api/services/authentication.service";
import { AdminPortalService } from "src/api/services/admin-portal.services";
import { MemberPortalService } from "src/api/services";
import { PartnerPortalService } from "src/api/services/partner-portal.services";
import { PartnerIntegrationService } from "src/api/services/partner-integration.service";

type ApiFixtures = {
  apiClient: ApiClient;
  authenticationService: Authentication;
  adminPortalService: AdminPortalService;
  memberPortalService: MemberPortalService;
  partnerPortalService: PartnerPortalService;
  partnerIntegrationService: PartnerIntegrationService;
};

export const test = base.extend<ApiFixtures>({
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
    await use(new Authentication(api));
  },

  adminPortalService: async ({ apiClient: api, authenticationService: auth }, use) => {
    await use(await AdminPortalService.create(api, auth));
  },

  memberPortalService: async ({ apiClient: api }, use) => {
    await use(new MemberPortalService(api));
  },

  partnerPortalService: async ({ apiClient: api }, use) => {
    await use(new PartnerPortalService(api));
  },

  partnerIntegrationService: async ({ apiClient: api }, use) => {
    await use(new PartnerIntegrationService(api));
  },
});
