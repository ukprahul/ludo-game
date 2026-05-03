import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

let db   = null;
let auth = null;

export function isFirebaseConfigured() {
  return !!(
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_DATABASE_URL
  );
}

export function getFirebaseDB() {
  if (!isFirebaseConfigured()) throw new Error('Firebase is not configured. Copy .env.example → .env and fill in your credentials.');
  if (!db) {
    const app = getApps().length === 0
      ? initializeApp({
          apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
          authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
          databaseURL:       import.meta.env.VITE_FIREBASE_DATABASE_URL,
          projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
          storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
          appId:             import.meta.env.VITE_FIREBASE_APP_ID,
        })
      : getApps()[0];
    db   = getDatabase(app);
    auth = getAuth(app);
  }
  return db;
}

export function getFirebaseAuth() {
  getFirebaseDB(); // ensures init
  return auth;
}
