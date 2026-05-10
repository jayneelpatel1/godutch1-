/**
 * @file Validation utilities.
 * @description Simple input validation functions used across the app.
 */

/**
 * @function isValidEmail
 * @description Checks if a string is a valid email using a regex pattern.
 *
 * @param email — The email string to validate
 * @returns True if the email matches the standard format
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
