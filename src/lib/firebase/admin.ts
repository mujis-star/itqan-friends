import { initializeApp, getApps, cert, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
let serviceAccount = null;
try {
  if (serviceAccountStr) {
    serviceAccount = JSON.parse(serviceAccountStr);
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
  }
} catch (e) {
  console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT JSON", e);
}

let app;
if (!getApps().length) {
  try {
    if (serviceAccount) {
      app = initializeApp({
        credential: cert(serviceAccount),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "zenith-artsfest.firebasestorage.app",
      });
    } else {
      console.warn("FIREBASE_SERVICE_ACCOUNT is not set. Admin SDK will fail in production.");
      app = initializeApp({
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "zenith-artsfest.firebasestorage.app",
      });
    }
  } catch (error) {
    console.error("Firebase admin initialization error", error);
  }
} else {
  app = getApp();
}

export const adminAuth = app ? getAuth(app) : null as any;
export const adminDb = app ? getFirestore(app) : null as any;
export const adminStorage = app ? getStorage(app) : null as any;
