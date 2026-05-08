import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../layouts/AppLayout';

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  // Wait for token validation before making a routing decision.
  // Without this, the app flashes the login page briefly on every reload
  // even when the user is legitimately logged in.
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: '36px', height: '36px', margin: '0 auto 1rem', borderWidth: '3px' }} />
          <p style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <AppLayout>{children}</AppLayout>;
}
