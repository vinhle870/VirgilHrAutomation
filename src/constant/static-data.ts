import {
  getPlansForDepartment,
} from "./department-plans";

const validCardInfo = {
  cardNumber: "4242 4242 4242 4242",
  cardExp: "12/34",
  cardCvc: "123",
  cardHolderName: "Test User",
  billingAddressLine1: "123 Test St",
  billingCity: "Test City",
};

const inValidCardInfo = {
  cardNumber: "4242 4242 4242 0000",
  cardExp: "12/34",
  cardCvc: "123",
  cardHolderName: "Test User",
  billingAddressLine1: "123 Test St",
  billingCity: "Test City",
};

const validIndustry = {
  code: "ACCOMMODATION",
  value: "Accommodation",
};

const validCountry = {
  key: "US",
  value: "United States",
};

const paymentOptions = [
  { key: "PartnerConsultantOwner", value: 0 },
  { key: "MemberPortalConsumer", value: 1 },
];

const localHR = "6891c8c2b34bb84b18eae816";

/**
 * Plan names for the current `process.env.DEPARTMENT_NAME` and `process.env.ENV`.
 * Prefer {@link getPlansForDepartment} when the department is not the active env default.
 */
const plans = getPlansForDepartment(
  process.env.DEPARTMENT_NAME ?? "BiginHR",
);

export {
  validCardInfo,
  inValidCardInfo,
  validIndustry,
  validCountry,
  paymentOptions,
  localHR,
  plans,
  getPlansForDepartment,
};
