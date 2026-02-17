import { DataGenerate } from "src/utilities";
import { Partner } from "src/objects/ipartner";
import UserInfo from "src/objects/user-info";
import { AdminPortalService } from "src/api/services/admin-portal.services";
import { ProductInfo } from "src/objects/IProduct";
import { localHR } from "src/constant/static-data";

export class PartnerFactory {
  private static departmentInfor: any;
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
      (await PartnerFactory.getPartnerID(adminService));

    let bankTransfer: boolean =
      overrides?.bankTransfer ?? DataGenerate.generateBoolean();
    let canCustomUpdatePlan: boolean =
      overrides?.canCustomUpdatePlan ?? DataGenerate.generateBoolean();
    let companyType: number =
      overrides?.companyType ?? DataGenerate.generateBoolean();
    const isPublic: boolean =
      overrides?.isPublic ?? DataGenerate.generateBoolean();
    const level: number = levelOfPartner;
    const name: string = overrides?.name ?? `${firstName}${seq}`;
    const partnerType: number =
      overrides?.partnerType ?? DataGenerate.generateDecimal();

    let paymentEnable: boolean =
      overrides?.paymentEnable ?? DataGenerate.generateBoolean();

    const subDomain: string = overrides?.subDomain ?? name;
    const userInfo: UserInfo = {
      email,
      firstName,
      lastName,
      jobTitle,
      phoneNumber,
    };

    const apiEnable: boolean = false;

    let feFilterProductTypes: number[] = [];

    if (!overrides?.restriction?.feFilterProductTypes)
      feFilterProductTypes = DataGenerate.generateProductType(
        await PartnerFactory.getUniqueProductTypesAndNames(
          adminService,
          departmentId,
        ),
      ).map((p) => p.productType);

    let restriction = {
      eSignEnable: true,
      productSupport: true,
      resourceRequest: true,
      contactExpert: true,
      ssoEnable: true,
      lmsEnable: true,
      hrToolsEnable: true,
      feFilterProductTypes:
        overrides?.restriction?.feFilterProductTypes ?? feFilterProductTypes,
    };
    //Payment options
    const whoPay: number = overrides?.whoPay ?? DataGenerate.generateDecimal();
    const planId: string = overrides?.planId ?? ""; //masterPlanID

    partner.setAccountInfo({
      email,
      firstName,
      lastName,
      jobTitle,
      phoneNumber,
    });
    let billingCycle: number;
    if (!overrides?.planId) {
      billingCycle = 1;

      partner.setIPartnerInfo({
        whoPay,
        restriction,
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
    } else {
      billingCycle = 0;
      canCustomUpdatePlan = false;
      companyType = 1;
      paymentEnable = true;
      bankTransfer = true;

      partner.setIPartnerInfo({
        whoPay,
        restriction,
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
        planId,
      });
    }

    return partner;
  }

  public static async getPartnerID(
    adminService: AdminPortalService,
    departmentName?: string,
  ): Promise<string> {
    PartnerFactory.departmentInfor = await adminService.getDepartmentInfo();

    if (departmentName) {
      const dept = PartnerFactory.departmentInfor.body.find(
        (d: any) => d.name.toLowerCase() === departmentName.toLowerCase(),
      );

      if (dept) {
        return dept.id;
      } else {
        throw new Error(`Department with name "${departmentName}" not found`);
      }
    }

    const ids = PartnerFactory.departmentInfor.body.map((dept: any) => dept.id);
    let id = DataGenerate.generateDepartmentID(ids);

    while (id == localHR) {
      id = await PartnerFactory.getPartnerID(adminService);
    }
    return id;
  }

  public static async getDepartmentDomain(
    departmenID: string,
  ): Promise<string> {
    const matchedDept = PartnerFactory.departmentInfor.body.find(
      (dept: any) => dept.id === departmenID,
    );

    return matchedDept?.domain?.partner ?? null;
  }

  public static async getUniqueProductTypesAndNames(
    adminService: AdminPortalService,
    departmentId: string,
  ): Promise<ProductInfo[]> {
    const productTypesResponse = await adminService.getProductTypes();
    if (!productTypesResponse?.body) {
      return [];
    }

    const department = productTypesResponse.body.find(
      (d: any) => d.departmentId === departmentId,
    );

    if (!department?.plans) {
      return [];
    }

    const seenProductTypes = new Set<number>();

    const products: ProductInfo[] = department.plans.flatMap((plan: any) =>
      plan.products
        .filter((p: any) => {
          if (seenProductTypes.has(p.productType)) return false;

          seenProductTypes.add(p.productType);
          return true;
        })
        .map((p: any) => ({
          productType: p.productType,
          productName: plan.name,
          planId: plan.id,
        })),
    );

    return products;
  }
}
