/**
 * Authentication-related endpoints
 * Edit the paths to match your API.
 */
// Use lowercase path for standard token endpoints
export const GET_AUTH_TOKEN = '/connect/token';
export const RESET_PASSWORD_WITHOUT_TOKEN = '/Identity/Migration/ResetPasswordWithoutToken';
export const CONFIRM_EMAIL_WITHOUT_TOKEN = '/Identity/Migration/ConfirmEmailWithoutToken';