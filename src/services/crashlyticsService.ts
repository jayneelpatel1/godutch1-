/**
 * @service crashlyticsService
 * @description Platform-aware Firebase Crashlytics wrapper.
 *              Uses @react-native-firebase/crashlytics on native (Android/iOS)
 *              and a no-op stub on web (Crashlytics not available via Firebase JS SDK).
 *
 * @used-in RootLayout (user identification), all screens (error recording)
 *
 * @platform Android ✅ | iOS ✅ | Web ✅ (no-op)
 */

import { Platform } from 'react-native';

const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

let Crashlytics: any = null;

function getCrashlytics() {
  if (!isNative) return null;
  if (!Crashlytics) {
    try {
      Crashlytics = require('@react-native-firebase/crashlytics').default();
    } catch {
      return null;
    }
  }
  return Crashlytics;
}

export function initCrashlytics(): void {
  getCrashlytics();
}

export function setCrashlyticsUserId(userId: string | null): void {
  if (!isNative || !userId) return;
  try {
    getCrashlytics()?.setUserId(userId);
  } catch (error) {
    console.warn('[crashlytics] setUserId failed:', error);
  }
}

export function crashlyticsLog(message: string): void {
  if (!isNative) return;
  try {
    getCrashlytics()?.log(message);
  } catch (error) {
    console.warn('[crashlytics] log failed:', error);
  }
}

export function crashlyticsRecordError(error: Error): void {
  if (!isNative) return;
  try {
    getCrashlytics()?.recordError(error);
  } catch (e) {
    console.warn('[crashlytics] recordError failed:', e);
  }
}

export function crashlyticsSetAttribute(
  key: string,
  value: string | number | boolean,
): void {
  if (!isNative) return;
  try {
    getCrashlytics()?.setAttribute(key, String(value));
  } catch (error) {
    console.warn('[crashlytics] setAttribute failed:', error);
  }
}
