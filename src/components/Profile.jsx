import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Save, Check, Shield, Layers, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, token, updateProfile, logout } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || 'Ale Sathwik Netha',
    email: user?.email || 'sathwikale@gmail.com',
    phone: user?.phone || '9000848123',
    address: user?.address || '16-2-112/2/C Old City, Hyderabad',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfile(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const modules = [
    '1. User Authentication & Session Continuation (SQLite & Supabase RLS)',
    '2. User-Scoped Vehicle Fleet Management',
    '3. Service History Ledger & Odometer Tracking',
    '4. Expense Tracking & Financial Categorization',
    '5. Insurance & Document Vault (PUC, RC, policies)',
    '6. Reminder Management with Countdown Badges',
    '7. Reports, Analytics & One-Click CSV Export',
    '8. Real-Time IST Date & Time Digital Clock',
    '9. AI Vehicle Diagnostic Assistant Column',
    '10. Session Security & Session Invalidation on Logout',
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Profile & Account Sessions</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Manage your account credentials, view session metadata, and update personal details.
          </p>
        </div>
        {user && (
          <button
            className="secondary-btn"
            style={{ borderColor: 'rgba(244, 63, 94, 0.4)', color: '#fb7185' }}
            onClick={logout}
          >
            <LogOut size={15} />
            <span>End Session (Logout)</span>
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Profile Information Form */}
        <div className="panel-card">
          <div className="panel-header">
            <div className="panel-title">
              <User size={18} style={{ color: '#60a5fa' }} />
              <span>User Information</span>
            </div>
            {saved && (
              <span style={{ fontSize: '0.78rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Check size={14} /> Profile Saved
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)',
                }}
              >
                {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>
                  {formData.name || 'Account User'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  User ID: {user?.id || 'guest'}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                disabled
                style={{ opacity: 0.7, cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea
                className="form-input"
                rows="2"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <button type="submit" className="primary-btn" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
              <Save size={16} />
              <span>Save Changes</span>
            </button>
          </form>
        </div>

        {/* System & Session Modules */}
        <div className="panel-card">
          <div className="panel-header">
            <div className="panel-title">
              <Layers size={18} style={{ color: '#38bdf8' }} />
              <span>Session Architecture & Database</span>
            </div>
            <span className="vehicle-badge-active">Active</span>
          </div>

          <div
            style={{
              padding: '0.85rem',
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.8rem',
            }}
          >
            <div style={{ fontWeight: 600, color: '#93c5fd', marginBottom: '0.3rem' }}>
              🔒 Session & Data Isolation Status
            </div>
            <div style={{ color: '#cbd5e1', lineHeight: 1.4 }}>
              All records (vehicles, service visits, expenses, reminders) are indexed strictly under your authenticated User ID. Logging out invalidates the session token, and logging in restores your private dataset across reloads.
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {modules.map((m, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.6rem 0.85rem',
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                }}
              >
                <Check size={14} style={{ color: '#34d399', flexShrink: 0 }} />
                <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{m}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
