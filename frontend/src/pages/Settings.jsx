import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { LogOut, Shield, Bell, Moon, ChevronRight, AlertTriangle } from 'lucide-react';

export default function Settings() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully. See you soon! 👋');
    navigate('/login');
  };

  const settingGroups = [
    {
      title: 'Preferences',
      items: [
        { icon: Moon, label: 'Dark Mode', description: 'Currently active', toggle: true, value: true },
        { icon: Bell, label: 'Notifications', description: 'Email notifications', toggle: true, value: false },
      ],
    },
    {
      title: 'Security',
      items: [
        { icon: Shield, label: 'Two-Factor Auth', description: 'Add extra security (coming soon)', toggle: false },
      ],
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Navbar />

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '2rem', letterSpacing: '-0.5px' }}>
          Settings
        </h1>

        {/* Setting groups */}
        {settingGroups.map((group) => (
          <div key={group.title} style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>
              {group.title}
            </h2>
            <div style={{
              background: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
            }}>
              {group.items.map(({ icon: Icon, label, description, toggle, value }, i) => (
                <div key={label} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.1rem 1.4rem',
                  borderBottom: i < group.items.length - 1 ? '1px solid var(--color-border)' : 'none',
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
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text)' }}>{label}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.1rem' }}>{description}</p>
                  </div>
                  {toggle ? (
                    <div style={{
                      width: '40px', height: '22px',
                      background: value ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)',
                      borderRadius: '999px',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      flexShrink: 0,
                    }}>
                      <div style={{
                        width: '16px', height: '16px',
                        background: '#fff',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '3px',
                        left: value ? '21px' : '3px',
                        transition: 'left 0.2s',
                      }} />
                    </div>
                  ) : (
                    <ChevronRight size={16} color="var(--color-text-muted)" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Danger Zone */}
        <div>
          <h2 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>
            Account
          </h2>
          <div style={{
            background: 'rgba(239,68,68,0.05)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 'var(--radius)',
            padding: '1.4rem',
          }}>
            {!confirmLogout ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.9rem' }}>Sign out of TaskFlow</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                    You will need to log in again to access your tasks.
                  </p>
                </div>
                <button className="btn-danger" onClick={() => setConfirmLogout(true)}>
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
                  <AlertTriangle size={18} color="#ef4444" />
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ef4444' }}>Are you sure you want to logout?</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn-danger" onClick={handleLogout}>
                    <LogOut size={14} />
                    Yes, Logout
                  </button>
                  <button className="btn-ghost" onClick={() => setConfirmLogout(false)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
