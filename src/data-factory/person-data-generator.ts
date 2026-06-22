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
  static async generate(overrides?: Partial<UserInfo>): Promise<UserInfo> {
    const seq = DataGenerate.getRandomInt(1, 99999);

    const firstName = overrides?.firstName ?? (await DataGenerate.generateFirstName()) + `${seq}`;
    const isBeeinbox = (process.env.MAILBOX_URL || "").includes("beeinbox");
    const localPrefix = overrides?.firstName ?? (isBeeinbox ? `QATest_${seq}${firstName}`.slice(0, 15) : `${firstName}`);
    const email = overrides?.email ?? (isBeeinbox ? `${localPrefix}@beeinbox.edu.pl` : `${localPrefix}@yopmail.com`);
    const password = overrides?.password ?? `Password@123`;
    const lastName = overrides?.lastName ?? (await DataGenerate.generateLastName());
    const jobTitle = overrides?.jobTitle ?? (await DataGenerate.generatejobTitle());
    const phoneNumber = overrides?.phoneNumber ?? (await DataGenerate.generatePhoneNumber());

    return {
      email,
      password,
      firstName,
      lastName,
      jobTitle,
      localPrefix,
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
