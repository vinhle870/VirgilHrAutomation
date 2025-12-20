import { DataHandling } from "../data-handling/data-handling";
export default interface UserInfo {

    email: string;
    password: string;
    firstName: string;
    lastName: string;
    jobTitle: string;
    companyName: string;
    companySize: string;
    phoneNumber: string;
    partnerId?: string;
    source: string;
    departmentId: string;
    ssoProvider?: string;
    ssoToken?: string;

    /**
     * Get Dealer Login Account
     * @param user
     * @returns
     */

    generateCustomerPayload: (partnerId?: string, departmentId?: string) => Promise<object>;

}