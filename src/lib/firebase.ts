import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
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
const clientApp = !getClientApps().length ? initializeClientApp(clientConfig) : getClientApp();
const clientDb = getClientFirestore(clientApp);

// Server-side Firebase Admin SDK configuration
let adminApp: App;
let db: Firestore | null = null;

try {
  const serviceAccountCreds = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!serviceAccountCreds) {
    throw new Error(
      "GOOGLE_APPLICATION_CREDENTIALS is not set. " +
      "Please create a .env file and add your Firebase service account credentials. " +
      "See .env.example for more details."
    );
  }

  if (getApps().length === 0) {
    console.log("Initializing Firebase Admin SDK...");
    const serviceAccount = JSON.parse(
      Buffer.from(serviceAccountCreds, 'base64').toString('utf8')
    );
    adminApp = initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
    console.log("Using existing Firebase Admin SDK app.");
    adminApp = getApp();
  }
  db = getFirestore(adminApp);
  console.log("Firebase Admin SDK initialized and Firestore is available.");

} catch (error: any) {
  console.error('CRITICAL: Firebase Admin SDK initialization error.');
  console.error('Full error:', error.message);
  // Re-throw the error to make it clear that the server cannot start without proper config
  throw new Error(
    `Firebase Admin SDK failed to initialize: ${error.message}. ` +
    `Please check your GOOGLE_APPLICATION_CREDENTIALS in your .env file.`
  );
}

export { clientApp, clientDb, db };
