import React, { useState } from 'react';
import { X, Lock, Mail, Car, Check, User, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        await register({ email, password, name, phone, address });
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await login('sathwikale@gmail.com', 'Password123');
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className="logo-badge" style={{ width: '32px', height: '32px' }}>
              <Car size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700 }}>
                {isRegister ? 'Create VSRMS Account' : 'Welcome Back! Login to VSRMS'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {isRegister ? 'Store & sync your vehicle maintenance history' : 'Access your personalized fleet and service records'}
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

            {isRegister && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: '100%', paddingLeft: '2.2rem' }}
                    placeholder="e.g. Ale Sathwik Netha"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <User size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
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

            {isRegister && (
              <>
                <div className="form-group">
                  <label className="form-label">Phone Number (Optional)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="tel"
                      className="form-input"
                      style={{ width: '100%', paddingLeft: '2.2rem' }}
                      placeholder="9000848123"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <Phone size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Address (Optional)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-input"
                      style={{ width: '100%', paddingLeft: '2.2rem' }}
                      placeholder="16-2-112/2/C Old City, Hyderabad"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                    <MapPin size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              className="primary-btn"
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.4rem', padding: '0.75rem' }}
              disabled={loading}
            >
              {loading ? 'Processing...' : isRegister ? 'Create Account & Start Session' : 'Login to Account'}
            </button>

            {!isRegister && (
              <button
                type="button"
                className="secondary-btn"
                style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem', borderColor: 'rgba(59, 130, 246, 0.3)', color: '#93c5fd' }}
                onClick={handleDemoLogin}
                disabled={loading}
              >
                <span>One-Click Login (Ale Sathwik Netha)</span>
              </button>
            )}
          </div>

          <div className="modal-footer" style={{ justifyContent: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              style={{ background: 'none', border: 'none', color: '#60a5fa', fontWeight: 600, cursor: 'pointer', marginLeft: '4px' }}
              onClick={() => {
                setIsRegister(!isRegister);
                setErrorMsg('');
              }}
            >
              {isRegister ? 'Login' : 'Register Here'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
