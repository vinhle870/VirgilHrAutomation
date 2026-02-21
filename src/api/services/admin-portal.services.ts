import { ApiClient, HTTPMethod } from "src/utilities";
import {
  CREATE_CUSTOMER,
  CREATE_PARTNER,
  GET_CONSUMER_BY_ID,
  GET_PRODUCTTYPEFILTERS,
  SEARCH_PARTNER_BY_TEXT,
  GET_CUSTOMER,
  GET_DEPARTMENT_PLAN,
  GET_DEPARTMENT_PAYMENT_PRODUCT,
  GET_DEPARTMENTS_LIST,
  GET_ALL_DEPARTMENTS_PLANS,
  INVITE_MEMBER_ADMINPORTAL,
} from "src/api/endpoints/admin-portal.endpoints";
import { INVITE_MEMBERS } from "src/api/endpoints/admin-portal.endpoints";
import { Authentication } from "src/api/services/authentication.service";
import { CustomerInfo } from "src/objects/customer";
import { Partner } from "src/objects/ipartner";
import { APIResponse } from "@playwright/test";
import { CREATE_BUSINESS } from "../endpoints/partner-portal.endpoints";
import { InviteMemberPayload } from "./member-portal.services";

export interface RecipientInfo {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  jobTitle: string;
  role: number;
  partnerConsumerType: number;
  consultantRole: number;
}

export interface InviteMemberWithId {
  id: string;
  recipients: RecipientInfo[];
}

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
    token?: string,
  ): Promise<{ total: number; entities: Array<Record<string, any>> }> {
    const query = `SearchString=${encodeURIComponent(partnername)}`;
    const path = SEARCH_PARTNER_BY_TEXT.replace(/^\/+/, "");
    const url = `${this.baseUrl}/${path}?${query}`;

    const headers = token
      ? { Authorization: `Bearer ${token}` }
      : this.authToken
        ? { Authorization: `Bearer ${this.authToken}` }
        : this.apiClient.getAuthToken()
          ? { Authorization: `Bearer ${this.apiClient.getAuthToken()}` }
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

  /**
   * POST /Manage/Consumers: Create a new consumer
   * @param customerInfo - The information of the consumer
   * @returns The response from the API
   */
  async createCustomer(customerInfo: CustomerInfo): Promise<any> {
    const path = CREATE_CUSTOMER.replace(/^\/+/, "");
    const url = `${this.baseUrl}/${path}`;
    const requestBody = {
      ...customerInfo.accountInfo,
      ...customerInfo.company,
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

  /**
   * GET /Manage/Plan/ProductTypeFilter: Get the information of the product type filters
   * @returns The response from the API
   */
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

  /**
   * GET /Manage/Consumers: Get the information of the consumer by id
   * @param id - The id of the consumer
   * @returns The response from the API
   */
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

  /**
   * POST /Partner/Manage/Partner: Create a new partner
   * @param partnerInfo - The information of the partner
   * @returns The response from the API
   */
  async createPartner(partnerInfo: Partner): Promise<any> {
    const path = CREATE_PARTNER.replace(/^\/+/, "");
    const url = `${this.baseUrl}/${path}`;

    const requestBody = {
      ...partnerInfo.partnerInfo,
      ...partnerInfo.accountInfo,
    };

    const headers = this.authToken
      ? { Authorization: `Bearer ${this.authToken}` }
      : undefined;

    const response = await this.apiClient.sendRequest<any>(
      "POST",
      url,
      requestBody,
      200,
      headers,
    );

    return response;
  }

  /**
   * GET /Configuration/Department: Get the information of the department
   * @returns The response from the API
   */
  async getDepartmentsList(): Promise<any> {
    const url = `${this.baseUrl}/${GET_DEPARTMENTS_LIST}`;

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

  /**
   * GET /Manage/Plan/Departments: Get the information of the product types
   * @returns The response from the API
   */
  async getAllDepartmentsPlans(): Promise<any> {
    const url = `${this.baseUrl}/${GET_ALL_DEPARTMENTS_PLANS}`;

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

  //===========================================================================
  /**
   * GET /Manage/CustomerManagement: Get the id of the customer by email
   * @param email - The email of the customer
   * @returns The response from the API
   */
  async getCustomerByEmail(email: string): Promise<any> {
    const path = GET_CUSTOMER.replace(/^\/+/, "");
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

    const response = await this.apiClient.sendRequest<any>(
      "GET",
      url,
      undefined,
      200,
      headers,
      params,
    );

    return response;
  }

  /**
   * GET /Manage/Consumers: Get the role of the customer by id
   * @param id - The id of the customer
   * @returns The response from the API
   */
  async getCustomer(id: string): Promise<any> {
    const path = GET_CUSTOMER.replace(/^\/+/, "");
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

  /**
   * GET /Manage/Plan?DepartmentId=: Get the list of plans for a department
   * @param departmentId - The id of the department
   * @returns The response from the API
   */
  async getDepartmentPlanList(departmentId?: string): Promise<object> {
    const path = GET_DEPARTMENT_PLAN.replace(/^\/+/, "");
    const url = `${this.baseUrl}/${path}${departmentId}`;

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

  public async getDepartmentPaymentProduct(
    departmentID: string,
  ): Promise<object[]> {
    const url = `${this.baseUrl}/${GET_DEPARTMENT_PAYMENT_PRODUCT}${departmentID}`;

    let tokenToUse = this.authToken ?? this.apiClient.getAuthToken();

    const mergedHeaders: Record<string, string> = {
      Authorization: `Bearer ${tokenToUse}`,
      "Content-Type": "application/json",
    };

    const response = await this.apiClient.sendRequest<any>(
      "GET",
      url,
      undefined,
      200,
      mergedHeaders,
    );

    return response;
  }
  public async inviteMembers(member: InviteMemberWithId): Promise<object> {
    const url = `${this.baseUrl}/${INVITE_MEMBER_ADMINPORTAL}`;

    const headers: Record<string, string> = {
      accept: "application/json, text/plain, */*",
      authorization: `Bearer ${this.authToken ?? ""}`,
      "content-type": "application/json",
      origin: "https://admin.qa.virgilhr.com",
      referer: "https://admin.qa.virgilhr.com/",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
    };

    const response = await this.apiClient.sendRequest<object>(
      "POST",
      url,
      member,
      200, // Assuming 200 OK is the expected status code
      headers,
    );
    return response; // Return the checkout plan response
  }
}
