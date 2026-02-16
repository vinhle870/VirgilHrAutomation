// /src/api/api.client.ts

import { request, APIRequestContext, APIResponse } from "@playwright/test";
import { HTTPMethod } from "./api.types";

export class ApiClient {
  private apiContext: APIRequestContext;
  public readonly baseURL: string;
  private authToken: string | undefined; // Store the token if needed

  // Private constructor used by the async factory
  public constructor(
    baseURL: string,
    authToken: string | undefined,
    apiContext: APIRequestContext,
  ) {
    this.baseURL = baseURL;
    this.authToken = authToken;
    this.apiContext = apiContext;
    console.log(`API Client initialized with Base URL: ${this.baseURL}`);
  }

  public getApiContext() {
    return this.apiContext;
  }
  // Async factory to create an ApiClient since request.newContext is async
  public static async create(
    baseURL: string,
    authToken?: string,
  ): Promise<ApiClient> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    };

    const apiContext = await request.newContext({
      baseURL,
      extraHTTPHeaders: headers,
    });

    return new ApiClient(baseURL, authToken, apiContext);
  }

  // Dispose the underlying request context when finished
  public async dispose(): Promise<void> {
    try {
      await this.apiContext.dispose();
    } catch (err) {
      // swallow disposal errors but log for debugging
      // eslint-disable-next-line no-console
      console.warn("Failed to dispose ApiClient request context", err);
    }
  }

  // Set or update the authorization token for subsequent requests
  public async setAuthToken(token: string): Promise<void> {
    // Only store the token locally. Playwright's APIRequestContext does not
    // provide a method to mutate headers after creation, so we will merge
    // the Authorization header per-request in `sendRequest`.
    this.authToken = token;
  }

  // Read-only getter for current auth token
  public getAuthToken(): string | undefined {
    return this.authToken;
  }

  // Generic method to handle all API requests
  public async sendRequest<T>(
    method: HTTPMethod,
    url: string,
    data?: object,
    expectedStatus = 200,
    headers?: Record<string, string>,
  ): Promise<T> {
    let response: APIResponse;

    const fullUrl = url.startsWith("http") ? url : `${this.baseURL}/${url}`;

    try {
      const requestOptions: any = {};
      if (data) requestOptions.data = data;

      // Merge headers: prefer explicit `headers` passed for this call,
      // but include the stored auth token if present. This avoids calling
      // non-existent mutator methods on the Playwright request context.
      const mergedHeaders: Record<string, string> = {
        ...(this.authToken
          ? { Authorization: `Bearer ${this.authToken}` }
          : {}),
        ...(headers || {}),
      };
      if (Object.keys(mergedHeaders).length)
        requestOptions.headers = mergedHeaders;

      // Log outgoing request (method, URL, headers, body) for debugging.
      try {
        const safeStringify = (v: any) => {
          try {
            const s = JSON.stringify(v);
            // truncate long bodies for readability
            return s.length > 2000
              ? `${s.slice(0, 2000)}... (truncated ${s.length} bytes)`
              : s;
          } catch (e) {
            return String(v);
          }
        };

        const bodyLog = requestOptions.data
          ? safeStringify(requestOptions.data)
          : undefined;
        const headersLog = requestOptions.headers
          ? safeStringify(requestOptions.headers)
          : undefined;
        // Use console.debug so logs can be filtered; fallback to console.log if not available.
        const logger = (console.debug ?? console.log).bind(console);
        logger(
          `[ApiClient] ${method} ${fullUrl}` +
            (headersLog ? `\nHeaders: ${headersLog}` : "") +
            (bodyLog ? `\nBody: ${bodyLog}` : ""),
        );
      } catch (err) {
        // don't fail the request if logging fails
        // eslint-disable-next-line no-console
        console.warn("Failed to stringify request body for logging", err);
      }

      switch (method) {
        case "GET":
          response = await this.apiContext.get(fullUrl, requestOptions);
          break;
        case "POST":
          response = await this.apiContext.post(fullUrl, requestOptions);
          break;
        case "PUT":
          response = await this.apiContext.put(fullUrl, requestOptions);
          break;
        case "DELETE":
          response = await this.apiContext.delete(fullUrl, requestOptions);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }
    } catch (error) {
      console.error(
        `Request to ${fullUrl} failed due to network or Playwright error:`,
        error,
      );
      throw error;
    }

    // --- Validation and Error Handling ---
    if (response.status() !== expectedStatus) {
      const errorBody = await response.text();
      throw new Error(
        `API call failed for ${method} ${fullUrl}. ` +
          `Expected status: ${expectedStatus}, Actual status: ${response.status()}. ` +
          `Response body: ${errorBody}`,
      );
    }

    // Only attempt to parse JSON if content type indicates it and the response is not empty
    const contentType = response.headers()["content-type"] || "";
    if (contentType.includes("application/json") && response.status() !== 204) {
      return (await response.json()) as T;
    }

    // If the API returns non-JSON (e.g., plain text id), return the text body.
    // Keep `{}` for intentionally empty responses (e.g., 204) or empty bodies.
    if (response.status() === 204) return {} as T;
    const textBody = await response.text();
    return (textBody ? (textBody as unknown as T) : ({} as T));
  }

  public async sendPartnerRequest<T>(
    method: HTTPMethod,
    url: string,
    data?: object,
    expectedStatus = 200,
    headers?: Record<string, string>,
  ): Promise<{ status: number; data: T }> {
    let response: APIResponse;

    const fullUrl = url.startsWith("http") ? url : `${this.baseURL}/${url}`;

    try {
      const requestOptions: any = {};
      if (data) requestOptions.data = data;

      const mergedHeaders: Record<string, string> = {
        ...(this.authToken
          ? { Authorization: `Bearer ${this.authToken}` }
          : {}),
        ...(headers || {}),
      };
      if (Object.keys(mergedHeaders).length)
        requestOptions.headers = mergedHeaders;

      switch (method) {
        case "GET":
          response = await this.apiContext.get(fullUrl, requestOptions);
          break;
        case "POST":
          response = await this.apiContext.post(fullUrl, requestOptions);
          break;
        case "PUT":
          response = await this.apiContext.put(fullUrl, requestOptions);
          break;
        case "DELETE":
          response = await this.apiContext.delete(fullUrl, requestOptions);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }
    } catch (error) {
      console.error(`Request to ${fullUrl} failed:`, error);
      throw error;
    }

    const status = response.status();

    if (status !== expectedStatus) {
      const errorBody = await response.text();
      throw new Error(
        `API call failed for ${method} ${fullUrl}. ` +
          `Expected status: ${expectedStatus}, Actual status: ${status}. ` +
          `Response body: ${errorBody}`,
      );
    }

    const contentType = response.headers()["content-type"] || "";
    let dataResult: any = {};

    if (contentType.includes("application/json") && status !== 204) {
      dataResult = await response.json();
    }

    return { status, data: dataResult as T };
  }
  public async sendToGetDepartmentInfor<T>(
    method: HTTPMethod,
    url: string,
    expectedStatus = 200,
    headers?: Record<string, string>,
  ): Promise<{ status: number; body: any }> {
    let response: APIResponse;

    const fullUrl = url.startsWith("http") ? url : `${this.baseURL}/${url}`;

    try {
      const requestOptions: any = {};

      const mergedHeaders: Record<string, string> = {
        ...(this.authToken
          ? { authorization: `Bearer ${this.authToken}` }
          : {}),
        origin: "https://admin.qa.virgilhr.com",
        referer: "https://admin.qa.virgilhr.com/",
        priority: "u=1, i",
        ...(headers || {}),
      };

      if (Object.keys(mergedHeaders).length) {
        requestOptions.headers = mergedHeaders;
      }

      switch (method) {
        case "GET":
          response = await this.apiContext.get(fullUrl, requestOptions);
          break;
        case "POST":
          response = await this.apiContext.post(fullUrl, requestOptions);
          break;
        case "PUT":
          response = await this.apiContext.put(fullUrl, requestOptions);
          break;
        case "DELETE":
          response = await this.apiContext.delete(fullUrl, requestOptions);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }
    } catch (error) {
      console.error(`Request to ${fullUrl} failed:`, error);
      throw error;
    }

    const status = response.status();

    if (status !== expectedStatus) {
      const errorBody = await response.text();
      throw new Error(
        `API call failed for ${method} ${fullUrl}. ` +
          `Expected status: ${expectedStatus}, Actual status: ${status}. ` +
          `Response body: ${errorBody}`,
      );
    }

    const contentType = response.headers()["content-type"] || "";
    let body: any;

    if (contentType.includes("application/json") && status !== 204) {
      body = await response.json();
    } else {
      body = await response.text();
    }

    return { status, body };
  }

  public async sendToGetProductTypes<T>(
    method: HTTPMethod,
    url: string,
    expectedStatus = 200,
    headers?: Record<string, string>,
  ): Promise<{ status: number; body: any }> {
    let response: APIResponse;

    const fullUrl = url.startsWith("http") ? url : `${this.baseURL}/${url}`;

    try {
      const requestOptions: any = {};

      const mergedHeaders: Record<string, string> = {
        ...(this.authToken
          ? { authorization: `Bearer ${this.authToken}` }
          : {}),

        ...(headers || {}),
      };

      if (Object.keys(mergedHeaders).length) {
        requestOptions.headers = mergedHeaders;
      }

      switch (method) {
        case "GET":
          response = await this.apiContext.get(fullUrl, requestOptions);
          break;
        case "POST":
          response = await this.apiContext.post(fullUrl, requestOptions);
          break;
        case "PUT":
          response = await this.apiContext.put(fullUrl, requestOptions);
          break;
        case "DELETE":
          response = await this.apiContext.delete(fullUrl, requestOptions);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }
    } catch (error) {
      console.error(`Request to ${fullUrl} failed:`, error);
      throw error;
    }

    const status = response.status();

    if (status !== expectedStatus) {
      const errorBody = await response.text();
      throw new Error(
        `API call failed for ${method} ${fullUrl}. ` +
          `Expected status: ${expectedStatus}, Actual status: ${status}. ` +
          `Response body: ${errorBody}`,
      );
    }

    const contentType = response.headers()["content-type"] || "";
    let body: any;

    if (contentType.includes("application/json") && status !== 204) {
      body = await response.json();
    } else {
      body = await response.text();
    }

    return { status, body };
  }

  public async sendRequestToGetCusomterId<T>(
    method: HTTPMethod,
    url: string,
    expectedStatus = 200,
    headers?: Record<string, string>,
    params?: Record<string, string | number>,
  ): Promise<{ status: number; body: T }> {
    const fullUrl = url.startsWith("http") ? url : `${this.baseURL}/${url}`;
    const mergedHeaders: Record<string, string> = {
      ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}),
      ...(headers || {}),
    };
    const requestOptions: any = { headers: mergedHeaders, params };
    let response: APIResponse;
    switch (method) {
      case "GET":
        response = await this.apiContext.get(fullUrl, requestOptions);
        break;
      case "POST":
        response = await this.apiContext.post(fullUrl, requestOptions);
        break;
      case "PUT":
        response = await this.apiContext.put(fullUrl, requestOptions);
        break;
      case "DELETE":
        response = await this.apiContext.delete(fullUrl, requestOptions);
        break;
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
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
    return { status, body };
  }

  public async sendRequestToGetCustomerRole<T>(
    method: HTTPMethod,
    url: string,
    expectedStatus = 200,
    headers?: Record<string, string>,
  ): Promise<{ status: number; body: T }> {
    const fullUrl = url.startsWith("http") ? url : `${this.baseURL}/${url}`;

    const mergedHeaders: Record<string, string> = {
      ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}),
      ...(headers || {}),
    };

    const requestOptions: any = { headers: mergedHeaders };

    let response: APIResponse;
    switch (method) {
      case "GET":
        response = await this.apiContext.get(fullUrl, requestOptions);
        break;
      case "POST":
        response = await this.apiContext.post(fullUrl, requestOptions);
        break;
      case "PUT":
        response = await this.apiContext.put(fullUrl, requestOptions);
        break;
      case "DELETE":
        response = await this.apiContext.delete(fullUrl, requestOptions);
        break;
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }

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

    return { status, body: body as T };
  }

  public async sendRequestToLogin<T>(
    method: HTTPMethod,
    url: string,
    expectedStatus = 200,
    headers?: Record<string, string>,
  ): Promise<{ status: number; body: T }> {
    const fullUrl = url.startsWith("http") ? url : `${this.baseURL}/${url}`;

    const mergedHeaders: Record<string, string> = {
      ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}),
      ...(headers || {}),
    };

    const requestOptions: any = { headers: mergedHeaders };

    let response: APIResponse;
    switch (method) {
      case "GET":
        response = await this.apiContext.get(fullUrl, requestOptions);
        break;
      case "POST":
        response = await this.apiContext.post(fullUrl, requestOptions);
        break;
      case "PUT":
        response = await this.apiContext.put(fullUrl, requestOptions);
        break;
      case "DELETE":
        response = await this.apiContext.delete(fullUrl, requestOptions);
        break;
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }

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

    return { status, body: body as T };
  }
}
