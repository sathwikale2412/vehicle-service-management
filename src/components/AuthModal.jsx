import React, { useState } from 'react';
import { X, Lock, Mail, Car, Check, Shield } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        if (isRegister) {
          const { data, error } = await supabase.auth.signUp({ email, password });
          if (error) throw error;
          onAuthSuccess({
            name: email.split('@')[0],
            email: email,
            isCloud: true,
            id: data.user?.id,
          });
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
          onAuthSuccess({
            name: email.split('@')[0],
            email: email,
            isCloud: true,
            id: data.user?.id,
          });
        }
      } else {
        // Local Sandbox Mode
        onAuthSuccess({
          name: email.split('@')[0] || 'Ale Sathwik Netha',
          email: email || 'sathwikale@gmail.com',
          isCloud: false,
          id: 'local-user-1',
        });
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSandboxLogin = () => {
    onAuthSuccess({
      name: 'Ale Sathwik Netha',
      email: 'sathwikale@gmail.com',
      isCloud: false,
      id: 'local-user-1',
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className="logo-badge" style={{ width: '32px', height: '32px' }}>
              <Car size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>VSRMS Account</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {isRegister ? 'Register your account' : 'Welcome back! Login to your account'}
              </div>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errorMsg && (
              <div style={{ padding: '0.65rem', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '6px', color: '#fb7185', fontSize: '0.8rem' }}>
                {errorMsg}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '2.2rem' }}
                  placeholder="sathwikale@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '2.2rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked /> Remember me
              </label>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '0.78rem' }}
                onClick={() => alert('Password reset link sent to registered email.')}
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="primary-btn"
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.75rem' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Login'}
            </button>

            <button
              type="button"
              className="secondary-btn"
              style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem' }}
              onClick={handleSandboxLogin}
            >
              <span>Instant Guest Mode (Preloaded Fleet)</span>
            </button>
          </div>

          <div className="modal-footer" style={{ justifyContent: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              style={{ background: 'none', border: 'none', color: '#60a5fa', fontWeight: 600, cursor: 'pointer', marginLeft: '4px' }}
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? 'Login' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
