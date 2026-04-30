import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, entriesAPI } from '../services/api';
import EntryCard from '../components/EntryCard';
import EntryModal from '../components/EntryModal';
import toast from 'react-hot-toast';
import {
  IndianRupee, ListChecks, CheckCircle2, Clock, TrendingUp,
  Plus, Calendar, Search, SlidersHorizontal,
} from 'lucide-react';
import { formatCurrency, CATEGORIES } from '../utils/constants';

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [saving, setSaving] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sort, setSort] = useState('newest');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [summRes, entrRes] = await Promise.all([
        dashboardAPI.getSummary(),
        entriesAPI.getAll({ search, type: typeFilter, status: statusFilter, category: categoryFilter, date: dateFilter, sort }),
      ]);
      setSummary(summRes.data);
      setEntries(entrRes.data);
    } catch {
      toast.error('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, statusFilter, categoryFilter, dateFilter, sort]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // CRUD
  const handleCreate = async (form) => {
    setSaving(true);
    try {
      const { data } = await entriesAPI.create(form);
      setEntries([data, ...entries]);
      if (summary) setSummary({ ...summary, total_entries: summary.total_entries + 1 });
      setModalOpen(false);
      toast.success('Entry added! ✅');
      fetchAll();
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
      fetchAll();
    } catch { toast.error('Failed to update entry.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this entry?')) return;
    try {
      await entriesAPI.delete(id);
      setEntries(entries.filter((e) => e.id !== id));
      toast.success('Entry deleted.');
      fetchAll();
    } catch { toast.error('Failed to delete.'); }
  };

  const handleToggle = async (entry) => {
    let newStatus = 'completed';
    if (entry.status === 'pending') newStatus = 'in_progress';
    else if (entry.status === 'in_progress') newStatus = 'completed';
    else if (entry.status === 'completed') newStatus = 'pending';

    try {
      const { data } = await entriesAPI.update(entry.id, { status: newStatus });
      setEntries(entries.map((e) => (e.id === entry.id ? data : e)));
      
      const messages = {
        in_progress: 'Started! 🚧',
        completed: 'Marked complete! 🎉',
        pending: 'Marked pending.'
      };
      toast.success(messages[newStatus]);
      fetchAll();
    } catch { toast.error('Failed to update status.'); }
  };

  const openCreate = () => { setEditEntry(null); setModalOpen(true); };
  const openEdit = (entry) => { setEditEntry(entry); setModalOpen(true); };

  // Stat cards config
  const statCards = summary ? [
    {
      label: 'Total Expenses',
      value: formatCurrency(summary.total_expenses),
      icon: IndianRupee,
      color: '#4f8ef7',
      bg: 'rgba(79,142,247,0.1)',
      sub: `This month: ${formatCurrency(summary.month_spending)}`,
    },
    {
      label: 'Total Tasks',
      value: summary.total_tasks,
      icon: ListChecks,
      color: '#7c6ff7',
      bg: 'rgba(124,111,247,0.1)',
      sub: `${summary.completed_tasks} completed`,
    },
    {
      label: 'In Progress Tasks',
      value: summary.in_progress_tasks,
      icon: TrendingUp,
      color: '#38bdf8',
      bg: 'rgba(56,189,248,0.1)',
      sub: `Currently working on`,
    },
    {
      label: 'Pending Tasks',
      value: summary.pending_tasks,
      icon: Clock,
      color: '#fbbf24',
      bg: 'rgba(251,191,36,0.1)',
      sub: `Needs attention`,
    },
  ] : [];

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>Dashboard</h1>
          <p style={{ fontSize: '0.875rem' }}>
            Welcome, <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{user?.name || 'there'}</span> 👋 — track your day
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Add Entry
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {loading
          ? Array(4).fill(0).map((_, i) => (
            <div key={i} className="stat-card" style={{ height: '100px', background: 'var(--card)' }}>
              <div style={{ height: '12px', width: '60%', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', marginBottom: '0.75rem' }} />
              <div style={{ height: '28px', width: '40%', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }} />
            </div>
          ))
          : statCards.map(({ label, value, icon: Icon, color, bg, sub }) => (
            <div key={label} className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                <div style={{ width: '34px', height: '34px', background: bg, borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={17} color={color} />
                </div>
              </div>
              <div style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                {value}
              </div>
              <p style={{ fontSize: '0.73rem', color: 'var(--text-3)', marginTop: '0.4rem' }}>{sub}</p>
            </div>
          ))
        }
      </div>

      {/* Filters bar */}
      <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input className="field" placeholder="Search entries..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.2rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }} />
        </div>

        {/* Type */}
        <select className="field" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          style={{ width: 'auto', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
          <option value="">All Types</option>
          <option value="expense">Expenses</option>
          <option value="task">Tasks</option>
        </select>

        {/* Date range */}
        <select className="field" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
          style={{ width: 'auto', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
          <option value="">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>

        {/* Status */}
        <select className="field" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          style={{ width: 'auto', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        {/* Category */}
        <select className="field" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ width: 'auto', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
        </select>

        {/* Sort */}
        <select className="field" value={sort} onChange={(e) => setSort(e.target.value)}
          style={{ width: 'auto', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Entry list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-2)' }}>
          <div className="spinner" style={{ width: '32px', height: '32px', margin: '0 auto 1rem', borderWidth: '3px' }} />
          <p>Loading entries...</p>
        </div>
      ) : entries.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', color: 'var(--text-2)',
        }}>
          <Calendar size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>No entries found</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.4rem' }}>
            {search || statusFilter || categoryFilter || dateFilter
              ? 'Try adjusting your filters.'
              : 'Click "Add Entry" to track your first activity.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} onEdit={openEdit} onDelete={handleDelete} onToggle={handleToggle} />
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
