import React, { useState, useEffect } from 'react';
import { Clock, Plus, Cloud, HardDrive, Bell, User, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Topbar({ title, onAddVehicle, onAddService, onOpenAuth, onTabChange }) {
  const { user, logout } = useAuth();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="page-title">{title}</h1>

        {/* Live Real-Time Date & Time Clock */}
        <div className="live-clock-widget" title="Live System Date & Time">
          <span className="clock-pulse"></span>
          <Clock size={15} style={{ color: '#38bdf8' }} />
          <span>{formatDate(currentDateTime)}</span>
          <span style={{ color: 'var(--text-muted)' }}>•</span>
          <span style={{ fontWeight: 600, color: '#f8fafc' }}>{formatTime(currentDateTime)}</span>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>IST</span>
        </div>
      </div>

      <div className="topbar-right">
        {/* User Session Indicator */}
        {user ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.78rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.25)',
            }}
          >
            <User size={13} />
            <span style={{ fontWeight: 600 }}>{user.name || user.email}</span>
            <button
              onClick={logout}
              title="Logout Session"
              style={{
                background: 'none',
                border: 'none',
                color: '#fb7185',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '0 2px',
              }}
            >
              <LogOut size={13} />
            </button>
          </div>
        ) : (
          <button
            className="secondary-btn"
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', borderColor: 'rgba(59, 130, 246, 0.4)', color: '#93c5fd' }}
            onClick={onOpenAuth}
          >
            <LogIn size={14} />
            <span>Login / Register</span>
          </button>
        )}

        <button
          className="secondary-btn"
          onClick={() => onTabChange && onTabChange('reminders')}
          title="View Reminders"
        >
          <Bell size={15} />
          <span>Reminders</span>
        </button>

        <button className="primary-btn" onClick={onAddService}>
          <Plus size={16} />
          <span>Log Service</span>
        </button>

        <button
          className="secondary-btn"
          onClick={onAddVehicle}
          style={{ background: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.3)', color: '#93c5fd' }}
        >
          <Plus size={15} />
          <span>Add Vehicle</span>
        </button>
      </div>
    </header>
  );
}
