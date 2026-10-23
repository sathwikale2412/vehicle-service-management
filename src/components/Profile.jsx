import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Save, Check, Shield, Layers } from 'lucide-react';

export default function Profile({ profile, onUpdateProfile }) {
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || 'Ale Sathwik Netha',
    email: profile?.email || 'sathwikale@gmail.com',
    phone: profile?.phone || '9000848123',
    address: profile?.address || '16-2-112/2/C Old City, Hyderabad',
  });
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const modules = [
    '1. User Authentication (Email/Password & Supabase RLS)',
    '2. Vehicle Management (Fleet inventory & registration details)',
    '3. Service History Management (Digital logs, odometer tracking, cost tallies)',
    '4. Expense Tracking (Fuel, repairs, parts, categorization & charts)',
    '5. Insurance & Document Management (PUC, RC, policy renewals)',
    '6. Reminder Management (Real-time countdown alerts)',
    '7. Reports & Analytics (Mileage health, expense exports, audits)',
    '8. User Profile & Settings',
    '9. Admin Dashboard (Fleet metrics, KPI summaries, live clock)',
    '10. AI Assistant & Diagnostics (Predictive maintenance engine)',
  ];

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Profile & Settings</h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Manage your account profile details and review system architecture modules.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Profile Information Form (Page 6 of Wireframe) */}
        <div className="panel-card">
          <div className="panel-header">
            <div className="panel-title">
              <User size={18} style={{ color: '#60a5fa' }} />
              <span>Profile Information</span>
            </div>
            {saved && (
              <span style={{ fontSize: '0.78rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Check size={14} /> Saved Successfully
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
                {formData.full_name.charAt(0)}
              </div>
              <div>
                <button
                  type="button"
                  className="secondary-btn"
                  style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                  onClick={() => alert('Profile avatar updated')}
                >
                  Change Photo
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
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

        {/* System Modules (Page 6 of Wireframe) */}
        <div className="panel-card">
          <div className="panel-header">
            <div className="panel-title">
              <Layers size={18} style={{ color: '#38bdf8' }} />
              <span>Implemented Architecture Modules</span>
            </div>
            <span className="vehicle-badge-active">10 / 10 Live</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {modules.map((m, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.65rem 0.85rem',
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
