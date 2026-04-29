import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, LayoutDashboard, User, Settings, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      background: 'rgba(26, 26, 46, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--color-border)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>

          {/* Logo */}
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <div style={{
              background: 'linear-gradient(135deg, #6c63ff, #8b5cf6)',
              borderRadius: '10px',
              padding: '6px',
              display: 'flex',
            }}>
              <CheckSquare size={20} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-text)', letterSpacing: '-0.5px' }}>
              Task<span style={{ color: 'var(--color-accent)' }}>Flow</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="hidden-mobile">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link key={to} to={to} style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.5rem 0.9rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: active ? 600 : 400,
                  color: active ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  background: active ? 'var(--color-accent-light)' : 'transparent',
                  transition: 'all 0.2s',
                }}>
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.4rem 0.9rem',
              background: 'rgba(108,99,255,0.1)',
              border: '1px solid rgba(108,99,255,0.2)',
              borderRadius: '20px',
              fontSize: '0.8rem',
            }}>
              <div style={{
                width: '24px', height: '24px',
                background: 'linear-gradient(135deg, #6c63ff, #8b5cf6)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 700, color: '#fff',
              }}>
                {(user?.name || user?.email || 'U')[0].toUpperCase()}
              </div>
              <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>
                {user?.name || user?.email?.split('@')[0]}
              </span>
            </div>
            <button onClick={handleLogout} className="btn-ghost" style={{ padding: '0.4rem 0.75rem' }}>
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .hidden-mobile { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
