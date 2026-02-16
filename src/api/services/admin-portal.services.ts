import { ApiClient, HTTPMethod } from "src/utilities";
import {
  CREATE_CUSTOMER,
  CREATE_PARTNER,
  GET_CONSUMER_BY_ID,
  GET_PRODUCTTYPEFILTERS,
  SEARCH_PARTNER_BY_TEXT,
  SEARCH_CUSTOMER_BY_EMAIL,
  ADMIN_GET_PLANS,
} from "src/api/endpoints/admin-portal.endpoints";
import { Authentication } from "src/api/services/authentication.service";
import { CustomerInfo } from "src/objects/customer";
import { Partner } from "src/objects/ipartner";
import { APIResponse } from "@playwright/test";
import { IInviteMember } from "src/objects/iInviteMember";

export class AdminPortalService {
  private apiClient: ApiClient;
  private baseUrl: string;
  private authToken: string | undefined;
  private authentication?: Authentication;

  constructor(apiClient: ApiClient, authentication?: Authentication) {
    const apiVersion = process.env.API_VERSION ?? "v1";
    this.apiClient = apiClient;
    this.baseUrl =
      this.apiClient.baseURL.replace(/\/+$/, "") + `/${apiVersion}`;
    this.authentication = authentication;
  }

  /**
   * Async factory to create an AdminPortalService and optionally prefetch an auth token.
   */
  public static async create(
    apiClient: ApiClient,
    authentication?: Authentication,
  ): Promise<AdminPortalService> {
    const svc = new AdminPortalService(apiClient, authentication);
    if (authentication) {
      const username = process.env.API_USERNAME ?? process.env.ADMIN_USERNAME;
      const password = process.env.API_PASSWORD ?? process.env.ADMIN_PASSWORD;
      if (username && password) {
        try {
          const t = await authentication.getAuthToken(username, password);
          svc.authToken = t;
        } catch (err) {
          // don't crash on token fetch failure; log for debugging
          // eslint-disable-next-line no-console
          console.warn(
            "AdminPortalService: failed to prefetch auth token",
            err,
          );
        }
      }
    }
    return svc;
  }

  /**
   * Search partners by arbitrary query string. If `token` is provided it will
   * be used; otherwise the service will use the stored token (possibly obtained
   * from the `Authentication` service or previously set).
   */
  async searchPartnerByText(
    partnername: string,
  ): Promise<{ total: number; entities: Array<Record<string, any>> }> {
    const query = `SearchString=${encodeURIComponent(partnername)}`;
    const path = SEARCH_PARTNER_BY_TEXT.replace(/^\/+/, "");
    const url = `${this.baseUrl}/${path}?${query}`;

    let tokenToUse = this.authToken ?? this.apiClient.getAuthToken();

    const headers = tokenToUse
      ? { Authorization: `Bearer ${tokenToUse}` }
      : undefined;

    const response = await this.apiClient.sendRequest<{
      total: number;
      entities: Array<Record<string, any>>;
    }>("GET", url, undefined, 200, headers);

    return response; // Return the partner data
  }

  /**
   * Convenience helper: search by text and return the partnerId and departmentId
   * from the first matched entity (if any).
   */
  async searchPartner(
    partnername: string,
    token?: string,
  ): Promise<{
    partnerId?: string;
    departmentId?: string;
    subDomain?: string;
  }> {
    const path = SEARCH_PARTNER_BY_TEXT.replace(/^\/+/, "");
    const query = `SearchString=${encodeURIComponent(partnername)}`;
    const url = `${this.baseUrl}/${path}?${query}`;

    // Determine token to use: parameter > stored > apiClient
    const tokenToUse = token ?? this.authToken ?? this.apiClient.getAuthToken();
    const headers = tokenToUse
      ? { Authorization: `Bearer ${tokenToUse}` }
      : undefined;

    const resp = await this.apiClient.sendRequest<{
      total: number;
      entities: Array<Record<string, any>>;
    }>("GET", url, undefined, 200, headers);

    if (resp && Array.isArray(resp.entities) && resp.entities.length > 0) {
      const first = resp.entities[0];
      return {
        partnerId: first["id"] ?? undefined,
        departmentId: first["departmentId"] ?? undefined,
        subDomain: first["subDomain"] ?? undefined,
      };
    }

    return {};
  }

