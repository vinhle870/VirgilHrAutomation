import { ApiClient } from "src/utilities";
import {
  CHECK_OUT_PLAN,
  GET_CURRENT_SUBSCRIBED_PLAN,
  GET_PAYMENT_STATUS,
  GET_PAYMENT_PRODUCTS,
  GET_PAYMENT_SUBSCRIPTION,
  SIGN_UP_CONSUMER,
  MEMBER_LOGIN,
  INVITE_MEMBER,
} from "src/api/endpoints/member-portal.endpoints";
import { CustomerInfo } from "src/objects/customer";
import UserInfo from "src/objects/user-info";

/**
 * Payload for inviting members to a team.
 * Matches API schema: `{ recipients: [{ email, firstName, ... }] }`
 */
export interface InviteMemberPayload {
  recipients: Pick<
    UserInfo,
    "email" | "firstName" | "lastName" | "phoneNumber" | "jobTitle" | "role"
  >[];
}

export class MemberPortalService {
  private apiClient: ApiClient;
  private baseUrl: string;

  constructor(apiClient: ApiClient) {
    const apiVersion = process.env.API_VERSION ?? "v1";
    this.apiClient = apiClient;
    this.baseUrl = this.apiClient.baseURL + `/${apiVersion}`;
  }

  /***
   * Sign up a new user on Member Portal with the provided data
   */
  async signUpConsumer(
    consumerData: CustomerInfo,
  ): Promise<string | Record<string, any>> {
    const baseurl = this.baseUrl;
    const url = `${baseurl}${SIGN_UP_CONSUMER}`;
    const requestBody = {
      ...consumerData.accountInfo,
      ...consumerData.company,
    };
    const response = await this.apiClient.sendRequest<
      string | Record<string, any>
    >(
      "POST",
      url,
      requestBody,
      201, // Assuming 201 Created is the expected status code
    );
    return response; // Return the created consumer ID. E.g: 692bf9ec8600289c1af50f91
  }

  async checkOutPlan(productType: string, token?: string): Promise<object> {
    const baseurl = this.baseUrl;
    const paramters = `productType=${productType}`;

    const url = `${baseurl}/${CHECK_OUT_PLAN}${paramters}`;

    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    const response = await this.apiClient.sendRequest<object>(
      "GET",
      url,
      undefined,
      200, // Assuming 200 OK is the expected status code
      headers,
    );
    return response; // Return the checkout plan response
  }

  /*
            async previewPaymentChange(productType: string, token?:string): Promise<object> {

            const baseurl= this.baseUrl;
            const paramters = `productType=${productType}`;

            const url = `${baseurl}/${GET_PLAN}${paramters}`;

            const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

            const response = await this.apiClient.sendRequest<object>(
                'GET',
                url,
                undefined,
                200, // Assuming 200 OK is the expected status code
                headers
            );
            return response; // Return the checkout plan response
        }

    */

  async getCurrentSubscribedPlan(token?: string): Promise<object> {
    const baseurl = this.baseUrl;

    const url = `${baseurl}/${GET_CURRENT_SUBSCRIBED_PLAN}`;

    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    const response = await this.apiClient.sendRequest<object>(
      "GET",
      url,
      undefined,
      200, // Assuming 200 OK is the expected status code
      headers,
    );
    return response; // Return the plans list response
  }

  async getPlansList(departmentId: string, token?: string): Promise<object> {
    const baseurl = this.baseUrl;
    const paramters = `departmentId=${departmentId}`;
    const url = `${baseurl}/${GET_PAYMENT_PRODUCTS}${paramters}`;

    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    const response = await this.apiClient.sendRequest<object>(
      "GET",
      url,
      undefined,
      200, // Assuming 200 OK is the expected status code
      headers,
    );
    return response; // Return the checkout plan response
  }

  async checkPaymentStatus(guid: string, token?: string): Promise<object> {
    //const paramters = `guid=${guid}`;
    let temp_url = GET_PAYMENT_STATUS;
    temp_url = temp_url.replace("${guid}", guid);
    const url = `${this.baseUrl}/${temp_url}`;

    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    const response = await this.apiClient.sendRequest<object>(
      "GET",
      url,
      undefined,
      200, // Assuming 200 OK is the expected status code
      headers,
    );
    return response; // Return the checkout plan response
  }


  /**
   * Invite a member to a team from Admin Portal
   * @param token - The token to authenticate the request
   * @param member - The member to invite
   * @param name - The name of the team
   * @returns The invite member response
   */
  public async inviteMember(
    token: string,
    member: InviteMemberPayload,
  ): Promise<object> {
    const url = `${this.baseUrl}/${INVITE_MEMBER}`;
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    const response = await this.apiClient.sendRequest<object>(
      "POST",
      url,
      member,
      200, // Assuming 200 OK is the expected status code
      headers,
    );
    return response; // Return the checkout plan response
  }

  /**
   * Get payment subscription details after buying a plan
   * @param token - The token to authenticate the request
   * @returns The payment subscription details
   */
  async getPaymentSubscription<T>(token: string): Promise<T> {
    const url = `${this.baseUrl}${GET_PAYMENT_SUBSCRIPTION}`;

    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    return (await this.apiClient.sendRequest<object>(
      "GET",
      url,
      undefined,
      200, // Assuming 200 OK is the expected status code
      headers,
    )) as T;
  }
}
