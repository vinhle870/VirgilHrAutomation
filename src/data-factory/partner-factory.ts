import { DataGenerate } from "src/utilities";
import { Partner } from "src/objects/ipartner";
import UserInfo from "src/objects/user-info";
import { AdminPortalService } from "src/api/services/admin-portal.services";
import { ProductInfo } from "src/objects/iProduct";

export class PartnerFactory {
  private static partnerDomain: string;
  private static departmentID: string;

  public static getPartnerDomain(): string {
    return PartnerFactory.partnerDomain;
  }
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

    const feFilterProductTypes: number[] =
      overrides?.feFilterProductTypes ??
      DataGenerate.generateProductType(
        await PartnerFactory.getProductTypesAndNames(adminService),
      );

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

    PartnerFactory.departmentID = DataGenerate.generateDepartmentIDS(ids);

    const matchedDept = departmentIdResponse.body.find(
      (dept: any) => dept.id === PartnerFactory.departmentID,
    );

    PartnerFactory.partnerDomain = matchedDept?.domain?.partner ?? null;

    return await PartnerFactory.departmentID;
  }

  public static async getProductTypesAndNames(
    adminService: AdminPortalService,
  ): Promise<ProductInfo[]> {
    const productTypesResponse = await adminService.getProductTypes();
    if (!productTypesResponse?.body) {
      return [];
    }
    const department = productTypesResponse.body.find(
      (d: any) => d.departmentId === PartnerFactory.departmentID,
    );
    if (!department?.plans) {
      return [];
    }
    const products: ProductInfo[] = department.plans.flatMap((plan: any) =>
      plan.products.map((p: any) => ({
        productType: p.productType,
        productName: plan.name,
      })),
    );
    return products;
  }
}
