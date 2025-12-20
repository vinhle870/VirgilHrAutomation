import { Customer } from "src/objects/customer";
import { format } from 'date-fns';
import { DataGenerate } from "src/utilities";


export class CustomerFactory {

    static async createCustomer(overrides?: Partial<Record<string, any>>, plan?: string): Promise<Customer> {

        const customer = new Customer();

        const ts = format(new Date(), 'yyyyMMddHHmmss');
        const seq = DataGenerate.getRandomInt(1, 9999);
        const firstName = overrides?.firstName ?? await DataGenerate.generateFirstName();
        const localPrefix = overrides?.firstName ?? `${firstName}${seq}`;
        const email = overrides?.email ?? `${localPrefix}@yopmail.com`;
        const password = overrides?.password ?? `Vl@${ts.slice(-8)}`;
        const lastName = overrides?.lastName ?? await DataGenerate.generateLastName();
        const jobTitle = overrides?.jobTitle ?? await DataGenerate.generatejobTitle();
        const companyName = overrides?.companyName ?? await DataGenerate.generateCompanyName();
        const companySize = overrides?.companySize ?? '';
        const phoneNumber = overrides?.phoneNumber ?? await DataGenerate.generatePhoneNumber();
        const partnerId = overrides?.partnerId;
        const source = overrides?.source ?? 'member';
        const departmentId = overrides?.departmentId ?? '688897d5eb52b4af5573def4';
        const ssoProvider = overrides?.ssoProvider ?? null;
        const ssoToken = overrides?.ssoToken ?? null;

        customer.setAccountInfo({
            email,
            password,
            firstName,
            lastName,
            jobTitle,
            companyName,
            companySize,
            phoneNumber,
            ...(partnerId && { partnerId }),
            source,
            departmentId,
            ssoProvider,
            ssoToken,
           // ...overrides,
        });
        if (plan) {
            customer.setPlan(plan);
        }

        return customer;
    }


}