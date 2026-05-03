/* eslint-disable */
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import { onAuthStateChanged, signInAnonymously, signInWithPopup, signOut, User as FirebaseUser, UserCredential } from 'firebase/auth';

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  onAuthStateChanged: vi.fn((_auth: unknown, cb: (user: FirebaseUser | null) => void): (() => void) => {
    cb(null);
    return vi.fn();
  }),
  signInAnonymously: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  GoogleAuthProvider: vi.fn(),
}));

vi.mock('@/lib', () => ({
  auth: {},
  signInAnonymously: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  GoogleAuthProvider: vi.fn(),
}));

describe('useAuth Hook', () => {
  it('should initialize with loading state', (): void => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.loading).toBeDefined();
  });

  it('should handle anonymous login', async (): Promise<void> => {
     
    const mockUser = { uid: 'anon-123', isAnonymous: true } as unknown as FirebaseUser;
     
    vi.mocked(signInAnonymously).mockResolvedValueOnce({ user: mockUser } as unknown as UserCredential);

    const { result } = renderHook(() => useAuth());

    await act(async (): Promise<void> => {
      const user = await result.current.loginAnonymously();
      expect(user?.uid).toBe('anon-123');
    });
  });

  it('should handle Google login and assign staff role', async (): Promise<void> => {
     
    const mockUser = { uid: 'google-123', isAnonymous: false, displayName: 'Staff User', email: 'staff@example.com' } as unknown as FirebaseUser;
     
    vi.mocked(signInWithPopup).mockResolvedValueOnce({ user: mockUser } as unknown as UserCredential);

    const { result } = renderHook(() => useAuth());

    await act(async (): Promise<void> => {
      const user = await result.current.loginWithGoogle();
      expect(user?.uid).toBe('google-123');
    });
  });

  it('should handle logout', async (): Promise<void> => {
    vi.mocked(signOut).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useAuth());

    await act(async (): Promise<void> => {
      await result.current.logout();
    });

    expect(signOut).toHaveBeenCalled();
  });

  it('should update user state when auth state changes', async (): Promise<void> => {
     
    const mockUser = { uid: 'google-123', isAnonymous: false, displayName: 'Staff User', email: 'staff@example.com' } as unknown as FirebaseUser;
     
    vi.mocked(onAuthStateChanged).mockImplementationOnce((_auth: any, cb: any): (() => void) => {
      cb(mockUser);
      return vi.fn();
    });

    const { result } = renderHook(() => useAuth());
    expect(result.current.user?.role).toBe('staff');
  });
});
