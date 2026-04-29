import { CheckCircle2, Circle, Pencil, Trash2, Clock } from 'lucide-react';

export default function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const isCompleted = task.status === 'completed';

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div
      className="animate-fade-in"
      style={{
        background: 'var(--color-card)',
        border: `1px solid ${isCompleted ? 'rgba(16,185,129,0.2)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius)',
        padding: '1.2rem 1.4rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        transition: 'all 0.2s ease',
        cursor: 'default',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = isCompleted ? 'rgba(16,185,129,0.5)' : 'rgba(108,99,255,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = isCompleted ? 'rgba(16,185,129,0.2)' : 'var(--color-border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Toggle button */}
      <button
        onClick={() => onToggle(task)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', flexShrink: 0, marginTop: '2px' }}
        title={isCompleted ? 'Mark as pending' : 'Mark as completed'}
      >
        {isCompleted
          ? <CheckCircle2 size={22} color="#10b981" />
          : <Circle size={22} color="var(--color-text-muted)" />
        }
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{
          fontSize: '0.95rem',
          fontWeight: 600,
          color: isCompleted ? 'var(--color-text-muted)' : 'var(--color-text)',
          textDecoration: isCompleted ? 'line-through' : 'none',
          marginBottom: '0.25rem',
          wordBreak: 'break-word',
        }}>
          {task.title}
        </h3>
        {task.description && (
          <p style={{
            fontSize: '0.8rem',
            color: 'var(--color-text-muted)',
            marginBottom: '0.5rem',
            wordBreak: 'break-word',
          }}>
            {task.description}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={12} color="var(--color-text-muted)" />
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            {formatDate(task.created_at)}
          </span>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            padding: '0.15rem 0.6rem',
            borderRadius: '999px',
            background: isCompleted ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
            color: isCompleted ? '#10b981' : '#f59e0b',
            border: `1px solid ${isCompleted ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
          }}>
            {isCompleted ? '✓ Completed' : '⏳ Pending'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
        <button className="btn-ghost" onClick={() => onEdit(task)} style={{ padding: '0.4rem 0.6rem' }} title="Edit">
          <Pencil size={14} />
        </button>
        <button className="btn-danger" onClick={() => onDelete(task.id)} style={{ padding: '0.4rem 0.6rem' }} title="Delete">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
