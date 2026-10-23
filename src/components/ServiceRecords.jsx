import React, { useState } from 'react';
import { Wrench, Plus, Trash2, Edit2, Search, Filter, Calendar } from 'lucide-react';

export default function ServiceRecords({ services = [], vehicles = [], onAddService, onDeleteService }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('all');

  const filtered = services.filter((s) => {
    const matchesSearch =
      s.service_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.notes && s.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesVehicle = selectedVehicle === 'all' || s.vehicle_id === selectedVehicle;
    return matchesSearch && matchesVehicle;
  });

  const totalCost = filtered.reduce((sum, s) => sum + Number(s.cost || 0), 0);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Service Record Management</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Digital log of repairs, oil changes, periodic maintenance, and invoices.
          </p>
        </div>
        <button className="primary-btn" onClick={() => onAddService()}>
          <Plus size={16} />
          <span>Add Service</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="panel-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1.25rem',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', flex: 1 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search service type or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: '300px' }}
          />
          <select
            className="form-select"
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            style={{ maxWidth: '220px' }}
          >
            <option value="all">All Vehicles</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.reg_number})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Total Cost:</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
            ₹{totalCost.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Table (Page 4 of Wireframe) */}
      <div className="panel-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="data-table-wrapper" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Vehicle</th>
                <th>Service Name</th>
                <th>Odometer (KM)</th>
                <th>Cost (₹)</th>
                <th>Notes</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td>{s.service_date}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#93c5fd' }}>
                      {s.vehicle_name || 'Innova Crysta'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{s.service_type}</td>
                  <td>{Number(s.odometer_km || 0).toLocaleString()} KM</td>
                  <td className="cost-cell">₹{Number(s.cost || 0).toLocaleString('en-IN')}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.notes || '-'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="icon-btn"
                      style={{ display: 'inline-flex', width: '30px', height: '30px', color: '#fb7185' }}
                      title="Delete Record"
                      onClick={() => onDeleteService && onDeleteService(s.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No service records found. Click "+ Add Service" to record your first entry.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
