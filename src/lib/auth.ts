import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
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
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Get current user
export function getCurrentUser(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

// Get user role from Firestore
export async function getUserRole(uid: string): Promise<UserRole | null> {
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
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, updates, { merge: true });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
