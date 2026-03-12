import { ApiClient } from "src/utilities";
import {
  CONFIRM_EMAIL_WITHOUT_TOKEN,
  GET_AUTH_TOKEN,
  RESET_PASSWORD_WITHOUT_TOKEN,
} from "src/api/endpoints";
import { CREATE_CONSUMER, GET_CLIENT_PLANS_LIST, GET_CONSUMER_LIST } from "../endpoints/partner-integration.endpoints";
import { CustomerInfo } from "src/objects";

export class PartnerIntegrationService {
  private apiClient: ApiClient;
  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * GET /client/plans: Get the list of plans for a client
   * @param token - The token of the client
   * @returns The list of plans for a client
   */
  async getClientPlansList(
    token: string,
  ): Promise<object> {
    const path = GET_CLIENT_PLANS_LIST.replace(/^\/+/, "");
    const url = `${this.apiClient.baseURL}/${path}`;
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    // Use the provided credentials object as the request payload. If the
    // endpoint expects a different shape, callers can adapt before calling.

    const response = await this.apiClient.sendRequest<object>(
      "GET",
      url,
      undefined,
      200,
      headers
    );

    return response;
  }

  /**
   * POST /client/consumer: Create a new consumer
   * @param consumerData - The information of the consumer
   * @param planId - The ID of the plan getting from getClientPlansList API
   * @param token - The token of the client
   * @returns The response from the API
   */
  async createConsumer(
    consumerData: CustomerInfo,
    planId: string,
    token: string,
  ): Promise<object> {
    const path = CREATE_CONSUMER.replace(/^\/+/, "");
    const url = `${this.apiClient.baseURL}/${path}`;
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    // Use the provided credentials object as the request payload. If the
    // endpoint expects a different shape, callers can adapt before calling.
    const payload = {
      "email": consumerData.accountInfo.email,
      "firstName": consumerData.accountInfo.firstName,
      "lastName": consumerData.accountInfo.lastName,
      "phoneNumber": consumerData.accountInfo.phoneNumber,
      "jobTitle": consumerData.accountInfo.jobTitle,
      "companyName": consumerData.company.companyName,
      "planId": planId,
      "backUrl": "",
      "backText": "",
      "externalOwnerId": "",
      "externalCompanyId": ""
    };
    const response = await this.apiClient.sendRequest<object>(
      "POST",
      url,
      payload,
      200,
      headers
    );

    return response;
  }

  /**
   * GET /client/consumer: Get the list of consumers
   * @param token - The token of the client
   * @returns The list of consumers
   */
  async getConsumerList(
    token: string,
  ): Promise<object> {
    const path = GET_CONSUMER_LIST.replace(/^\/+/, "");
    const url = `${this.apiClient.baseURL}/${path}`;
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const response = await this.apiClient.sendRequest<object>(
      "GET",
      url,
      undefined,
      200,
      headers
    );
    return response;
  }
  
}
