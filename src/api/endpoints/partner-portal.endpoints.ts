/**
 * Authentication-related endpoints
 * Edit the paths to match your API.
 */
// Use lowercase path for standard token endpoints
export const PARTNER_LOGIN = "/PartnerConsumer/GetLoginFailReason";
export const CREATE_BUSINESS = "/Partner/Manage/Partner/Business";
export const GET_PARTNER_PAYMENT_PRODUCTS_LIST = "Partner/Manage/Payment/products";
export const GET_PARTNER_PLANS_LIST = "Partner/Manage/Plan";
export const INVITE_MEMBER = "Partner/Manage/Partner/Business/Invite";
export const GET_BUSINESS_LIST = "Partner/Manage/Partner/Business";
export const GET_TEAM_MEMBERS_LIST = "Partner/Manage/Teams/{teamId}/Members?id={teamId}";
