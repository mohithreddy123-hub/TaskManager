import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, ListChecks, User, Settings,
  LogOut, Wallet, AlertTriangle, X,
} from 'lucide-react';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/entries',   icon: ListChecks,      label: 'All Entries'  },
  { to: '/profile',   icon: User,            label: 'Profile'      },
  { to: '/settings',  icon: Settings,        label: 'Settings'     },
];

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out. See you soon! 👋');
    navigate('/login');
  };

  const initials = (user?.name || user?.email || 'U')
    .split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Logout Confirmation Modal ─────────────────────────────────── */}
      {showLogoutModal && (
        <div
          onClick={() => setShowLogoutModal(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 300,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            className="fade-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '380px',
              background: 'var(--surface)',
              border: '1px solid rgba(248,113,113,0.25)',
              borderRadius: 'var(--radius)',
              padding: '2rem',
              boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
              textAlign: 'center',
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setShowLogoutModal(false)}
              style={{
                position: 'absolute', top: '1rem', right: '1rem',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-3)', padding: '4px',
              }}
            >
              <X size={18} />
            </button>

            {/* Icon */}
            <div style={{
              width: '56px', height: '56px',
              background: 'rgba(248,113,113,0.1)',
              border: '1px solid rgba(248,113,113,0.25)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}>
              <LogOut size={24} color="var(--danger)" />
            </div>

            {/* Text */}
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              Sign out of TrackNest?
            </h2>
            <p style={{ fontSize: '0.875rem', marginBottom: '1.75rem' }}>
              You'll need to log back in to access your entries and expenses.
            </p>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn btn-ghost"
                onClick={() => setShowLogoutModal(false)}
                style={{ flex: 1, padding: '0.7rem' }}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleLogout}
                style={{ flex: 1, padding: '0.7rem', fontWeight: 700 }}
              >
                <LogOut size={15} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside style={{
        width: '240px', flexShrink: 0,
        background: 'var(--bg-2)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        padding: '1.25rem 0.85rem',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0 0.5rem', marginBottom: '2rem' }}>
          <div style={{
            width: '34px', height: '34px',
            background: 'linear-gradient(135deg, #4f8ef7, #7c6ff7)',
            borderRadius: '9px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(79,142,247,0.35)',
          }}>
            <Wallet size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.03em' }}>
            Track<span style={{ color: 'var(--accent)' }}>Nest</span>
          </span>
        </div>

        {/* Nav links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: 1 }}>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to} to={to}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.4rem 0.5rem' }}>
            <div style={{
              width: '34px', height: '34px', flexShrink: 0,
              background: 'linear-gradient(135deg, #4f8ef7, #7c6ff7)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 800, color: '#fff',
            }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || 'User'}
              </p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </p>
            </div>
          </div>
          {/* Logout button now opens modal */}
          <button
            className="sidebar-link btn-danger"
            onClick={() => setShowLogoutModal(true)}
            style={{ border: 'none', width: '100%', textAlign: 'left' }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main style={{ flex: 1, overflow: 'auto', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
