// lib/firebaseAdmin.ts
import * as admin from 'firebase-admin';

// Singleton – initializes only once (safe for Vercel / Next.js / Turbopack)
let firebaseAdmin: admin.app.App | null = null;

function getFirebaseAdmin() {
  if (!firebaseAdmin) {
    try {
      firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID!,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });

      console.log('✅ Firebase Admin SDK initialized successfully');
    } catch (error: any) {
      console.error('❌ Firebase Admin initialization failed:', error.message);
      throw new Error('Firebase Admin failed to initialize. Check your env variables.');
    }
  }
  return firebaseAdmin;
}

// ====================== EXPORTED HELPERS ======================
export function getAdminAuth() {
  return getFirebaseAdmin().auth();
}

export function getAdminDb() {
  return getFirebaseAdmin().firestore();
}

// Optional: add these later if you need them
// export function getAdminStorage() {
//   return getFirebaseAdmin().storage();
// }
// export function getAdminMessaging() {
//   return getFirebaseAdmin().messaging();
// }