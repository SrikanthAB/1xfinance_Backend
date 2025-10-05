// Aadhaar utilities: sanitize, validate, and mask

// Accept common formats: "374094076286", "3740 9407 6286", with optional dashes
const NON_DIGIT_REGEX = /[^0-9]/g;
const AADHAAR_12_DIGIT_REGEX = /^[2-9][0-9]{11}$/; // first digit 2-9, then 11 digits

export function sanitizeAadhaar(input: string): string {
  return (input || "").replace(NON_DIGIT_REGEX, "");
}

export function isValidAadhaar(input: string): boolean {
  const digits = sanitizeAadhaar(input);
  return AADHAAR_12_DIGIT_REGEX.test(digits);
}

export function extractLast4Aadhaar(input: string): string {
  const digits = sanitizeAadhaar(input);
  if (digits.length < 4) return "";
  return digits.slice(-4);
}

export function maskAadhaarLast4(last4?: string): string | undefined {
  if (!last4 || last4.length !== 4) return undefined;
  return `XXXXXXXX${last4}`;
}

export default {
  sanitizeAadhaar,
  isValidAadhaar,
  extractLast4Aadhaar,
  maskAadhaarLast4,
};

