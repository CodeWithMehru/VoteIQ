import { useState, useEffect } from 'react';
import { auth, signInAnonymously, GoogleAuthProvider, signInWithPopup, signOut } from '@/lib/firebase';
import { UserProfile } from '@/lib/types';
import { onAuthStateChanged } from 'firebase/auth';

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Mock checking custom claims for staff role. 
        // In a real app, you'd check token claims: `const token = await firebaseUser.getIdTokenResult(); const isStaff = token.claims.role === 'staff';`
        // For this hackathon, we'll assign 'staff' if they signed in with Google (have a displayName)
        const isStaff = firebaseUser.isAnonymous === false; 

        setUser({
          uid: firebaseUser.uid,
          role: isStaff ? 'staff' : 'citizen',
          displayName: firebaseUser.displayName,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginAnonymously = async () => {
    if (!auth) return null;
    try {
      const result = await signInAnonymously(auth);
      return result.user;
    } catch (error) {
      console.error("Anonymous login failed", error);
      return null;
    }
  };

  const loginWithGoogle = async () => {
    if (!auth) return null;
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      console.error("Google login failed", error);
      return null;
    }
  };

  const logout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return { user, loading, loginAnonymously, loginWithGoogle, logout };
}
