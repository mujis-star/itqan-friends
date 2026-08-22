import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAgOLv2xG21CY7ghd3KOhQcfRrWZ34aPGU",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "zenith-artsfest.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "zenith-artsfest",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "zenith-artsfest.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "506898514611",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:506898514611:web:0ea13ddd075a020062e6c6",
};

let app: any;
try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} catch (e) {
  console.error("Firebase client initialization error:", e);
}

export const auth = app ? getAuth(app) : null as any;
export const db = app ? initializeFirestore(app, { experimentalForceLongPolling: true }) : null as any;
export const storage = app ? getStorage(app) : null as any;
