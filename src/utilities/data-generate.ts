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

  static generateCompanyType(): string {
    const values: string[] = ["External", "Internal "];

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

}
