import { useState, useEffect } from 'react';
import { X, IndianRupee } from 'lucide-react';
import { CATEGORIES, todayISO } from '../utils/constants';

const EMPTY = { title: '', description: '', amount: '', category: 'food', status: 'pending', date: todayISO() };

export default function EntryModal({ isOpen, onClose, onSubmit, editEntry, loading }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (editEntry) {
      setForm({
        title: editEntry.title,
        description: editEntry.description || '',
        amount: editEntry.amount,
        category: editEntry.category,
        status: editEntry.status,
        date: editEntry.date,
      });
    } else {
      setForm({ ...EMPTY, date: todayISO() });
    }
  }, [editEntry, isOpen]);

  if (!isOpen) return null;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit({ ...form, amount: parseFloat(form.amount) || 0 });
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className="fade-up"
        style={{
          width: '100%', maxWidth: '520px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '1.75rem',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.05rem' }}>{editEntry ? 'Edit Entry' : 'New Entry'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Title */}
            <div>
              <label className="label">Title *</label>
              <input className="field" placeholder="e.g. Bought groceries, Gym session..." value={form.title}
                onChange={(e) => set('title', e.target.value)} required autoFocus />
            </div>

            {/* Amount + Category row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div>
                <label className="label">Amount (₹)</label>
                <div style={{ position: 'relative' }}>
                  <IndianRupee size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                  <input className="field field-icon" type="number" min="0" step="0.01"
                    placeholder="0" value={form.amount} onChange={(e) => set('amount', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Category</label>
                <select className="field" value={form.category} onChange={(e) => set('category', e.target.value)}>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date + Status row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div>
                <label className="label">Date</label>
                <input className="field" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} required />
              </div>
              <div>
                <label className="label">Status</label>
                <select className="field" value={form.status} onChange={(e) => set('status', e.target.value)}>
                  <option value="pending">⏳ Pending</option>
                  <option value="completed">✅ Completed</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="label">Description</label>
              <textarea className="field" rows={3} placeholder="Add notes or details..." value={form.description}
                onChange={(e) => set('description', e.target.value)}
                style={{ resize: 'vertical', minHeight: '72px' }} />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.25rem' }}>
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading && <span className="spinner" />}
                {editEntry ? 'Save Changes' : 'Add Entry'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
