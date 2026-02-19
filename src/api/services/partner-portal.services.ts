import { ApiClient } from "src/utilities";
import {
    CREATE_BUSINESS,
    GET_PARTNER_PAYMENT_PRODUCTS_LIST,
    GET_PARTNER_PLANS_LIST,
} from "src/api/endpoints/partner-portal.endpoints";
import { CustomerInfo } from "src/objects/customer";
import UserInfo from "src/objects/user-info";
import { TestDataProvider } from "src/test-data";
import { AdminPortalService } from "./admin-portal.services";

/**
 * Payload for inviting members to a team.
 * Matches API schema: `{ recipients: [{ email, firstName, ... }] }`
 */


export class PartnerPortalService {
  private apiClient: ApiClient;
  private baseUrl: string;

  constructor(apiClient: ApiClient) {
    const apiVersion = process.env.API_VERSION ?? "v1";
    this.apiClient = apiClient;
    this.baseUrl = this.apiClient.baseURL + `/${apiVersion}`;
  }

  /**
   * POST /Partner/Manage/Partner/Business: Return 200-OK and correct Response
   * Create a new business for a partner
   * @param partnerId - The ID of the partner
   * @param teamName - The name of the team
   * @param planId - The ID of the plan
   * @param assigneeEmails - The emails of the assignees
   * @param membersEmails - The emails of the members
   * @param token - The token of the partner
   */
  async createBusiness(partnerId: string,teamName: string,planId: string,assigneeEmails:string[]|undefined,membersEmails:string[]|undefined,token: string): Promise<any> { 
    const path = CREATE_BUSINESS.replace(/^\/+/, "");
    const url = `${this.baseUrl}/${path}`;
    
    const requestBody = {
        partnerId,
        teamName,
        planId,
        assignedIds: assigneeEmails??[],
        recipients: membersEmails??[],
        useCredit: true,
    };
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    const response = await this.apiClient.sendRequest<any>(
      "POST",
      url,
      requestBody,
      200,
      headers,
    );

    return response;
  }
  async getPartnerPaymentProductsList(token: string): Promise<any> {
    const path = GET_PARTNER_PAYMENT_PRODUCTS_LIST.replace(/^\/+/, "");
    const url = `${this.baseUrl}/${path}`;
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const response = await this.apiClient.sendRequest<any>(
      "GET",
      url,
      undefined,
      200,
      headers,
    );
    return response;
  }

  async getPartnerPlansList(token: string): Promise<any> {
    const path = GET_PARTNER_PLANS_LIST.replace(/^\/+/, "");
    const url = `${this.baseUrl}/${path}`;
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const response = await this.apiClient.sendRequest<any>(
      "GET",
      url,
      undefined,
      200,
      headers,
    );
    return response;
  }
}
