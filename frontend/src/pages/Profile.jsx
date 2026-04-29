import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { User, Mail, Calendar, Hash, Edit2, Check, X } from 'lucide-react';

export default function Profile() {
  const { user, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await authAPI.updateProfile({ name });
      await refreshProfile();
      setEditing(false);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const fields = [
    { label: 'Email Address', value: user?.email, icon: Mail },
    { label: 'Username', value: user?.username, icon: Hash },
    { label: 'Member Since', value: formatDate(user?.date_joined), icon: Calendar },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Navbar />

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '2rem', letterSpacing: '-0.5px' }}>
          My Profile
        </h1>

        {/* Avatar card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(139,92,246,0.08))',
          border: '1px solid rgba(108,99,255,0.25)',
          borderRadius: 'var(--radius)',
          padding: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}>
          <div style={{
            width: '72px', height: '72px',
            background: 'linear-gradient(135deg, #6c63ff, #8b5cf6)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#fff',
            flexShrink: 0,
            boxShadow: '0 8px 24px rgba(108,99,255,0.4)',
          }}>
            {(user?.name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: '140px' }}>
            {editing ? (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  className="input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ maxWidth: '220px' }}
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false); }}
                />
                <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '0.5rem 0.8rem' }}>
                  {saving ? <span className="spinner" /> : <Check size={15} />}
                </button>
                <button className="btn-ghost" onClick={() => setEditing(false)} style={{ padding: '0.5rem 0.8rem' }}>
                  <X size={15} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)' }}>
                  {user?.name || 'No name set'}
                </span>
                <button
                  className="btn-ghost"
                  onClick={() => { setName(user?.name || ''); setEditing(true); }}
                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                >
                  <Edit2 size={13} /> Edit
                </button>
              </div>
            )}
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              {user?.email}
            </p>
          </div>
        </div>

        {/* Info fields */}
        <div style={{
          background: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
        }}>
          {fields.map(({ label, value, icon: Icon }, i) => (
            <div key={label} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1.1rem 1.4rem',
              borderBottom: i < fields.length - 1 ? '1px solid var(--color-border)' : 'none',
            }}>
              <div style={{
                width: '36px', height: '36px',
                background: 'var(--color-accent-light)',
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={16} color="var(--color-accent)" />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.1rem' }}>{label}</p>
                <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text)' }}>{value || '—'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
