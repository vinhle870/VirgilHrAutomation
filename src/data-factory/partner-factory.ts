import { format } from "date-fns";
import { DataGenerate } from "src/utilities";
import { Partner } from "src/objects/ipartner";
import UserInfo from "src/objects/user-info";

export class PartnerFactory {
  static async createPartner(
    levelOfPartner: number,
    overrides?: Partial<Record<string, any>>
  ): Promise<Partner> {
    const partner = new Partner();

    const seq = DataGenerate.getRandomInt(1, 9999);
    const firstName =
      overrides?.firstName ?? (await DataGenerate.generateFirstName());
    const localPrefix = overrides?.firstName ?? `${firstName}${seq}`;
    const email = overrides?.email ?? `${localPrefix}@yopmail.com`;
    const lastName =
      overrides?.lastName ?? (await DataGenerate.generateLastName());
    const jobTitle: string =
      overrides?.jobTitle ?? (await DataGenerate.generatejobTitle());
    const phoneNumber =
      overrides?.phoneNumber ?? (await DataGenerate.generatePhoneNumber());
    const departmentId: string =
      overrides?.departmentId ?? DataGenerate.generateDepartmentId();
    const bankTransfer: boolean =
      overrides?.bankTransfer ?? DataGenerate.generateBoolean();
    const canCustomUpdatePlan: boolean =
      overrides?.canCustomUpdatePlan ?? DataGenerate.generateBoolean();
    const companyType: number =
      overrides?.companyType ?? DataGenerate.generateBoolean();
    const isPublic: boolean =
      overrides?.isPublic ?? DataGenerate.generateBoolean();
    const level: number = levelOfPartner;
    const name: string = overrides?.name ?? `${firstName}${seq}`;
    const partnerType: number =
      overrides?.partnerType ?? DataGenerate.generateDecimal();
    //Payment options
    const paymentEnable: boolean =
      overrides?.paymentEnable ?? DataGenerate.generateBoolean();
    const subDomain: string = overrides?.subDomain ?? name;
    const userInfo: UserInfo = {
      email,
      firstName,
      lastName,
      jobTitle,
      phoneNumber,
    };
    const billingCycle: number = 1;
    const apiEnable: boolean = false;
    const feFilterProductTypes: number[] =
      overrides?.feFilterProductTypes ?? DataGenerate.generateProductType();
    const whoPay: number = overrides?.whoPay ?? DataGenerate.generateDecimal();

    partner.setAccountInfo({
      email,
      firstName,
      lastName,
      jobTitle,
      phoneNumber,
    });

    partner.setIPartnerInfo({
      whoPay,
      feFilterProductTypes,
      apiEnable,
      departmentId,
      bankTransfer,
      canCustomUpdatePlan,
      companyType,
      isPublic,
      level,
      name,
      partnerType,
      paymentEnable,
      subDomain,
      userInfo,
      ...(bankTransfer && { billingCycle }),
    });

    return partner;
  }
}
