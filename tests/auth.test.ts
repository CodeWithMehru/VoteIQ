import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { useAuth } from '@/hooks/useAuth';
import { renderHook, act } from '@testing-library/react';
import * as firebaseLib from '@/lib/infrastructure/firebase';

// Mock Firebase
vi.mock('@/lib/infrastructure/firebase', () => {
  return {
    auth: { currentUser: null },
    signInAnonymously: vi.fn(),
    signInWithPopup: vi.fn(),
    signOut: vi.fn(),
    GoogleAuthProvider: vi.fn(),
  };
});

// Mock firebase/auth
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((auth, cb) => {
    // Initial call simulates unauthenticated state
    cb(null);
    return vi.fn(); // unsubscribe mock
  }),
}));

describe('Auth Hook & Roles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with null user', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
    // In our mock, the initial callback happens immediately, so loading is false
    expect(result.current.loading).toBe(false);
  });

  it('loginAnonymously calls Firebase signInAnonymously', async () => {
    const mockUser = { uid: 'anon-123' };
    (firebaseLib.signInAnonymously as Mock).mockResolvedValueOnce({ user: mockUser });

    const { result } = renderHook(() => useAuth());

    let returnedUser;
    await act(async () => {
      returnedUser = await result.current.loginAnonymously();
    });

    expect(firebaseLib.signInAnonymously).toHaveBeenCalled();
    expect(returnedUser).toEqual(mockUser);
  });

  it('loginWithGoogle calls Firebase signInWithPopup', async () => {
    const mockUser = { uid: 'google-123', displayName: 'Staff Name' };
    (firebaseLib.signInWithPopup as Mock).mockResolvedValueOnce({ user: mockUser });

    const { result } = renderHook(() => useAuth());

    let returnedUser;
    await act(async () => {
      returnedUser = await result.current.loginWithGoogle();
    });

    expect(firebaseLib.signInWithPopup).toHaveBeenCalled();
    expect(returnedUser).toEqual(mockUser);
  });

  it('logout calls Firebase signOut', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.logout();
    });

    expect(firebaseLib.signOut).toHaveBeenCalled();
  });

  // Role check simulation is usually tested by simulating the onAuthStateChanged callback
  // but since we mocked it simply above, we can test the expected hook behavior
  it('detects staff role based on displayName logic', async () => {
    // Override the mock for this test
    const { onAuthStateChanged } = await import('firebase/auth');
    (onAuthStateChanged as Mock).mockImplementationOnce((auth: unknown, cb: (user: unknown) => void) => {
      cb({ uid: 'staff-123', displayName: 'John', isAnonymous: false });
      return vi.fn();
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.user?.role).toBe('staff');
    expect(result.current.user?.uid).toBe('staff-123');
  });

  describe('Firebase Lockout Simulation', () => {
    it('handles loginAnonymously failure due to Google Cloud outage gracefully', async () => {
      const { signInAnonymously } = await import('firebase/auth');
      (signInAnonymously as Mock).mockRejectedValueOnce(new Error('auth/network-request-failed'));

      const { result } = renderHook(() => useAuth());

      // Wait for initialization
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      let userResult = null;
      try {
        userResult = await result.current.loginAnonymously();
      } catch (e: any) {
        expect(e.message).toBe('auth/network-request-failed');
      }
      expect(userResult).toBeNull();
    });
  });
});
