/**
 * @file UUID generation utility.
 * @description Generates v4 UUIDs using Math.random for client-side ID generation.
 *              Note: Supabase generates UUIDs server-side — this is only used for
 *              local/mock data if needed.
 */

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
