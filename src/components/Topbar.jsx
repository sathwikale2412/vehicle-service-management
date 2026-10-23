import React, { useState, useEffect } from 'react';
import { Clock, Plus, Cloud, HardDrive, Bell } from 'lucide-react';

export default function Topbar({ title, isCloud, onAddVehicle, onAddService, onOpenAuth, onTabChange }) {
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.75rem',
            padding: '0.35rem 0.65rem',
            borderRadius: '9999px',
            background: isCloud ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.15)',
            color: isCloud ? '#34d399' : '#94a3b8',
            border: `1px solid ${isCloud ? 'rgba(16, 185, 129, 0.3)' : 'rgba(148, 163, 184, 0.2)'}`,
            cursor: isCloud ? 'default' : 'pointer',
          }}
          onClick={!isCloud ? onOpenAuth : undefined}
          title={isCloud ? 'Synced with Supabase Cloud' : 'Click to connect Cloud Supabase account'}
        >
          {isCloud ? <Cloud size={13} /> : <HardDrive size={13} />}
          <span>{isCloud ? 'Supabase Connected' : 'Guest Mode (Local)'}</span>
        </div>

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
