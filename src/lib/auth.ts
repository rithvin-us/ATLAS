import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseDb } from './firebase-client';
import { UserRole } from './types';

export interface AuthUser {
  uid: string;
  email: string;
  role: UserRole;
  organizationId?: string;
}

// Sign up with email and password
export async function signUp(
  email: string, 
  password: string, 
  role: 'agent' | 'contractor',
  additionalData?: Record<string, any>
) {
  const auth = getFirebaseAuth();
  const db = getFirebaseDb();
  
  if (!auth || !db) {
    return { success: false, error: 'Firebase not initialized' };
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Store additional user data in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      role,
      createdAt: new Date().toISOString(),
      ...additionalData,
    });

    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Sign in with email and password
export async function signIn(email: string, password: string) {
  const auth = getFirebaseAuth();
  const db = getFirebaseDb();
  
  if (!auth || !db) {
    return { success: false, error: 'Firebase not initialized' };
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();

    return { 
      success: true, 
      user,
      role: userData?.role as UserRole
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Sign out
export async function signOut() {
  const auth = getFirebaseAuth();
  
  if (!auth) {
    return { success: false, error: 'Firebase not initialized' };
  }

  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Get current user
export function getCurrentUser(): Promise<User | null> {
  const auth = getFirebaseAuth();
  
  if (!auth) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

// Get user role from Firestore
export async function getUserRole(uid: string): Promise<UserRole | null> {
  const db = getFirebaseDb();
  
  if (!db) {
    return null;
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data()?.role as UserRole;
    }
    return null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

// User profile type
export interface UserProfile {
  uid: string;
  email?: string;
  name?: string;
  displayName?: string;
  phone?: string;
  role?: UserRole;
  organizationId?: string;
  organizationName?: string;
  createdAt?: string;
  [key: string]: any;
}

// Get user profile data from Firestore
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const db = getFirebaseDb();
  
  if (!db) {
    return null;
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return { uid, ...userDoc.data() } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

// Update user profile (safe fields only)
export async function updateUserProfile(
  uid: string,
  updates: { displayName?: string; phone?: string }
) {
  const db = getFirebaseDb();
  
  if (!db) {
    return { success: false, error: 'Firebase not initialized' };
  }

  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, updates, { merge: true });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
