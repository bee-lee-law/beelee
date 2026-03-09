'use client';

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const myGreen = "#45CB85";
const myPurp = "#A882DD";

export function ModeSelector({ onSelectOwner }) {
  const { initSandbox, getOAuthUrl, isLoading } = useAuth();
  const [error, setError] = useState(null);

  const handleSandbox = async () => {
    setError(null);
    const result = await initSandbox();
    if (!result.success) {
      setError(result.error);
    }
  };

  const handleOAuth = async () => {
    setError(null);
    const result = await getOAuthUrl('/challonge');
    if (result.success) {
      window.location.href = result.authUrl;
    } else {
      setError(result.error);
    }
  };

  const handleOwner = () => {
    setError(null);
    onSelectOwner?.();
  };
  function NewOutput () {
    return (

          <section className="mb-12">
          <div className="flex items-center">
            <h1 className="text-lg mb-1 font-bold" style={{color: myPurp}}>modes&nbsp;</h1>
            <hr className="flex-1" style={{color: myPurp}} />
          </div>
          <div className="text-sm mb-6">select how you want to access the tournament manager</div>
            <div style={styles.options}>
              {/* Sandbox Mode */}
              <button 
                onClick={handleSandbox}
                disabled={isLoading}
                style={styles.optionButton}
              >
                <div style={styles.optionIcon}>🎮</div>
                <div style={styles.optionTitle}>Sandbox Mode</div>
                <div style={styles.optionDesc}>
                  Explore with demo data. No account needed
                </div>
              </button>

              {/* OAuth Mode */}
              <button
                onClick={handleOAuth}
                disabled={isLoading}
                style={styles.optionButton}
              >
                <div style={styles.optionIcon}>🔐</div>
                <div style={styles.optionTitle}>Your Challonge Account</div>
                <div style={styles.optionDesc}>
                  Sign in to your Challonge account via OAuth to access your tournaments
                </div>
              </button>

              {/* Owner Mode */}
              <button
                onClick={handleOwner}
                disabled={isLoading}
                style={styles.optionButton}
              >
                <div style={styles.optionIcon}>🐝</div>
                <div style={styles.optionTitle}>Bee's Access</div>
                <div style={styles.optionDesc}>
                  Access with Bee's credentials for one of his tournaments (password required)
                </div>
              </button>
            </div>
            {isLoading && <div style={styles.loading}>Loading...</div>}
          </section>

    )
  }
  return(<NewOutput />)
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>choose access mode</h2>
      <p style={styles.subtitle}>
        Select how you want to access the tournament manager
      </p>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.options}>
        {/* Sandbox Mode */}
        <button
          onClick={handleSandbox}
          disabled={isLoading}
          style={styles.optionButton}
        >
          <div style={styles.optionIcon}>🎮</div>
          <div style={styles.optionTitle}>Sandbox Mode</div>
          <div style={styles.optionDesc}>
            Explore with demo data. No account needed.
          </div>
        </button>

        {/* OAuth Mode */}
        <button
          onClick={handleOAuth}
          disabled={isLoading}
          style={styles.optionButton}
        >
          <div style={styles.optionIcon}>🔐</div>
          <div style={styles.optionTitle}>Your Challonge Account</div>
          <div style={styles.optionDesc}>
            Connect your own Challonge account via OAuth.
          </div>
        </button>

        {/* Owner Mode */}
        <button
          onClick={handleOwner}
          disabled={isLoading}
          style={styles.optionButton}
        >
          <div style={styles.optionIcon}>👤</div>
          <div style={styles.optionTitle}>Owner Access</div>
          <div style={styles.optionDesc}>
            Access with owner credentials (password required).
          </div>
        </button>
      </div>

      {isLoading && <div style={styles.loading}>Loading...</div>}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '500px',
    margin: '0 auto',
    padding: '2rem',
    textAlign: 'center',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#fff',
  },
  subtitle: {
    fontSize: '1rem',
    color: myGreen,
  },
  error: {
    backgroundColor: 'rgba(220, 53, 69, 0.2)',
    border: '1px solid #dc3545',
    color: '#ff6b6b',
    padding: '0.75rem',
    borderRadius: '8px',
    marginBottom: '1rem',
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },//className="bg-zinc-700 px-2 py-2 rounded w-5/6 mr-auto ml-auto"
  optionButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '1.5rem',
    width: '75%',
    backgroundColor: 'rgb(63 63 70)',
    //border: '1px solid rgba(255, 255, 255, 0.1)',
    border: `1px solid ${myGreen}`,
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    color: '#fff',
  },
  optionIcon: {
    fontSize: '2rem',
    marginBottom: '0.75rem',
  },
  optionTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
  },
  optionDesc: {
    fontSize: '0.875rem',
    //color: '#aaa',
  },
  loading: {
    marginTop: '1rem',
    color: '#aaa',
  },
};

export default ModeSelector;
