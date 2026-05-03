import { useState, useEffect } from 'react';
import { auth, signInAnonymously, GoogleAuthProvider, signInWithPopup, signOut } from '@/lib/infrastructure/firebase';
import { UserProfile } from '@/lib/domain/types';
import { onAuthStateChanged } from 'firebase/auth';

/**
 * Custom hook to manage Firebase authentication state, including anonymous and Google login.
 *
 * @returns {Object} An object containing the current user, loading state, user role, and authentication methods.
 * @returns {User | null} returns.user - The current authenticated Firebase user or null.
 * @returns {boolean} returns.loading - Whether the auth state is currently loading.
 * @returns {'staff' | 'voter'} returns.role - The derived role of the user ('staff' for Google auth, 'voter' otherwise).
 * @returns {Function} returns.loginAnonymously - Function to authenticate anonymously.
 * @returns {Function} returns.loginWithGoogle - Function to authenticate via Google Popup.
 * @returns {Function} returns.logout - Function to sign out the current user.
 */
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
      console.error('Anonymous login failed', error);
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
      console.error('Google login failed', error);
      return null;
    }
  };

  const logout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return { user, loading, loginAnonymously, loginWithGoogle, logout };
}
