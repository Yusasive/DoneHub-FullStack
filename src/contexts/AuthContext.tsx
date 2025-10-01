import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User } from '../types';
import {
  completeMemberSignup,
  getUserById,
  signIn as mockSignIn,
  signOut as mockSignOut,
  signUp as mockSignUp,
} from '../utils/mockApi';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const STORAGE_KEY = 'donehub_active_user';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserId = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;

    if (!storedUserId) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const profile = await getUserById(storedUserId);
        if (profile) {
          setUser(profile);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    try {
      const authenticatedUser = await mockSignIn(email, password);
      setUser(authenticatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, authenticatedUser.id);
      }
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const handleSignUp = async (email: string, password: string, name?: string) => {
    try {
      const newUser = await mockSignUp(email, password, name);
      setUser(newUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, newUser.id);
      }
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const handleSignOut = async () => {
    await mockSignOut();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
