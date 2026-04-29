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

const plans = getPlansForDepartment();

export {
  validCardInfo,
  inValidCardInfo,
  validIndustry,
  validCountry,
  paymentOptions,
  localHR,
  plans,
};
