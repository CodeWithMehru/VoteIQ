import { useState, useEffect, useCallback } from 'react';
import { 
  onAuthStateChanged, 
  signInAnonymously, 
  signInWithPopup, 
  signOut, 
  GoogleAuthProvider, 
  User as FirebaseUser,
  UserCredential,
  Auth
} from 'firebase/auth';
import { auth } from '@/lib';

export type UserRole = 'voter' | 'staff' | 'admin';

export interface User {
  readonly uid: string;
  readonly email: string | null;
  readonly displayName: string | null;
  readonly isAnonymous: boolean;
  readonly role: UserRole;
}

export interface UseAuthReturn {
  readonly user: User | null;
  readonly loading: boolean;
  readonly loginAnonymously: () => Promise<User | null>;
  readonly loginWithGoogle: () => Promise<User | null>;
  readonly logout: () => Promise<void>;
}

/**
 * Singularity Architecture: Auth Hook with Strict Types
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const mapFirebaseUser = useCallback((fbUser: FirebaseUser | null): User | null => {
    if (!fbUser) return null;
    return {
      uid: fbUser.uid,
      email: fbUser.email,
      displayName: fbUser.displayName,
      isAnonymous: fbUser.isAnonymous,
      role: fbUser.email?.endsWith('@example.com') ? 'staff' : 'voter',
    } satisfies User;
  }, []);

  useEffect((): (() => void) => {
    if (!auth) return (): void => {};
    const unsubscribe = onAuthStateChanged(auth as Auth, (fbUser: FirebaseUser | null): void => {
      setUser(mapFirebaseUser(fbUser));
      setLoading(false);
    });
    return unsubscribe;
  }, [mapFirebaseUser]);

  const loginAnonymously = async (): Promise<User | null> => {
    if (!auth) return null;
    try {
      const result: UserCredential = await signInAnonymously(auth as Auth);
      return mapFirebaseUser(result.user);
    } catch (error: unknown) {
      console.error('Anonymous login failed:', error);
      return null;
    }
  };

  const loginWithGoogle = async (): Promise<User | null> => {
    if (!auth) return null;
    try {
      const provider = new GoogleAuthProvider();
      const result: UserCredential = await signInWithPopup(auth as Auth, provider);
      return mapFirebaseUser(result.user);
    } catch (error: unknown) {
      console.error('Google login failed:', error);
      return null;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (auth) await signOut(auth as Auth);
    } catch (error: unknown) {
      console.error('Logout failed:', error);
    }
  };

  return { user, loading, loginAnonymously, loginWithGoogle, logout } satisfies UseAuthReturn;
}
