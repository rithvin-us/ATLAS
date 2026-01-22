/**
 * Firebase Configuration Module
 * 
 * IMPORTANT: This module is designed to be safely imported during SSR/build.
 * All Firebase initialization is deferred and guarded with typeof window checks.
 * 
 * For client-only code, prefer importing from '@/lib/firebase-client' directly.
 */

// Re-export everything from the client module for backward compatibility
// These functions are safe to call - they return null during SSR
export { 
  getFirebaseApp, 
  getFirebaseAuth, 
  getFirebaseDb,
  type FirebaseApp,
  type Auth,
  type Firestore
} from './firebase-client';

// Null-safe stubs for server-side rendering
// These are explicitly null during build/SSR
export const app = typeof window === 'undefined' ? null : undefined;
export const auth = typeof window === 'undefined' ? null : undefined;
export const db = typeof window === 'undefined' ? null : undefined;
export const safeAuth = null;
export const safeDb = null;

