import React from 'react';
import {
  Car,
  Wrench,
  IndianRupee,
  Bell,
  Calendar,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import AIAssistant from './AIAssistant';

export default function Dashboard({
  vehicles = [],
  services = [],
  expenses = [],
  reminders = [],
  onNavigate,
  onAddService,
  onAddVehicle,
}) {
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.cost || 0), 0);
  const activeVehicles = vehicles.filter((v) => v.status === 'Active');

  // Seed / dynamic upcoming services matching the wireframe
  const upcomingServices = [
    {
      id: 'up-1',
      service: 'Oil change',
      vehicle: 'Innova Crysta',
      date: '20 May 2026',
      daysLeft: 5,
      type: 'Routine',
    },
    {
      id: 'up-2',
      service: 'General service',
      vehicle: 'Honda Accord',
      date: '05 June 2026',
      daysLeft: 21,
      type: 'Major',
    },
    {
      id: 'up-3',
      service: 'Tyre rotation & balance',
      vehicle: 'Innova Crysta',
      date: '18 June 2026',
      daysLeft: 34,
      type: 'Maintenance',
    },
  ];

  return (
    <div>
      {/* 4 Metric KPI Cards (Page 3 of Wireframe) */}
      <div className="kpi-grid">
        <div className="kpi-card" onClick={() => onNavigate('vehicles')} style={{ cursor: 'pointer' }}>
          <div className="kpi-top">
            <span className="kpi-label">Total Vehicles</span>
            <div className="kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
              <Car size={18} />
            </div>
          </div>
          <div className="kpi-value">{vehicles.length}</div>
          <div className="kpi-sub" style={{ color: '#34d399' }}>
            ● {activeVehicles.length} Active in fleet
          </div>
        </div>

        <div className="kpi-card" onClick={() => onNavigate('services')} style={{ cursor: 'pointer' }}>
          <div className="kpi-top">
            <span className="kpi-label">Upcoming Services</span>
            <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <Wrench size={18} />
            </div>
          </div>
          <div className="kpi-value">{upcomingServices.length}</div>
          <div className="kpi-sub" style={{ color: '#fbbf24' }}>
            Next due in 5 days
          </div>
        </div>

        <div className="kpi-card" onClick={() => onNavigate('expenses')} style={{ cursor: 'pointer' }}>
          <div className="kpi-top">
            <span className="kpi-label">Total Expenses</span>
            <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <IndianRupee size={18} />
            </div>
          </div>
          <div className="kpi-value">₹{totalExpenses.toLocaleString('en-IN')}</div>
          <div className="kpi-sub" style={{ color: 'var(--text-muted)' }}>
            Across all service logs
          </div>
        </div>

        <div className="kpi-card" onClick={() => onNavigate('reminders')} style={{ cursor: 'pointer' }}>
          <div className="kpi-top">
            <span className="kpi-label">Active Reminders</span>
            <div className="kpi-icon" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
              <Bell size={18} />
            </div>
          </div>
          <div className="kpi-value">{reminders.length}</div>
          <div className="kpi-sub" style={{ color: '#fb7185' }}>
            1 Insurance renewal critical
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Left Content + Right AI Assistant Column */}
      <div className="dashboard-main-grid">
        {/* Left Column: Upcoming Services & Fleet Summary */}
        <div>
          {/* Upcoming Services Panel (as in Wireframe) */}
          <div className="panel-card">
            <div className="panel-header">
              <div className="panel-title">
                <Calendar size={18} style={{ color: '#38bdf8' }} />
                <span>Upcoming Scheduled Services</span>
              </div>
              <button
                className="secondary-btn"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                onClick={() => onNavigate('services')}
              >
                <span>View All</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {upcomingServices.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: 'rgba(59, 130, 246, 0.1)',
                        color: '#60a5fa',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Wrench size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>
                        {item.service}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {item.vehicle} • {item.date}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`countdown-badge ${
                      item.daysLeft <= 7
                        ? 'countdown-urgent'
                        : item.daysLeft <= 25
                        ? 'countdown-warning'
                        : 'countdown-normal'
                    }`}
                  >
                    {item.daysLeft} days left
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Registered Vehicles Summary */}
          <div className="panel-card">
            <div className="panel-header">
              <div className="panel-title">
                <Car size={18} style={{ color: '#60a5fa' }} />
                <span>Registered Fleet Overview</span>
              </div>
              <button
                className="secondary-btn"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                onClick={() => onNavigate('vehicles')}
              >
                <span>Manage</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {vehicles.map((v) => (
                <div
                  key={v.id}
                  style={{
                    padding: '1rem',
                    background: 'rgba(15, 23, 42, 0.5)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                      {v.name}
                    </span>
                    <span className="vehicle-badge-active">{v.status}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#38bdf8' }}>
                    {v.reg_number}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    {v.fuel_type} • {v.year} • {Number(v.odometer_km || 0).toLocaleString()} KM
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Assistant Column (as requested) */}
        <div>
          <AIAssistant
            vehicles={vehicles}
            services={services}
            expenses={expenses}
            reminders={reminders}
          />
        </div>
      </div>
    </div>
  );
}
