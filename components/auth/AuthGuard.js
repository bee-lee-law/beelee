'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

/**
 * AuthGuard component - protects routes requiring authentication
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render when authenticated
 * @param {string[]} props.allowedModes - Optional array of allowed modes (e.g., ['user', 'owner'])
 * @param {string} props.redirectTo - Where to redirect if not authenticated (default: '/challonge/login')
 * @param {React.ReactNode} props.fallback - Optional loading component
 */
export function AuthGuard({
  children,
  allowedModes,
  redirectTo = '/challonge/login',
  fallback,
}) {
  const router = useRouter();
  const { isLoading, isAuthenticated, mode } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      // Not authenticated - redirect to login
      if (!isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      // Check allowed modes if specified
      if (allowedModes && !allowedModes.includes(mode)) {
        router.push(redirectTo);
        return;
      }
    }
  }, [isLoading, isAuthenticated, mode, allowedModes, redirectTo, router]);

  // Show loading state
  if (isLoading) {
    return fallback || <LoadingSpinner />;
  }

  // Not authenticated
  if (!isAuthenticated) {
    return fallback || <LoadingSpinner />;
  }

  // Check allowed modes
  if (allowedModes && !allowedModes.includes(mode)) {
    return fallback || <LoadingSpinner />;
  }

  return children;
}

function LoadingSpinner() {
  return (
    <div style={styles.loadingContainer}>
      <div style={styles.spinner}></div>
      <p style={styles.loadingText}>Loading...</p>
    </div>
  );
}

const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
    color: '#aaa',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(255, 255, 255, 0.1)',
    borderTopColor: '#4a9eff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '1rem',
  },
};

// Add keyframes for spinner animation via global styles or CSS module
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default AuthGuard;
