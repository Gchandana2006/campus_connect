// src/firebase/server.ts
import { initializeApp, getApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

function getFirebaseAdminApp() {
  if (getApps().length > 0) {
    return getApp();
  }

  if (!serviceAccount) {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT environment variable.');
  }

  return initializeApp({
    credential: cert(serviceAccount),
  });
}

export function initializeFirebase() {
  const app = getFirebaseAdminApp();
  const firestore = getFirestore(app);
  return { app, firestore };
}
