'use client';

/**
 * Client-only Firebase module
 * This file should ONLY be imported in client components ('use client')
 * Never import this in server components, layouts, or pages that are prerendered
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Singleton instances
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

/**
 * Get Firebase App instance (client-side only)
 */
export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  if (!app) {
    // Check if we have required config
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.warn('Firebase config missing, skipping initialization');
      return null;
    }
    
    try {
      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    } catch (error) {
      console.error('Firebase initialization error:', error);
      return null;
    }
  }
  
  return app;
}

/**
 * Get Firebase Auth instance (client-side only)
 */
export function getFirebaseAuth(): Auth | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  if (!auth) {
    const firebaseApp = getFirebaseApp();
    if (firebaseApp) {
      auth = getAuth(firebaseApp);
    }
  }
  
  return auth;
}

/**
 * Get Firestore instance (client-side only)
 */
export function getFirebaseDb(): Firestore | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  if (!db) {
    const firebaseApp = getFirebaseApp();
    if (firebaseApp) {
      db = getFirestore(firebaseApp);
    }
  }
  
  return db;
}

// Type exports for consumers
export type { FirebaseApp, Auth, Firestore };
