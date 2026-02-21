import { format } from "date-fns";
import { DataGenerate } from "src/utilities";
import UserInfo from "src/objects/user-info";

/**
 * Shared utility that generates person/account data with sensible defaults.
 * Used by CustomerBuilder, PartnerBuilder, and any future builders
 * to avoid duplicating name/email/phone generation logic.
 *
 * Pass `Partial<UserInfo>` to override specific fields;
 * any field left undefined will be auto-generated with realistic fake data.
 */
export class PersonDataGenerator {
  static async generate(
    overrides?: Partial<UserInfo>,
  ): Promise<UserInfo> {
    const ts = format(new Date(), "yyyyMMddHHmmss");
    const seq = DataGenerate.getRandomInt(1, 9999);

    const firstName =
      overrides?.firstName ?? (await DataGenerate.generateFirstName());
    const localPrefix = overrides?.firstName ?? `${firstName}${seq}`;
    const email = overrides?.email ?? `${localPrefix}@yopmail.com`;
    const password = overrides?.password ?? `Pass@${ts.slice(-8)}`;
    const lastName =
      overrides?.lastName ?? (await DataGenerate.generateLastName());
    const jobTitle =
      overrides?.jobTitle ?? (await DataGenerate.generatejobTitle());
    const phoneNumber =
      overrides?.phoneNumber ?? (await DataGenerate.generatePhoneNumber());

    return {
      email,
      password,
      firstName,
      lastName,
      jobTitle,
      phoneNumber,
      ...(overrides?.userType !== undefined && {
        userType: overrides.userType,
      }),
      ...(overrides?.partnerConsumerType !== undefined && {
        partnerConsumerType: overrides.partnerConsumerType,
      }),
      ...(overrides?.role !== undefined && {
        role: overrides.role,
      }),
    };
  }
  
}
