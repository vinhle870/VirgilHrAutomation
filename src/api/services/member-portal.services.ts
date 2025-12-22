import { ApiClient } from 'src/utilities';
import { GET_AUTH_TOKEN } from 'src/api/endpoints';
import { CHECK_OUT_PLAN, GET_CURRENT_SUBSCRIBED_PLAN, GET_PAYMENTSTATUS, GET_PLANS, SIGN_UP_CONSUMER } from 'src/api/endpoints/member-portal.endpoints';
import { MembPortalCustomer } from 'src/objects/customer';

export class MemberPortalService {
    private apiClient: ApiClient;
    private baseUrl: string;
    constructor(apiClient: ApiClient) {
        const apiVersion = process.env.API_VERSION ?? 'v1';
        this.apiClient = apiClient;
        this.baseUrl = this.apiClient.baseURL + `/${apiVersion}`;
    }

    /***
     * Sign up a new user on Member Portal with the provided data
     */
    async signUpConsumer(consumerData: MembPortalCustomer): Promise<object> {

        const baseurl = this.baseUrl;
        const url = `${baseurl}${SIGN_UP_CONSUMER}`;
        const requestBody = { ...consumerData.getAccountInfo(), ...consumerData.getCompany()};
        const response = await this.apiClient.sendRequest<object>(
            'POST',
            url,
            requestBody,
            201 // Assuming 201 Created is the expected status code
        );
        return response; // Return the created consumer ID. E.g: 692bf9ec8600289c1af50f91
    }

    async checkOutPlan(productType: string, token?: string): Promise<object> {

        const baseurl = this.baseUrl;
        const paramters = `productType=${productType}`;

        const url = `${baseurl}/${CHECK_OUT_PLAN}${paramters}`;

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
            'GET',
            url,
            undefined,
            200, // Assuming 200 OK is the expected status code
            headers
        );
        return response; // Return the checkout plan response
    }

    async getPlansList(departmentId:string,token?: string): Promise<object> {

        const baseurl = this.baseUrl;
        const paramters = `departmentId=${departmentId}`;
        const url = `${baseurl}/${GET_PLANS}${paramters}`;

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

        async checkPaymentStatus(guid:string,token?: string): Promise<object> {

        const paramters = `guid=${guid}`;
        let temp_url = GET_PAYMENTSTATUS;
        temp_url = temp_url.replace('${guid}',paramters);
        const url = `${this.baseUrl}/${temp_url}`;

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



}