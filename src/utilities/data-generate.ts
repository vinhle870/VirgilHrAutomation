import { format } from "date-fns";
import { CollectionUtils } from "./collection-utils";

// Bypass ts-node transpiling dynamic import() to require() for ESM-only packages
const loadFaker = new Function(
  'return import("@faker-js/faker")',
) as () => Promise<typeof import("@faker-js/faker")>;

export class DataGenerate {
  /** @deprecated Use `CollectionUtils.pickOne()` instead */
  static selectRandomlyInList(array: any[]): string {
    return CollectionUtils.pickOne(array);
  }

  /** @deprecated Use `CollectionUtils.randomInt()` instead */
  static getRandomInt(min: number, max: number): number {
    return CollectionUtils.randomInt(min, max);
  }

  /**
   * Generate Year from[20 year ago to current year]
   * @returns number
   */
  static generateYear(fromcurrentyear: number): number {
    const currentYear = new Date().getFullYear();
    const year = this.getRandomInt(currentYear + fromcurrentyear, currentYear);
    return year;
  }

  /**
   * Generate Amount
   * @returns number
   */
  static generateAmount(min: number, max: number): number {
    const amount = parseFloat(this.getRandomInt(min, max).toFixed(2));
    return amount;
  }

  /**
   * Generate Date
   * @param dateformat
   * @returns string
   */
  static async generateDate(dateformat: string): Promise<string> {
    const { faker } = await loadFaker();
    const futuredate = faker.date.future();
    return format(futuredate, dateformat);
  }

  static async generateFirstName(): Promise<string> {
    const { faker } = await loadFaker();
    return "QATest_" + faker.person.firstName();
  }

  static async generateLastName(): Promise<string> {
    const { faker } = await loadFaker();
    return faker.person.lastName();
  }

  static async generateEmail(): Promise<string> {
    const { faker } = await loadFaker();
    const email = faker.internet.email();
    return `QATest${email}`;
  }

  static async generatePhoneNumber(): Promise<string> {
    const { faker } = await loadFaker();
    return faker.helpers.replaceSymbols("+1##########");
  }
  static async generateCompanyName(): Promise<string> {
    const { faker } = await loadFaker();
    return "QATest_" + faker.company.name().replace(",", "and");
  }

  static async generatejobTitle(): Promise<string> {
    const { faker } = await loadFaker();
    return faker.person.jobTitle();
  }

  static generateBoolean(): boolean {
    const values: boolean[] = [true, false];

    const randomValue = values[Math.floor(Math.random() * values.length)];

    return randomValue;
  }

  static generateDecimal(): number {
    const values: number[] = [0, 1];

    const randomValue = values[Math.floor(Math.random() * values.length)];

    return randomValue;
  }
  /** @deprecated Use `CollectionUtils.pickOne()` instead */
  public static generateDepartmentID(departmentIDS: string[]): string {
    return CollectionUtils.pickOne(departmentIDS);
  }

  /**
   * Generate a dynamic user payload with sensible defaults.
   * You can pass `overrides` to replace any generated field.
   */

  /*
    static async generateUserData(overrides?: Partial<Record<string, any>>): Promise<Record<string, any>> {
        const { faker } = await import('@faker-js/faker');
        const ts = format(new Date(), 'yyyyMMddHHmmss');
        const seq = this.getRandomInt(1, 9999);
        const localPrefix = overrides?.firstName ?? `VinhYopmail${seq}`;
        const email = overrides?.email ?? `${localPrefix}@yopmail.com`;
        const password = overrides?.password ?? `Vl@${ts.slice(-8)}`;
        const firstName = overrides?.firstName ?? localPrefix;
        const lastName = overrides?.lastName ?? 'Le';
        const jobTitle = overrides?.jobTitle ?? 'test';
        const companyName = overrides?.companyName ?? 'vinhyopmail.com';
        const companySize = overrides?.companySize ?? '';
        const phoneNumber = overrides?.phoneNumber ?? faker.helpers.replaceSymbols('+1##########');
        const partnerId = overrides?.partnerId;
        const source = overrides?.source ?? 'member';
        const departmentId = overrides?.departmentId ?? '688897d5eb52b4af5573def4';
        const ssoProvider = overrides?.ssoProvider ?? null;
        const ssoToken = overrides?.ssoToken ?? null;

        return {
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
            ...overrides,
        };
    }
    */
}
