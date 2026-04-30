import { useState, useEffect } from 'react';
import { X, IndianRupee, ListChecks } from 'lucide-react';
import { CATEGORIES, todayISO } from '../utils/constants';

const EMPTY = { entry_type: 'expense', title: '', description: '', amount: '', category: 'food', status: 'pending', date: todayISO() };

export default function EntryModal({ isOpen, onClose, onSubmit, editEntry, loading }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (editEntry) {
      setForm({
        entry_type: editEntry.entry_type || 'expense',
        title: editEntry.title,
        description: editEntry.description || '',
        amount: editEntry.amount,
        category: editEntry.category || '',
        status: editEntry.status,
        date: editEntry.date || '',
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
    
    // Cleanup payload based on entry type
    const payload = { ...form };
    if (payload.entry_type === 'expense') {
      payload.amount = parseFloat(payload.amount) || 0;
      if (!payload.category) payload.category = 'other';
    } else {
      payload.amount = 0; // Not needed for tasks
      if (!payload.category) payload.category = null;
      if (!payload.date) payload.date = null;
    }
    
    onSubmit(payload);
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

            {/* Type Selection */}
            {!editEntry && (
              <div>
                <label className="label">Entry Type</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className={`btn ${form.entry_type === 'expense' ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ flex: 1 }}
                    onClick={() => set('entry_type', 'expense')}
                  >
                    <IndianRupee size={16} /> Expense
                  </button>
                  <button
                    type="button"
                    className={`btn ${form.entry_type === 'task' ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ flex: 1 }}
                    onClick={() => set('entry_type', 'task')}
                  >
                    <ListChecks size={16} /> Task
                  </button>
                </div>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="label">Title *</label>
              <input className="field" placeholder={form.entry_type === 'expense' ? "e.g. Bought groceries..." : "e.g. Prepare presentation..."} value={form.title}
                onChange={(e) => set('title', e.target.value)} required autoFocus />
            </div>

            {/* Amount + Category row (Expense) */}
            {form.entry_type === 'expense' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label className="label">Amount (₹) *</label>
                  <div style={{ position: 'relative' }}>
                    <IndianRupee size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                    <input className="field field-icon" type="number" min="0" step="0.01"
                      placeholder="0" value={form.amount} onChange={(e) => set('amount', e.target.value)} required />
                  </div>
                </div>
                <div>
                  <label className="label">Category *</label>
                  <select className="field" value={form.category} onChange={(e) => set('category', e.target.value)} required>
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Category only (Task) */}
            {form.entry_type === 'task' && (
              <div>
                <label className="label">Category (Optional)</label>
                <select className="field" value={form.category} onChange={(e) => set('category', e.target.value)}>
                  <option value="">No Category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Date + Status row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div>
                <label className="label">{form.entry_type === 'expense' ? 'Date *' : 'Due Date (Optional)'}</label>
                <input className="field" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} required={form.entry_type === 'expense'} />
              </div>
              <div>
                <label className="label">Status</label>
                <select className="field" value={form.status} onChange={(e) => set('status', e.target.value)}>
                  <option value="pending">⏳ Pending</option>
                  <option value="in_progress">🚧 In Progress</option>
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
