import crypto from 'crypto';
import moment from 'moment';

/**
 * Generates a cryptographically secure OTP and its expiry time.
 * @param length - The length of the OTP (default is 6 digits).
 * @param expiryMinutes - The validity period of the OTP in minutes (default is 5 minutes).
 * @returns An object containing the OTP and its expiry time.
 */
export const generateOtp = (length: number = 6, expiryMinutes: number = 5): { otp: number; otpExpiry: Date } => {
  const min: number = 10 ** (length - 1); // Minimum value for the OTP (e.g., 100000 for a 6-digit OTP)
  const max: number = 10 ** length - 1;   // Maximum value for the OTP (e.g., 999999 for a 6-digit OTP)
  const otp: number = crypto.randomInt(min, max + 1); // Generate a random integer between min and max
  const otpExpiry: Date = moment().add(expiryMinutes, 'minutes').toDate();
  return { otp, otpExpiry };
};
