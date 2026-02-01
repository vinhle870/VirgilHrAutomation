import { DataGenerate } from "src/utilities";
import { Partner } from "src/objects/ipartner";
import UserInfo from "src/objects/user-info";
import { AdminPortalService } from "src/api/services/admin-portal.services";

export class PartnerFactory {
  public static partner: string;
  private static productTypes: number[] = [];
  static async createPartner(
    levelOfPartner: number,
    adminService: AdminPortalService,
    overrides?: Partial<Record<string, any>>,
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
      overrides?.departmentId ??
      (await PartnerFactory.generatePartnerInfor(adminService));

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

    const feFilterProductTypes =
      overrides?.feFilterProductTypes ??
      DataGenerate.generateProductType(PartnerFactory.productTypes);

    //Payment options
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

  public static async generatePartnerInfor(
    adminService: AdminPortalService,
  ): Promise<string> {
    const departmentIdResponse = await adminService.getDepartmentInfor();

    const ids = departmentIdResponse.body.map((dept: any) => dept.id);

    const departmentID = DataGenerate.generateDepartmentIDS(ids);

    const matchedDept = departmentIdResponse.body.find(
      (dept: any) => dept.id === departmentID,
    );

    PartnerFactory.partner = matchedDept?.domain?.partner ?? null;

    const productTypesResponse = await adminService.getProductTypes();

    for (let i = 0; i < productTypesResponse.body.length; i++)
      PartnerFactory.productTypes.push(i);

    return await departmentID;
  }
}
