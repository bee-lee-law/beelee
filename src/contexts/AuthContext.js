'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

// API base URL - adjust for your environment
const API_BASE_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8888/api';

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    isLoading: true,
    isAuthenticated: false,
    mode: null, // 'sandbox' | 'user' | 'owner'
    user: null,
    error: null,
  });

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, []);

  // Check current session status
  const checkSession = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/session`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setAuthState({
          isLoading: false,
          isAuthenticated: true,
          mode: data.data.session.mode,
          user: data.data.session,
          error: null,
        });
      } else {
        setAuthState({
          isLoading: false,
          isAuthenticated: false,
          mode: null,
          user: null,
          error: null,
        });
      }
    } catch (error) {
      console.error('Session check error:', error);
      setAuthState({
        isLoading: false,
        isAuthenticated: false,
        mode: null,
        user: null,
        error: null,
      });
    }
  }, []);

  // Initialize sandbox mode
  const initSandbox = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`${API_BASE_URL}/auth/sandbox/init`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to initialize sandbox mode');
      }

      const data = await response.json();

      setAuthState({
        isLoading: false,
        isAuthenticated: true,
        mode: 'sandbox',
        user: null,
        error: null,
      });

      return { success: true };
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      return { success: false, error: error.message };
    }
  }, []);

  // Login with owner password
  const loginOwner = useCallback(async (password) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`${API_BASE_URL}/auth/owner/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Authentication failed');
      }

      setAuthState({
        isLoading: false,
        isAuthenticated: true,
        mode: 'owner',
        user: null,
        error: null,
      });

      return { success: true };
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      return { success: false, error: error.message };
    }
  }, []);

  // Get OAuth authorization URL
  const getOAuthUrl = useCallback(async (redirectTo = '/challonge') => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/oauth/authorize?redirect=${encodeURIComponent(redirectTo)}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get authorization URL');
      }

      const data = await response.json();
      return { success: true, authUrl: data.data.authUrl };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      await fetch(`${API_BASE_URL}/auth/session/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    setAuthState({
      isLoading: false,
      isAuthenticated: false,
      mode: null,
      user: null,
      error: null,
    });
  }, []);

  // Refresh token
  const refreshToken = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      return response.ok;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }, []);

  // Handle OAuth callback success (called from callback page)
  const handleOAuthSuccess = useCallback(async () => {
    await checkSession();
  }, [checkSession]);

  const value = {
    ...authState,
    initSandbox,
    loginOwner,
    getOAuthUrl,
    logout,
    refreshToken,
    checkSession,
    handleOAuthSuccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
