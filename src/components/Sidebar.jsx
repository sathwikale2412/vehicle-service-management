import React from 'react';
import {
  LayoutDashboard,
  Car,
  Wrench,
  Receipt,
  Bell,
  BarChart3,
  User,
  LogOut,
  Sparkles,
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, remindersCount = 0, user, onSignOut, onOpenAuth }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'vehicles', label: 'My Vehicles', icon: Car },
    { id: 'services', label: 'Service Records', icon: Wrench },
    { id: 'expenses', label: 'Expense Tracker', icon: Receipt },
    { id: 'reminders', label: 'Service Reminders', icon: Bell, badge: remindersCount },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'ai-insights', label: 'AI Vehicle Insights', icon: Sparkles },
    { id: 'profile', label: 'Profile & Settings', icon: User },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-badge">
          <Car size={22} />
        </div>
        <div>
          <div className="brand-title">VSRMS</div>
          <div className="brand-sub">Vehicle Service Manager</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-mini-card">
          <div className="user-avatar">
            {user?.name ? user.name.charAt(0) : 'A'}
          </div>
          <div className="user-details">
            <div className="user-name">{user?.name || 'Ale Sathwik Netha'}</div>
            <div className="user-status">
              <span className="status-dot"></span>
              <span>{user?.isCloud ? 'Cloud Synced' : 'Guest Mode'}</span>
            </div>
          </div>
          {user?.isCloud ? (
            <button
              className="icon-btn"
              title="Sign Out"
              style={{ width: '32px', height: '32px' }}
              onClick={onSignOut}
            >
              <LogOut size={14} />
            </button>
          ) : (
            <button
              className="icon-btn"
              title="Sign In"
              style={{ width: '32px', height: '32px', color: '#60a5fa' }}
              onClick={onOpenAuth}
            >
              <User size={14} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
