// Definition of regex patterns used in the application
// Email regex pattern
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// This regex supports international phone numbers with optional country codes (+ or 00)
export const MOBILE_NUMBER_REGEX = /^\d{6,15}$/;

// coutry code regex
export const COUNTRY_CODE_REGEX = /^\+\d{1,4}$/;

// password regex pattern
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
