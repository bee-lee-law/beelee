'use client';

import { useAuth } from '../../hooks/useAuth';
import AuthGuard from '../../components/auth/AuthGuard';

function ChallongeDashboard() {
  const { mode, logout, isSandbox, canAccessChallonge } = useAuth();

  const getModeLabel = () => {
    switch (mode) {
      case 'sandbox':
        return 'Sandbox Mode';
      case 'user':
        return 'Your Challonge Account';
      case 'owner':
        return 'Owner Access';
      default:
        return 'Unknown';
    }
  };

  const getModeDescription = () => {
    switch (mode) {
      case 'sandbox':
        return 'You are viewing demo data. Changes will not be saved.';
      case 'user':
        return 'Connected to your personal Challonge account.';
      case 'owner':
        return 'Using owner credentials for Challonge access.';
      default:
        return '';
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Tournament Manager</h1>
        <button onClick={logout} style={styles.logoutButton}>
          Logout
        </button>
      </header>

      <main style={styles.main}>
        <div style={styles.modeCard}>
          <div style={styles.modeIcon}>
            {mode === 'sandbox' && '🎮'}
            {mode === 'user' && '🔐'}
            {mode === 'owner' && '👤'}
          </div>
          <div style={styles.modeInfo}>
            <h2 style={styles.modeLabel}>{getModeLabel()}</h2>
            <p style={styles.modeDesc}>{getModeDescription()}</p>
          </div>
        </div>

        {isSandbox && (
          <div style={styles.sandboxNotice}>
            <strong>Sandbox Mode Active</strong>
            <p>
              This is a demo environment with sample data. Tournament operations
              are simulated and won&apos;t affect any real Challonge data.
            </p>
          </div>
        )}

        <div style={styles.placeholder}>
          <h3>Coming Soon</h3>
          <p>
            Tournament management features will be implemented in Phase 6.
            {canAccessChallonge && (
              <span> Your Challonge API access is ready.</span>
            )}
          </p>
        </div>

        <div style={styles.nav}>
          <a href="/" style={styles.navLink}>
            ← Back to Portfolio
          </a>
        </div>
      </main>
    </div>
  );
}

export default function ChallongePage() {
  return (
    <AuthGuard>
      <ChallongeDashboard />
    </AuthGuard>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    color: '#fff',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '600',
  },
  logoutButton: {
    padding: '0.5rem 1rem',
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '6px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  main: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem',
  },
  modeCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.5rem',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    marginBottom: '1.5rem',
  },
  modeIcon: {
    fontSize: '2.5rem',
  },
  modeInfo: {
    flex: 1,
  },
  modeLabel: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.25rem',
  },
  modeDesc: {
    color: '#aaa',
    fontSize: '0.9rem',
  },
  sandboxNotice: {
    padding: '1rem',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    border: '1px solid rgba(255, 193, 7, 0.3)',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    color: '#ffc107',
  },
  placeholder: {
    textAlign: 'center',
    padding: '3rem',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px dashed rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#666',
  },
  nav: {
    marginTop: '2rem',
    textAlign: 'center',
  },
  navLink: {
    color: '#666',
    textDecoration: 'none',
  },
};
