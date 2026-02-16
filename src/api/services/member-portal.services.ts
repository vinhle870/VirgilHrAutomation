import { ApiClient } from "src/utilities";
import {
  CHECK_OUT_PLAN,
  GET_CURRENT_SUBSCRIBED_PLAN,
  GET_PAYMENTSTATUS,
  MEMBER_GET_PLANS,
  GET_PAYMENT_SUBSCRIPTION,
  SIGN_UP_CONSUMER,
  GET_DEPARTMENTS,
  MEMBER_LOGIN,
} from "src/api/endpoints/member-portal.endpoints";
import { MembPortalCustomer } from "src/objects/customer";
import { ApiLoginResponse } from "src/objects/responselogin";
import { APIResponse } from "@playwright/test";

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
    consumerData: MembPortalCustomer,
  ): Promise<string | Record<string, any>> {
    const baseurl = this.baseUrl;
    const url = `${baseurl}${SIGN_UP_CONSUMER}`;
    const requestBody = {
      ...consumerData.getAccountInfo(),
      ...consumerData.getCompany(),
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
    return response; // Return the checkout plan response
  }

  async getPlansList(departmentId: string, token?: string): Promise<object> {
    const baseurl = this.baseUrl;
    const paramters = `departmentId=${departmentId}`;
    const url = `${baseurl}/${MEMBER_GET_PLANS}${paramters}`;

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
    let temp_url = GET_PAYMENTSTATUS;
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

  async loginMember(
    email: string,
    password: string,
    name: string,
  ): Promise<ApiLoginResponse<string>> {
    const url = `${this.baseUrl}${MEMBER_LOGIN}`;

    const requestBody = {
      userName: email,
      password: password,
      subDomain: name,
      domain: `${name}.member-virgilhr-qa.bigin.top`,
    };

    const response = await this.apiClient.sendRequestToLoginPortal<string>(
      "POST",
      url,
      requestBody,
    );

    return response;
  }

  async getBenifit<T>(email: string, token: string): Promise<T> {
    const url = `${this.baseUrl}${GET_PAYMENT_SUBSCRIPTION}`;
    return (await this.sendRequestToGetBenifit<object>(
      url,
      email.split("@")[0],
      token,
    )) as T;
  }

  private async sendRequestToGetBenifit<T>(
    url: string,
    name: string,
    token: string,
    expectedStatus = 200,
  ): Promise<object> {
    const fullUrl = url.startsWith("http") ? url : `${this.baseUrl}/${url}`;

    const mergedHeaders: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      accept: "*/*",
      "accept-language": "en-US,en;q=0.9,vi;q=0.8",
      origin: `https://${name}.member-virgilhr-qa.bigin.top`,
      priority: "u=1, i",
      referer: `https://${name}.member-virgilhr-qa.bigin.top/`,
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0",
    };

    const requestOptions: any = { headers: mergedHeaders };

    const response = await this.apiClient
      .getApiContext()
      .get(fullUrl, requestOptions);
    const status = response.status();
    if (status !== expectedStatus) {
      throw new Error(
        `Expected ${expectedStatus}, got ${status}. Body: ${await response.text()}`,
      );
    }

    const contentType = response.headers()["content-type"] || "";
    const body =
      contentType.includes("application/json") && status !== 204
        ? await response.json()
        : await response.text();

    return body;
  }

  /**
   * Get payment subscription details after buying a plan
   * @param token - The token to authenticate the request
   * @returns The payment subscription details
   */
  async getPaymentSubscription<T>(token: string): Promise<T> {
    const url = `${this.baseUrl}${GET_PAYMENT_SUBSCRIPTION}`;

    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    return ( await this.apiClient.sendRequest<object>(
      "GET",
      url,
      undefined,
      200, // Assuming 200 OK is the expected status code
      headers,
    )) as T;
  }

  
}