  async createCustomer(customerInfo: CustomerInfo): Promise<any> {
    const path = CREATE_CUSTOMER.replace(/^\/+/, "");
    const url = `${this.baseUrl}/${path}`;
    const requestBody = {
      ...customerInfo.getAccountInfo(),
      ...customerInfo.getCompany(),
    };
    const headers = this.authToken
      ? { Authorization: `Bearer ${this.authToken}` }
      : undefined;

    const response = await this.apiClient.sendRequest<any>(
      "POST",
      url,
      requestBody,
      201,
      headers,
    );

    return response;
  }

  async getProductTypeFilters(): Promise<any> {
    const path = GET_PRODUCTTYPEFILTERS.replace(/^\/+/, "");
    const url = `${this.baseUrl}/${path}`;
    const headers = this.authToken
      ? { Authorization: `Bearer ${this.authToken}` }
      : undefined;
    const response = await this.apiClient.sendRequest<any>(
      "GET",
      url,
      undefined,
      200,
      headers,
    );
    return response;
  }

  async getConsumerById(id: string): Promise<any> {
    const path = GET_CONSUMER_BY_ID.replace(/^\/+/, "");
    const url = `${this.baseUrl}/${path}/${id}`;
    const headers = this.authToken
      ? { Authorization: `Bearer ${this.authToken}` }
      : undefined;
    const response = await this.apiClient.sendRequest<any>(
      "GET",
      url,
      undefined,
      200,
      headers,
    );
    return response;
  }

  async createPartner(partnerInfo: Partner): Promise<any> {
    const path = CREATE_PARTNER.replace(/^\/+/, "");
    const url = `${this.baseUrl}/${path}`;

    const requestBody = {
      ...partnerInfo.getIPartnerInfo(),
      ...partnerInfo.getAccountInfo(),
    };

    const headers = this.authToken
      ? { Authorization: `Bearer ${this.authToken}` }
      : undefined;

    const response = await this.apiClient.sendPartnerRequest<any>(
      "POST",
      url,
      requestBody,
      200,
      headers,
    );

    return response;
  }

  async getDepartmentInfo(): Promise<any> {
    const url = "https://api.qa.virgilhr.com/v1/Configuration/Department";

    const headers = this.authToken
      ? { Authorization: `Bearer ${this.authToken}` }
      : undefined;

    const response = await this.apiClient.sendToGetDepartmentInfor<any>(
      "GET",
      url,
      200,
      headers,
    );

    return response;
  }

  async getProductTypes(): Promise<any> {
    const url = `https://api.qa.virgilhr.com/v1/Manage/Plan/Departments`;

    const headers = this.authToken
      ? { Authorization: `Bearer ${this.authToken}` }
      : undefined;

    const response = await this.apiClient.sendToGetProductTypes<any>(
      "GET",
      url,
      200,
      headers,
    );

    return response;
  }

  async getCustomerIdByEmail(email: string): Promise<any> {
    const path = SEARCH_CUSTOMER_BY_EMAIL.replace(/^\/+/, "");
    const url = `${this.baseUrl}/${path}`;

    const headers = this.authToken
      ? { Authorization: `Bearer ${this.authToken}` }
      : undefined;

    const params = {
      AccountStatus: "",
      AccountType: "",
      BillingCycle: "",
      DepartmentId: "",
      Length: 12,
      OrderBy: "updatedAt desc",
      PartnerId: "",
      PartnerLevel: "",
      PaymentStatus: "",
      Search: email,
      SearchString: "",
      Source: "",
      Start: 0,
      StripeProductId: "",
      UserType: "",
    };

    const response = await this.apiClient.sendRequestToGetCusomterId<any>(
      "GET",
      url,
      200,
      headers,
      params,
    );

    return response;
  }

