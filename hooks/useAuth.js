'use client';

import { useAuthContext } from '../src/contexts/AuthContext';

/**
 * Hook for accessing auth state and actions
 * Provides convenient access to authentication functionality
 */
export function useAuth() {
  const auth = useAuthContext();

  return {
    // State
    isLoading: auth.isLoading,
    isAuthenticated: auth.isAuthenticated,
    mode: auth.mode,
    user: auth.user,
    error: auth.error,

    // Computed
    isSandbox: auth.mode === 'sandbox',
    isUser: auth.mode === 'user',
    isOwner: auth.mode === 'owner',
    canAccessChallonge: auth.mode === 'user' || auth.mode === 'owner',

    // Actions
    initSandbox: auth.initSandbox,
    loginOwner: auth.loginOwner,
    getOAuthUrl: auth.getOAuthUrl,
    logout: auth.logout,
    refreshToken: auth.refreshToken,
    checkSession: auth.checkSession,
    handleOAuthSuccess: auth.handleOAuthSuccess,
  };
}

export default useAuth;
