import React, { useState } from 'react';
import {
  ArrowLeft,
  Car,
  Wrench,
  Receipt,
  FileText,
  Bell,
  Plus,
  Shield,
  Calendar,
  Gauge,
  Fuel,
  Upload,
} from 'lucide-react';

export default function VehicleDetails({
  vehicle,
  services = [],
  expenses = [],
  reminders = [],
  onBack,
  onAddService,
  onAddExpense,
  onAddReminder,
}) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!vehicle) return null;

  const vehicleServices = services.filter((s) => s.vehicle_id === vehicle.id || s.vehicleId === vehicle.id);
  const vehicleExpenses = expenses.filter((e) => e.vehicle_id === vehicle.id || e.vehicleId === vehicle.id);
  const totalSpent = vehicleExpenses.reduce((sum, e) => sum + Number(e.cost || 0), 0);

  return (
    <div>
      {/* Top back button & title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <button className="icon-btn" onClick={onBack} title="Back to Vehicles">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Vehicle Details</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Overview, service history, and document vault for {vehicle.name}
          </span>
        </div>
      </div>

      {/* Vehicle Hero Card (Page 4 of Wireframe) */}
      <div
        className="panel-card"
        style={{
          background: 'linear-gradient(135deg, #162032 0%, #111a29 100%)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '12px',
                background: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#60a5fa',
              }}
            >
              <Car size={32} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>{vehicle.name}</h3>
                <span className="vehicle-badge-active">{vehicle.status || 'Active'}</span>
              </div>
              <div className="vehicle-reg">{vehicle.reg_number}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {vehicle.model || 'Standard Edition'}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Spent on Vehicle</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
              ₹{totalSpent.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* 6 Key Spec Grid from Wireframe */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '1rem',
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="spec-item">
            <span className="spec-label">Fuel Type</span>
            <span className="spec-val">{vehicle.fuel_type || 'Diesel'}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Year</span>
            <span className="spec-val">{vehicle.year || 2020}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Registration</span>
            <span className="spec-val">{vehicle.reg_date || '12 May 2020'}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Insurance</span>
            <span className="spec-val" style={{ color: '#38bdf8' }}>
              {vehicle.insurance_expiry || '10 Dec 2026'}
            </span>
          </div>
          <div className="spec-item">
            <span className="spec-label">PUC Expiry</span>
            <span className="spec-val" style={{ color: '#fbbf24' }}>
              {vehicle.puc_expiry || '15 Aug 2026'}
            </span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Odometer (KM)</span>
            <span className="spec-val" style={{ color: '#34d399' }}>
              {Number(vehicle.odometer_km || 58760).toLocaleString()} KM
            </span>
          </div>
        </div>
      </div>

      {/* 4 Quick Action Buttons (Page 4 of Wireframe) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <button
          className="secondary-btn"
          style={{ justifyContent: 'center', padding: '0.85rem' }}
          onClick={() => onAddService(vehicle.id)}
        >
          <Wrench size={16} style={{ color: '#60a5fa' }} />
          <span>Add Service Record</span>
        </button>

        <button
          className="secondary-btn"
          style={{ justifyContent: 'center', padding: '0.85rem' }}
          onClick={() => onAddExpense(vehicle.id)}
        >
          <Receipt size={16} style={{ color: '#34d399' }} />
          <span>Add Expense</span>
        </button>

        <button
          className="secondary-btn"
          style={{ justifyContent: 'center', padding: '0.85rem' }}
          onClick={() => alert(`Document uploader for ${vehicle.name}: Insurance policy and RC certificate are stored securely in document vault.`)}
        >
          <Upload size={16} style={{ color: '#38bdf8' }} />
          <span>Upload Document</span>
        </button>

        <button
          className="secondary-btn"
          style={{ justifyContent: 'center', padding: '0.85rem' }}
          onClick={() => onAddReminder(vehicle.id)}
        >
          <Bell size={16} style={{ color: '#fbbf24' }} />
          <span>Set Reminder</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
        {['overview', 'service-history', 'expenses', 'documents'].map((tab) => (
          <button
            key={tab}
            style={{
              padding: '0.65rem 1.25rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeTab === tab ? '#60a5fa' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="panel-card">
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Maintenance Health Status
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                88%
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#fff' }}>Good Operational Condition</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  All scheduled oil and filter services are up to date. Next service in ~2,500 KM.
                </div>
              </div>
            </div>
          </div>

          <div className="panel-card">
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Compliance & Renewals
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>PUC Certificate:</span>
                <span style={{ color: '#34d399', fontWeight: 600 }}>Valid (15 Aug 2026)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Comprehensive Insurance:</span>
                <span style={{ color: '#38bdf8', fontWeight: 600 }}>Active (10 Dec 2026)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Fitness Validity:</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>Valid until 2035</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'service-history' && (
        <div className="panel-card">
          <div className="panel-header">
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Service Log History</h4>
            <button className="primary-btn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }} onClick={() => onAddService(vehicle.id)}>
              <Plus size={14} />
              <span>Add Service</span>
            </button>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Service Type</th>
                  <th>Odometer</th>
                  <th>Cost</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {vehicleServices.map((s) => (
                  <tr key={s.id}>
                    <td>{s.service_date}</td>
                    <td style={{ fontWeight: 600 }}>{s.service_type}</td>
                    <td>{Number(s.odometer_km || 0).toLocaleString()} KM</td>
                    <td className="cost-cell">₹{Number(s.cost || 0).toLocaleString('en-IN')}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="panel-card">
          <div className="panel-header">
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Expense Transactions</h4>
            <button className="primary-btn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }} onClick={() => onAddExpense(vehicle.id)}>
              <Plus size={14} />
              <span>Add Expense</span>
            </button>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {vehicleExpenses.map((e) => (
                  <tr key={e.id}>
                    <td>{e.expense_date}</td>
                    <td style={{ fontWeight: 600 }}>{e.title}</td>
                    <td><span className="vehicle-badge-active">{e.category}</span></td>
                    <td className="cost-cell">₹{Number(e.cost || 0).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="panel-card">
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>
            Document Vault
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <FileText size={20} style={{ color: '#38bdf8', marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>RC Certificate</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PDF • Verified Govt copy</div>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <Shield size={20} style={{ color: '#34d399', marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Insurance Policy</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PDF • Policy No: POL-2026-9009</div>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <Calendar size={20} style={{ color: '#fbbf24', marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>PUC Certificate</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PDF • Valid till 15 Aug 2026</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
