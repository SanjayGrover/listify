import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) return setError('Password must be at least 6 characters');
    if (password !== confirm) return setError('Passwords do not match');

    setLoading(true);
    try {
      await api.post(`/password/reset/${token}`, { password });
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Reset Password</h2>

        {done ? (
          <div style={styles.successBox}>
            <p style={styles.successText}>✅ Password reset successful!</p>
            <p style={styles.hint}>Redirecting you to login in 3 seconds...</p>
            <Link to="/login" style={styles.backLink}>Go to Login now →</Link>
          </div>
        ) : (
          <>
            <p style={styles.subtitle}>Enter your new password below.</p>
            {error && <p style={styles.error}>{error}</p>}
            <form onSubmit={handleSubmit} style={styles.form}>
              <input
                style={styles.input}
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <input
                style={styles.input}
                type="password"
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
              <button style={styles.button} type="submit" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
            <p style={styles.link}>
              Remember your password? <Link to="/login">Login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-page)' },
  card: { backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 10px var(--shadow)', width: '100%', maxWidth: '400px' },
  title: { marginBottom: '0.5rem', textAlign: 'center', color: 'var(--text-primary)' },
  subtitle: { color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', marginBottom: '1.5rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  input: { padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '1rem', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' },
  button: { padding: '0.75rem', borderRadius: '6px', border: 'none', backgroundColor: 'var(--accent)', color: '#fff', fontSize: '1rem', cursor: 'pointer' },
  error: { color: 'var(--error-text)', marginBottom: '0.5rem', textAlign: 'center' },
  link: { marginTop: '1rem', textAlign: 'center', color: 'var(--text-secondary)' },
  successBox: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  successText: { color: 'var(--success-text)', fontWeight: 600 },
  hint: { color: 'var(--text-muted)', fontSize: '0.9rem' },
  backLink: { color: 'var(--accent-text)', fontSize: '0.9rem' },
};

export default ResetPassword;