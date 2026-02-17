import { MembPortalCustomer } from "src/objects/customer";
import { format } from "date-fns";
import { DataGenerate } from "src/utilities";
import { validCountry, validIndustry } from "src/constant/static-data";

export class CustomerFactory {
  static async createCustomer(
    portal: string,
    overrides?: Partial<Record<string, any>>,
    plan?: string,
  ): Promise<MembPortalCustomer> {
    const customer = new MembPortalCustomer();

    const ts = format(new Date(), "yyyyMMddHHmmss");
    const seq = DataGenerate.getRandomInt(1, 9999);
    const firstName =
      overrides?.firstName ?? (await DataGenerate.generateFirstName());
    const localPrefix = overrides?.firstName ?? `${firstName}${seq}`;
    const email = overrides?.email ?? `${localPrefix}@yopmail.com`;
    const password = overrides?.password ?? `Vl@${ts.slice(-8)}`;
    const lastName =
      overrides?.lastName ?? (await DataGenerate.generateLastName());
    const jobTitle =
      overrides?.jobTitle ?? (await DataGenerate.generatejobTitle());
    const companyName =
      overrides?.companyName ?? (await DataGenerate.generateCompanyName());
    const companySize = overrides?.companySize ?? "";
    const phoneNumber =
      overrides?.phoneNumber ?? (await DataGenerate.generatePhoneNumber());
    const partnerId = overrides?.partnerId ?? null;
    const source = overrides?.source ?? "member";
    const departmentId = overrides?.departmentId ?? "688897d5eb52b4af5573def4";
    const ssoProvider = overrides?.ssoProvider ?? null;
    const ssoToken = overrides?.ssoToken ?? null;
    const inviteToken = overrides?.inviteToken ?? null;
    const teamId = overrides?.teamId ?? null;

    //Admin Portal specific info
    const userType = overrides?.userType ?? "0"; // Default to '0' - Admin;
    const useCredit = overrides?.useCredit ?? false;
    const statesEmployee = overrides?.statesEmployee ?? [];
    const country = overrides?.country ?? validCountry;
    const totalEmployees = overrides?.totalEmployees ?? 0;
    const isSso = overrides?.isSso ?? false;
    const type = overrides?.type ?? 1;
    const partnerConsultantId = overrides?.partnerConsultantId ?? "";
    const industry = overrides?.industry ?? [validIndustry];
    const productType = overrides?.productType ?? "";
    const billingcycle = overrides?.billingcycle;
    const trialDays = overrides?.trialDays;

    if (plan) {
    }

    customer.setAccountInfo({
      email,
      password,
      firstName,
      lastName,
      jobTitle,
      phoneNumber,
      inviteToken,
    });

    customer.setCompany({
      companyName,
      companySize,
      departmentId,
      teamId,
      ...(partnerId && { partnerId }),
      //Set Member Portal specific info
      ...(portal === "member" && { source, ssoProvider, ssoToken }),
      //Set Admin Portal specific info
      ...(portal === "admin" && {
        useCredit,
        statesEmployee,
        country,
        totalEmployees,
        isSso,
        type,
        partnerConsultantId,
        industry,
        productType,
        billingcycle,
        trialDays,
      }),
    });

    return customer;
  }
}
