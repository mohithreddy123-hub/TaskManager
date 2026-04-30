import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Mail, User, Calendar, Hash, ListChecks, Pencil, Check, X } from 'lucide-react';

export default function Profile() {
  const { user, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await authAPI.updateProfile({ name });
      await refreshProfile();
      setEditing(false);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile.'); }
    finally { setSaving(false); }
  };

  const initials = (user?.name || user?.email || 'U')
    .split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  const formatJoined = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const infoRows = [
    { icon: Mail,      label: 'Email',          value: user?.email },
    { icon: Hash,      label: 'Username',        value: user?.username },
    { icon: Calendar,  label: 'Member Since',    value: formatJoined(user?.date_joined) },
    { icon: ListChecks,label: 'Total Entries',   value: user?.total_entries ?? '—' },
  ];

  return (
    <div className="page-container" style={{ maxWidth: '680px' }}>
      <h1 style={{ fontSize: '1.6rem', marginBottom: '2rem' }}>Profile</h1>

      {/* Avatar card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(79,142,247,0.12), rgba(124,111,247,0.08))',
        border: '1px solid rgba(79,142,247,0.2)',
        borderRadius: 'var(--radius)',
        padding: '2rem',
        display: 'flex', alignItems: 'center', gap: '1.5rem',
        marginBottom: '1.5rem', flexWrap: 'wrap',
      }}>
        <div style={{
          width: '72px', height: '72px', flexShrink: 0,
          background: 'linear-gradient(135deg, #4f8ef7, #7c6ff7)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', fontWeight: 800, color: '#fff',
          boxShadow: '0 8px 24px rgba(79,142,247,0.45)',
        }}>
          {initials}
        </div>
        <div style={{ flex: 1 }}>
          {editing ? (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input className="field" value={name} onChange={(e) => setName(e.target.value)}
                style={{ maxWidth: '220px' }} autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false); }} />
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                {saving ? <span className="spinner" /> : <Check size={14} />}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}><X size={14} /></button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)' }}>
                {user?.name || 'No name set'}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={() => { setName(user?.name || ''); setEditing(true); }}>
                <Pencil size={13} /> Edit
              </button>
            </div>
          )}
          <p style={{ fontSize: '0.85rem' }}>{user?.email}</p>
        </div>
      </div>

      {/* Info rows */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        {infoRows.map(({ icon: Icon, label, value }, i) => (
          <div key={label} style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            padding: '1rem 1.4rem',
            borderBottom: i < infoRows.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <div style={{
              width: '36px', height: '36px', flexShrink: 0,
              background: 'rgba(79,142,247,0.1)', borderRadius: '9px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={16} color="var(--accent)" />
            </div>
            <div>
              <p style={{ fontSize: '0.73rem', color: 'var(--text-3)', marginBottom: '0.1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
              <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text)' }}>{value ?? '—'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
