/**
 * Authentication-related endpoints
 * Edit the paths to match your API.
 */
// Use lowercase path for standard token endpoints
export const SIGN_UP_CONSUMER = "/Consumer/Consumers";
export const CHECK_OUT_PLAN = "Payment/checkout?"; //productType=1
export const GET_PAYMENT_PREVIEWCHANGES = "Payment/PreviewChanges?";
export const GET_CURRENT_SUBSCRIBED_PLAN = "Plan/me"; // Get current user's plan details
export const MEMBER_GET_PLANS = "Payment/products?"; // Get current Plans list
export const GET_PAYMENTSTATUS = "Payment/checkout/${guid}/PaymentStatus";
export const MEMBER_LOGIN = "/Consumer/Consumers/GetLoginFailReason";
export const GET_PAYMENT_SUBSCRIPTION = "/Payment/subscription/me";
export const GET_DEPARTMENTS = "Configuration/Department";
export const INVITE_MEMBER = "Consumer/Teams/Invite";


