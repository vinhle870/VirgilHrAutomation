import { ApiClient } from "src/utilities";
import {
  CONFIRM_EMAIL_WITHOUT_TOKEN,
  GET_AUTH_TOKEN,
  RESET_PASSWORD_WITHOUT_TOKEN,
} from "src/api/endpoints";

export class Authentication {
  private apiClient: ApiClient;
  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getAuthToken(
    username: string,
    password: string,
    systemId?: string
  ): Promise<string> {
    const data = {
      username,
      password,
      client_id: "1STPARTY.APP",
      grant_type: "password",
      scope:
        "resourceApi offline_access profile fileServiceApi notificationApi",
    };

    const base = process.env.API_BASE_URL ?? process.env.BASE_URL;
    //const apiVersion = process.env.API_VERSION ?? 'v1';
    if (!base)
      throw new Error(
        "API base URL not configured. Set API_BASE_URL or BASE_URL."
      );

    // Build a clean absolute URL without duplicate slashes
    const url = GET_AUTH_TOKEN.replace(/^\/+/, "");
    const headers = {
      "system-id": systemId ?? process.env.SYSTEM_ID ?? "4",
    } as Record<string, string>;

    const response = await this.apiClient.sendRequest<{ access_token: string }>(
      "POST",
      url,
      data,
      200,
      headers
    );

    return response.access_token;
  }

  /**
   * Reset a consumer password without token (system-initiated flow).
   * Sends required headers `API-KEY` and `system-id`. Defaults are provided
   * but can be overridden via params or environment variables.
   */
  async resetPasswordWithoutToken(
    credentials: { username: string; password: string },
    apiKey?: string,
    systemId?: string
  ): Promise<object> {
    const apiVersion = process.env.API_VERSION ?? "v1";
    const baseUrl =
      this.apiClient.baseURL.replace(/\/+$/, "") + `/${apiVersion}`;
    const url = `${baseUrl}${RESET_PASSWORD_WITHOUT_TOKEN}`;

    const headers = {
      "API-KEY": apiKey ?? process.env.API_KEY ?? "kPTosLWucY$*",
      "system-id": systemId ?? process.env.SYSTEM_ID ?? "4",
      "Content-Type": "application/json-patch+json",
    } as Record<string, string>;

    // Use the provided credentials object as the request payload. If the
    // endpoint expects a different shape, callers can adapt before calling.
    const payload = {
      username: credentials.username,
      password: credentials.password,
    };

    const response = await this.apiClient.sendRequest<object>(
      "PUT",
      url,
      payload,
      200,
      headers
    );

    return response;
  }

  async confirmEmailWithoutToken(
    username: string,
    apiKey?: string,
    systemId?: string
  ): Promise<object> {
    const apiVersion = process.env.API_VERSION ?? "v1";
    const baseUrl =
      this.apiClient.baseURL.replace(/\/+$/, "") + `/${apiVersion}`;
    const url = `${baseUrl}${CONFIRM_EMAIL_WITHOUT_TOKEN}`;

    const headers = {
      "API-KEY": apiKey ?? process.env.API_KEY ?? "kPTosLWucY$*",
      "system-id": systemId ?? process.env.SYSTEM_ID ?? "4",
      "Content-Type": "application/json-patch+json",
    } as Record<string, string>;

    // Use the provided credentials object as the request payload. If the
    // endpoint expects a different shape, callers can adapt before calling.
    const payload = {
      email: username,
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
}
