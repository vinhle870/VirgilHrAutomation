import { ApiClient } from "src/utilities";
import {
    CREATE_BUSINESS,
    GET_BUSINESS_LIST,
    GET_PARTNER_PAYMENT_PRODUCTS_LIST,
    GET_PARTNER_PLANS_LIST,
    GET_TEAM_MEMBERS_LIST,
    INVITE_MEMBER,
} from "src/api/endpoints/partner-portal.endpoints";
import { CustomerInfo } from "src/objects/customer";
import UserInfo from "src/objects/user-info";
import { TestDataProvider } from "src/test-data";
import { AdminPortalService } from "./admin-portal.services";
import { InviteMemberPayload } from ".";

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
  async createBusiness(partnerId: string,teamName: string,planId: string,assigneeEmails:string[]|undefined,membersList:UserInfo[]|undefined,token: string): Promise<any> { 
    const path = CREATE_BUSINESS.replace(/^\/+/, "");
    const url = `${this.baseUrl}/${path}`;
    
    const requestBody = {
        partnerId,
        teamName,
        planId,
        assignedIds: assigneeEmails??[],
        recipients: membersList??[],
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

  /**
   * GET /Partner/Manage/Payment/products: Get the list of payment products for a partner
   * @param token - The token of the partner
   * @returns The list of payment products for a partner
   */
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

  /**
   * GET /Partner/Manage/Plan: Get the list of plans for a partner
   * @param token - The token of the partner
   * @returns The list of plans for a partner
   */
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

  /**
   * POST Partner/Manage/Partner/Business/Invite: Return 200-OK and correct Response
   * Invite members to a business
   * @param businessId - The ID of the business
   * @param members - The members to invite
   * @param token - The token of the partner
   * @returns The invite member response
   */
  async inviteMember(businessId: string, members: UserInfo[],token: string): Promise<any> {
    const path = INVITE_MEMBER.replace(/^\/+/, "");
    
    const url = `${this.baseUrl}/${path}`;
    
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    
        const requestBody = {
      id:businessId, 
      recipients: [
          ...members.map(member => ({
            ...{
            email: member.email,
            firstName: member.firstName,
            lastName: member.lastName,
            phoneNumber: member.phoneNumber,
            jobTitle: member.jobTitle,
            role: member.role,
            }, 
          ...{isEmailMemberExisted: false, partnerConsumerType: 1}
          })),
      ]
  }   
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
   * GET Partner/Manage/Partner/Business: Return 200-OK and correct Response
   * Get the list of businesses for a partner
   * @param token - The token of the partner
   * @returns The list of businesses for a partner
   */
  async getBusinessList(token: string): Promise<any> {
    const path = GET_BUSINESS_LIST.replace(/^\/+/, "");
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

  /**
   * GET Partner/Manage/Teams/{teamId}/Members: Return 200-OK and correct Response
   * Get the list of members for a team
   * @param teamId - The ID of the team
   * @param token - The token of the partner
   * @returns The list of members for a team
   */
  async getTeamMembersList(teamId: string, token: string): Promise<any> {
    const path = GET_TEAM_MEMBERS_LIST.replace(/^\/+/, "").replaceAll("{teamId}", teamId);
    this.baseUrl = this.baseUrl.replace("v1", "v2");
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
