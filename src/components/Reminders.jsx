import React, { useState } from 'react';
import { Bell, Plus, Shield, Calendar, Wrench, CheckCircle, Trash2 } from 'lucide-react';

export default function Reminders({ reminders = [], vehicles = [], onAddReminder, onDeleteReminder }) {
  const getDaysLeft = (dueDateStr) => {
    const due = new Date(dueDateStr);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getIcon = (type) => {
    switch ((type || '').toLowerCase()) {
      case 'insurance':
        return <Shield size={18} style={{ color: '#38bdf8' }} />;
      case 'puc':
        return <Calendar size={18} style={{ color: '#fbbf24' }} />;
      default:
        return <Wrench size={18} style={{ color: '#60a5fa' }} />;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Service & Document Reminders</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Automated alerts for periodic inspections, insurance renewals, and PUC certification.
          </p>
        </div>
        <button className="primary-btn" onClick={() => onAddReminder()}>
          <Plus size={16} />
          <span>Add Reminder</span>
        </button>
      </div>

      <div className="reminders-list">
        {reminders.map((r) => {
          const days = getDaysLeft(r.due_date);
          const isUrgent = days <= 30;
          const isWarning = days <= 60;

          return (
            <div key={r.id} className="reminder-item">
              <div className="reminder-left">
                <div
                  className="reminder-icon"
                  style={{
                    background: isUrgent ? 'rgba(244, 63, 94, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                  }}
                >
                  {getIcon(r.reminder_type)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                    {r.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {r.vehicle_name || 'Innova Crysta'} • Due: {r.due_date}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span
                  className={`countdown-badge ${
                    isUrgent ? 'countdown-urgent' : isWarning ? 'countdown-warning' : 'countdown-normal'
                  }`}
                >
                  {days > 0 ? `${days} days left` : 'Due today'}
                </span>

                {onDeleteReminder && (
                  <button
                    className="icon-btn"
                    style={{ width: '32px', height: '32px', color: '#fb7185' }}
                    onClick={() => onDeleteReminder(r.id)}
                    title="Dismiss / Complete"
                  >
                    <CheckCircle size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {reminders.length === 0 && (
          <div className="panel-card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No pending reminders. Click "+ Add Reminder" to configure an alert.
          </div>
        )}
      </div>
    </div>
  );
}
