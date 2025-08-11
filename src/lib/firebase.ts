import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp as initializeClientApp, getApps as getClientApps, getApp as getClientApp } from 'firebase/app';
import { getFirestore as getClientFirestore } from 'firebase/firestore';

// Client-side Firebase configuration
const clientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase for the client
const clientApp = getClientApps().length ? getClientApp() : initializeClientApp(clientConfig);
const clientDb = getClientFirestore(clientApp);


// Server-side Firebase Admin SDK configuration
let adminDb: ReturnType<typeof getFirestore>;

try {
    const serviceAccountString = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!serviceAccountString) {
        throw new Error("The GOOGLE_APPLICATION_CREDENTIALS environment variable is not set. This is required for server-side Firebase Admin operations.");
    }
    const serviceAccount = JSON.parse(serviceAccountString);

    if (!getApps().length) {
        initializeApp({
            credential: cert(serviceAccount),
            databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`
        });
    }
    adminDb = getFirestore();
} catch (error: any) {
    console.error('Firebase Admin SDK initialization error:', error.message);
    // The app can still run on the client side, but server actions will fail.
    // @ts-ignore
    adminDb = null;
}

// We rename the exports to avoid conflicts and make their usage clear.
export { clientApp, clientDb, adminDb as db };
