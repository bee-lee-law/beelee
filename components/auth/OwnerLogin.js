'use client';

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export function OwnerLogin({ onBack }) {
  const { loginOwner, isLoading } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    const result = await loginOwner(password);
    if (!result.success) {
      setError(result.error);
      setPassword('');
    }
  };

  return (
    <div style={styles.container}>
      <button onClick={onBack} style={styles.backButton}>
        ← Back to options
      </button>

      <h2 style={styles.title}>Owner Access</h2>
      <p style={styles.subtitle}>Enter the owner password to continue</p>

      {error && <div style={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          disabled={isLoading}
          style={styles.input}
          autoFocus
        />

        <button type="submit" disabled={isLoading} style={styles.submitButton}>
          {isLoading ? 'Authenticating...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '400px',
    margin: '0 auto',
    padding: '2rem',
    textAlign: 'center',
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#aaa',
    cursor: 'pointer',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#fff',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#aaa',
    marginBottom: '1.5rem',
  },
  error: {
    backgroundColor: 'rgba(220, 53, 69, 0.2)',
    border: '1px solid #dc3545',
    color: '#ff6b6b',
    padding: '0.75rem',
    borderRadius: '8px',
    marginBottom: '1rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  input: {
    padding: '0.875rem 1rem',
    fontSize: '1rem',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    color: '#fff',
    outline: 'none',
  },
  submitButton: {
    padding: '0.875rem 1rem',
    fontSize: '1rem',
    fontWeight: '600',
    backgroundColor: '#4a9eff',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
};

export default OwnerLogin;
