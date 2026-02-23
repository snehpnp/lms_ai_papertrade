import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique referral code (e.g. 8-char alphanumeric uppercase).
 */
export function generateReferralCode(): string {
  return uuidv4().replace(/-/g, '').slice(0, 8).toUpperCase();
}
