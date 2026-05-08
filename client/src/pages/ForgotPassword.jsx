import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await api.post('/password/forgot', { email });
      setMessage(res.data.message);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Forgot Password</h2>

        {sent ? (
          <div style={styles.successBox}>
            <p style={styles.successText}>✅ {message}</p>
            <p style={styles.hint}>Check your inbox and follow the link to reset your password. The link expires in 30 minutes.</p>
            <Link to="/login" style={styles.backLink}>← Back to Login</Link>
          </div>
        ) : (
          <>
            <p style={styles.subtitle}>Enter your account email and we'll send you a reset link.</p>
            {error && <p style={styles.error}>{error}</p>}
            <form onSubmit={handleSubmit} style={styles.form}>
              <input
                style={styles.input}
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button style={styles.button} type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPassword;