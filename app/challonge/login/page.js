'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import ModeSelector from '../../../components/auth/ModeSelector';
import OwnerLogin from '../../../components/auth/OwnerLogin';
import Logo from '../logo';


const myGreen = "#45CB85";
const myPurp = "#A882DD";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();
  const [showOwnerLogin, setShowOwnerLogin] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Check for error from OAuth callback
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      setAuthError(decodeURIComponent(error));
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/challonge');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.loading}>Loading...</div>
        </div>
      </div>
    );
  }

  // Already authenticated, will redirect
  if (isAuthenticated) {
    return null;
  }

function NewOutput() {
  return(
    <div className="min-h-screen flex-column items-center justify-center px-6 w-5/6 m-auto mb-4" >
      <main className="max-w-2xl w-full ml-auto mr-auto mt-20" >
        <section className="mb-6">
          <div className="flex items-center justify-center mb-0">
            <Logo />  <div className="ml-4" style={{fontSize: '36px'}}>tournament manager</div>  
          </div> 
          <div style={styles.subtitle} className="flex items-center justify-center"><div>powered by challonge</div></div>
        </section>
        
        {authError && (
          <section className="mb-6">
          <div style={styles.error}>
            {authError}
          </div>
          </section>
        )}
        
          {showOwnerLogin ? (
            <OwnerLogin onBack={() => setShowOwnerLogin(false)} />
          ) : (
            <ModeSelector onSelectOwner={() => setShowOwnerLogin(true)} />
          )}

      </main>
    </div>
  )
}

  return(<NewOutput />)
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>Tournament Manager</h1>
          <p style={styles.subtitle}>Powered by Challonge</p>
        </div>

        {authError && (
          <div style={styles.error}>
            {authError}
          </div>
        )}

        {showOwnerLogin ? (
          <OwnerLogin onBack={() => setShowOwnerLogin(false)} />
        ) : (
          <ModeSelector onSelectOwner={() => setShowOwnerLogin(true)} />
        )}

        <div style={styles.footer}>
          <a href="/" style={styles.footerLink}>
            ← Back to Portfolio
          </a>
        </div>
      </div>
    </div>
  );
}



const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  },
  content: {
    width: '100%',
    maxWidth: '500px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1rem',
    color: myGreen,
  },
  error: {
    backgroundColor: 'rgba(220, 53, 69, 0.2)',
    border: '1px solid #dc3545',
    color: '#ff6b6b',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    textAlign: 'center',
  },
  loading: {
    textAlign: 'center',
    color: '#aaa',
    padding: '2rem',
  },
  footer: {
    textAlign: 'center',
    marginTop: '2rem',
  },
  footerLink: {
    color: '#666',
    textDecoration: 'none',
    fontSize: '0.9rem',
  },
};
