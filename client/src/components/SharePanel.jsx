import { useState, useEffect } from 'react';
import api from '../api/axios';

const SharePanel = ({ listId }) => {
  const [sharedWith, setSharedWith] = useState([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSharedUsers();
  }, [listId]);

  const fetchSharedUsers = async () => {
    try {
      const res = await api.get(`/lists/${listId}/share`);
      setSharedWith(res.data);
    } catch {
      // Not owner, silently ignore
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      const res = await api.post(`/lists/${listId}/share`, { email, role });
      setMessage(res.data.message);
      setEmail('');
      fetchSharedUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to share list');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userId) => {
    if (!window.confirm('Remove this user from the list?')) return;
    try {
      await api.delete(`/lists/${listId}/share/${userId}`);
      setSharedWith(sharedWith.filter(s => s.user._id !== userId));
    } catch {
      setError('Failed to remove user');
    }
  };

  return (
    <div style={styles.panel}>
      <h3 style={styles.heading}>🔗 Share This List</h3>

      {/* Share Form */}
      <form onSubmit={handleShare} style={styles.form}>
        <input
          style={styles.input}
          type="email"
          placeholder="User's email address..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <select
          style={styles.select}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
        </select>
        <button style={styles.shareBtn} type="submit" disabled={loading}>
          {loading ? 'Sharing...' : 'Share'}
        </button>
      </form>

      {message && <p style={styles.success}>{message}</p>}
      {error && <p style={styles.error}>{error}</p>}

      {/* Shared Users List */}
      {sharedWith.length > 0 && (
        <div style={styles.userList}>
          <p style={styles.subHeading}>Shared with:</p>
          {sharedWith.map(entry => (
            <div key={entry.user._id} style={styles.userRow}>
              <div>
                <span style={styles.userName}>{entry.user.name}</span>
                <span style={styles.userEmail}> — {entry.user.email}</span>
              </div>
              <div style={styles.userRight}>
                <span style={styles.roleBadge}>{entry.role}</span>
                <button
                  onClick={() => handleRemove(entry.user._id)}
                  style={styles.removeBtn}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  panel: { backgroundColor: 'var(--bg-card)', borderRadius: '8px', padding: '1.25rem', boxShadow: `0 2px 6px var(--shadow)`, marginBottom: '1.5rem' },
  heading: { margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--accent-text)' },
  form: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  input: { flex: 1, minWidth: '180px', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.95rem', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' },
  select: { padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.95rem', cursor: 'pointer', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' },
  shareBtn: { padding: '0.6rem 1rem', borderRadius: '6px', border: 'none', backgroundColor: 'var(--accent)', color: '#fff', fontSize: '0.95rem', cursor: 'pointer' },
  success: { color: 'var(--success-text)', marginTop: '0.5rem', fontSize: '0.9rem' },
  error: { color: 'var(--error-text)', marginTop: '0.5rem', fontSize: '0.9rem' },
  subHeading: { margin: '1rem 0 0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' },
  userList: { marginTop: '0.5rem' },
  userRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border-light)' },
  userName: { fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' },
  userEmail: { fontSize: '0.85rem', color: 'var(--text-muted)' },
  userRight: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  roleBadge: { fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '999px', backgroundColor: 'var(--badge-bg)', color: 'var(--badge-text)', fontWeight: 600 },
  removeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem' },
};

export default SharePanel;