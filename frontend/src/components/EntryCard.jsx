import { Pencil, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { getCategoryMeta, formatCurrency, formatDate } from '../utils/constants';

export default function EntryCard({ entry, onEdit, onDelete, onToggle }) {
  const cat = getCategoryMeta(entry.category);
  const isCompleted = entry.status === 'completed';

  return (
    <div
      className="card fade-up"
      style={{ padding: '1.1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}
    >
      {/* Toggle */}
      <button
        onClick={() => onToggle(entry)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', flexShrink: 0, marginTop: '2px' }}
        title={isCompleted ? 'Mark pending' : 'Mark completed'}
      >
        {isCompleted
          ? <CheckCircle2 size={21} color="var(--success)" />
          : <Circle size={21} color="var(--text-3)" />
        }
      </button>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Row 1: Title + Amount */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.4rem' }}>
          <h3 style={{
            fontSize: '0.92rem', fontWeight: 600,
            color: isCompleted ? 'var(--text-3)' : 'var(--text)',
            textDecoration: isCompleted ? 'line-through' : 'none',
            wordBreak: 'break-word',
          }}>
            {entry.title}
          </h3>
          {parseFloat(entry.amount) > 0 && (
            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--accent)', flexShrink: 0 }}>
              {formatCurrency(entry.amount)}
            </span>
          )}
        </div>

        {/* Description */}
        {entry.description && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', marginBottom: '0.55rem', wordBreak: 'break-word' }}>
            {entry.description}
          </p>
        )}

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Category badge */}
          <span className={`badge ${cat.colorClass}`} style={{ fontSize: '0.72rem', fontWeight: 700 }}>
            {cat.emoji} {cat.label}
          </span>

          {/* Status badge */}
          <span className={`badge ${isCompleted ? 'badge-completed' : 'badge-pending'}`}>
            {isCompleted ? '✓ Completed' : '⏳ Pending'}
          </span>

          {/* Date */}
          <span style={{ fontSize: '0.73rem', color: 'var(--text-3)', marginLeft: 'auto' }}>
            {formatDate(entry.date)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => onEdit(entry)} title="Edit">
          <Pencil size={13} />
        </button>
        <button className="btn btn-danger btn-sm" onClick={() => onDelete(entry.id)} title="Delete">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