  async getRoleOfCustomer(id: string): Promise<any> {
    const path = SEARCH_CUSTOMER_BY_EMAIL.replace(/^\/+/, "");
    const url = `${this.baseUrl}/${path}/${id}`;

    const headers = this.authToken
      ? { Authorization: `Bearer ${this.authToken}` }
      : undefined;

    const response = await this.apiClient.sendRequestToGetCustomerRole<any>(
      "GET",
      url,
      200,
      headers,
    );

    return response;
  }

  async getPlan(
    apiClient: ApiClient,
    nameOfPlan: string,
    departmentId?: string,
  ): Promise<object> {
    const path = ADMIN_GET_PLANS.replace(/^\/+/, "");
    const url = `${this.baseUrl}/${path}${departmentId}`;

    const headers = this.authToken
      ? { Authorization: `Bearer ${this.authToken}` }
      : undefined;

    const response = await this.sendRequestToGetPlans<any>(
      nameOfPlan,
      url,
      apiClient,
      200,
      headers,
    );

    return response;
  }

  private async sendRequestToGetPlans<T>(
    nameOfPlan: string,
    url: string,
    apiClient: ApiClient,
    expectedStatus = 200,
    headers?: Record<string, string>,
  ): Promise<{ status: number; body: T }> {
    const fullUrl = url.startsWith("http") ? url : `${this.baseUrl}/${url}`;

    const mergedHeaders: Record<string, string> = {
      ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}),
    };

    const requestOptions: any = { headers: mergedHeaders };

    const response: APIResponse = await apiClient
      .getApiContext()
      .get(fullUrl, requestOptions);

    const status = response.status();
    if (status !== expectedStatus) {
      throw new Error(
        `Expected ${expectedStatus}, got ${status}. Body: ${await response.text()}`,
      );
    }

    const contentType = response.headers()["content-type"] || "";
    const rawBody =
      contentType.includes("application/json") && status !== 204
        ? await response.json()
        : await response.text();

    let filteredBody: any = rawBody;
    if (Array.isArray(rawBody)) {
      filteredBody = rawBody.find((plan: any) => plan.name === nameOfPlan);
      if (!filteredBody) {
        throw new Error(`Plan with name "${nameOfPlan}" not found`);
      }
    }

    return { status, body: filteredBody as T };
  }

  public async createBussiness(
    teamName: string,
    partnerId: string,
    planId: string,
    token: string,
  ): Promise<any> {
    const url = `https://api.qa.virgilhr.com/v1/Partner/Manage/Partner/Business`;

    const response = await this.sendRequestToCreateBusiness(
      teamName,
      partnerId,
      planId,
      url,
      token,
    );

    return response;
  }

  private async sendRequestToCreateBusiness(
    teamName: string,
    partnerId: string,
    planId: string,
    url: string,
    token: string,
    expectedStatus = 200,
  ): Promise<any> {
    const fullUrl = url.startsWith("http") ? url : `${this.baseUrl}/${url}`;

    const mergedHeaders: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };

    const requestOptions: any = { headers: mergedHeaders };
    requestOptions.data = {
      request: {},
      teamName,
      partnerId,
      assignedIds: [],
      recipients: [],
      useCredit: true,
    };

    const response: APIResponse = await this.apiClient
      .getApiContext()
      .post(fullUrl, requestOptions);

    const status = response.status();
    if (status !== expectedStatus) {
      throw new Error(
        `Expected ${expectedStatus}, got ${status}. Body: ${await response.text()}`,
      );
    }

    const contentType = response.headers()["content-type"] || "";
    const rawBody =
      contentType.includes("application/json") && status !== 204
        ? await response.json()
        : await response.text();

    let filteredBody: any = rawBody;
    if (Array.isArray(rawBody)) {
      filteredBody = rawBody.find((plan: any) => plan.id === planId);
      if (!filteredBody) {
        throw new Error(`Plan with name "${planId}" not found`);
      }
    }

    return { status, body: filteredBody };
  }

  public async inviteMembers(invitedMember: IInviteMember): Promise<boolean> {
    const url = `https://api.qa.virgilhr.com/v1/Manage/Organization/Partner/Invite`;

    const response = await this.sendRequestToInviteMembers(url, invitedMember);

    return response;
  }

  private async sendRequestToInviteMembers(
    url: string,
    invitedMember: IInviteMember,
    expectedStatus = 200,
  ): Promise<boolean> {
    const fullUrl = url.startsWith("http") ? url : `${this.baseUrl}/${url}`;

    let tokenToUse = this.authToken ?? this.apiClient.getAuthToken();
    if (!tokenToUse || tokenToUse === "undefined") {
      throw new Error("Auth token is missing or invalid");
    }

    const mergedHeaders: Record<string, string> = {
      accept: "application/json, text/plain, */*",
      authorization: `Bearer ${tokenToUse}`,
      "content-type": "application/json",
      origin: "https://admin.qa.virgilhr.com",
      referer: "https://admin.qa.virgilhr.com/",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
    };

    const response = await this.apiClient.getApiContext().post(fullUrl, {
      headers: mergedHeaders,
      data: invitedMember,
    });

    const status = response.status();
    if (status !== expectedStatus) {
      throw new Error(
        `Expected ${expectedStatus}, got ${status}. Body: ${await response.text()}`,
      );
    }

    const body = await response.json();
    return body === true;
  }
}

