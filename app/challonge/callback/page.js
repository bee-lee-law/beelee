'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleOAuthSuccess } = useAuth();
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    const processCallback = async () => {
      const authSuccess = searchParams.get('auth');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        // Redirect to login with error
        setTimeout(() => {
          router.push(`/challonge/login?error=${encodeURIComponent(error)}`);
        }, 1500);
        return;
      }

      if (authSuccess === 'success') {
        setStatus('success');
        // Refresh auth state from cookies
        await handleOAuthSuccess();
        // Redirect to dashboard
        setTimeout(() => {
          router.push('/challonge');
        }, 1000);
      } else {
        setStatus('error');
        setTimeout(() => {
          router.push('/challonge/login?error=Unknown%20authentication%20error');
        }, 1500);
      }
    };

    processCallback();
  }, [searchParams, router, handleOAuthSuccess]);

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {status === 'processing' && (
          <>
            <div style={styles.spinner}></div>
            <h2 style={styles.title}>Processing authentication...</h2>
            <p style={styles.subtitle}>Please wait while we complete your login.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={styles.successIcon}>✓</div>
            <h2 style={styles.title}>Authentication successful!</h2>
            <p style={styles.subtitle}>Redirecting to dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={styles.errorIcon}>✕</div>
            <h2 style={styles.title}>Authentication failed</h2>
            <p style={styles.subtitle}>Redirecting to login...</p>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0a0a',
  },
  content: {
    textAlign: 'center',
    color: '#fff',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '3px solid rgba(255, 255, 255, 0.1)',
    borderTopColor: '#4a9eff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 1.5rem',
  },
  successIcon: {
    width: '50px',
    height: '50px',
    backgroundColor: 'rgba(40, 167, 69, 0.2)',
    border: '2px solid #28a745',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    color: '#28a745',
    margin: '0 auto 1.5rem',
  },
  errorIcon: {
    width: '50px',
    height: '50px',
    backgroundColor: 'rgba(220, 53, 69, 0.2)',
    border: '2px solid #dc3545',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    color: '#dc3545',
    margin: '0 auto 1.5rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: '#aaa',
  },
};
