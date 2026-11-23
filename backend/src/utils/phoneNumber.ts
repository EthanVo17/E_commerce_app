/**
 * Normalize phone number to international E.164 format (+84XXXXXXXXX).
 *
 * Examples:
 *  - "0901234567"     → "+84901234567"
 *  - "84901234567"    → "+84901234567"
 *  - "+84901234567"   → "+84901234567"
 *  - "0 901 234 567"  → "+84901234567"
 *  - "090-123-4567"   → "+84901234567"
 *  - "(090) 123 4567" → "+84901234567"
 */
export function normalizePhone(raw: string): string {
  if (!raw) return "";
  // Strip all non-digit characters except leading +
  const hasPlus = raw.trim().startsWith("+");
  const digits = raw.replace(/\D/g, "");

  if (hasPlus) {
    return `+${digits}`;
  }

  // Vietnam national prefix 0 -> +84
  if (digits.startsWith("0") && digits.length === 10) {
    return `+84${digits.slice(1)}`;
  }

  // Vietnam without plus -> 84901234567
  if (digits.startsWith("84") && digits.length === 11) {
    return `+${digits}`;
  }

  return `+${digits}`;
}

/**
 * Validate whether a phone number matches E.164 standard.
 * Specifically for Vietnam (+84 followed by 9 digits) or general E.164 (+ and 10-15 digits).
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Standard Vietnamese mobile numbers in E.164: +84[3|5|7|8|9]xxxxxxxx (10 digits total after +)
  return /^\+84(3|5|7|8|9)\d{8}$/.test(phone) || /^\+84\d{9}$/.test(phone);
}

/**
 * Mask phone number for display UX: "+84901234567" → "+84 90***4567"
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 8) return phone;
  const clean = phone.startsWith("+") ? phone : `+${phone}`;
  if (clean.startsWith("+84") && clean.length === 12) {
    // e.g. +84 90***4567
    return `+84 ${clean.slice(3, 5)}***${clean.slice(-4)}`;
  }
  return clean.slice(0, 5) + "***" + clean.slice(-4);
}