/***
 * SAMPLE API RESPONSE
 * {
    "total": 1,
    "entities": [
        {
            "partnerName": null,
            "departmentName": "VirgilHR",
            "name": "VinhPartner01",
            "apiEnable": false,
            "apiId": "HMHA-5QJT-JQU2-QFVW-AUSE-YDPV-2GAQ-ZWJ4",
            "apiSecret": "vb8M7ebjr&ytF2i3^@gp4D6nXVWqGpSr",
            "paymentEnable": true,
            "isPublic": true,
            "restriction": {
                "eSignEnable": true,
                "productSupport": true,
                "resourceRequest": true,
                "contactExpert": true,
                "ssoEnable": true,
                "lmsEnable": true,
                "hrToolsEnable": true,
                "feFilterProductTypes": [
                    19,
                    15,
                    16,
                    2,
                    4,
                    6
                ],
                "productTypes": [
                    19,
                    1,
                    17,
                    3,
                    5,
                    6,
                    19,
                    15,
                    16,
                    2,
                    4,
                    6
                ]
            },
            "externalConfig": {
                "pendoApiKey": null
            },
            "level": 0,
            "email": "VinhPartner01@yopmail.com",
            "firstName": "VinhP",
            "lastName": "Le",
            "phoneNumber": "9288383333",
            "jobTitle": "Test",
            "partnerId": null,
            "whoPay": 0,
            "bankTransfer": null,
            "billingCycle": null,
            "companyType": 1,
            "planId": null,
            "planRestriction": null,
            "consultantRestriction": {
                "customBranding": true
            },
            "backUrl": null,
            "backText": null,
            "isActive": true,
            "assignedIds": [],
            "allowAssignOnMember": null,
            "country": null,
            "state": null,
            "subDomain": "vinhpartner01",
            "normalizedSubDomain": "VINHPARTNER01",
            "convertFromConsumer": false,
            "departmentId": "6886e0e940323d31fb74bd20",
            "source": "virgilhr",
            "externalPartnerId": null,
            "isSso": false,
            "canCustomUpdatePlan": false,
            "version": 0,
            "createdAt": "2025-11-17T15:48:37.309Z",
            "updatedAt": "2025-11-17T15:48:37.309Z",
            "createdBy": null,
            "updatedBy": null,
            "isDeleted": false,
            "id": "691b43d63732af5f6c74d2c7"
        }
    ]
}
 */
