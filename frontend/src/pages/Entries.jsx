import { useState, useEffect, useCallback } from 'react';
import { entriesAPI } from '../services/api';
import EntryCard from '../components/EntryCard';
import EntryModal from '../components/EntryModal';
import toast from 'react-hot-toast';
import { Plus, ListChecks, Search } from 'lucide-react';
import { CATEGORIES } from '../utils/constants';

export default function Entries() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sort, setSort] = useState('newest');

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await entriesAPI.getAll({ search, status: statusFilter, category: categoryFilter, sort });
      setEntries(data);
    } catch { toast.error('Failed to load entries.'); }
    finally { setLoading(false); }
  }, [search, statusFilter, categoryFilter, sort]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      const { data } = await entriesAPI.create(form);
      setEntries([data, ...entries]);
      setModalOpen(false);
      toast.success('Entry added! ✅');
    } catch { toast.error('Failed to add entry.'); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (form) => {
    setSaving(true);
    try {
      const { data } = await entriesAPI.update(editEntry.id, form);
      setEntries(entries.map((e) => (e.id === editEntry.id ? data : e)));
      setModalOpen(false); setEditEntry(null);
      toast.success('Entry updated!');
    } catch { toast.error('Failed to update.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this entry?')) return;
    try {
      await entriesAPI.delete(id);
      setEntries(entries.filter((e) => e.id !== id));
      toast.success('Deleted.');
    } catch { toast.error('Failed to delete.'); }
  };

  const handleToggle = async (entry) => {
    const newStatus = entry.status === 'completed' ? 'pending' : 'completed';
    try {
      const { data } = await entriesAPI.update(entry.id, { status: newStatus });
      setEntries(entries.map((e) => (e.id === entry.id ? data : e)));
    } catch { toast.error('Failed to update status.'); }
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>All Entries</h1>
          <p style={{ fontSize: '0.875rem' }}>{entries.length} entr{entries.length !== 1 ? 'ies' : 'y'} found</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditEntry(null); setModalOpen(true); }}>
          <Plus size={16} /> Add Entry
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input className="field" placeholder="Search..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.2rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }} />
        </div>
        <select className="field" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          style={{ width: 'auto', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
        <select className="field" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ width: 'auto', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
        </select>
        <select className="field" value={sort} onChange={(e) => setSort(e.target.value)}
          style={{ width: 'auto', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-2)' }}>
          <div className="spinner" style={{ width: '28px', height: '28px', margin: '0 auto 1rem', borderWidth: '3px' }} />
          <p>Loading...</p>
        </div>
      ) : entries.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', color: 'var(--text-2)',
        }}>
          <ListChecks size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.95rem' }}>No entries yet</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.35rem' }}>Add your first activity or expense to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} onEdit={(e) => { setEditEntry(e); setModalOpen(true); }}
              onDelete={handleDelete} onToggle={handleToggle} />
          ))}
        </div>
      )}

      <EntryModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditEntry(null); }}
        onSubmit={editEntry ? handleUpdate : handleCreate}
        editEntry={editEntry}
        loading={saving}
      />
    </div>
  );
}
