import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [lists, setLists] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const res = await api.get('/lists');
      setLists(res.data);
    } catch {
      setError('Failed to load lists');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const res = await api.post('/lists', { title: newTitle });
      setLists([...lists, res.data]);
      setNewTitle('');
    } catch {
      setError('Failed to create list');
    }
  };

  const handleDelete = async (listId) => {
    if (!window.confirm('Delete this list?')) return;
    try {
      await api.delete(`/lists/${listId}`);
      setLists(lists.filter(l => l._id !== listId));
    } catch {
      setError('Failed to delete list');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.logo}>📋 Listify</h1>
        <div style={styles.userInfo}>
          <span>Hi, {user?.name}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        <h2 style={styles.sectionTitle}>Your Lists</h2>

        {/* Create List Form */}
        <form onSubmit={handleCreate} style={styles.createForm}>
          <input
            style={styles.input}
            type="text"
            placeholder="New list title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button style={styles.createBtn} type="submit">+ Create</button>
        </form>

        {error && <p style={styles.error}>{error}</p>}

        {/* Lists Grid */}
        {loading ? (
          <p>Loading...</p>
        ) : lists.length === 0 ? (
          <p style={styles.empty}>No lists yet. Create one above!</p>
        ) : (
          <div style={styles.grid}>
            {lists.map(list => (
              <div key={list._id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>{list.title}</h3>
                  <button
                    onClick={() => handleDelete(list._id)}
                    style={styles.deleteBtn}
                  >
                    🗑
                  </button>
                </div>
                <p style={styles.itemCount}>
                  {list.items.length} item{list.items.length !== 1 ? 's' : ''}
                </p>
                <button
                  onClick={() => navigate(`/lists/${list._id}`)}
                  style={styles.openBtn}
                >
                  Open →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', backgroundColor: 'var(--bg-page)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', backgroundColor: 'var(--bg-header)', boxShadow: `0 1px 4px var(--shadow)` },
  logo: { margin: 0, color: 'var(--accent)' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-primary)' },
  logoutBtn: { padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', cursor: 'pointer', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' },
  main: { maxWidth: '900px', margin: '0 auto', padding: '2rem' },
  sectionTitle: { marginBottom: '1rem', color: 'var(--text-primary)' },
  createForm: { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' },
  input: { flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '1rem', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' },
  createBtn: { padding: '0.75rem 1.25rem', borderRadius: '6px', border: 'none', backgroundColor: 'var(--accent)', color: '#fff', fontSize: '1rem', cursor: 'pointer' },
  error: { color: 'var(--error-text)', marginBottom: '1rem' },
  empty: { color: 'var(--text-muted)', textAlign: 'center', marginTop: '3rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' },
  card: { backgroundColor: 'var(--bg-card)', borderRadius: '8px', padding: '1.25rem', boxShadow: `0 2px 6px var(--shadow)` },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
  cardTitle: { margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' },
  itemCount: { color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' },
  openBtn: { padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--accent)', color: 'var(--accent-text)', backgroundColor: 'var(--bg-card)', cursor: 'pointer', width: '100%' },
};

export default Dashboard;