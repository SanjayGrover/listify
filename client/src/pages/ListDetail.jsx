import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ListDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newItemText, setNewItemText] = useState('');
  const [newSubItemText, setNewSubItemText] = useState({});
  const [expandedItems, setExpandedItems] = useState({});
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');

  useEffect(() => {
    fetchList();
  }, [id]);

  const fetchList = async () => {
    try {
      const res = await api.get(`/lists/${id}`);
      setList(res.data);
      setTitleInput(res.data.title);
    } catch {
      setError('Failed to load list');
    } finally {
      setLoading(false);
    }
  };

  // --- Item Handlers ---
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    try {
      const res = await api.post(`/lists/${id}/items`, { text: newItemText });
      setList(res.data);
      setNewItemText('');
    } catch {
      setError('Failed to add item');
    }
  };

  const handleToggleItem = async (itemId, completed) => {
    try {
      const res = await api.put(`/lists/${id}/items/${itemId}`, { completed: !completed });
      setList(res.data);
    } catch {
      setError('Failed to update item');
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      const res = await api.delete(`/lists/${id}/items/${itemId}`);
      setList(res.data);
    } catch {
      setError('Failed to delete item');
    }
  };

  // --- Subitem Handlers ---
  const handleAddSubItem = async (e, itemId) => {
    e.preventDefault();
    const text = newSubItemText[itemId];
    if (!text?.trim()) return;
    try {
      const res = await api.post(`/lists/${id}/items/${itemId}/subitems`, { text });
      setList(res.data);
      setNewSubItemText({ ...newSubItemText, [itemId]: '' });
    } catch {
      setError('Failed to add subitem');
    }
  };

  const handleToggleSubItem = async (itemId, subItemId, completed) => {
    try {
      const res = await api.put(`/lists/${id}/items/${itemId}/subitems/${subItemId}`, { completed: !completed });
      setList(res.data);
    } catch {
      setError('Failed to update subitem');
    }
  };

  const handleDeleteSubItem = async (itemId, subItemId) => {
    try {
      const res = await api.delete(`/lists/${id}/items/${itemId}/subitems/${subItemId}`);
      setList(res.data);
    } catch {
      setError('Failed to delete subitem');
    }
  };

  // --- Title Handlers ---
  const handleUpdateTitle = async () => {
    if (!titleInput.trim()) return;
    try {
      const res = await api.put(`/lists/${id}`, { title: titleInput });
      setList(res.data);
      setEditingTitle(false);
    } catch {
      setError('Failed to update title');
    }
  };

  const toggleExpand = (itemId) => {
    setExpandedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>;
  if (error) return <p style={{ padding: '2rem', color: 'red' }}>{error}</p>;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>← Back</button>
        {editingTitle ? (
          <div style={styles.titleEdit}>
            <input
              style={styles.titleInput}
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              autoFocus
            />
            <button onClick={handleUpdateTitle} style={styles.saveBtn}>Save</button>
            <button onClick={() => setEditingTitle(false)} style={styles.cancelBtn}>Cancel</button>
          </div>
        ) : (
          <h2 style={styles.title} onClick={() => setEditingTitle(true)} title="Click to edit">
            {list.title} ✏️
          </h2>
        )}
      </div>

      <div style={styles.main}>
        {/* Add Item Form */}
        <form onSubmit={handleAddItem} style={styles.addForm}>
          <input
            style={styles.input}
            type="text"
            placeholder="Add a new item..."
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
          />
          <button style={styles.addBtn} type="submit">+ Add</button>
        </form>

        {/* Items List */}
        {list.items.length === 0 ? (
          <p style={styles.empty}>No items yet. Add one above!</p>
        ) : (
          <ul style={styles.itemList}>
            {list.items.map(item => (
              <li key={item._id} style={styles.itemCard}>
                {/* Item Row */}
                <div style={styles.itemRow}>
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => handleToggleItem(item._id, item.completed)}
                    style={styles.checkbox}
                  />
                  <span style={{ ...styles.itemText, textDecoration: item.completed ? 'line-through' : 'none', color: item.completed ? '#aaa' : '#000' }}>
                    {item.text}
                  </span>
                  <div style={styles.itemActions}>
                    <button
                      onClick={() => toggleExpand(item._id)}
                      style={styles.subBtn}
                      title="Toggle subitems"
                    >
                      {expandedItems[item._id] ? '▲' : '▼'} {item.subItems.length}
                    </button>
                    <button onClick={() => handleDeleteItem(item._id)} style={styles.deleteBtn}>🗑</button>
                  </div>
                </div>

                {/* Subitems */}
                {expandedItems[item._id] && (
                  <div style={styles.subItemSection}>
                    {item.subItems.map(sub => (
                      <div key={sub._id} style={styles.subItemRow}>
                        <input
                          type="checkbox"
                          checked={sub.completed}
                          onChange={() => handleToggleSubItem(item._id, sub._id, sub.completed)}
                          style={styles.checkbox}
                        />
                        <span style={{ ...styles.itemText, fontSize: '0.9rem', textDecoration: sub.completed ? 'line-through' : 'none', color: sub.completed ? '#aaa' : '#555' }}>
                          {sub.text}
                        </span>
                        <button onClick={() => handleDeleteSubItem(item._id, sub._id)} style={styles.deleteBtn}>🗑</button>
                      </div>
                    ))}

                    {/* Add Subitem Form */}
                    <form onSubmit={(e) => handleAddSubItem(e, item._id)} style={styles.subAddForm}>
                      <input
                        style={styles.subInput}
                        type="text"
                        placeholder="Add subitem..."
                        value={newSubItemText[item._id] || ''}
                        onChange={(e) => setNewSubItemText({ ...newSubItemText, [item._id]: e.target.value })}
                      />
                      <button style={styles.subAddBtn} type="submit">+ Add</button>
                    </form>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f0f2f5' },
  header: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 2rem', backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' },
  backBtn: { padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #ccc', cursor: 'pointer', backgroundColor: '#fff' },
  title: { margin: 0, cursor: 'pointer', fontSize: '1.4rem' },
  titleEdit: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
  titleInput: { padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1.1rem' },
  saveBtn: { padding: '0.4rem 0.8rem', borderRadius: '6px', border: 'none', backgroundColor: '#4f46e5', color: '#fff', cursor: 'pointer' },
  cancelBtn: { padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #ccc', cursor: 'pointer', backgroundColor: '#fff' },
  main: { maxWidth: '700px', margin: '0 auto', padding: '2rem' },
  addForm: { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' },
  input: { flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' },
  addBtn: { padding: '0.75rem 1.25rem', borderRadius: '6px', border: 'none', backgroundColor: '#4f46e5', color: '#fff', fontSize: '1rem', cursor: 'pointer' },
  empty: { color: '#888', textAlign: 'center', marginTop: '3rem' },
  itemList: { listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  itemCard: { backgroundColor: '#fff', borderRadius: '8px', padding: '1rem', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' },
  itemRow: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  checkbox: { width: '18px', height: '18px', cursor: 'pointer' },
  itemText: { flex: 1, fontSize: '1rem' },
  itemActions: { display: 'flex', gap: '0.5rem' },
  subBtn: { padding: '0.3rem 0.6rem', borderRadius: '6px', border: '1px solid #ccc', cursor: 'pointer', backgroundColor: '#fff', fontSize: '0.85rem' },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' },
  subItemSection: { marginTop: '0.75rem', paddingLeft: '1.5rem', borderLeft: '2px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  subItemRow: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  subAddForm: { display: 'flex', gap: '0.5rem', marginTop: '0.5rem' },
  subInput: { flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.9rem' },
  subAddBtn: { padding: '0.5rem 0.75rem', borderRadius: '6px', border: 'none', backgroundColor: '#4f46e5', color: '#fff', fontSize: '0.9rem', cursor: 'pointer' },
};

export default ListDetail;