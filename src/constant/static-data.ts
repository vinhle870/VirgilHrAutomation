const plans = [
  "Under 50 Employees",
  "50 - 100 Employees",
  "101 - 250 Employees",
  "251 - 500 Employees",
  "500+ Employees & HR Consultants",
];

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

export {
  plans,
  validCardInfo,
  inValidCardInfo,
  validIndustry,
  validCountry,
  paymentOptions,
  localHR,
};
