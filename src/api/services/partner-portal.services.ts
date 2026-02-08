import { ApiClient } from "src/utilities";
import { PARTNER_LOGIN } from "../endpoints/partner-portal.endpoints";
import { ApiLoginResponse } from "src/objects/responselogin";

export class PartnerPortalService {
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
  async loginPartner(
    email: string,
    password: string,
    name: string,
  ): Promise<ApiLoginResponse<string>> {
    const url = `${this.baseUrl}${PARTNER_LOGIN}`;

    const requestBody = {
      UserName: email,
      Password: password,
      SubDomain: name,
      Domain: `${name}.partner-virgilhr-qa.bigin.top`,
    };

    const response = await this.apiClient.sendRequestToLoginPortal<string>(
      "POST",
      url,
      requestBody,
    );

    return response;
  }
}
