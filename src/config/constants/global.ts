import { ITokens } from "../../interfaces/global";

export const CONST_TOKENS :ITokens= {
  ACCESS: 'access',
  REFRESH: 'refresh',
  ADMIN_ACCESS:'admin_access',
  ADMIN_REFRESH:'admin_refresh'
};


// src/config/constants.ts
export const OTP_STATUS = {
  PENDING: 'Pending',
  VERIFIED: 'Verified',
  FAILED: 'Failed',
} as const;

// constants.ts
export const ADMIN_APPROVAL_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected'
} as const;

export type AdminApprovalStatus = typeof ADMIN_APPROVAL_STATUS[keyof typeof ADMIN_APPROVAL_STATUS];


export const EMAIL_OTP_CONFIG = {
  EXPIRATION_TIME_MINUTES: 5,
  MAX_ATTEMPTS: 5,
  OTP_LENGTH: 6, // Add OTP length to config
  MINIMUM_RESEND_TIME_IN_MINUTES: 1,
} as const;


export const MOBILE_OTP_CONFIG = {
  EXPIRATION_TIME_MINUTES: 10,
  MAX_ATTEMPTS: 5,
  OTP_LENGTH: 6,
  MINIMUM_RESEND_TIME_IN_MINUTES: 1,
} as const;

// Optionally, you can export a computed value in milliseconds if needed
export const OTP_EXPIRATION_TIME_MS = EMAIL_OTP_CONFIG.EXPIRATION_TIME_MINUTES * 60 * 1000;
export const MOBILE_OTP_EXPIRATION_TIME_MS = MOBILE_OTP_CONFIG.EXPIRATION_TIME_MINUTES * 60 * 1000;
export const MINIMUM_RESEND_INTERVAL_MS = MOBILE_OTP_CONFIG.MINIMUM_RESEND_TIME_IN_MINUTES * 60 * 1000;
