import { createHmac } from 'crypto';
import config from '../config/config';

/**
 * Generates a signature for SmileID API requests
 * @param timestamp - ISO date/time format (e.g., 2025-07-28T10:18:20.000+05:30)
 * @returns Base64-encoded SHA-256 HMAC signature
 */
export const generateSignature = (timestamp: string): string => {
  if (!config.smileId?.apiKey) {
    throw new Error('SmileID API key is required');
  }
  if (!config.smileId?.partnerId) {
    throw new Error('SmileID partner ID is required');
  }

  console.log("config.smileId.apiKey",config.smileId.apiKey)
  const hmac = createHmac('sha256', config.smileId.apiKey);
  hmac.update(timestamp, 'utf8');
  hmac.update(config.smileId.partnerId, 'utf8');
  hmac.update('sid_request', 'utf8');

let signature = hmac.digest().toString("base64");
return signature;
};