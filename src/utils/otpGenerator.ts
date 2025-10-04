import { randomBytes } from 'crypto';

export function generateOTP(length: number): string {
  // Calculate the maximum value for the given length (e.g., 10^6 = 1000000 for length 6)
  const maxValue = Math.pow(10, length);
  // Generate enough random bytes to cover the range (4 bytes = 32 bits, enough for up to 9 digits)
  const buffer = randomBytes(4);
  // Convert the buffer to an unsigned 32-bit integer
  const randomNumber = buffer.readUInt32BE(0);
  // Map the random number to the range [0, maxValue - 1] and pad with zeros
  const otp = (randomNumber % maxValue).toString().padStart(length, '0');
  
  return otp;
}