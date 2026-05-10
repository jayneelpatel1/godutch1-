/**
 * @file Firebase initialization module.
 * @description Initializes the Firebase app and Auth instance using environment variables.
 *              All EXPO_PUBLIC_FIREBASE_* vars must be set in .env or build config.
 *
 * @exports firebaseApp — The initialized Firebase application instance
 * @exports firebaseAuth — The Auth instance used for Google sign-in
 *
 * @see https://firebase.google.com/docs/web/setup
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
