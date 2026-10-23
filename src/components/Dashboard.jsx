import React, { useMemo } from 'react';
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
  Plus,
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

  // Dynamically calculate upcoming services strictly based on the user's registered vehicles and reminders
  const upcomingServices = useMemo(() => {
    if (!vehicles || vehicles.length === 0) return [];

    const list = [];

    // 1. Include user-scheduled reminders that relate to service or inspections
    reminders.forEach((r) => {
      const v = vehicles.find((veh) => veh.id === r.vehicle_id) || vehicles[0];
      const target = new Date(r.due_date);
      const now = new Date();
      const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
      const daysLeft = diff > 0 ? diff : 0;

      list.push({
        id: `rem-srv-${r.id}`,
        service: r.title,
        vehicle: v ? v.name : (r.vehicle_name || 'Vehicle'),
        date: r.due_date || 'Scheduled',
        daysLeft,
        type: r.reminder_type || 'Service',
      });
    });

    // 2. Compute dynamic scheduled service milestones based on the user's vehicles' actual current odometer & fuel type
    vehicles.forEach((v) => {
      const km = parseInt(v.odometer_km || 0, 10);

      // Standard engine oil interval: every 10,000 km
      const nextOilKm = Math.ceil((km + 200) / 10000) * 10000;
      const kmUntilOil = Math.max(0, nextOilKm - km);
      const daysUntilOil = Math.max(4, Math.min(180, Math.round(kmUntilOil / 35)));

      const hasOilReminder = list.some(
        (item) => item.vehicle.toLowerCase() === v.name.toLowerCase() && item.service.toLowerCase().includes('oil')
      );

      if (!hasOilReminder) {
        const d = new Date();
        d.setDate(d.getDate() + daysUntilOil);
        list.push({
          id: `calc-oil-${v.id}`,
          service: 'Engine Oil & Filter Service',
          vehicle: v.name,
          date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          daysLeft: daysUntilOil,
          type: 'Routine',
        });
      }

      // Tyre rotation interval: every 8,000 km - 10,000 km
      const nextTyreKm = Math.ceil((km + 200) / 8000) * 8000;
      const kmUntilTyre = Math.max(0, nextTyreKm - km);
      const daysUntilTyre = Math.max(12, Math.min(180, Math.round(kmUntilTyre / 35)));

      const hasTyreReminder = list.some(
        (item) => item.vehicle.toLowerCase() === v.name.toLowerCase() && item.service.toLowerCase().includes('tyre')
      );

      if (!hasTyreReminder) {
        const d = new Date();
        d.setDate(d.getDate() + daysUntilTyre);
        list.push({
          id: `calc-tyre-${v.id}`,
          service: 'Tyre Rotation & Wheel Balancing',
          vehicle: v.name,
          date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          daysLeft: daysUntilTyre,
          type: 'Maintenance',
        });
      }

      // General periodic inspection if vehicle has > 40,000 km
      if (km >= 40000) {
        const nextInspKm = Math.ceil((km + 200) / 15000) * 15000;
        const kmUntilInsp = Math.max(0, nextInspKm - km);
        const daysUntilInsp = Math.max(20, Math.min(180, Math.round(kmUntilInsp / 35)));

        const hasInspReminder = list.some(
          (item) => item.vehicle.toLowerCase() === v.name.toLowerCase() && item.service.toLowerCase().includes('general')
        );

        if (!hasInspReminder) {
          const d = new Date();
          d.setDate(d.getDate() + daysUntilInsp);
          list.push({
            id: `calc-insp-${v.id}`,
            service: 'Comprehensive General Inspection',
            vehicle: v.name,
            date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            daysLeft: daysUntilInsp,
            type: 'Major',
          });
        }
      }
    });

    return list.sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 5);
  }, [vehicles, reminders]);

  // Urgent reminders counter (< 30 days)
  const urgentRemindersCount = useMemo(() => {
    const now = new Date();
    return reminders.filter((r) => {
      const target = new Date(r.due_date);
      const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
      return diff <= 30;
    }).length;
  }, [reminders]);

  return (
    <div>
      {/* 4 Metric KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card" onClick={() => onNavigate('vehicles')} style={{ cursor: 'pointer' }}>
          <div className="kpi-top">
            <span className="kpi-label">Total Vehicles</span>
            <div className="kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
              <Car size={18} />
            </div>
          </div>
          <div className="kpi-value">{vehicles.length}</div>
          <div className="kpi-sub" style={{ color: activeVehicles.length > 0 ? '#34d399' : 'var(--text-muted)' }}>
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
          <div className="kpi-sub" style={{ color: upcomingServices.length > 0 ? '#fbbf24' : 'var(--text-muted)' }}>
            {upcomingServices.length > 0
              ? `Next due in ${upcomingServices[0].daysLeft} days`
              : 'All maintenance up to date'}
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
            {expenses.length > 0 ? `Across ${expenses.length} expense logs` : 'No expenses logged'}
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
          <div
            className="kpi-sub"
            style={{ color: urgentRemindersCount > 0 ? '#fb7185' : '#34d399' }}
          >
            {reminders.length === 0
              ? 'All documents & renewals current'
              : urgentRemindersCount > 0
              ? `${urgentRemindersCount} document/service renewal due soon`
              : 'All renewals up to date'}
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="dashboard-main-grid">
        {/* Left Column: Upcoming Services & Fleet Summary */}
        <div>
          {/* Upcoming Services Panel */}
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
                        <span style={{ color: '#93c5fd', fontWeight: 600 }}>{item.vehicle}</span> • {item.date}
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

              {upcomingServices.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  No vehicles registered yet. Add your vehicle to generate scheduled maintenance timelines.
                </div>
              )}
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

            {vehicles.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
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
                      <span className="vehicle-badge-active">{v.status || 'Active'}</span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#38bdf8' }}>
                      {v.reg_number}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                      {v.fuel_type || 'Diesel'} • {v.year || 2022} • {Number(v.odometer_km || 0).toLocaleString()} KM
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                <p style={{ marginBottom: '0.75rem', fontSize: '0.88rem' }}>No vehicles registered in your fleet yet.</p>
                <button className="primary-btn" style={{ margin: '0 auto', fontSize: '0.82rem' }} onClick={onAddVehicle}>
                  <Plus size={14} />
                  <span>Add First Vehicle</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Assistant Column */}
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
