'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/firebaseClient';
import {
  CrmUserProfile,
  getUserProfile,
  loginWithGoogle as serviceLoginWithGoogle,
  logoutUser as serviceLogoutUser,
  handleRedirectAuth
} from '@/services/authService';

const LS_AUTH_PROFILE_CACHE = 'vitality_auth_profile_cache_v3';

export interface AuthContextType {
  currentUser: User | null;
  userProfile: CrmUserProfile | null;
  isAuthLoading: boolean;
  loginWithGoogle: (customAdvisorName?: string) => Promise<{ user: User; profile: CrmUserProfile }>;
  logout: () => Promise<void>;
  isLoginModalOpen: boolean;
  loginModalReason: string;
  intendedDestination: string | null;
  openLoginModal: (reason?: string, redirectAfter?: string) => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try to load cached user profile immediately for instant 0ms restoration
  const [userProfile, setUserProfile] = useState<CrmUserProfile | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = localStorage.getItem(LS_AUTH_PROFILE_CACHE);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    // If we have auth.currentUser already initialized, use it
    return auth.currentUser || null;
  });

  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [loginModalReason, setLoginModalReason] = useState<string>('');
  const [intendedDestination, setIntendedDestination] = useState<string | null>(null);

  // Sync profile cache to localStorage
  const updateCachedProfile = useCallback((profile: CrmUserProfile | null) => {
    setUserProfile(profile);
    try {
      if (profile) {
        localStorage.setItem(LS_AUTH_PROFILE_CACHE, JSON.stringify(profile));
      } else {
        localStorage.removeItem(LS_AUTH_PROFILE_CACHE);
      }
    } catch (e) {}
  }, []);

  // Handle mobile redirect auth (for iOS Safari and Android Chrome redirect mode)
  useEffect(() => {
    handleRedirectAuth().then((res) => {
      if (res) {
        setCurrentUser(res.user);
        updateCachedProfile(res.profile);
      }
    });
  }, [updateCachedProfile]);

  // Global Auth State Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const profile = await getUserProfile(user.uid, user.email);
          updateCachedProfile(profile);
        } catch (e) {
          console.warn('[AuthContext] Error getting user profile:', e);
        }
      } else {
        updateCachedProfile(null);
      }
      setIsAuthLoading(false);
    });

    return () => unsub();
  }, [updateCachedProfile]);

  const handleLogin = async (customAdvisorName?: string) => {
    setIsAuthLoading(true);
    try {
      const result = await serviceLoginWithGoogle(customAdvisorName);
      setCurrentUser(result.user);
      updateCachedProfile(result.profile);
      setIsLoginModalOpen(false);
      return result;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsAuthLoading(true);
    try {
      await serviceLogoutUser();
      setCurrentUser(null);
      updateCachedProfile(null);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const openLoginModal = (reason: string = '', redirectAfter?: string) => {
    setLoginModalReason(reason);
    if (redirectAfter) {
      setIntendedDestination(redirectAfter);
    }
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setLoginModalReason('');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAuthLoading,
        loginWithGoogle: handleLogin,
        logout: handleLogout,
        isLoginModalOpen,
        loginModalReason,
        intendedDestination,
        openLoginModal,
        closeLoginModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
