import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { LogOut, Lock, AlertTriangle, Eye, EyeOff, Check } from 'lucide-react';

export default function Settings() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [pwdForm, setPwdForm] = useState({ old_password: '', new_password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState({ old: false, new: false });
  const [pwdLoading, setPwdLoading] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out. See you soon! 👋');
    navigate('/login');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwdForm.new_password !== pwdForm.confirm) {
      toast.error('New passwords do not match.'); return;
    }
    if (pwdForm.new_password.length < 6) {
      toast.error('Password must be at least 6 characters.'); return;
    }
    setPwdLoading(true);
    try {
      await authAPI.changePassword({ old_password: pwdForm.old_password, new_password: pwdForm.new_password });
      toast.success('Password changed successfully! 🔐');
      setPwdForm({ old_password: '', new_password: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password.');
    } finally {
      setPwdLoading(false);
    }
  };

  const PwdField = ({ k, label, showKey }) => (
    <div>
      <label className="label">{label}</label>
      <div style={{ position: 'relative' }}>
        <Lock size={14} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
        <input className="field" type={showPwd[showKey] ? 'text' : 'password'} placeholder="••••••••"
          value={pwdForm[k]} onChange={(e) => setPwdForm({ ...pwdForm, [k]: e.target.value })}
          required style={{ paddingLeft: '2.4rem', paddingRight: '2.8rem' }} />
        <button type="button" onClick={() => setShowPwd({ ...showPwd, [showKey]: !showPwd[showKey] })}
          style={{ position: 'absolute', right: '11px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}>
          {showPwd[showKey] ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="page-container" style={{ maxWidth: '640px' }}>
      <h1 style={{ fontSize: '1.6rem', marginBottom: '2rem' }}>Settings</h1>

      {/* Change Password */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
          Security
        </h2>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', marginBottom: '1.1rem' }}>Change Password</h3>
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <PwdField k="old_password"  label="Current Password"  showKey="old" />
            <PwdField k="new_password"  label="New Password"      showKey="new" />
            <div>
              <label className="label">Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                <input className="field" type="password" placeholder="••••••••"
                  value={pwdForm.confirm} onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })}
                  required style={{ paddingLeft: '2.4rem' }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={pwdLoading}>
                {pwdLoading ? <span className="spinner" /> : <Check size={15} />}
                Update Password
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Danger Zone / Logout */}
      <section>
        <h2 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
          Account
        </h2>
        <div style={{ background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 'var(--radius)', padding: '1.4rem' }}>
          {!confirmLogout ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.9rem' }}>Sign Out</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', marginTop: '0.2rem' }}>You will be redirected to the login page.</p>
              </div>
              <button className="btn btn-danger" onClick={() => setConfirmLogout(true)}>
                <LogOut size={15} /> Logout
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', marginBottom: '1rem' }}>
                <AlertTriangle size={18} color="var(--danger)" />
                <p style={{ fontWeight: 600, color: 'var(--danger)', fontSize: '0.9rem' }}>Are you sure you want to logout?</p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-danger" onClick={handleLogout}><LogOut size={15} /> Yes, Logout</button>
                <button className="btn btn-ghost" onClick={() => setConfirmLogout(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
